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
    const { priceId, metadata = {} } = body

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      )
    }

    // Get or create customer
    let user = await prisma.user.findUnique({
      where: { auth_user_id: userId },
      include: { subscription: true }
    })

    if (!user) {
      const { ensureUserExists } = await import('@/lib/ensure-user-exists')
      await ensureUserExists()
      user = await prisma.user.findUnique({
        where: { auth_user_id: userId },
        include: { subscription: true }
      })
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const customerId = await SubscriptionService.createOrGetCustomer(
      userId, 
      '', 
      user.name
    )

    // Get price details from Stripe
    const price = await stripe.prices.retrieve(priceId)
    
    // Create Payment Intent for subscription
    const paymentIntent = await stripe.paymentIntents.create({
      amount: price.unit_amount!,
      currency: price.currency,
      customer: customerId,
      metadata: {
        userId,
        priceId,
        type: 'subscription',
        ...metadata
      },
      automatic_payment_methods: {
        enabled: true,
      },
      setup_future_usage: 'off_session', // For future payments if needed
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: price.unit_amount,
      currency: price.currency,
      customerId
    })

  } catch (error) {
    console.error('Payment Intent creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
