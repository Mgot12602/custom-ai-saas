"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations("Navigation");
  const footerT = useTranslations("Footer");
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full bg-neutral-100 dark:bg-neutral-900 border-t-2 border-primary py-8 z-10 shadow-lg">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm font-body text-secondary-500 dark:text-secondary-400">
              © {currentYear} Next Auth Starter
            </p>
          </div>
          <div className="flex space-x-6">
            <Link 
              href="/" 
              className="text-sm font-body text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-white transition-colors duration-200"
            >
              {t("home")}
            </Link>
            <a
              href="https://clerk.com/docs"
              className="text-sm font-body text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-white transition-colors duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              {footerT("clerkDocs")}
            </a>
            <a 
              href="https://nextjs.org/docs"
              className="text-sm font-body text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-white transition-colors duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              {footerT("nextDocs")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
