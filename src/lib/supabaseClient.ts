// @ts-nocheck
/**
 * STUB CLIENT - Supabase is disabled for static/contact-first operation.
 * All methods return empty results silently without making any network calls.
 * Replace with real createBrowserClient when re-enabling DB integration.
 */

const noop = () => noopQuery;
const noopQuery: any = {
  from: noop,
  select: noop,
  insert: noop,
  update: noop,
  delete: noop,
  eq: noop,
  neq: noop,
  lt: noop,
  gt: noop,
  lte: noop,
  gte: noop,
  single: () => Promise.resolve({ data: null, error: null }),
  then: (resolve: any) => Promise.resolve({ data: null, error: null, count: null }).then(resolve),
  catch: (reject: any) => Promise.resolve({ data: null, error: null }),
};

const noopStorage = {
  from: () => ({
    upload: () => Promise.resolve({ data: null, error: null }),
    getPublicUrl: () => ({ data: { publicUrl: '' } }),
  }),
};

const noopChannel = {
  on: () => noopChannel,
  subscribe: () => noopChannel,
};

export const supabase: any = {
  from: (table: string) => ({
    select: (...args: any[]) => ({
      eq: (...args: any[]) => ({
        single: () => Promise.resolve({ data: null, error: null }),
        order: (...args: any[]) => Promise.resolve({ data: [], error: null }),
        gt: (...args: any[]) => Promise.resolve({ data: [], error: null }),
        neq: (...args: any[]) => ({
          neq: (...args: any[]) => ({
            neq: (...args: any[]) => ({
              lt: (...args: any[]) => ({
                gt: (...args: any[]) => Promise.resolve({ count: 0, error: null }),
              }),
            }),
          }),
        }),
      }),
      order: (...args: any[]) => Promise.resolve({ data: [], error: null }),
      gt: (...args: any[]) => Promise.resolve({ data: [], error: null }),
      single: () => Promise.resolve({ data: null, error: null }),
    }),
    insert: (data: any) => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: null }),
      }),
    }),
    update: (data: any) => ({
      eq: (...args: any[]) => ({
        eq: (...args: any[]) => ({
          eq: (...args: any[]) => Promise.resolve({ data: null, error: null }),
        }),
        select: () => Promise.resolve({ data: [], error: null }),
      }),
      select: () => Promise.resolve({ data: [], error: null }),
    }),
    delete: () => ({
      eq: (...args: any[]) => Promise.resolve({ data: null, error: null }),
    }),
  }),
  storage: noopStorage,
  channel: (name: string) => noopChannel,
  removeChannel: (channel: any) => { },
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
  },
};