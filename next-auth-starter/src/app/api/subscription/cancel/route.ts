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
    const { cancelAtPeriodEnd = true } = body

    await SubscriptionService.cancelSubscription(userId, cancelAtPeriodEnd)

    return NextResponse.json({ 
      success: true,
      message: cancelAtPeriodEnd 
        ? 'Subscription will cancel at the end of your current billing period. You can continue using your plan until then.'
        : 'Subscription has been cancelled immediately.'
    })

  } catch (error) {
    console.error('Error canceling subscription:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
