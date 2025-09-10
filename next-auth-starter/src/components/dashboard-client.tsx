'use client'

import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { GenerationSection } from '@/components/dashboard/generation-section'

interface DashboardClientProps {
  userId: string
  locale: string
}

export function DashboardClient({ userId, locale }: DashboardClientProps) {
  const t = useTranslations("Dashboard")

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>

      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {t("welcome")}
        </h2>
        <p className="mb-4">
          {t("protectedInfo")}
        </p>
        <p className="mb-4">
          {t("userId")}{" "}
          <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            {userId}
          </code>
        </p>

        <div className="mt-6">
          <h3 className="font-medium mb-2">{t("whatsNext")}</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              {t("exploreClerk")}{" "}
              <a
                href="https://clerk.com/docs"
                className="text-[#3b82f6] hover:text-[#2563eb] dark:text-[#60a5fa] dark:hover:text-[#93c5fd] hover:underline transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                Clerk documentation
              </a>
            </li>
            <li>
              {t("customizeApp")}{" "}
              <code className="bg-gray-100 dark:bg-gray-700 px-1 text-sm rounded">
                src/app/[locale]/dashboard/page.tsx
              </code>
            </li>
            <li>
              {t("addFeatures")}{" "}
              <Link href={`/${locale}`} className="text-[#3b82f6] hover:text-[#2563eb] dark:text-[#60a5fa] dark:hover:text-[#93c5fd] hover:underline transition-colors duration-200">
                {t("backHome")}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Generation Section - combines job triggering and subscription management */}
      <GenerationSection userId={userId} />
    </div>
  )
}
