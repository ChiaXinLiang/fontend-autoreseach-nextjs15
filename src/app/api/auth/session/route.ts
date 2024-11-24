import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await auth();
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json({ user: null });
  }
}
