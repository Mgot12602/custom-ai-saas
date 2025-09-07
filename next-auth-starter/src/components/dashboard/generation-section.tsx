'use client'

import { useState, useEffect, useRef } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import CancelSubscriptionButton from '../subscription/CancelSubscriptionButton'

interface UsageStatus {
  currentUsage: number
  limits: { [key: string]: number }
  remainingUsage: { [key: string]: number }
  subscriptionStatus: string
  resetDate: string
}

interface SubscriptionInfo {
  currentPlan?: {
    name: string
    usageLimit: number
    interval?: string
  }
  subscription?: {
    status: string
    currentPeriodEnd?: string
  }
}

interface GenerationSectionProps {
  userId: string
  showTestActions?: boolean
}

type JobStatusValue = "idle" | "pending" | "processing" | "completed" | "failed"

export function GenerationSection({ userId, showTestActions = true }: GenerationSectionProps) {
  const { user } = useUser()
  const { isSignedIn } = useAuth()
  
  // Job status states
  const [sessionId, setSessionId] = useState<string>("")
  const [jobId, setJobId] = useState<string | null>(null)
  const [status, setStatus] = useState<JobStatusValue>("idle")
  const [message, setMessage] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [buttonDisabled, setButtonDisabled] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null)
  
  // Subscription states
  const [usageStatus, setUsageStatus] = useState<UsageStatus | null>(null)
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(true)

  // Stable per-tab session id
  useEffect(() => {
    let sid = sessionStorage.getItem("job_session_id")
    if (!sid) {
      sid = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`)
      sessionStorage.setItem("job_session_id", sid)
    }
    setSessionId(sid)
  }, [])

  // Fetch subscription info and usage on mount
  useEffect(() => {
    if (user) {
      fetchUsageStatus()
      fetchSubscriptionInfo()
    }
  }, [user])

  // Connect to SSE stream
  useEffect(() => {
    if (!sessionId || !isSignedIn) return

    let closedByClient = false
    const connect = () => {
      try {
        setConnecting(true)
        const url = `/api/jobs/status-stream?session_id=${encodeURIComponent(sessionId)}`
        const eventSource = new EventSource(url)
        eventSourceRef.current = eventSource

        eventSource.onopen = () => {
          setConnecting(false)
        }

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            
            if (data?.type === "job_status_update") {
              // Only handle updates for this tab's session
              if (data.session_id && data.session_id !== sessionId) return
              setJobId((prev) => prev ?? data.job_id)
              const newStatus = String(data.status || "").toLowerCase() as JobStatusValue
              if (["pending", "processing", "completed", "failed"].includes(newStatus)) {
                setStatus(newStatus)
                setMessage(data.message ?? null)
                setButtonDisabled(newStatus === "pending" || newStatus === "processing")
                if(newStatus === "completed") {
                  handleSubmitUsage("generation")
                }
              }
            } else if (data?.type === "connection") {
              console.log('[GenerationSection] SSE connection status:', data.status)
            } else if (data?.type === "error") {
              console.error('[GenerationSection] SSE error:', data.message)
            }
            // Ignore heartbeat messages
          } catch (error) {
            console.error('[GenerationSection] Error parsing SSE message:', error)
          }
        }

        eventSource.onerror = () => {
          eventSourceRef.current = null
          setConnecting(false)
          
          if (!closedByClient) {
            // Attempt reconnect with backoff
            if (!reconnectTimer.current) {
              reconnectTimer.current = setTimeout(() => {
                reconnectTimer.current = null
                connect()
              }, 1500)
            }
          }
        }
      } catch (error) {
        console.error('[GenerationSection] Error connecting to SSE:', error)
        setConnecting(false)
      }
    }

    connect()
    return () => {
      closedByClient = true
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current)
        reconnectTimer.current = null
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [sessionId, isSignedIn])

  const fetchSubscriptionInfo = async () => {
    try {
      const response = await fetch('/api/subscription/info')
      if (response.ok) {
        const data = await response.json()
        setSubscriptionInfo(data)
      }
    } catch (error) {
      console.error('Error fetching subscription info:', error)
    }
  }

  const fetchUsageStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/subscription/usage')
      console.log('Usage status response:', response)
      if (response.ok) {
        const data = await response.json()
        console.log('Usage status:', data)
        setUsageStatus(data)
      }
    } catch (error) {
      console.error('Error fetching usage status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitUsage = async (action: string) => {
    try {
      const response = await fetch('/api/subscription/usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          metadata: { testAction: true }
        })
      })

      const data = await response.json()

      if (response.status === 429) {
        // Usage limit exceeded - redirect to pricing page
        window.location.href = '/pricing?reason=usage-limit'
      } else if (data.success) {
        // Refresh usage status
        await fetchUsageStatus()
        alert(`✅ ${action} successful! Remaining usage: ${data.remainingUsage}`)
      }
    } catch (error) {
      console.error('Error testing action:', error)
      alert('❌ Error testing action')
    }
  }

  const triggerJob = async () => {
    if (!isSignedIn) {
      alert("Please sign in first")
      return
    }
    try {
      setButtonDisabled(true)
      setStatus("pending")
      setMessage("Submitting job...")

      const payload = {
        session_id: sessionId,
        job_type: "text_generation",
        input_data: {
          prompt: "Test generation from Dashboard",
          max_tokens: 60,
        },
      }

      const res = await fetch('/api/jobs/trigger', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (res.status === 409) {
        // Active job exists for this session
        if (data?.data?.existing_job_id) {
          setJobId(data.data.existing_job_id)
          setStatus("processing")
          setMessage("Resuming active job...")
          setButtonDisabled(true)
          return
        }
      }

      if (!res.ok) {
        setStatus("failed")
        setMessage(data?.message || data?.error || "Failed to create job")
        setButtonDisabled(false)
        return
      }

      if (!data?.success || !data?.data) {
        setStatus("failed")
        setMessage("Invalid server response")
        setButtonDisabled(false)
        return
      }

      setJobId(data.data.id)
      setStatus((String(data.data.status || "pending").toLowerCase() as JobStatusValue) || "pending")
      setMessage(null)
      setButtonDisabled(true)
    } catch (error) {
      console.error(error)
      setStatus("failed")
      setMessage("Network error")
      setButtonDisabled(false)
    }
  }

  const resetState = () => {
    setJobId(null)
    setStatus("idle")
    setMessage(null)
    setButtonDisabled(false)
  }

  const statusBadgeClass = (() => {
    switch (status) {
      case "completed":
        return "bg-success-50 text-success-700 dark:bg-success-900 dark:text-success-300"
      case "failed":
        return "bg-error-50 text-error-700 dark:bg-error-900 dark:text-error-300"
      case "processing":
        return "bg-warning-50 text-warning-700 dark:bg-warning-900 dark:text-warning-300"
      case "pending":
        return "bg-secondary-50 text-secondary-700 dark:bg-secondary-900 dark:text-secondary-300"
      default:
        return "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
    }
  })()

  const getPlanColor = (status: string) => {
    switch (status) {
      case 'pro': return 'text-cta-600 bg-cta-50 dark:text-cta-400 dark:bg-cta-900'
      case 'enterprise': return 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900'
      default: return 'text-secondary-600 bg-secondary-50 dark:text-secondary-400 dark:bg-secondary-900'
    }
  }

  const getUsagePercentage = (remaining: number, limit: number) => {

    const used = limit - remaining
    console.log("used",used,"limit", limit, "remaining", remaining  )
    return Math.min((used / limit) * 100, 100)
  }

  const formatResetDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleCancelComplete = () => {
    // Refresh subscription info after cancellation
    fetchSubscriptionInfo()
  }

  if (!user) {
    return <div>Please sign in to view generation details.</div>
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 animate-pulse">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3 mb-2"></div>
          <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded w-full"></div>
        </div>
      </div>
    )
  }

  // Get the primary action for display
  const primaryAction = 'general'
  const primaryLimit = usageStatus?.limits[primaryAction] || 0
  const primaryRemaining = usageStatus?.remainingUsage[primaryAction] || 0
  const usagePercentage = getUsagePercentage(primaryRemaining, primaryLimit)
  console.log("usagePercentage",usagePercentage)

  const isPaidPlan = usageStatus?.subscriptionStatus && !usageStatus.subscriptionStatus.toLowerCase().includes('free')
  const isActiveSubscription = subscriptionInfo?.subscription && 
    (subscriptionInfo.subscription.status === 'active' || 
     subscriptionInfo.subscription.status === 'trialing' ||
     (subscriptionInfo.subscription.status === 'canceled' && 
      subscriptionInfo.subscription.currentPeriodEnd && 
      new Date(subscriptionInfo.subscription.currentPeriodEnd) > new Date()))

  return (
    <div className="space-y-6">
      {/* Generation Controls */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm">
        <h3 className="text-lg font-medium font-display text-primary-900 dark:text-primary-100 mb-4">AI Generation</h3>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadgeClass}`}>
              {status}
            </span>
            {connecting && <span className="text-xs text-secondary-500">(connecting...)</span>}
          </div>
          <div className="text-xs text-secondary-500">session: {sessionId.slice(0, 8)}…</div>
        </div>

        {jobId && (
          <div className="text-xs text-secondary-600 dark:text-secondary-400 mb-2">
            Job ID: <code className="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-700">{jobId}</code>
          </div>
        )}

        {message && (
          <div className="text-sm text-secondary-700 dark:text-secondary-300 mb-3">{message}</div>
        )}

        <div className="flex gap-3">
          <button
            onClick={triggerJob}
            disabled={buttonDisabled}
            className={`px-6 py-3 rounded-md font-medium text-white shadow-sm transition-colors duration-200 focus:ring-2 focus:ring-offset-2 ${
              buttonDisabled
                ? "bg-secondary-400 cursor-not-allowed"
                : "bg-cta-500 hover:bg-cta-600 focus:ring-cta-500"
            }`}
          >
            {buttonDisabled ? "Running…" : "Start AI Generation"}
          </button>
          {(status === "completed" || status === "failed") && (
            <button
              onClick={resetState}
              className="px-4 py-3 rounded-md font-medium bg-neutral-200 dark:bg-neutral-700 text-primary-900 dark:text-primary-100"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Subscription Status Display */}
      <div>
        <h2 className="text-xl font-semibold font-display text-primary-900 dark:text-primary-100 mb-4">
          Your Subscription & Usage
        </h2>

        {/* Subscription Details */}
        {subscriptionInfo && (
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 mb-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium font-display text-primary-900 dark:text-primary-100">Subscription Details</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getPlanColor(subscriptionInfo.currentPlan?.name?.toLowerCase() || 'free')}`}>
                {subscriptionInfo.currentPlan?.name || 'Free'} Plan
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary-600 dark:text-secondary-400">Status:</span>
                <span className={`font-medium ${
                  isActiveSubscription 
                    ? 'text-success-600 dark:text-success-400' 
                    : subscriptionInfo.subscription?.status === 'canceled'
                    ? 'text-warning-600 dark:text-warning-400'
                    : 'text-secondary-600 dark:text-secondary-400'
                }`}>
                  {isActiveSubscription ? 'Active' : subscriptionInfo.subscription?.status || 'Free'}
                </span>
              </div>

              {subscriptionInfo.subscription?.currentPeriodEnd && (
                <div className="flex justify-between">
                  <span className="text-secondary-600 dark:text-secondary-400">
                    {subscriptionInfo.subscription.status === 'canceled' ? 'Access Until:' : 'Renews On:'}
                  </span>
                  <span className="font-medium text-primary-900 dark:text-primary-100">
                    {new Date(subscriptionInfo.subscription.currentPeriodEnd).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {subscriptionInfo.subscription?.status === 'canceled' && 
             subscriptionInfo.subscription.currentPeriodEnd && 
             new Date(subscriptionInfo.subscription.currentPeriodEnd) > new Date() && (
              <div className="bg-warning-50 dark:bg-warning-900 border border-warning-200 dark:border-warning-700 rounded-lg p-3 mt-3">
                <p className="text-warning-800 dark:text-warning-200 text-sm">
                  <strong>Subscription Canceled:</strong> You&apos;ll continue to have access until {new Date(subscriptionInfo.subscription.currentPeriodEnd).toLocaleDateString()}. Your subscription won&apos;t renew.
                </p>
              </div>
            )}

            {isPaidPlan && isActiveSubscription && subscriptionInfo.subscription?.status !== 'canceled' && (
              <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <CancelSubscriptionButton onCancel={handleCancelComplete} />
              </div>
            )}
          </div>
        )}
        
        {usageStatus && (
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium font-display text-primary-900 dark:text-primary-100">Usage Details</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getPlanColor(usageStatus.subscriptionStatus)}`}>
                {usageStatus.subscriptionStatus} Plan
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-secondary-600 dark:text-secondary-400">Generations</span>
                  <span className="text-primary-900 dark:text-primary-100 font-medium">
                    {primaryLimit - primaryRemaining} / {primaryLimit}
                  </span>
                </div>
                {/* Debug info - remove this once working */}
                <div className="text-xs text-gray-500 mb-1">
                  Debug: {usagePercentage.toFixed(1)}% | Color: {usagePercentage > 90 ? 'error' : usagePercentage > 70 ? 'warning' : 'success'}
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.max(usagePercentage, 2)}%`,
                      minWidth: usagePercentage > 0 ? '8px' : '0px',
                      backgroundColor: usagePercentage > 90 
                        ? 'var(--color-error-500)' 
                        : usagePercentage > 70 
                        ? 'var(--color-warning-500)' 
                        : 'var(--color-success-500)'
                    }}
                    title={`Usage: ${usagePercentage.toFixed(1)}%`}
                  ></div>
                </div>
              </div>

              <div className="text-xs text-secondary-500 dark:text-secondary-400">
                Plan: <span className="capitalize font-medium text-primary-700 dark:text-primary-300">{usageStatus.subscriptionStatus}</span> • 
                Resets on {formatResetDate(usageStatus.resetDate)}
              </div>

              {usagePercentage > 80 && usageStatus.subscriptionStatus === 'free' && (
                <div className="bg-warning-50 dark:bg-warning-900 border border-warning-200 dark:border-warning-700 rounded-md p-3">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-warning-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium font-display text-warning-800 dark:text-warning-200">
                        You&apos;re running low on usage
                      </h4>
                      <p className="text-sm text-warning-700 dark:text-warning-300 mt-1">
                        Only {primaryRemaining} API calls remaining. Upgrade to Pro for 10x more usage.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
