# Single Course Platform – Functional Specification

## 1. Overview
- **Product**: High-performance, high-security single-course platform with a conversion-optimized sales funnel.
- **Tech Stack**: Next.js 16+ (App Router), Auth.js v5, Drizzle ORM, Neon PostgreSQL, ShadCN/UI, Resend.
- **Core Value**: Secure content delivery (IP protection), frictionless "One-Click" upsells, and robust server-side validation for all transactions.

## 2. Goals & Non-Goals
- **Goals**:
    - **Sales Funnel**: Implement a "Core -> Upsell -> Downsell" flow with server-enforced scarcity (sales periods).
    - **One-Click Payments**: Securely vault payment methods (Stripe/PayPal) to enable zero-friction upsells.
    - **Security**: "Serverless Monolith" architecture where all business logic (auth, payments, access control) resides in secure Server Actions.
    - **Content Protection**: Dual-layer protection using Vimeo Domain-Level Privacy and strict Content Security Policy (CSP).
    - **Analytics**: Full integration of GA4 (quantitative) and Microsoft Clarity (qualitative) for funnel optimization.
- **Non-Goals**:
    - Multi-tenant marketplace (this is a single-product site).
    - Instructor portal (admin is the only content manager).
    - Native mobile apps (PWA/Responsive Web is sufficient).

## 3. Personas
- **Student**:
    - Enters via Landing Page -> Purchases Core Offer -> Presented with Upsell -> Accesses Dashboard.
    - Consumes video lessons, downloads secure attachments, takes assessments, and asks questions.
- **Admin**:
    - Manages users (students), views transaction history, and monitors sales performance.
    - Configures sales periods (scarcity), manages course content (lessons, attachments), and moderates Q&A.

## 4. Functional Requirements

### 4.1 Authentication & Identity (Auth.js V5)
- **Hybrid Strategy**:
    - **Google OAuth**: Primary, low-friction login.
    - **Magic Link (Resend)**: Recommended passwordless option for security.
    - **Credentials (Email/Password)**: Supported to meet specific user requirements.
        - *Implementation*: Requires custom `authorize` logic with `bcrypt` hashing.
        - *Password Management*: Custom "Forgot Password" flow using short-lived tokens sent via Resend.
- **Role-Based Access Control (RBAC)**:
    - Roles: `ADMIN`, `STUDENT`.
    - Roles must be persisted in the Database (`users` table) and synchronized to the Session via JWT callbacks.
    - **Strict Enforcement**: All Server Actions must verify `session.user.role` before execution.

### 4.2 High-Performance Sales Funnel
- **Flow**: Landing Page -> Checkout (Core) -> Upsell Offer -> (if declined) Downsell Offer -> Confirmation.
- **Scarcity Enforcement**:
    - **Server-Side Validation**: Never trust client clocks. Server Actions must check the `sales_periods` table in DB before processing any charge.
    - **Redirects**: If a sale period is expired, the server must redirect the user to an "Expired/Waitlist" page immediately.
- **Pricing**:
    - Prices are authoritative in the Database. Server Actions fetch price by `course_id` or `offer_type`, ignoring any client-sent price data.

### 4.3 Payments & Fulfillment
- **Dual Gateway Support**:
    - **Stripe**:
        - **Core Purchase**: Use `checkout.session.create` with `setup_future_usage: 'on_session'` to vault the card.
        - **Upsell (One-Click)**: Use `paymentIntents.create` with `off_session: true` using the stored `stripe_customer_id`.
        - **Fulfillment**: Must be triggered via **Webhooks** (`checkout.session.completed`) to ensure validity. Verify signatures using `STRIPE_WEBHOOK_SECRET`.
    - **PayPal**:
        - **Core Purchase**: Standard Order Create/Capture flow.
        - **Upsell**: Use "Vaulted Payments" (Billing Agreements) if supported, or fallback to standard approval.
        - **Fulfillment**: Triggered upon successful Capture response (`status === 'COMPLETED'`).
- **Idempotency**:
    - Fulfillment logic must check if a `transaction` with the same `payment_intent_id` already exists to prevent duplicate enrollments/emails.
- **Receipts**: Automated email receipts sent via Resend upon successful fulfillment.

### 4.4 Content Security (DRM)
- **Vimeo Integration**:
    - Videos set to "Hide from Vimeo".
    - **Domain Whitelist**: Restrict playback to the specific production/staging domains of the platform.
- **Content Security Policy (CSP)**:
    - `frame-ancestors 'none'`: Prevents clickjacking/embedding on unauthorized sites.
    - `frame-src`: Whitelist `player.vimeo.com`.
- **Access Control**:
    - Video URLs and Embeds are only rendered if the user has a valid, paid `enrollment` record in the DB.

### 4.5 Learning Experience
- **Progress Tracking**:
    - Track completion status and watch time per lesson.
    - Data stored in `lesson_completion` table.
- **Attachments**:
    - Files stored in **Vercel Blob**.
    - **Secure Proxy**: Direct Blob URLs are NOT exposed. A Server Action (`/api/attachments/:id`) validates auth/payment before redirecting to the temporary download URL.
- **Assessments**:
    - Simple quizzes per lesson.
    - **Server-Side Scoring**: Correct answers never sent to client. Submission handled by Server Action which returns only the score.
- **Q&A System**:
    - Threaded comments per lesson.
    - Self-referencing DB schema for replies.

### 4.6 Admin Capabilities
- **Dashboard**: View total revenue, daily sales, and active students.
- **User Management**: List users, view purchase history, manually grant/revoke access.
- **Content Management**: Reorder lessons, update video IDs, manage attachments.

## 5. User Journeys (Technical Flow)

### 5.1 Core Purchase (Stripe)
1.  **Initiate**: User clicks "Buy Now".
2.  **Validation**: Server Action `createCheckoutSession` checks `sales_periods` (is active?) and fetches Price from DB.
3.  **Stripe Session**: Created with `setup_future_usage: 'on_session'` and metadata `{ userId, offer: 'core' }`.
4.  **Payment**: User completes payment on Stripe hosted page.
5.  **Webhook**: Stripe sends `checkout.session.completed`.
6.  **Fulfillment**:
    -   Server validates signature.
    -   Server updates `transactions` table (status: `completed`).
    -   Server updates `users` table with `stripe_customer_id`.
    -   Server sends Welcome Email (Resend).

### 5.2 One-Click Upsell
1.  **View**: User sees Upsell page.
2.  **Action**: User clicks "Add to Order".
3.  **Processing**:
    -   Server Action `handleUpsell` retrieves `stripe_customer_id` from DB.
    -   Server calls Stripe API: `paymentIntents.create({ customer: id, off_session: true, confirm: true })`.
4.  **Result**:
    -   **Success**: Transaction recorded, user redirected to Confirmation.
    -   **Failure**: User redirected to a manual checkout page or Downsell.

### 5.3 Secure File Download
1.  **Request**: User clicks "Download PDF".
2.  **Guard**: Server Action intercepts request.
3.  **Check**: Is user logged in? Is `transactions` status `completed`?
4.  **Delivery**: If yes, Server redirects to the Vercel Blob secure URL. If no, returns 403.
