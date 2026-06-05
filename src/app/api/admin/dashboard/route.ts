import { NextResponse } from "next/server";
import { getCurrentAdminAccessState } from "@/lib/auth/adminAccess";
import { getAdminDashboardAudit } from "@/services/adminAudit.server";

export async function GET() {
  const access = await getCurrentAdminAccessState();
  if (!access.allowed) {
    return NextResponse.json(
      {
        error: "Forbidden",
        reason: access.reason,
      },
      { status: 403 },
    );
  }

  try {
    const audit = await getAdminDashboardAudit();
    return NextResponse.json(audit);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to load admin dashboard audit.",
      },
      { status: 500 },
    );
  }
}
