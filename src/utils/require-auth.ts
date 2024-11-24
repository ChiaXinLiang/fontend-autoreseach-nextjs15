import { redirect } from "next/navigation";

import { authConfig } from "@/config/auth";
import type { AuthUser } from "@/lib/auth";
import { auth } from "@/lib/auth";

export async function requireAuth(callbackUrl?: string): Promise<AuthUser> {
  const user = await auth();

  if (!user) {
    const signInUrl = new URL(
      authConfig.pages.signIn,
      process.env.NEXT_PUBLIC_APP_URL
    );
    if (callbackUrl) {
      signInUrl.searchParams.set("callbackUrl", callbackUrl);
    }
    redirect(signInUrl.toString());
  }

  return user;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  return auth();
}
