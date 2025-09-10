'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import PaymentForm from './payment-form'

interface PricingPlan {
  id: string
  name: string
  price: number
  currency: string
  interval: string | null
  features: string[]
  usageLimit: number
  stripePriceId: string
  isActive: boolean
}

interface UsageStatus {
  currentUsage: number
  limits: { [key: string]: number }
  remainingUsage: { [key: string]: number }
  subscriptionStatus: string
  resetDate: string
}

export function PricingPage() {
  const { user } = useUser()
  const [loading, setLoading] = useState<string | null>(null)
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([])
  const [plansLoading, setPlansLoading] = useState(true)
  const [userSubscription, setUserSubscription] = useState<UsageStatus | null>(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<{ priceId: string; name: string } | null>(null)

  useEffect(() => {
    const fetchPricingPlans = async () => {
      try {
        const response = await fetch('/api/pricing-plans')
        if (!response.ok) throw new Error('Failed to fetch pricing plans')
        const plans = await response.json()
        setPricingPlans(plans)
      } catch (error) {
        console.error('Error fetching pricing plans:', error)
        // Fallback to empty array - could show error message instead
        setPricingPlans([])
      } finally {
        setPlansLoading(false)
      }
    }

    const fetchUserSubscription = async () => {
      if (!user) return
      try {
        const response = await fetch('/api/subscription/usage')
        if (response.ok) {
          const data = await response.json()
          setUserSubscription(data)
        }
      } catch (error) {
        console.error('Error fetching user subscription:', error)
      }
    }

    fetchPricingPlans()
    fetchUserSubscription()
  }, [user])

  const handleUpgrade = async (priceId: string, planName: string) => {
    if (!user || !priceId) return

    // Show payment form instead of redirecting to Stripe Checkout
    setSelectedPlan({ priceId, name: planName })
    setShowPaymentForm(true)
  }

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false)
    setSelectedPlan(null)
    // Refresh subscription data
    window.location.reload()
  }

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error)
    // Keep form open so user can retry
  }

  const handlePaymentCancel = () => {
    setShowPaymentForm(false)
    setSelectedPlan(null)
  }

  // Helper function to determine if a plan is the user's current plan
  const isCurrentPlan = (planName: string) => {
    if (!userSubscription) return planName === 'Free' // Default to Free if no subscription data
    
    const subscriptionStatus = userSubscription.subscriptionStatus.toLowerCase()
    const normalizedPlanName = planName.toLowerCase()
    
    return subscriptionStatus === normalizedPlanName
  }

  return (
    <>
      <div className="py-12 bg-neutral-50 dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold font-display text-primary-900 dark:text-primary-100 sm:text-5xl">
              Choose Your Plan
            </h1>
          
            <p className="mt-4 text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
              Start free, upgrade when you need more. All plans include our core features 
              with generous usage limits and premium support.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plansLoading ? (
              <div className="col-span-3 text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b82f6]"></div>
                <p className="mt-4 text-secondary-600 dark:text-secondary-400">Loading pricing plans...</p>
              </div>
            ) : pricingPlans.length === 0 ? (
              <div className="col-span-3 text-center py-12">
                <p className="text-secondary-600 dark:text-secondary-400">No pricing plans available</p>
              </div>
            ) : (
              pricingPlans.map((plan: PricingPlan) => (
              <div
                key={plan.name}
                className={`relative bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border ${
                  plan.name === 'Pro' 
                    ? 'border-2 border-[#3b82f6] scale-105' 
                    : 'border-neutral-200 dark:border-neutral-700'
                }`}
                
              >
                {plan.name === 'Pro' && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#3b82f6] text-white px-6 py-2 rounded-full text-sm font-semibold font-display">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold font-display text-primary-900 dark:text-primary-100 mb-2">
                      {plan.name}
                    </h3>
                    <div className="mb-4">
                      <span className="text-5xl font-extrabold font-display text-primary-900 dark:text-primary-100">
                        ${plan.price === 0 ? '0' : (plan.price / 100).toFixed(0)}
                      </span>
                      <span className="text-secondary-600 dark:text-secondary-400 ml-1">
                        {plan.price > 0 ? `/${plan.interval}` : ''}
                      </span>
                    </div>
                    <p className="text-secondary-600 dark:text-secondary-400">
                      {plan.name === 'Free' && 'Perfect for getting started'}
                      {plan.name === 'Pro' && 'Best for growing businesses'}
                      {plan.name === 'Enterprise' && 'For large scale operations'}
                    </p>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-4 mb-8">
                    {Array.isArray(plan.features) ? plan.features.map((feature: string, featureIndex: number) => (
                      <li key={featureIndex} className="flex items-start">
                        <svg className="w-5 h-5 text-success-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-secondary-700 dark:text-secondary-300">{feature}</span>
                      </li>
                    )) : (
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-success-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-secondary-700 dark:text-secondary-300">Basic features included</span>
                      </li>
                    )}
                  </ul>

                  {/* CTA Button */}
                  {plan.name !== 'Free' && (
                    <div className="text-center">
                      {isCurrentPlan(plan.name) ? (
                        <button
                          disabled
                          className="w-full py-3 px-6 border border-neutral-300 dark:border-neutral-600 rounded-lg text-secondary-500 dark:text-secondary-400 font-medium font-body cursor-not-allowed bg-neutral-50 dark:bg-neutral-700"
                        >
                          Current Plan
                        </button>
                      ) : (
                        <button
                          onClick={() => plan.stripePriceId && handleUpgrade(plan.stripePriceId, plan.name)}
                          disabled={loading === plan.name || !plan.stripePriceId || !user}
                          className={`w-full py-3 px-6 rounded-lg font-medium font-body transition-all duration-200 cursor-pointer bg-[#3b82f6] hover:bg-[#2563eb] focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-2 text-white shadow-lg hover:shadow-xl ${loading === plan.name ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {!user ? (
                            'Sign In to Upgrade'
                          ) : (
                            `Get ${plan.name}`
                          )}
                        </button>
                      )}
                    </div>
                  )}

                  {plan.name !== 'Free' && (
                    <p className="text-xs text-center text-secondary-500 dark:text-secondary-400 mt-4">
                      Cancel anytime • 30-day money back guarantee
                    </p>
                  )}
                </div>
              </div>
              ))
            )}
          </div>

          {/* FAQ Section */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold font-display text-primary-900 dark:text-primary-100 text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto">
              <div className="grid gap-6">
                <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow border border-neutral-200 dark:border-neutral-700">
                  <h3 className="font-semibold font-display text-primary-900 dark:text-primary-100 mb-2">
                    Can I change plans at any time?
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-400">
                    Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately for upgrades, 
                    or at the end of your current billing cycle for downgrades.
                  </p>
                </div>
                <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow border border-neutral-200 dark:border-neutral-700">
                  <h3 className="font-semibold font-display text-primary-900 dark:text-primary-100 mb-2">
                    What happens if I exceed my usage limits?
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-400">
                    When you reach your monthly limit, you&apos;ll see a notification prompting you to upgrade. 
                    Your usage resets at the beginning of each billing cycle.
                  </p>
                </div>
                <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow border border-neutral-200 dark:border-neutral-700">
                  <h3 className="font-semibold font-display text-primary-900 dark:text-primary-100 mb-2">
                    Is there a free trial for paid plans?
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-400">
                    We offer a generous free plan that lets you experience our core features. 
                    For paid plans, we provide a 30-day money-back guarantee.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Form Modal */}
      {showPaymentForm && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold font-display text-primary-900 dark:text-primary-100">
                  Complete Your Subscription
                </h2>
                <button
                  onClick={handlePaymentCancel}
                  className="text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <PaymentForm
                priceId={selectedPlan.priceId}
                planName={selectedPlan.name}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onCancel={handlePaymentCancel}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
