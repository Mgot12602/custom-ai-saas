import { PrismaClient } from '../src/generated/prisma'
import { config } from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
config({ path: path.resolve(process.cwd(), '.env.local') })

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding pricing plans...')

  // Free Plan
  const freeStripePriceId = 'price_free_plan' // Free plan doesn't use actual Stripe ID
  await prisma.pricingPlan.upsert({
    where: { stripePriceId: freeStripePriceId },
    update: {},
    create: {
      name: 'Free',
      price: 0,
      currency: 'usd',
      stripePriceId: freeStripePriceId, // Not actual Stripe ID for free plan
      interval: undefined,
      features: {
        maxProjects: 3,
        maxUsers: 1,
        storage: '1GB',
        support: 'community',
        analytics: false,
        customDomain: false,
        apiAccess: false,
        advancedFeatures: false
      },
      usageLimit: 15,
      isActive: true
    }
  })


  // Pro Plan
  const proStripePriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
  if (!proStripePriceId) {
    throw new Error('NEXT_PUBLIC_STRIPE_PRO_PRICE_ID is not defined')
  }
  
  await prisma.pricingPlan.upsert({
    where: { stripePriceId: proStripePriceId },
    update: {},
    create: {
      name: 'Pro',
      price: 1999, // $29.99
      currency: 'usd',
      stripePriceId: proStripePriceId, // Replace with actual Stripe Price ID
      interval: 'monthly',
      features: {
        maxProjects: 50,
        maxUsers: 10,
        storage: '100GB',
        support: 'priority',
        analytics: true,
        customDomain: true,
        apiAccess: true,
        advancedFeatures: true,
        webhooks: true,
        ssoIntegration: false
      },
      usageLimit: 15,
      isActive: true
    }
  })

  // Enterprise Plan
  const enterprisePriceId = process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID
  if (!enterprisePriceId) {
    throw new Error('NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID is not defined')
  }
  await prisma.pricingPlan.upsert({
    where: { stripePriceId: enterprisePriceId },
    update: {},
    create: {
      name: 'Enterprise',
      price: 9999, // $99.99
      currency: 'usd',
      stripePriceId: enterprisePriceId, // Replace with actual Stripe Price ID
      interval: 'monthly',
      features: {
        maxProjects: -1, // Unlimited
        maxUsers: -1, // Unlimited
        storage: 'unlimited',
        support: 'dedicated',
        analytics: true,
        customDomain: true,
        apiAccess: true,
        advancedFeatures: true,
        webhooks: true,
        ssoIntegration: true,
        customIntegrations: true,
        onPremise: true
      },
      usageLimit: 15,
      isActive: true
    }
  })


  console.log('Pricing plans seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
