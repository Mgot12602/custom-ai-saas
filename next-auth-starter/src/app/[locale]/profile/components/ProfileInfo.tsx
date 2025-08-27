'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default function ProfileInfo() {
  const { user, isLoaded } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '')
      setLastName(user.lastName || '')
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return

    setIsLoading(true)
    setMessage('')

    try {
      await user.update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      })
      
      setMessage('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage('Failed to update profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setFirstName(user.firstName || '')
      setLastName(user.lastName || '')
    }
    setIsEditing(false)
    setMessage('')
  }

  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
            <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <div>Please sign in to view your profile.</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium font-display text-primary-900 dark:text-primary-100 mb-4">Profile Information</h3>
        
        {message && (
          <div className={`mb-4 p-3 rounded-md ${
            message.includes('successfully') 
              ? 'bg-success-50 text-success-800 border border-success-200 dark:bg-success-900 dark:text-success-200 dark:border-success-700' 
              : 'bg-error-50 text-error-800 border border-error-200 dark:bg-error-900 dark:text-error-200 dark:border-error-700'
          }`}>
            {message}
          </div>
        )}

        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
          {/* Profile Picture */}
          <div className="flex items-center space-x-6 mb-6">
            <div className="flex-shrink-0">
              {user.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt="Profile"
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-neutral-300 dark:bg-neutral-700 flex items-center justify-center">
                  <span className="text-secondary-600 dark:text-secondary-300 text-2xl font-medium">
                    {user.firstName?.charAt(0) || user.emailAddresses[0]?.emailAddress.charAt(0) || '?'}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h4 className="text-sm font-medium font-display text-primary-900 dark:text-primary-100">Profile Picture</h4>
              <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-2">
                Update your profile picture through your account provider
              </p>
              <button className="text-sm text-cta-600 hover:text-cta-500 dark:text-cta-400 dark:hover:text-cta-300">
                Change picture
              </button>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                First Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-800 dark:text-primary-100"
                  placeholder="Enter your first name"
                />
              ) : (
                <div className="px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-md text-primary-900 dark:text-primary-100">
                  {user.firstName || 'Not set'}
                </div>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Last Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-800 dark:text-primary-100"
                  placeholder="Enter your last name"
                />
              ) : (
                <div className="px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-md text-primary-900 dark:text-primary-100">
                  {user.lastName || 'Not set'}
                </div>
              )}
            </div>

            {/* Email (Read-only) */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Email Address
              </label>
              <div className="px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-md text-primary-900 dark:text-primary-100">
                {user.emailAddresses[0]?.emailAddress || 'No email address'}
                <span className="ml-2 text-xs text-secondary-500 dark:text-secondary-400">
                  (managed through security settings)
                </span>
              </div>
            </div>

            {/* User ID (Read-only) */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                User ID
              </label>
              <div className="px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-md text-primary-900 dark:text-primary-100 font-mono text-sm">
                {user.id}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
