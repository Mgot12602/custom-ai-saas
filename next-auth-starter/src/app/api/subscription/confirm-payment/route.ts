import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { SubscriptionService } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { subscriptionId } = body

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      )
    }

    // Finalize subscription using subscription-first flow (no extra payments here)
    await SubscriptionService.finalizeSubscriptionAfterPayment(userId, subscriptionId)

    return NextResponse.json({
      success: true,
      message: 'Subscription activated successfully'
    })

  } catch (error) {
    console.error('Payment confirmation error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to confirm subscription'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
