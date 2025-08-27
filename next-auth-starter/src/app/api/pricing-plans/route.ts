import { NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import { ClerkDegraded } from '@clerk/nextjs'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const pricingPlans = await prisma.pricingPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    })

    // Ensure features field is properly parsed as JSON array
    const formattedPlans = pricingPlans.map(plan => ({
      ...plan,
      features: typeof plan.features === 'object' && plan.features !== null ? 
                Object.entries(plan.features).map(([key, value]) => `${key}: ${value}`) :
                []
    }))
    console.log("formattedPlans", formattedPlans)

    return NextResponse.json(formattedPlans)
  } catch (error) {
    console.error('Error fetching pricing plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pricing plans' },
      { status: 500 }
    )
  }
}
