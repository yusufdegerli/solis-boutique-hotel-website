# Installation & Setup Guide

This guide will help you set up the Solis Hotel Management System locally.

## Prerequisites

- **Node.js:** v18.17 or higher (Recommended: v20 LTS)
- **Supabase Account:** You need a Supabase project for the database, authentication, and storage.

## 1. Clone the Repository

```bash
git clone https://github.com/your-username/solis-hotel.git
cd solis-hotel
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Environment Configuration

Create a `.env.local` file in the root directory of the project. Copy the following variables and fill them with your Supabase credentials.

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Site URL (For email links)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **Important:** The `SUPABASE_SERVICE_ROLE_KEY` is critical for server-side operations (like creating bookings without login) and must never be exposed to the client-side.

## 4. Database Setup (Supabase)

This project uses raw SQL for migrations. You need to run the following scripts in your **Supabase SQL Editor** in the specified order to set up the schema correctly.

1.  **Initial Schema:** Run `supabase/migrations/20240101000000_init_schema.sql` (if available) to create the base tables.
2.  **Room Images Fix:** Run `MIGRATE_ROOM_IMAGES.sql` to enable array support for room images.
3.  **Cancellation System:** Run `MIGRATE_CANCELLATION_TOKEN.sql` to add the cancellation token column and the secure booking function (`create_booking_safe`).
4.  **User Roles & Permissions (Important):** Run `MIGRATE_USER_ROLES.sql` to setup the `user_roles` table.
5.  **Fix RLS Policies:** Run the content of `FIX_RLS.sql` (if provided) or ensure RLS policies allow authenticated users to read their own roles.
6.  **Room Amenities:** Run `supabase/migrations/20251224124703_add_amenities_to_rooms.sql` to add the amenities column to the rooms table.

### Storage Buckets
- Create a public storage bucket named `hotel-images`.
- Set the policy to allow public read access.

## 5. Creating an Admin User

Since the system uses a Role-Based Access Control (RBAC), simply signing up is not enough to access the admin panel.

1.  Sign up a user via the website (e.g., `/login` -> Sign Up) or create one in the Supabase Dashboard.
2.  Go to your Supabase Table Editor -> `user_roles` table.
3.  Insert a new row:
    - `user_id`: The UUID of the user you just created.
    - `role`: `admin`

*Alternatively, you can use the provided local helper scripts (not included in the repo) if you have the Service Role Key configured.*

## 6. Running the Application

Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

- **Public Site:** Visit `/` (e.g., `/tr` or `/en`).
- **Admin Panel:** Visit `/tr/admin`. If you are not an admin, you will be redirected to the home page.

## Troubleshooting

- **"Auth session missing"**: Ensure you are using `createBrowserClient` in `src/lib/supabaseClient.ts` for client-side components and `@supabase/ssr` for server-side.
- **"Failed to fetch" on Logout**: Ensure your internet connection is stable and the Supabase project is active.