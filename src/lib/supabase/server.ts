import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getPublicSupabaseEnv,
  getRequiredServiceRoleKey,
} from "@/lib/supabase/env";

export async function createServerSupabaseClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  const { url, anonKey } = getPublicSupabaseEnv();

  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components may not always be able to mutate cookies.
          }
        },
      },
    },
  );
}

export function createServiceRoleSupabaseClient(): SupabaseClient {
  const { url } = getPublicSupabaseEnv();

  return createClient(
    url,
    getRequiredServiceRoleKey(),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}
