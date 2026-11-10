import { NextResponse } from "next/server";
import { POST as handleUploadPost } from "./upload/route";
import { DEFAULT_MEDIA } from "@/lib/data/defaultMedia";

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      media: DEFAULT_MEDIA,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to retrieve media library" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  return handleUploadPost(request);
}
