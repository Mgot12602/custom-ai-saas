'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface CancelSubscriptionButtonProps {
  onCancel?: () => void
}

export default function CancelSubscriptionButton({ onCancel }: CancelSubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [message, setMessage] = useState('')

  const handleCancel = async () => {
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cancelAtPeriodEnd: true
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message)
        setShowConfirmation(false)
        onCancel?.()
      } else {
        setMessage(data.error || 'Failed to cancel subscription')
      }
    } catch {
      setMessage('Failed to cancel subscription. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (showConfirmation) {
    return (
      <div className="bg-warning-50 dark:bg-warning-900 border border-warning-200 dark:border-warning-700 rounded-lg p-4">
        <h3 className="font-semibold font-display text-warning-800 dark:text-warning-200 mb-2">Cancel Subscription</h3>
        <p className="text-warning-700 dark:text-warning-300 mb-4">
          Are you sure you want to cancel your subscription? You&apos;ll continue to have access until the end of your current billing period, but your subscription won&apos;t renew.
        </p>
        <div className="flex gap-2">
          <Button 
            onClick={handleCancel}
            disabled={isLoading}
            variant="destructive"
            size="sm"
          >
            {isLoading ? 'Canceling...' : 'Yes, Cancel'}
          </Button>
          <Button 
            onClick={() => setShowConfirmation(false)}
            variant="outline"
            size="sm"
          >
            Keep Subscription
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Button
        onClick={() => setShowConfirmation(true)}
        variant="outline"
        className="border-error-200 dark:border-error-700 text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-800"
      >
        Cancel Subscription
      </Button>
      {message && (
        <div className={`mt-2 p-2 rounded ${
          message.includes('error') || message.includes('Failed') 
            ? 'bg-error-50 dark:bg-error-900 text-error-600 dark:text-error-400' 
            : 'bg-success-50 dark:bg-success-900 text-success-600 dark:text-success-400'
        }`}>
          {message}
        </div>
      )}
    </div>
  )
}
