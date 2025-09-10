"use client";

import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import CustomUserButton from "./CustomUserButton";
import ThemeSwitcher from "./ThemeSwitcher";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";

export default function Navbar() {
  const t = useTranslations("Navigation");

  return (
    <nav className="bg-white dark:bg-neutral-800 shadow-md w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Image
                className="h-8 w-auto dark:invert"
                src="/next.svg"
                alt="Next.js Logo"
                width={32}
                height={32}
              />
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link
                href="/"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-display font-medium text-[#3b82f6] hover:text-[#2563eb] hover:border-[#93c5fd] dark:text-[#60a5fa] dark:hover:text-[#93c5fd] dark:hover:border-[#3b82f6] transition-colors duration-200"
              >
                {t("home")}
              </Link>
              
              {/* Pricing Navigation */}
              <Link
                href="/pricing"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-display font-medium text-[#3b82f6] hover:text-[#2563eb] hover:border-[#93c5fd] dark:text-[#60a5fa] dark:hover:text-[#93c5fd] dark:hover:border-[#3b82f6] transition-colors duration-200"
              >
                Pricing
              </Link>
              

              <SignedIn>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-display font-medium text-[#3b82f6] hover:text-[#2563eb] hover:border-[#93c5fd] dark:text-[#60a5fa] dark:hover:text-[#93c5fd] dark:hover:border-[#3b82f6] transition-colors duration-200"
                >
                  {t("dashboard")}
                </Link>
              </SignedIn>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Theme Switcher */}
           {/*  <ThemeSwitcher className="hidden md:block" /> */}
            
            <div className="hidden md:flex md:items-center md:space-x-4">
              <SignedOut>
                <SignInButton>
                  <button className="inline-flex items-center px-4 py-2 border border-secondary-300 text-sm font-display font-medium rounded-md text-secondary-700 bg-secondary-100 hover:bg-secondary-200 dark:text-secondary-200 dark:bg-secondary-700 dark:hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3b82f6] transition-colors duration-200">
                    {t("signIn")}
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="ml-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-display font-medium rounded-md text-white bg-[#3b82f6] hover:bg-[#2563eb] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3b82f6] transition-colors duration-200 shadow-sm">
                    {t("signUp")}
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center space-x-2">
                  {/* <span className="text-sm font-display font-medium text-secondary-500 dark:text-secondary-300">
                    {t("profile")}
                  </span> */}
                  <CustomUserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center ml-4">
              <ThemeSwitcher className="mr-2" />
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-secondary-400 hover:text-secondary-500 hover:bg-secondary-100 dark:hover:bg-secondary-700 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors duration-200"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {/* Icon for menu */}
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
