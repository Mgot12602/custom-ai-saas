"use client";

import { useEffect, useRef } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { getApiBase } from "@/lib/env";

/**
 * Ensures the authenticated user exists in the AI backend.
 * - Runs once per session after sign-in (sessionStorage + ref guard).
 * - Backend is idempotent: returns 201 on create, 200 if already exists.
 */
export function useEnsureBackendUser() {
  const { user, isLoaded } = useUser();
  const { getToken, isSignedIn } = useAuth();
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;
    const flagKey = `ensureUser:${user.id}`;
    if (sessionStorage.getItem(flagKey)) return;
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const run = async () => {
      try {
        const apiBase = getApiBase();
        const createUrl = new URL('/api/v1/users/', apiBase).toString();

        const token = await getToken();
        const payload = {
          clerk_id: user.id,
          email: user.primaryEmailAddress?.emailAddress ?? "",
          name: user.fullName ?? undefined,
        };

        const res = await fetch(createUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          console.error("[useEnsureBackendUser] Failed", res.status, txt);
          return;
        }
        sessionStorage.setItem(flagKey, "1");
      } catch (err) {
        console.error("[useEnsureBackendUser] Unexpected error", err);
      }
    };

    run();
  }, [isLoaded, isSignedIn, user, getToken]);
}
