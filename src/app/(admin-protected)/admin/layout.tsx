import type { ReactNode } from "react";
import { AdminRouteShell } from "@/components/admin/AdminRouteShell";
import { requireAdmin } from "@/lib/auth/server";

export default async function AdminProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdmin();

  return <AdminRouteShell>{children}</AdminRouteShell>;
}
