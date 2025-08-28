import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getWsBase } from '@/lib/env'

export async function GET(request: NextRequest) {
  try {
    // Get authentication from Clerk
    const { userId, getToken } = await auth()
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Get session_id from query params
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')
    
    if (!sessionId) {
      return new Response('Missing session_id', { status: 400 })
    }

    // Set up SSE headers
    const headers = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    })

    // Create a readable stream for SSE
    const stream = new ReadableStream({
      start(controller) {
        let ws: WebSocket | null = null
        let heartbeatInterval: NodeJS.Timeout | null = null

        const cleanup = () => {
          if (heartbeatInterval) {
            clearInterval(heartbeatInterval)
            heartbeatInterval = null
          }
          if (ws) {
            ws.close()
            ws = null
          }
        }

        const connectToBackend = async () => {
          try {
            // Get backend WebSocket URL
            const wsBase = getWsBase()
            const wsUrl = `${wsBase}/ws/${encodeURIComponent(userId)}`.replace(/([^:])\/\/+ws\//, "$1/ws/")
            
            // Get JWT token for backend authentication
            const rawToken = await getToken().catch(() => null)
            const token = `clerk_${rawToken ?? "anon"}`
            const url = `${wsUrl}?token=${encodeURIComponent(token)}`

            console.log('[SSE] Connecting to backend WebSocket:', wsUrl)
            
            ws = new WebSocket(url)

            ws.onopen = () => {
              console.log('[SSE] Connected to backend WebSocket')
              
              // Send initial connection message to client
              const data = `data: ${JSON.stringify({
                type: 'connection',
                status: 'connected',
                timestamp: new Date().toISOString()
              })}\n\n`
              
              try {
                controller.enqueue(new TextEncoder().encode(data))
              } catch (e) {
                console.log('[SSE] Client disconnected during connection')
                cleanup()
              }

              // Set up heartbeat to keep connection alive
              heartbeatInterval = setInterval(() => {
                try {
                  const heartbeat = `data: ${JSON.stringify({
                    type: 'heartbeat',
                    timestamp: new Date().toISOString()
                  })}\n\n`
                  controller.enqueue(new TextEncoder().encode(heartbeat))
                } catch (e) {
                  console.log('[SSE] Client disconnected during heartbeat')
                  cleanup()
                }
              }, 30000) // 30 second heartbeat
            }

            ws.onmessage = (event) => {
              try {
                const backendData = JSON.parse(event.data)
                
                // Filter messages for this session
                if (backendData?.type === "job_status_update") {
                  if (backendData.session_id && backendData.session_id !== sessionId) {
                    return // Skip messages for other sessions
                  }
                }

                // Forward the message to the client via SSE
                const sseData = `data: ${JSON.stringify(backendData)}\n\n`
                controller.enqueue(new TextEncoder().encode(sseData))
                
              } catch (error) {
                console.error('[SSE] Error processing backend message:', error)
              }
            }

            ws.onclose = () => {
              console.log('[SSE] Backend WebSocket closed')
              cleanup()
              
              // Send close message to client
              try {
                const closeData = `data: ${JSON.stringify({
                  type: 'connection',
                  status: 'disconnected',
                  timestamp: new Date().toISOString()
                })}\n\n`
                controller.enqueue(new TextEncoder().encode(closeData))
                controller.close()
              } catch (e) {
                // Client already disconnected
              }
            }

            ws.onerror = (error) => {
              console.error('[SSE] Backend WebSocket error:', error)
              cleanup()
              
              try {
                const errorData = `data: ${JSON.stringify({
                  type: 'error',
                  message: 'Backend connection error',
                  timestamp: new Date().toISOString()
                })}\n\n`
                controller.enqueue(new TextEncoder().encode(errorData))
              } catch (e) {
                // Client already disconnected
              }
            }

          } catch (error) {
            console.error('[SSE] Error connecting to backend:', error)
            cleanup()
            
            try {
              const errorData = `data: ${JSON.stringify({
                type: 'error',
                message: 'Failed to connect to backend',
                timestamp: new Date().toISOString()
              })}\n\n`
              controller.enqueue(new TextEncoder().encode(errorData))
              controller.close()
            } catch (e) {
              // Client already disconnected
            }
          }
        }

        // Start the connection
        connectToBackend()

        // Handle client disconnect
        request.signal?.addEventListener('abort', () => {
          console.log('[SSE] Client disconnected')
          cleanup()
        })
      }
    })

    return new Response(stream, { headers })

  } catch (error) {
    console.error('[SSE] Error setting up stream:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
