# Solis Hotel Management System

Solis Hotel is a modern, full-stack hotel management and reservation application built with **Next.js 15 (App Router)**, **TypeScript**, and **Supabase**. It features a multi-language public-facing website and a secure administration dashboard.

## 🚀 Features

### Public Website
- **Dynamic Content:** Hotels, rooms, and services fetched dynamically from Supabase.
- **Reservation System:** Real-time room availability, date validation, and secure booking process.
- **Room Gallery:** Interactive image slider for room details with auto-play functionality.
- **Multi-language Support:** Full localization (i18n) for Turkish (TR), English (EN), Arabic (AR), Hungarian (HU), and Romanian (RO).
- **Responsive Design:** Optimized for mobile, tablet, and desktop devices.

### Admin Dashboard (`/admin`)
- **Secure Authentication:** Protected routes accessible only to authorized personnel via email whitelist.
- **Hotel & Room Management:** 
  - CRUD operations for hotels and rooms.
  - **Multi-image Upload:** Support for uploading up to 5 images per room via Supabase Storage.
- **Live Monitoring:** Real-time view of checked-in guests and pending reservations.
- **Booking Management:** Confirm, cancel, or check-in/out guests efficiently.
- **Campaign Management:** Interface for managing seasonal discounts (UI only).

## 🛠 Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Server Actions)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Storage:** Supabase Storage (for hotel images)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Validation:** [Zod](https://zod.dev/)
- **Internationalization:** [next-intl](https://next-intl-docs.vercel.app/)

## 📦 Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/solis-hotel.git
    cd solis-hotel
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Environment Setup:**
    Create a `.env.local` file in the root directory and add your Supabase credentials:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_secret_key
    ADMIN_EMAILS=admin@example.com,manager@example.com
    NEXT_PUBLIC_SITE_URL=http://localhost:3000
    ```
    > **Note:** `SUPABASE_SERVICE_ROLE_KEY` is required for bypassing RLS during booking creation and password resets.

4.  **Database Setup:**
    - Create a new Supabase project.
    - Run the provided SQL scripts in the Supabase SQL Editor to set up tables and policies:
        - `db_schema.sql` (Base structure)
        - `MASTER_DB_FIX.sql` (Booking logic & RLS fixes)
        - `STORAGE_POLICIES_OPEN.sql` (Storage permissions)
        - `MIGRATE_ROOM_IMAGES.sql` (Multi-image support for rooms)
        - `FIX_HOTEL_PERMISSIONS.sql` (Full admin access policies)
    - (Optional) Seed the database with initial data:
      ```bash
      npx tsx seed_db.ts
      ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser.

## 🔒 Security

- **Row Level Security (RLS):** Database tables are protected. Only authenticated users (admins) can modify hotel/room data.
- **Middleware Protection:** The `/admin` route is guarded by a middleware that checks both authentication status and the `ADMIN_EMAILS` whitelist.
- **Server Actions:** Sensitive operations like booking creation run securely on the server.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
