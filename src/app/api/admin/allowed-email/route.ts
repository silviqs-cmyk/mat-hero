import { NextResponse } from "next/server";
import { isAllowedAdminEmail } from "@/lib/auth/adminAccess";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    return NextResponse.json({
      allowed: isAllowedAdminEmail(body.email ?? null),
    });
  } catch {
    return NextResponse.json({ allowed: false }, { status: 400 });
  }
}
