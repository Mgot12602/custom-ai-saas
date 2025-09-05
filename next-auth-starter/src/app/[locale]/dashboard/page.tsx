import { auth } from "@clerk/nextjs/server";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { DashboardClient } from "@/components/dashboard-client";
import { ensureBackendUser } from "@/server/ensureBackendUser";
import { ensureUserExists } from "@/lib/ensure-user-exists";

export const dynamic = 'force-dynamic';

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

  // Ensure users exist in both databases (safe to call repeatedly)
  void ensureBackendUser();
  void ensureUserExists();

  return <DashboardClient userId={userId} locale={locale} />;
}
