'use client'

import { useState } from 'react'
import ProfileInfo from './ProfileInfo'
import SecuritySettings from './SecuritySettings'
import { DashboardSubscriptionSection } from '@/components/subscription/dashboard-subscription-section'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { usePathname } from '@/i18n/navigation'

type TabType = 'profile' | 'security' | 'subscription' | 'account'

const tabs = [
  { id: 'profile' as TabType, name: 'Profile', icon: '👤' },
  { id: 'security' as TabType, name: 'Security', icon: '🔒' },
  { id: 'subscription' as TabType, name: 'Subscription', icon: '💳' },
  { id: 'account' as TabType, name: 'Account', icon: '⚙️' },
]

export default function ProfileTabs() {
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const pathname = usePathname()

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileInfo />
      case 'security':
        return <SecuritySettings />
      case 'subscription':
        return <DashboardSubscriptionSection showTestActions={false} />
      case 'account':
        return <AccountSettings pathname={pathname} />
      default:
        return <ProfileInfo />
    }
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow border border-neutral-200 dark:border-neutral-700">
      {/* Tab Navigation */}
      <div className="border-b border-neutral-200 dark:border-neutral-700">
        <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-secondary-500 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300 hover:border-secondary-300 dark:hover:border-secondary-600'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium font-display text-sm flex items-center gap-2 transition-colors duration-200`}
            >
              <span>{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {renderTabContent()}
      </div>
    </div>
  )
}

// AccountSettings component with LanguageSwitcher
function AccountSettings({ pathname }: { pathname: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium font-display text-primary-900 dark:text-primary-100 mb-4">Account Settings</h3>
        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
          <p className="text-secondary-600 dark:text-secondary-400 mb-4">
            Manage your account preferences and data.
          </p>
          
          <div className="space-y-4">
            {/* Language Settings */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium font-display text-primary-900 dark:text-primary-100">Language Preference</h4>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Choose your preferred language for the interface</p>
              </div>
              <LanguageSwitcher pathName={pathname} />
            </div>
            
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium font-display text-primary-900 dark:text-primary-100">Data Export</h4>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400">Download a copy of your account data</p>
                </div>
                <button className="inline-flex items-center px-3 py-2 border border-neutral-300 dark:border-neutral-600 shadow-sm text-sm leading-4 font-medium font-body rounded-md text-secondary-700 dark:text-secondary-300 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200">
                  Export Data
                </button>
              </div>
            </div>
            
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium font-display text-error-900 dark:text-error-200">Delete Account</h4>
                  <p className="text-sm text-error-500 dark:text-error-400">Permanently delete your account and all data</p>
                </div>
                <button className="inline-flex items-center px-3 py-2 border border-error-300 dark:border-error-700 shadow-sm text-sm leading-4 font-medium font-body rounded-md text-error-700 dark:text-error-300 bg-error-50 dark:bg-error-900 hover:bg-error-100 dark:hover:bg-error-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error-500 transition-colors duration-200">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
