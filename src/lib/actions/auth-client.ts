"use client";

export async function signOutClient() {
  try {
    const response = await fetch("/api/auth/signout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to sign out");
    }

    return true;
  } catch (error) {
    console.error("Sign out error:", error);
    return false;
  }
}
