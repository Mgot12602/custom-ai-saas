import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

// Return 404 in production instead of throwing error during build
const isProduction = process.env.NODE_ENV === 'production'

export async function GET() {
  // Return 404 in production
  if (isProduction) {
    return NextResponse.json(
      { error: 'Not found' },
      { status: 404 }
    )
  }

  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { auth_user_id: userId },
      include: {
        subscription: {
          include: {
            pricingPlan: true
          }
        },
        usageLogs: {
          orderBy: { timestamp: 'desc' },
          take: 10
        }
      }
    })

    return NextResponse.json({
      user,
      testActions: [
        'api_call',
        'feature_use', 
        'generation'
      ]
    })

  } catch (error) {
    console.error('Test subscription fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch test data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Return 404 in production
  if (isProduction) {
    return NextResponse.json(
      { error: 'Not found' },
      { status: 404 }
    )
  }

  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action } = body

    if (action === 'reset_usage') {
      // Clear all usage logs for testing
      await prisma.usageLog.deleteMany({
        where: { userId }
      })
      
      return NextResponse.json({ 
        success: true, 
        message: 'Usage logs cleared for testing' 
      })
    }

    if (action === 'simulate_upgrade') {
      // Simulate upgrading to Pro for testing
      // Clear usage logs when upgrading
      await prisma.usageLog.deleteMany({
        where: { userId }
      })
      
      return NextResponse.json({ 
        success: true, 
        message: 'Simulated upgrade to Pro' 
      })
    }

    if (action === 'simulate_downgrade') {
      // Simulate downgrading to free for testing
      // Clear usage logs when downgrading
      await prisma.usageLog.deleteMany({
        where: { userId }
      })
      
      return NextResponse.json({ 
        success: true, 
        message: 'Simulated downgrade to Free' 
      })
    }

    if (action === 'max_out_usage') {
      // Set usage to maximum for current plan to test limits
      const user = await prisma.user.findFirst({
        where: { id: userId },
        include: {
          subscription: {
            include: {
              pricingPlan: true
            }
          }
        }
      })

      const planName = user?.subscription?.pricingPlan?.name?.toLowerCase() || 'free'
      let maxUsage = 15 // Default usage limit
      if (planName.includes('pro')) {
        maxUsage = user?.subscription?.pricingPlan?.usageLimit || 1000
      } else if (planName.includes('enterprise')) {
        maxUsage = user?.subscription?.pricingPlan?.usageLimit || 10000
      }

      // Create usage logs to simulate near limit
      const targetUsage = maxUsage - 1
      
      // Clear existing logs first
      await prisma.usageLog.deleteMany({ where: { userId } })
      
      // Create usage logs up to target
      for (let i = 0; i < targetUsage; i++) {
        await prisma.usageLog.create({
          data: {
            userId,
            action: 'generation',
            metadata: { testUsage: true }
          }
        })
      }
      
      return NextResponse.json({ 
        success: true, 
        message: `Set usage to ${targetUsage} (one remaining)` 
      })
    }

    return NextResponse.json(
      { error: 'Invalid test action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Test subscription action error:', error)
    return NextResponse.json(
      { error: 'Failed to perform test action' },
      { status: 500 }
    )
  }
}
