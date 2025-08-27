import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { SubscriptionService } from '@/lib/stripe'
import { WebhookLogger } from '@/middleware/webhook-logger'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  console.log("Stripe webhook received")
  try {
    const body = await request.text()
    
    // Enhanced webhook logging
    await WebhookLogger.logStripeWebhook(request, body)
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      console.log("Stripe webhook event", event)
    } catch (err) {
      console.error(`Webhook signature verification failed.`, err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
        const createdSubscription = event.data.object
        console.log(`📋 Subscription created: ${createdSubscription.id} - Status: ${createdSubscription.status} (skipping, will handle on payment success)`)
        // No action needed - we'll create the subscription when payment succeeds
        break

      case 'customer.subscription.updated':
        const subscription = event.data.object
        console.log(`📋 Subscription updated: ${subscription.id} - Status: ${subscription.status}`)
        await SubscriptionService.handleSubscriptionUpdated(subscription)
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription
        await SubscriptionService.handleSubscriptionUpdated(deletedSubscription)
        break

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          console.log(`💰 Payment succeeded for subscription ${invoice.subscription}`)
          // Activate subscription when payment succeeds
          await SubscriptionService.handlePaymentSucceeded(invoice)
        }
        break

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice
        if (failedInvoice.subscription) {
          console.log(`💳 Payment failed for subscription ${failedInvoice.subscription}`)
          await SubscriptionService.handlePaymentFailed(failedInvoice)
        }
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
