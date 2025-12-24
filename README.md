# Solis Hotel Management System

Solis Hotel is a modern, full-stack hotel management and reservation application built with **Next.js 16 (App Router)**, **TypeScript**, and **Supabase**. It features a multi-language public-facing website, a secure role-based administration dashboard, and a real-time support chat.

## 🚀 Features

### Public Website
- **Dynamic Content:** Hotels, rooms, and services fetched dynamically from Supabase.
- **Reservation System:** 
  - Real-time room availability and date validation.
  - **Cancellation Management:** Users can manage/cancel their bookings via a secure token link sent to their email.
- **Live Chat:** Real-time customer support chat powered by Supabase Realtime.
- **Room Gallery:** Interactive image slider for room details with auto-play functionality.
- **Multi-language Support:** Full localization (i18n) for Turkish (TR), English (EN), Arabic (AR), Hungarian (HU), and Romanian (RO).
- **Responsive Design:** Optimized for mobile, tablet, and desktop devices with a modern aesthetic.

### Admin Dashboard (`/admin`)
- **Role-Based Access Control (RBAC):** Secure access via `user_roles` database table. Only users with the 'admin' role can access the dashboard.
- **Hotel & Room Management:** 
  - CRUD operations for hotels and rooms.
  - **Multi-image Upload:** Support for uploading multiple images per room via Supabase Storage.
- **Guest Management:**
  - **Check-In/Check-Out:** Process guest arrivals and departures with ID verification and payment tracking.
  - **Live Monitoring:** Real-time view of checked-in guests and pending reservations.
- **Chat Management:** Admin panel to view and reply to customer messages in real-time, with unread message badges.
- **Reports:** Visual analytics for occupancy, revenue, and booking status distribution.

## 🛠 Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Server Actions, Turbopack)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL, Realtime, Storage)
- **Auth:** Supabase Auth (SSR with `@supabase/ssr`)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Validation:** [Zod](https://zod.dev/)
- **Date Handling:** [date-fns](https://date-fns.org/)
- **Internationalization:** [next-intl](https://next-intl-docs.vercel.app/)

## 📂 Project Structure

The project follows a clean architecture with the `src/` directory convention:
- `src/app`: App Router pages and API routes.
- `src/components`: Reusable UI components (Public & Admin).
- `src/lib`: Database clients, utility functions, and constants.
- `src/services`: Business logic and data access layers.
- `src/actions`: Server Actions for form submissions and mutations.
- `src/messages`: Translation files for i18n.

## 📦 Installation

For detailed setup instructions, including database migration and environment configuration, please see [INSTALLATION.md](INSTALLATION.md).

## 🔒 Security

- **Row Level Security (RLS):** Database tables are protected. `user_roles` table dictates access levels.
- **Middleware Protection:** The `/admin` route is guarded by a middleware that checks the authenticated user's role against the database.
- **Server Actions:** Sensitive operations like booking creation run securely on the server using Zod validation.
- **SSR Authentication:** Uses `@supabase/ssr` for secure cookie-based session management.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).