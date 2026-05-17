"use client";

import { useEffect, useState } from "react";
import { getCurrentUserClient, getClientProfile } from "@/lib/auth/client";
import type { CurrentUser } from "@/types/user";

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
        const user = await getCurrentUserClient();
        if (!user) {
          if (active) {
            setState(initialState);
          }
          return;
        }

        const profile = await getClientProfile(user.id);
        if (!active) {
          return;
        }

        setState({
          profile,
          isAuthenticated: true,
          isAdmin: profile?.role === "admin",
        });
      } catch (error) {
        console.error("Failed to load current user", error);
        if (active) {
          setState(initialState);
        }
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
