"use client";

import { useEnsureBackendUser } from "@/hooks/useEnsureBackendUser";

export default function EnsureBackendUser() {
  useEnsureBackendUser();
  return null;
}
