import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getApiBase } from '@/lib/env'

export async function POST(request: NextRequest) {
  try {
    // Get authentication from Clerk
    const { userId, getToken } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { job_type = 'text_generation', input_data } = body

    // Default input data if not provided
    const defaultInputData = {
      prompt: 'Test generation from Dashboard',
      max_tokens: 60
    }

    const payload = {
      job_type,
      input_data: input_data || defaultInputData
    }

    // Get backend API base URL
    const apiBase = getApiBase()
    const backendUrl = `${apiBase}/api/v1/jobs/`

    // Get JWT token for backend authentication
    const template = process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE
    const token = await getToken({ template: template || undefined })

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    console.log('[API] Triggering backend job', { 
      backendUrl, 
      payload, 
      hasToken: Boolean(token),
      template 
    })

    // Make request to backend
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })

    const responseText = await response.text()
    console.log('[API] Backend response', { 
      status: response.status, 
      responseText 
    })

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: 'Backend request failed',
          status: response.status,
          message: responseText
        },
        { status: response.status }
      )
    }

    // Try to parse JSON response
    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = { message: responseText }
    }

    return NextResponse.json({
      success: true,
      data: responseData
    })

  } catch (error) {
    console.error('[API] Error triggering backend job:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
