import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * Ensure the authenticated user exists in the AI backend.
 * Runs on the Next.js server. Safe to call repeatedly (backend is idempotent).
 */
export async function ensureBackendUser(): Promise<void> {
  try {
    const { userId, getToken } = await auth();
    if (!userId) return; // not signed in on the server

    const user = await currentUser();
    // Determine API base URL (prefer server-only var)
    const apiBase = process.env.API_BASE_URL 
    if (!apiBase) {
      console.warn("[ensureBackendUser] API_BASE_URL not set");
      return;
    }

    const createUrl = new URL("/api/v1/users/", apiBase).toString();

    // Optionally support a Clerk token template via env
    const template = process.env.CLERK_JWT_TEMPLATE;
    const token = await getToken({ template: template || undefined });
    if (!token) {
      console.warn("[ensureBackendUser] Failed to obtain Clerk server token");
      return;
    }

    const payload = {
      clerk_id: userId,
      email: user?.primaryEmailAddress?.emailAddress ?? "",
      name: user?.fullName ?? undefined,
    };

    const res = await fetch(createUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      // Route handler runs server-side; we can allow internal network calls
      cache: "no-store",
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.warn("[ensureBackendUser] Backend ensure failed", res.status, txt);
    }
  } catch (err) {
    console.warn("[ensureBackendUser] Unexpected error", err);
  }
}
