import { NextResponse } from "next/server";

import { getFromS3, uploadToS3 } from "@/lib/s3";

export async function POST() {
  try {
    const testContent = "This is a test markdown content";
    const key = `test-${Date.now()}.md`;

    // Upload test content
    const uploadSuccess = await uploadToS3(key, testContent);
    if (!uploadSuccess) {
      return NextResponse.json({ error: "Failed to upload" }, { status: 500 });
    }

    // Retrieve the content to verify
    const retrievedContent = await getFromS3(key);
    if (!retrievedContent) {
      return NextResponse.json(
        { error: "Failed to retrieve" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      key,
      uploaded: testContent,
      retrieved: retrievedContent,
    });
  } catch (error) {
    console.error("S3 test error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
