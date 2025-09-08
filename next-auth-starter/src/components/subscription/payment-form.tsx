'use client'

import { useState, useEffect, useRef } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'

// Load Stripe outside of component to avoid recreating on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentFormProps {
  priceId: string
  planName: string
  onSuccess?: () => void
  onError?: (error: string) => void
  onCancel?: () => void
}

interface CheckoutFormProps extends PaymentFormProps {
  clientSecret: string
  subscriptionId: string
}

function CheckoutForm({ priceId, planName, onSuccess, onError, onCancel, clientSecret, subscriptionId }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      // Trigger form validation and wallet collection
      const { error: submitError } = await elements.submit()
      if (submitError) {
        setErrorMessage(submitError.message || 'Validation failed')
        onError?.(submitError.message || 'Validation failed')
        setIsLoading(false)
        return
      }

      // Confirm payment for the subscription's invoice PaymentIntent
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        redirect: 'if_required', // Stay on page for SPA handling
        confirmParams: {
          return_url: `${window.location.origin}/dashboard?success=true`,
        },
      })

      if (error) {
        setErrorMessage(error.message || 'Payment failed')
        onError?.(error.message || 'Payment failed')
      } else if (paymentIntent?.status === 'succeeded') {
        // Payment succeeded! Finalize subscription immediately on server
        console.log('Subscription invoice paid:', paymentIntent.id)
        
        try {
          const confirmResponse = await fetch('/api/subscription/confirm-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              subscriptionId,
            }),
          })

          const confirmData = await confirmResponse.json()

          if (confirmResponse.ok) {
            console.log('Subscription finalized:', confirmData)
            onSuccess?.()
          } else {
            setErrorMessage(confirmData.error || 'Failed to finalize subscription')
            onError?.(confirmData.error || 'Failed to finalize subscription')
          }
        } catch (error) {
          const errorMsg = 'Failed to finalize subscription. Please contact support.'
          setErrorMessage(errorMsg)
          onError?.(errorMsg)
        }
      }
    } catch (error) {
      const errorMsg = 'Payment processing failed. Please try again.'
      setErrorMessage(errorMsg)
      onError?.(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  if (!clientSecret || !subscriptionId) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cta-500"></div>
        <span className="ml-3">Preparing payment...</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
        <h3 className="font-semibold text-primary-900 dark:text-primary-100 mb-2">
          Upgrade to {planName}
        </h3>
        <p className="text-secondary-600 dark:text-secondary-400 text-sm">
          Your payment will be processed securely by Stripe
        </p>
      </div>

      <PaymentElement 
        options={{
          layout: 'tabs'
        }}
      />
      
      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-3">
          <p className="text-red-600 dark:text-red-400 text-sm">{errorMessage}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={!stripe || !elements || isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </div>
          ) : (
            `Subscribe to ${planName}`
          )}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>

      <p className="text-xs text-center text-secondary-500 dark:text-secondary-400">
        By subscribing, you agree to our terms of service. Cancel anytime.
      </p>
    </form>
  )
}

export default function PaymentForm(props: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null)
  const effectRan = useRef(false)
  // Get client secret for Elements options
  useEffect(() => {
    const startSubscription = async () => {
      try {
        const response = await fetch('/api/subscription/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ priceId: props.priceId }),
        })
        const data = await response.json()
        if (response.ok) {
          setClientSecret(data.clientSecret)
          setSubscriptionId(data.subscriptionId)
        }
      } catch (error) {
        console.error('Failed to start subscription:', error)
      }
    }
    if (effectRan.current) {
      return
    }
    console.log('Starting subscription...')
    effectRan.current = true
    startSubscription()
  }, [props.priceId])

  const options = {
    clientSecret: clientSecret || undefined,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#3b82f6',
      },
    },
  }

  if (!clientSecret || !subscriptionId) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cta-500"></div>
        <span className="ml-3">Initializing payment...</span>
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm {...props} clientSecret={clientSecret} subscriptionId={subscriptionId} />
    </Elements>
  )
}
