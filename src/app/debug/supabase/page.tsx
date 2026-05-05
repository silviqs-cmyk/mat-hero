import { notFound } from "next/navigation";
import { SupabaseDebugClient } from "./SupabaseDebugClient";

export default function SupabaseDebugPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <SupabaseDebugClient />;
}
