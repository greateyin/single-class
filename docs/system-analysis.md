# Single Course Platform – System Analysis & Architecture

## 1. Architecture Overview
- **Pattern**: **Serverless Monolith**.
    - The entire application (Frontend + Backend API + Jobs) is hosted within a single Next.js 16+ repository.
    - **App Router** serves as the backbone, utilizing **React Server Components (RSC)** for data fetching and **Server Actions** for mutations.
- **Infrastructure**:
    - **Compute**: Vercel Serverless Functions (Node.js runtime for crypto/payments, Edge for static assets).
    - **Database**: **Neon PostgreSQL** (Serverless).
        - Uses **Branching** for development/preview environments.
        - **Drizzle ORM** for type-safe, lightweight SQL interaction (Zero runtime overhead).
    - **Storage**: **Vercel Blob** for course attachments (PDFs, zips).
    - **Email**: **Resend** for transactional emails (Auth, Receipts).

## 2. Security Architecture

### 2.1 Defense in Depth Strategy
1.  **Network Layer**:
    - **Vimeo Domain Restrictions**: Videos are configured to ONLY play on `yourdomain.com` and `staging.yourdomain.com`.
    - **CSP (Content Security Policy)**:
        - `frame-ancestors 'none'`: Prevents the site from being embedded in iframes (Clickjacking protection).
        - `frame-src https://player.vimeo.com`: Only allows Vimeo iframes.
2.  **Application Layer**:
    - **Server-Side Validation**: All critical logic (Price, Scarcity, Access) happens in Server Actions. Client input is treated as untrusted.
    - **RBAC**: `auth-guards.ts` enforces `ADMIN` vs `STUDENT` roles before any DB operation.
    - **Sanitization**: All inputs (especially Q&A) are sanitized to prevent XSS.
3.  **Data Layer**:
    - **Row Level Security (Logical)**: Drizzle queries always filter by `userId` for student data access.
    - **Encryption**: Passwords (if used) are hashed with `bcrypt`. Session tokens are signed JWTs.

### 2.2 Payment Security
- **PCI Compliance**:
    - No credit card data ever touches the application server.
    - **Stripe Elements** / **PayPal SDK** handle tokenization directly in the browser.
- **Vaulting**:
    - `stripe_customer_id` is stored in the DB to map users to their payment methods.
    - **Consent**: The checkout flow explicitly requests consent for "future payments" (`setup_future_usage`) to enable legal One-Click Upsells.
- **Webhook Integrity**:
    - All fulfillment relies on Webhooks.
    - Webhook endpoints verify the **cryptographic signature** provided by Stripe/PayPal before processing.

## 3. Performance & Scalability

### 3.1 Database Optimization
- **Connection Pooling**: Neon provides built-in connection pooling, essential for Serverless environments to prevent connection exhaustion.
- **Drizzle RQB (Relational Query Builder)**:
    - Used to fetch nested data (e.g., `User` + `Enrollments` + `Progress`) in a single SQL query, avoiding the N+1 problem.
- **Indexing**:
    - Composite indexes on `lesson_completion(user_id, lesson_id)` for fast progress lookups.
    - Index on `transactions(payment_intent_id)` for O(1) idempotency checks.

### 3.2 Caching Strategy (Next.js)
- **Static Content**: Landing pages and Course structure are statically generated (SSG) or cached (ISR).
- **Dynamic Content**: User progress and dashboard are rendered dynamically (SSR/RSC).
- **Revalidation**:
    - **Tags**: `revalidateTag('user-purchases')` is called immediately after a successful Webhook or Upsell to ensure the UI reflects the new state instantly.
    - **Paths**: `revalidatePath('/dashboard')` is used for granular updates like lesson completion.

## 4. Deployment Topology
- **Production**:
    - `main` branch deploys to Production.
    - Connects to Neon `main` branch.
- **Preview**:
    - Pull Requests deploy to Vercel Preview URLs.
    - **Neon Branching**: Each PR can optionally spin up a dedicated DB branch (copy of main schema) for isolated testing.
- **Environment Variables**:
    - Managed via Vercel Project Settings.
    - Sensitive keys (`STRIPE_SECRET_KEY`, `DB_URL`) are strictly Server-Only.

## 5. Observability
- **Analytics**:
    - **GA4**: Tracks conversion events (Begin Checkout, Purchase).
    - **Microsoft Clarity**: Heatmaps and session recordings to debug UX friction in the funnel.
- **Logging**:
    - Server Actions log critical failures (e.g., Payment Declined, Webhook Signature Mismatch) to Vercel Logs.
    - **Error Handling**: Global `error.tsx` boundaries catch unhandled exceptions.

## 6. Risks & Mitigations
- **Risk**: Webhook delays causing "Paid but no Access".
    - **Mitigation**: Webhooks are usually fast, but UI should show "Processing..." state. Idempotency ensures retries don't cause double-fulfillment.
- **Risk**: Shared Accounts.
    - **Mitigation**: Monitor concurrent sessions (future scope). Basic mitigation via rate limiting.
- **Risk**: Video URL Leaks.
    - **Mitigation**: Vimeo domain locking makes the URL useless outside the platform.
