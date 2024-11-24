// This route is no longer needed as we're using our own auth implementation
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "ok" });
}

export async function POST() {
  return NextResponse.json({ status: "ok" });
}

export async function HEAD() {
  return NextResponse.json({ status: "ok" });
}

// Remove the route handler file entirely
export const dynamic = "force-dynamic";
