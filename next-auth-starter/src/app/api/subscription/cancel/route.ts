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

    if (cancelAtPeriodEnd) {
      return NextResponse.json({
        success: true,
        message: 'Subscription will cancel at the end of the current period'
      })
    } else {
      return NextResponse.json({
        success: true,
        message: 'Subscription canceled immediately and downgraded to free plan'
      })
    }

  } catch (error) {
    console.error('Subscription cancellation error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
