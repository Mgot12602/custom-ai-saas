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
          {/* Password Management */}
          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium font-display text-primary-900 dark:text-primary-100">Password</h4>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">
                  Change your password to keep your account secure
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleChangePassword}
              >
                Change Password
              </Button>
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium font-display text-primary-900 dark:text-primary-100">Two-Factor Authentication</h4>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">
                  Add an extra layer of security to your account
                </p>
                {user.twoFactorEnabled && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200 mt-1">
                    Enabled
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                onClick={handleManageMFA}
              >
                {user.twoFactorEnabled ? 'Manage' : 'Enable'} 2FA
              </Button>
            </div>
          </div>

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

          {/* Security Recommendations */}
          <div className="bg-info-50 dark:bg-info-900 border border-info-200 dark:border-info-700 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-info-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium font-display text-info-800 dark:text-info-200">
                  Security Recommendations
                </h4>
                <div className="mt-2 text-sm text-info-700 dark:text-info-300">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Enable two-factor authentication for better security</li>
                    <li>Use a strong, unique password</li>
                    <li>Review your connected accounts regularly</li>
                    <li>Sign out of devices you no longer use</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
