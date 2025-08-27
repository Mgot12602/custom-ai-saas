import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ProfileTabs from "./components/ProfileTabs";

export default async function ProfilePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display text-primary-900 dark:text-primary-100 mb-2">Account Settings</h1>
        <p className="text-secondary-600 dark:text-secondary-400">
          Manage your profile, security settings, and subscription
        </p>
      </div>

      <ProfileTabs />
    </div>
  );
}
