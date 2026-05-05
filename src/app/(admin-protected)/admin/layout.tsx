import type { ReactNode } from "react";
import { AdminRouteShell } from "@/components/admin/AdminRouteShell";
import { requireAdminAccess } from "@/lib/auth/adminAccess";

export default async function AdminProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdminAccess();

  return <AdminRouteShell>{children}</AdminRouteShell>;
}
