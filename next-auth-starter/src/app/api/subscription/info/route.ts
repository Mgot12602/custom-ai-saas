import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { SubscriptionService } from '@/lib/stripe'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const subscriptionData = await SubscriptionService.getUserSubscription(userId)
    
    return NextResponse.json(subscriptionData)

  } catch (error) {
    console.error('Error fetching subscription info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription information' },
      { status: 500 }
    )
  }
}
