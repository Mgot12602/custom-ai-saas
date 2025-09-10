'use client'

import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

export default function SecuritySettings() {
  const { user, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
            <div className="h-16 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <div>Please sign in to view security settings.</div>
  }

  const handleChangePassword = () => {
    // Open Clerk's password change - using a more appropriate method
    window.open('/user-profile#/security', '_blank', 'noopener,noreferrer')
  }

  const handleManageMFA = () => {
    // Navigate to Clerk's MFA management
    window.open('/user-profile#/security', '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium font-display text-primary-900 dark:text-primary-100 mb-4">Security Settings</h3>
        
        <div className="space-y-6">
    

     

          {/* Connected Accounts */}
          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
            <div className="mb-4">
              <h4 className="text-sm font-medium font-display text-primary-900 dark:text-primary-100">Connected Accounts</h4>
              <p className="text-sm text-secondary-500 dark:text-secondary-400">
                Manage your social login connections
              </p>
            </div>
            
            <div className="space-y-3">
              {user.externalAccounts && user.externalAccounts.length > 0 ? (
                user.externalAccounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between bg-white dark:bg-neutral-800 p-3 rounded border border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-secondary-600 dark:text-secondary-300">
                            {account.provider?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary-900 dark:text-primary-100 capitalize">
                          {account.provider}
                        </p>
                        <p className="text-sm text-secondary-500 dark:text-secondary-400">
                          {account.emailAddress || account.username || 'Connected'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => account.destroy()}
                    >
                      Disconnect
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-secondary-500 dark:text-secondary-400">No connected accounts</p>
                </div>
              )}
            </div>
          </div>

          {/* Active Sessions */}
          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-medium font-display text-primary-900 dark:text-primary-100">Active Sessions</h4>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">
                  Manage where you're signed in
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => user.getSessions().then(sessions => {
                  // This would typically show a modal or navigate to session management
                  console.log('Active sessions:', sessions)
                })}
              >
                View Sessions
              </Button>
            </div>
            
            <div className="bg-white dark:bg-neutral-800 p-3 rounded border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary-900 dark:text-primary-100">Current Device</p>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400">
                    {navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                     navigator.userAgent.includes('Firefox') ? 'Firefox' :
                     navigator.userAgent.includes('Safari') ? 'Safari' : 'Browser'} • 
                    Last active now
                  </p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200">
                  Current
                </span>
              </div>
            </div>
          </div>

      
        </div>
      </div>
    </div>
  )
}
