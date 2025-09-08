import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
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

    // Get or create customer (use real email when available)
    const clerkUser = await currentUser()
    const email = clerkUser?.primaryEmailAddress?.emailAddress || ''

    const customerId = await SubscriptionService.createOrGetCustomer(
      userId, 
      email, 
      user.name
    )

    // Create subscription in incomplete state and return its invoice PaymentIntent client_secret
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      metadata: {
        userId,
        type: 'subscription',
        ...metadata,
      },
    })

    const latestInvoice: any = subscription.latest_invoice
    const paymentIntent: any = latestInvoice?.payment_intent
    const clientSecret = paymentIntent?.client_secret

    if (!clientSecret) {
      return NextResponse.json(
        { error: 'Failed to initialize subscription payment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      clientSecret,
      subscriptionId: subscription.id,
      customerId,
    })

  } catch (error) {
    console.error('Payment Intent creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
