import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

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

    // Get user and their subscription
    const user = await prisma.user.findUnique({
      where: { auth_user_id: userId },
      include: { subscription: true }
    })

    if (!user?.subscription) {
      return NextResponse.json(
        { error: 'No subscription found for user' },
        { status: 404 }
      )
    }

    // Check if it's a paid subscription
    const priceId = user.subscription.pricingPlanId
    const isPaidSubscription = priceId !== 'price_free_plan'

    if (!isPaidSubscription) {
      return NextResponse.json(
        { error: 'Cannot cancel free subscription' },
        { status: 400 }
      )
    }

    // Get free plan for downgrade
    const freePlan = await prisma.pricingPlan.findUnique({
      where: { stripePriceId: 'price_free_plan' }
    })

    if (!freePlan) {
      return NextResponse.json(
        { error: 'Free plan not found' },
        { status: 500 }
      )
    }

    if (cancelAtPeriodEnd) {
      // Cancel at period end - update subscription to show it will cancel
      await prisma.subscription.update({
        where: { userId: user.id },
        data: {
          cancelAtPeriodEnd: true,
          // Keep current plan active until period ends
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Subscription will cancel at the end of the current period',
        cancelDate: user.subscription.currentPeriodEnd
      })
    } else {
      // Cancel immediately - downgrade to free plan
      await prisma.subscription.update({
        where: { userId: user.id },
        data: {
          status: 'canceled',
          pricingPlanId: 'price_free_plan',
          cancelAtPeriodEnd: false,
          stripeCustomerId: null, // Clear Stripe customer ID
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year for free plan
        }
      })

      // Clear usage logs for fresh start with free plan
      await prisma.usageLog.deleteMany({
        where: { userId: user.id }
      })

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
