import { auth } from "@clerk/nextjs/server";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { DashboardClient } from "@/components/dashboard-client";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Dashboard({ params }: Props) {
  const { locale } = await params;
  
  // Enable static rendering
  setRequestLocale(locale);
  
  const { userId } = await auth();

  if (!userId) {
    return redirect({href: "/", locale});
  }

  return <DashboardClient userId={userId} locale={locale} />;
}

export function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'es' },
    { locale: 'fr' }
  ];
}
