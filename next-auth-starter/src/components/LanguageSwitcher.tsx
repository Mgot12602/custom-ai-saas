"use client";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { locales } from "@/i18n/routing";
import { Link, usePathname } from "@/i18n/navigation";

interface LanguageSwitcherProps {
  pathName: string;
}

export default function LanguageSwitcher({ pathName }: LanguageSwitcherProps) {
  const t = useTranslations("Languages");
  const tNav = useTranslations("Navigation");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Extract locale from pathname
  const getCurrentLocale = () => {
    // The locale is now part of the URL context managed by next-intl
    // So we use a simpler approach to get the current locale from URL pattern
    const segments = pathName.split("/");
    const potentialLocale = segments[1]; // First path segment after initial slash

    return locales.includes(potentialLocale) ? potentialLocale : "en";
  };

  const currentLocale = getCurrentLocale();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // We don't need to manually handle paths anymore as next-intl Link component does this for us
  const targetPath = pathName;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          type="button"
          className="inline-flex justify-center w-full rounded-md border border-secondary-300 dark:border-neutral-700 shadow-sm px-4 py-2 bg-white dark:bg-neutral-800 text-sm font-display font-medium text-secondary-700 dark:text-secondary-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cta-500 transition-colors duration-200"
          id="language-menu"
          aria-expanded="true"
          aria-haspopup="true"
          onClick={() => setIsOpen(!isOpen)}
        >
          {t(currentLocale)}
          <svg
            className="-mr-1 ml-2 h-5 w-5 transition-transform duration-200"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-neutral-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50 border border-secondary-200 dark:border-neutral-700"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="language-menu"
        >
          <div className="py-1" role="none">
            {locales.map((locale) => (
              <Link
                href={targetPath}
                locale={locale}
                key={locale}
                className={`block px-4 py-2 text-sm font-body transition-colors duration-150 ${
                  currentLocale === locale
                    ? "bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-300"
                    : "text-secondary-700 dark:text-secondary-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                }`}
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                {t(locale)}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
