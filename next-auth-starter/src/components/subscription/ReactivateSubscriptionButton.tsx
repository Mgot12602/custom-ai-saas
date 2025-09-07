'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface ReactivateSubscriptionButtonProps {
  onReactivate?: () => void
}

export default function ReactivateSubscriptionButton({ onReactivate }: ReactivateSubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [message, setMessage] = useState('')

  const handleReactivate = async () => {
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/subscription/reactivate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message)
        setShowConfirmation(false)
        onReactivate?.()
      } else {
        setMessage(data.error || 'Failed to reactivate subscription')
      }
    } catch {
      setMessage('Failed to reactivate subscription. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (showConfirmation) {
    return (
      <div className="bg-success-50 dark:bg-success-900 border border-success-200 dark:border-success-700 rounded-lg p-4">
        <h3 className="font-semibold font-display text-success-800 dark:text-success-200 mb-2">Reactivate Subscription</h3>
        <p className="text-success-700 dark:text-success-300 mb-4">
          Are you sure you want to reactivate your subscription? Your subscription will continue and renew automatically at the end of the current period.
        </p>
        <div className="flex gap-2">
          <Button 
            onClick={handleReactivate}
            disabled={isLoading}
            variant="default"
            size="sm"
            className="bg-success-600 hover:bg-success-700 text-white"
          >
            {isLoading ? 'Reactivating...' : 'Yes, Reactivate'}
          </Button>
          <Button 
            onClick={() => setShowConfirmation(false)}
            variant="outline"
            size="sm"
          >
            Cancel
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
        className="border-success-200 dark:border-success-700 text-success-600 dark:text-success-400 hover:bg-success-50 dark:hover:bg-success-800"
      >
        Reactivate Subscription
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
