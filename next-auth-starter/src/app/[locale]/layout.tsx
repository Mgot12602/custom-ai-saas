import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { locales } from "@/i18n/routing";
import { ensureBackendUser } from "@/server/ensureBackendUser";
import { ensureUserExists } from "@/lib/ensure-user-exists";

import "@/app/globals.css";

const inter = Inter({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export async function generateMetadata({
  params,
}: Omit<Props, 'children'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Home' });
  
  return {
    title: t('title'),
    description: t('description'),
  };
}

// Generate static params for all supported locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Props) {
  const { locale } = await params;
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) notFound();

  // Enable static rendering
  setRequestLocale(locale);

  // Load the messages for the current locale
  let messages;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch {
    console.warn(`Could not load messages for locale: ${locale}, falling back to English`);
    // Fall back to English if the requested locale is not available
    try {
      messages = (await import('@/messages/en.json')).default;
    } catch (fallbackError) {
      console.error('Failed to load fallback locale', fallbackError);
      notFound();
    }
  }

  // Ensure AI backend user on the server side (idempotent) without blocking render
  void ensureBackendUser();
  void ensureUserExists()

  return (
    <ClerkProvider>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <html lang={locale}>
          <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen flex flex-col`}>
            <ThemeProvider>
              <header className="w-full bg-white dark:bg-neutral-800 shadow-md">
                <div className="flex justify-end items-center gap-4 h-16">
                  <Navbar />
                </div>
              </header>
              <main className="flex-grow flex flex-col justify-center">
                {children}
              </main>
              <Footer />
            </ThemeProvider>
          </body>
        </html>
      </NextIntlClientProvider>
    </ClerkProvider>
  );
}
