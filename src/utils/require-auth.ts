import { redirect } from "next/navigation";

import { authConfig } from "@/config/auth";
import type { AuthUser } from "@/lib/auth";
import { auth } from "@/lib/auth";

export async function requireAuth(): Promise<AuthUser> {
  const user = await auth();

  if (!user) {
    redirect(authConfig.pages.signIn);
  }

  return user;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  return auth();
}
