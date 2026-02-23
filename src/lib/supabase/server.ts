// @ts-nocheck
/**
 * STUB - Supabase server client is disabled for static/contact-first operation.
 * Returns `any`-typed no-op so TypeScript doesn't complain about missing methods.
 */
export async function createClient(): Promise<any> {
  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Auth disabled' } }),
      signOut: () => Promise.resolve({ error: null }),
      resetPasswordForEmail: () => Promise.resolve({ data: null, error: null }),
      updateUser: () => Promise.resolve({ data: { user: null }, error: null }),
      exchangeCodeForSession: () => Promise.resolve({ data: null, error: null }),
    },
    from: (table: string) => ({
      select: (...args: any[]) => ({
        eq: (...args: any[]) => ({
          single: () => Promise.resolve({ data: null, error: null }),
          order: () => Promise.resolve({ data: [], error: null }),
        }),
        order: () => Promise.resolve({ data: [], error: null }),
        single: () => Promise.resolve({ data: null, error: null }),
      }),
      insert: (data: any) => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
      update: (data: any) => ({
        eq: () => ({
          select: () => Promise.resolve({ data: [], error: null }),
        }),
        select: () => Promise.resolve({ data: [], error: null }),
      }),
      delete: () => ({
        eq: () => Promise.resolve({ data: null, error: null }),
      }),
    }),
  };
}
