import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { UsageTracker } from '@/lib/usage-tracker'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const usageStatus = await UsageTracker.getUserUsageStatus(userId)
    
    return NextResponse.json(usageStatus)

  } catch (error) {
    console.error('Usage status fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch usage status' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  console.log(`[DEBUG API] POST /api/subscription/usage called`)
  
  try {
    console.log(`[DEBUG API] Getting auth info...`)
    const { userId } = await auth()
    console.log(`[DEBUG API] Auth result - userId:`, userId)
    
    if (!userId) {
      console.log(`[DEBUG API] No userId found - returning 401`)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log(`[DEBUG API] Parsing request body...`)
    const body = await request.json()
    const { action, metadata } = body
    console.log(`[DEBUG API] Request body parsed - action: ${action}, metadata:`, metadata)

    if (!action) {
      console.log(`[DEBUG API] No action provided - returning 400`)
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    console.log(`[DEBUG API] Calling UsageTracker.trackUsage with userId: ${userId}, action: ${action}`)
    const result = await UsageTracker.trackUsage(userId, action, metadata)
    console.log(`[DEBUG API] UsageTracker.trackUsage completed successfully, result:`, result)
    
    if (result.exceeded) {
      console.log(`[DEBUG API] Usage limit exceeded - returning 429`)
      return NextResponse.json(
        { 
          error: 'Usage limit exceeded',
          exceeded: true,
          remainingUsage: result.remainingUsage,
          action 
        },
        { status: 429 }
      )
    }

    console.log(`[DEBUG API] Usage tracking successful - returning success response`)
    return NextResponse.json({
      success: true,
      remainingUsage: result.remainingUsage
    })

  } catch (error) {
    console.error('### [DEBUG API] USAGE TRACKING ERROR ###')
    console.error('Error type:', typeof error)
    console.error('Error name:', (error as any)?.constructor?.name)
    console.error('Error message:', (error as any)?.message)
    console.error('Error stack:', (error as any)?.stack)
    console.error('Full error object:', error)
    console.error('### END ERROR DETAILS ###')
    
    return NextResponse.json(
      { error: 'Failed to track usage' },
      { status: 500 }
    )
  }
}
