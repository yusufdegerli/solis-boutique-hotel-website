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

# Admin Access Control (Comma separated emails)
ADMIN_EMAILS=admin@solis.com,manager@solis.com

# Site URL (For email links)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **Important:** The `SUPABASE_SERVICE_ROLE_KEY` is critical for server-side operations (like creating bookings without login) and must never be exposed to the client-side.

## 4. Database Setup (Supabase)

This project uses raw SQL for migrations. You need to run the following scripts in your **Supabase SQL Editor** in the specified order to set up the schema correctly.

1.  **Initial Schema:** Run `supabase/migrations/20240101000000_init_schema.sql` (if available) or `db_schema.sql` to create the base tables (`Hotel_Information_Table`, `Rooms_Information`, `Reservation_Information`).
2.  **Room Images Fix:** Run `MIGRATE_ROOM_IMAGES.sql` to enable array support for room images.
3.  **Cancellation System:** Run `MIGRATE_CANCELLATION_TOKEN.sql` to add the cancellation token column and the secure booking function (`create_booking_safe`).
4.  **User Roles & Permissions:** Run `MIGRATE_USER_ROLES.sql` to setup the `user_roles` table and RLS policies.
5.  **Storage Buckets:**
    - Create a public storage bucket named `hotel-images`.
    - Set the policy to allow public read access.

## 5. Seed Data (Optional)

To populate the database with initial hotel and room data for testing:

```bash
npx tsx seed_db.ts
```

## 6. Running the Application

Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

- **Public Site:** Visit `/` (e.g., `/tr` or `/en`).
- **Admin Panel:** Visit `/tr/admin` (Requires login with an email listed in `ADMIN_EMAILS`).

## Troubleshooting

- **"Invalid input syntax for type bigint"**: This usually means the `create_booking_safe` function in the database is outdated. Re-run `MIGRATE_CANCELLATION_TOKEN.sql` in Supabase.
- **"supabase.from is not a function"**: Ensure you are using `createClient()` from `@/lib/supabase/server` in Server Components and awaiting it.
