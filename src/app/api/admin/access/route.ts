import { NextResponse } from "next/server";
import { getCurrentAdminAccessState } from "@/lib/auth/adminAccess";

export async function GET() {
  const access = await getCurrentAdminAccessState();

  return NextResponse.json({
    allowed: access.allowed,
    reason: access.reason,
  });
}
