import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { SubscriptionService } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Use SubscriptionService to handle reactivation
    await SubscriptionService.reactivateSubscription(userId)

    return NextResponse.json({
      success: true,
      message: 'Subscription reactivated successfully! Your subscription will continue and renew as normal.'
    })

  } catch (error) {
    console.error('Error reactivating subscription:', error)
    
    // Handle specific error types
    const errorMessage = error instanceof Error ? error.message : 'Failed to reactivate subscription'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
