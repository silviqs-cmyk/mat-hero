import { NextResponse } from "next/server";
import { getCurrentAdminAccessState } from "@/lib/auth/adminAccess";
import { getAdminDayAudit } from "@/services/adminAudit.server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ dayNumber: string }> },
) {
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

  const { dayNumber: rawDayNumber } = await params;
  const dayNumber = Number(rawDayNumber);
  if (!Number.isInteger(dayNumber) || dayNumber < 1) {
    return NextResponse.json(
      {
        error: "Invalid dayNumber.",
      },
      { status: 400 },
    );
  }

  try {
    const audit = await getAdminDayAudit(dayNumber);
    return NextResponse.json(audit);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to load admin day audit.",
      },
      { status: 500 },
    );
  }
}
