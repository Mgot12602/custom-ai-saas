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
    const { paymentIntentId } = body

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment Intent ID is required' },
        { status: 400 }
      )
    }

    // Use SubscriptionService to handle payment confirmation and subscription creation
    await SubscriptionService.confirmPaymentAndCreateSubscription(userId, paymentIntentId)

    return NextResponse.json({
      success: true,
      message: 'Subscription activated successfully'
    })

  } catch (error) {
    console.error('Payment confirmation error:', error)
    
    // Handle specific error types
    const errorMessage = error instanceof Error ? error.message : 'Failed to confirm payment'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
