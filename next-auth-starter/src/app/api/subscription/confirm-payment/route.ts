import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { stripe, SubscriptionService } from '@/lib/stripe'
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
    const { paymentIntentId } = body

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment Intent ID is required' },
        { status: 400 }
      )
    }

    // Retrieve the payment intent to verify it succeeded
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not successful' },
        { status: 400 }
      )
    }

    if (paymentIntent.metadata.userId !== userId) {
      return NextResponse.json(
        { error: 'Payment intent does not belong to user' },
        { status: 403 }
      )
    }

    const priceId = paymentIntent.metadata.priceId
    const customerId = paymentIntent.customer as string

    if (!priceId) {
      return NextResponse.json(
        { error: 'No price ID found in payment metadata' },
        { status: 400 }
      )
    }

    // Get user and their existing subscription
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

    // Simply update the existing subscription to active with the new plan
    await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        status: 'active',
        pricingPlanId: priceId,
        stripeCustomerId: customerId,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      }
    })

    // Clear usage logs to give user fresh start with new plan
    await prisma.usageLog.deleteMany({
      where: { userId: user.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription activated successfully'
    })

  } catch (error) {
    console.error('Payment confirmation error:', error)
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    )
  }
}
