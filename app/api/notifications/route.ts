// This route has been deprecated in favor of website-specific notifications
// Please use /api/notifications/[websiteId] instead
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "Please use website-specific notifications endpoint" }, { status: 410 });
}

export async function POST() {
  return NextResponse.json({ error: "Please use website-specific notifications endpoint" }, { status: 410 });
}