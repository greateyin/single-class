# Single Class Platform

A scalable course platform built with Next.js 16, Drizzle ORM, Stripe, and PayPal.

## 🚀 Getting Started

First, run the development server:

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## ⚙️ Setup & Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env.local
```

### Key Environment Variables

-   **`NEXT_PUBLIC_BASE_URL`**: (Required for Production) The full URL of your application (e.g., `https://uat-class.most.tw`).
-   **`NEXT_PUBLIC_APP_NAME`**: The name of your application (e.g., "Most Class"), used in email subjects and headers.
-   **`DATABASE_URL`**: Connection string for your PostgreSQL database (e.g., Neon).
-   **`AUTH_SECRET`**: Random string for NextAuth encryption.
-   **`AUTH_GOOGLE_CLIENT_ID` / `SECRET`**: Google OAuth credentials.
-   **`RESEND_FROM_EMAIL`**: The "From" email address for system emails (e.g., `notification@yourdomain.com`). Must be verified in Resend for production use.
-   **`BLOB_READ_WRITE_TOKEN`**: (Required for Image Uploads) Token for Vercel Blob storage. You can find this in your Vercel Storage dashboard.
-   **`NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`**: (Optional) GA4 Measurement ID for Google Analytics.
-   **`NEXT_PUBLIC_FACEBOOK_PIXEL_ID`**: (Optional) Pixel ID for Facebook/Meta tracking.
-   **`NEXT_PUBLIC_MICROSOFT_CLARITY_ID`**: (Optional) Project ID for Microsoft Clarity heatmaps and session recording.

## 📊 Analytics & Tracking

The platform supports built-in integration for popular analytics tools. Simply add the corresponding ID to your environment variables to enable them.

- **Google Analytics**: Adds the GA4 tag (`gtag.js`) to all pages.
- **Facebook Pixel**: Adds the standard Facebook Pixel base code for page view tracking.
- **Microsoft Clarity**: Adds the Clarity tracking script for user behavior analysis.

If an ID is missing or left empty, the corresponding script will not be loaded.

## 🗺️ URL Structure & Routes

### 🟢 Public Funnel (Sales & Checkout)
| URL | Purpose |
| --- | --- |
| `/core` | **Core Offer Sales Page**. The main landing page for the course. |
| `/enroll/[courseId]` | **Enrollment Page**. Dynamic checkout page with Stripe & PayPal options. |
| `/upsell` | **One-Click Upsell**. Offered immediately after a successful core purchase. |
| `/downsell` | **Downsell Page**. Offered if the user rejects the upsell. |
| `/confirmation` | **Order Confirmation**. The final "Thank You" page. |

### 🔵 Student Area (Learning)
| URL | Purpose |
| --- | --- |
| `/dashboard` | **Student Dashboard**. Lists all purchased courses and progress. |
| `/courses/[courseId]` | **Course Curriculum**. Displays the list of lessons for a specific course. |
| `/lessons/[lessonId]` | **Lesson Player**. Video player, content, and navigation for a specific lesson. |
| `/qa` | **Q&A Board**. Global question and answer section for students. |

### 🔴 Admin Area (Management)
*Requires `role: 'admin'`*

| URL | Purpose |
| --- | --- |
| `/admin` | **Admin Dashboard**. Overview of revenue, users, and sales stats. |
| `/admin/courses` | **Course Management**. Create, edit, and publish courses. |
| `/admin/lessons` | **Lesson Management**. Create and organize lessons within courses. |
| `/admin/users` | **User Management**. View registered users and their purchase status. |

### ⚙️ API & Webhooks
| URL | Purpose |
| --- | --- |
| `/api/webhooks/stripe` | **Stripe Webhook**. Listens for payment events to fulfill orders. |
| `/api/auth/signin` | **Sign In**. Authentication page (Magic Link / Credentials). |

## 🛠️ Key Commands

- `npm run dev`: Start development server.
- `npm run build`: Build for production.
- `npm run db:push`: Deploy schema changes to the database.
- `npm run db:studio`: Open Drizzle Studio to view data.
- `npm run db:seed`: Populate the database with initial data (e.g., default course).

## 🌱 Database Seeding & Initial Data

The application requires certain data to function correctly. If the database is empty, you may encounter errors like "Course not found".

### Required Initial Data
1.  **Courses**: At least one course must exist for the enrollment page (`/enroll/[courseId]`) to work.
2.  **Users**: You can register a new user via the Sign In page. To access the Admin Dashboard, you must manually update the user's role to `admin` in the database.

### How to Seed
Run the following command to create a default course:
```bash
npm run db:seed
```

### Handling Missing Data
- **"Course not found"**: Run the seed script or create a course manually via the Admin Dashboard (once you have admin access).
- **"User not found"**: Ensure you have registered or that the auto-registration flow (Guest Checkout) is working.


