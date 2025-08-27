"use client";

import { useEffect, useRef } from "react";
import { useUser, useAuth } from "@clerk/nextjs";

/**
 * Ensures a user exists in the AI backend right after registration/sign-in.
 * Logs each step to the browser console for easy debugging.
 */
export default function UserBootstrapper() {
  const { user, isLoaded } = useUser();
  const { getToken, isSignedIn } = useAuth();
  const hasRunRef = useRef(false);

  useEffect(() => {
    console.log("UserBootstrapper")
    console.log("isLoaded", isLoaded)
    console.log("isSignedIn", isSignedIn)
    console.log("user", user)
    if (!isLoaded || !isSignedIn || !user) return;
    if (hasRunRef.current) return; // prevent double run on React strict mode
    hasRunRef.current = true;

    const run = async () => {

      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
        const createUrl = `${apiBase}/api/v1/users`;

        console.group("[UserBootstrapper] Creating user in AI backend");
        console.debug("Step 1 - Clerk user loaded", {
          clerk_id: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          fullName: user.fullName,
        });

        const token = await getToken();
        console.debug("Step 2 - Retrieved Clerk token", {
          present: Boolean(token),
          prefix: token ? token.substring(0, 12) + "..." : null,
        });

        const payload = {
          clerk_id: user.id,
          email: user.primaryEmailAddress?.emailAddress ?? "",
          name: user.fullName ?? undefined,
        };

        console.debug("Step 3 - Sending POST to AI backend", {
          url: createUrl,
          payload,
        });

        const res = await fetch(createUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });

        const bodyText = await res.text();
        let body: unknown = bodyText;
        try {
          body = JSON.parse(bodyText);
        } catch {}

        console.debug("Step 4 - Backend response", {
          status: res.status,
          statusText: res.statusText,
          body,
        });

        if (!res.ok && res.status !== 409) {
          // 409 could be duplicate user, which is ok for idempotency
          console.error("Create user failed", { status: res.status, body });
        } else {
          console.info("User creation succeeded or already exists");
        }
        console.groupEnd();
      } catch (err) {
        console.groupEnd();
        console.error("[UserBootstrapper] Unexpected error", err);
      }
    };
 
    run();
  }, [isLoaded, isSignedIn, user, getToken]);

  return null;
}
