"use client";

import { useRouter } from "next/navigation";
import { NeonButton } from "@/components/ui/NeonButton";
import { signOut } from "@/lib/auth/client";

export function ProfileSignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <NeonButton
      type="button"
      onClick={() => void handleSignOut()}
      variant="secondary"
      className="mt-5 min-h-0 px-4 py-3 text-sm"
    >
      Изход
    </NeonButton>
  );
}
