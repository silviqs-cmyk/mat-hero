"use client";

import { useEffect, useState } from "react";
import { getCurrentUserClient } from "@/lib/auth/client";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { CurrentUser, UserProfile } from "@/types/user";

const initialState: CurrentUser = {
  profile: null,
  isAuthenticated: false,
  isAdmin: false,
};

export function useCurrentUser() {
  const [state, setState] = useState<CurrentUser>(initialState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const supabase = getSupabaseBrowserClient();
        const user = await getCurrentUserClient();
        if (!user) {
          if (active) {
            setState(initialState);
          }
          return;
        }

        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
        if (!active) {
          return;
        }

        const profile = (data as UserProfile | null) ?? null;
        setState({
          profile,
          isAuthenticated: true,
          isAdmin: profile?.role === "admin",
        });
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  return { ...state, isLoading };
}
