'use client'

import { useState, useEffect } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import CancelSubscriptionButton from './CancelSubscriptionButton'

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

interface DashboardSubscriptionSectionProps {
  showTestActions?: boolean
}

export function DashboardSubscriptionSection({ showTestActions = true }: DashboardSubscriptionSectionProps) {
  const { user } = useUser()
  const [usageStatus, setUsageStatus] = useState<UsageStatus | null>(null)
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUsageStatus()
      fetchSubscriptionInfo()
    }
  }, [user])

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

  const handleTestAction = async (action: string) => {
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

  // Trigger AI backend job via Next.js API route
  const { isSignedIn } = useAuth()
  const triggerBackendJob = async () => {
    if (!isSignedIn) {
      alert('Please sign in first')
      return
    }
    try {
      const payload = {
        job_type: 'text_generation',
        input_data: {
          prompt: 'Test generation from Dashboard',
          max_tokens: 60
        }
      }

      console.debug('[Dashboard] Triggering backend job via API route', { payload })
      const res = await fetch('/api/jobs/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      console.debug('[Dashboard] API response', { status: res.status, data })
      
      if (!res.ok) {
        alert(`❌ Failed to trigger job (${res.status}): ${data.message || data.error}`)
        return
      }

      if (data.success && data.data) {
        alert(`✅ Job created! ID: ${data.data.id}\nStatus: ${data.data.status}`)
      } else {
        alert('✅ Job triggered successfully!')
      }
    } catch (err) {
      console.error('[Dashboard] Error triggering backend job', err)
      alert('❌ Error triggering backend job')
    }
  }

  const getPlanColor = (status: string) => {
    switch (status) {
      case 'pro': return 'text-cta-600 bg-cta-50 dark:text-cta-400 dark:bg-cta-900'
      case 'enterprise': return 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900'
      default: return 'text-secondary-600 bg-secondary-50 dark:text-secondary-400 dark:bg-secondary-900'
    }
  }

  const getUsagePercentage = (remaining: number, limit: number) => {
    const used = limit - remaining
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

  if (!user) {
    return <div>Please sign in to view subscription details.</div>
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

  const isPaidPlan = usageStatus?.subscriptionStatus && !usageStatus.subscriptionStatus.toLowerCase().includes('free')
  const isActiveSubscription = subscriptionInfo?.subscription && 
    (subscriptionInfo.subscription.status === 'active' || 
     subscriptionInfo.subscription.status === 'trialing' ||
     (subscriptionInfo.subscription.status === 'canceled' && 
      subscriptionInfo.subscription.currentPeriodEnd && 
      new Date(subscriptionInfo.subscription.currentPeriodEnd) > new Date()))

  const handleCancelComplete = () => {
    // Refresh subscription info after cancellation
    fetchSubscriptionInfo()
  }

  return (
    <div className="space-y-6">
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
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      usagePercentage > 90 ? 'bg-error-500' : 
                      usagePercentage > 70 ? 'bg-warning-500' : 'bg-success-500'
                    }`}
                    style={{ width: `${usagePercentage}%` }}
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

      {/* Test Actions - Only show when showTestActions is true */}
      {showTestActions && (
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm">
          <h3 className="text-lg font-medium font-display text-primary-900 dark:text-primary-100 mb-4">
            Test Your Usage Limits
          </h3>
          <p className="text-secondary-600 dark:text-secondary-400 mb-4">
            Use these buttons to test the freemium flow and trigger upgrade prompts when limits are reached.
          </p>
          <div className="flex justify-center">
            <div className="flex gap-3">
              <button
                onClick={() => handleTestAction('generation')}
                className="bg-secondary-600 hover:bg-secondary-700 focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 text-white px-6 py-3 rounded-md font-medium font-body transition-colors duration-200 shadow-sm"
              >
                Test Usage (Local)
              </button>
              <button
                onClick={triggerBackendJob}
                className="bg-cta-500 hover:bg-cta-600 focus:ring-2 focus:ring-cta-500 focus:ring-offset-2 text-white px-6 py-3 rounded-md font-medium font-body transition-colors duration-200 shadow-sm"
              >
                Test Generation
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
