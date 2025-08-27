import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold font-display text-primary-900 dark:text-primary-100 mb-6">Dashboard</h1>

      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow border border-neutral-200 dark:border-neutral-700 p-6">
        <h2 className="text-xl font-semibold font-display text-primary-900 dark:text-primary-100 mb-4">
          Welcome to your dashboard!
        </h2>
        <p className="mb-4 text-secondary-700 dark:text-secondary-300">
          This is a protected page. Only authenticated users can view this
          content.
        </p>
        <p className="mb-4 text-secondary-700 dark:text-secondary-300">
          Your user ID:{" "}
          <code className="bg-neutral-100 dark:bg-neutral-700 text-primary-800 dark:text-primary-200 px-2 py-1 rounded font-mono text-sm">
            {userId}
          </code>
        </p>

        <div className="mt-6">
          <h3 className="font-medium font-display text-primary-900 dark:text-primary-100 mb-2">What&#39;s next?</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li className="text-secondary-700 dark:text-secondary-300">
              Explore the{" "}
              <a
                href="https://clerk.com/docs"
                className="text-cta-500 hover:text-cta-600 dark:text-cta-400 dark:hover:text-cta-300 hover:underline transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                Clerk documentation
              </a>
            </li>
            <li className="text-secondary-700 dark:text-secondary-300">Customize your user profile</li>
            <li className="text-secondary-700 dark:text-secondary-300">Add more protected routes</li>
            <li className="text-secondary-700 dark:text-secondary-300">Implement role-based access control</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
