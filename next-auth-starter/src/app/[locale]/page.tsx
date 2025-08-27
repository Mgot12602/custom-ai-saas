import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  // Enable static rendering
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Home" });
  
  return (
    <div className="font-body items-center p-8 pb-20 gap-8 sm:p-20">
      <main className="flex flex-col gap-8 items-center sm:items-start">
        <div className="max-w-2xl text-center sm:text-left">
          <h1 className="text-4xl font-display font-bold mb-4 text-secondary-900 dark:text-secondary-100">
            {t("title")}
          </h1>
          <p className="text-lg font-body mb-8 text-secondary-700 dark:text-secondary-300 leading-relaxed">
            {t("description")}
          </p>

          <SignedIn>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-cta-500 hover:bg-cta-600 text-white font-display font-medium text-base transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cta-500"
            >
              {t("goToDashboard")}
            </Link>
          </SignedIn>
          <SignedOut>
            <div className="flex gap-4 items-center flex-col sm:flex-row">
              <SignUpButton>
                <button className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-cta-500 text-white font-display font-medium text-base transition-all duration-200 hover:bg-cta-600 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cta-500 transform hover:scale-105">
                  {t("getStarted")}
                </button>
              </SignUpButton>
              <SignInButton>
                <button className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-secondary-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-secondary-700 dark:text-secondary-200 font-display font-medium text-base transition-colors duration-200 hover:bg-secondary-50 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  {t("signIn")}
                </button>
              </SignInButton>
            </div>
          </SignedOut>
        </div>
      </main>
    </div>
  );
}
