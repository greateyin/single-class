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


