# Single Course Platform – Program Specification (Next.js 16+)

## 1. Project Structure (App Router)
```
.
├── app/
│   ├── (funnel)/                  # Sales Funnel Routes
│   │   ├── enroll/page.tsx        # Lead Capture / Squeeze Page
│   │   ├── core/page.tsx          # Core Offer Sales Page
│   │   ├── upsell/page.tsx        # One-Click Upsell Page
│   │   ├── downsell/page.tsx      # Downsell Page
│   │   └── confirmation/page.tsx  # Order Confirmation
│   ├── (auth)/                    # Auth Pages (Signin/Signup/Reset)
│   ├── (course)/                  # Protected Course Area
│   │   ├── dashboard/page.tsx     # Student Dashboard
│   │   ├── lessons/[id]/page.tsx  # Lesson Player & Content
│   │   └── qa/page.tsx            # Q&A Center
│   ├── admin/                     # Admin Console (RBAC Protected)
│   │   ├── users/page.tsx
│   │   └── sales/page.tsx
│   ├── api/
│   │   └── webhooks/
│   │       ├── stripe/route.ts    # Stripe Webhook (Raw Body)
│   │       └── paypal/route.ts    # PayPal Webhook
│   └── layout.tsx                 # Root Layout (CSP, Analytics)
├── src/
│   ├── db/
│   │   ├── schema.ts              # Drizzle ORM Schema Definition
│   │   └── index.ts               # DB Connection
│   ├── lib/
│   │   ├── auth.ts                # Auth.js Config (Adapters, Providers)
│   │   ├── auth-guards.ts         # Server-Side Permission Checks
│   │   ├── stripe.ts              # Stripe SDK Instance
│   │   └── fulfillment.ts         # Centralized Order Fulfillment Logic
│   ├── actions/                   # Server Actions ('use server')
│   │   ├── payment.ts             # Checkout & One-Click Logic
│   │   ├── content.ts             # Progress, Attachments, Q&A
│   │   └── admin.ts               # Admin CRUD Operations
│   └── components/                # ShadCN UI & Custom Components
└── next.config.mjs                # CSP Headers & Config
```

## 2. Database Schema (Drizzle ORM)

The database is the single source of truth. All timestamps should use `withTimezone: true`.

```typescript
// src/db/schema.ts

import { pgTable, text, timestamp, serial, varchar, integer, boolean, pgEnum, primaryKey } from 'drizzle-orm/pg-core';

// Enums
export const userRoles = pgEnum('user_role', ['student', 'admin']);
export const transactionStatus = pgEnum('transaction_status', ['pending', 'completed', 'failed', 'refunded']);
export const offerType = pgEnum('offer_type', ['core', 'upsell', 'downsell']);

// 1. Users
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Matches Auth.js ID format
  email: text('email').notNull().unique(),
  hashedPassword: text('hashed_password'), // For Credentials provider
  role: userRoles('role').default('student').notNull(),
  stripeCustomerId: text('stripe_customer_id'), // Critical for One-Click Upsell
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 2. Lessons (Implicit Course Structure)
export const lessons = pgTable('lessons', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 256 }).notNull(),
  orderIndex: integer('order_index').notNull(), // Determines sequence
  videoEmbedUrl: text('video_embed_url').notNull(), // Vimeo URL
  hasAttachment: boolean('has_attachment').default(false),
  hasAssessment: boolean('has_assessment').default(false),
});

// 3. Transactions (Sales History)
export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  amountCents: integer('amount_cents').notNull(),
  status: transactionStatus('status').default('pending').notNull(),
  type: offerType('type').notNull(),
  paymentIntentId: text('payment_intent_id').unique(), // For Idempotency
  isVaulted: boolean('is_vaulted').default(false), // Was card saved?
  saleDate: timestamp('sale_date', { withTimezone: true }).defaultNow().notNull(),
});

// 4. Lesson Completion (Progress)
export const lessonCompletion = pgTable('lesson_completion', {
  userId: text('user_id').references(() => users.id).notNull(),
  lessonId: integer('lesson_id').references(() => lessons.id).notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.lessonId] }),
}));

// 5. Attachments
export const attachments = pgTable('attachments', {
  id: serial('id').primaryKey(),
  lessonId: integer('lesson_id').references(() => lessons.id).notNull(),
  fileName: varchar('file_name', { length: 256 }).notNull(),
  storageUrl: text('storage_url').notNull(), // Vercel Blob URL (Hidden behind proxy)
});

// 6. Q&A Messages (Self-Referencing)
export const qaMessages = pgTable('qa_messages', {
  id: serial('id').primaryKey(),
  authorId: text('author_id').references(() => users.id).notNull(),
  lessonId: integer('lesson_id').references(() => lessons.id).notNull(),
  parentId: integer('parent_id'), // Self-reference for replies
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 7. Sales Periods (Scarcity)
export const salesPeriods = pgTable('sales_periods', {
  id: serial('id').primaryKey(),
  offerType: offerType('offer_type').notNull(),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
});

// 8. Assessments
export const assessments = pgTable('assessments', {
  id: serial('id').primaryKey(),
  lessonId: integer('lesson_id').references(() => lessons.id).notNull(),
  questionText: text('question_text').notNull(),
  correctAnswer: text('correct_answer').notNull(), // Server-only!
});

export const userAttempts = pgTable('user_attempts', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  assessmentId: integer('assessment_id').references(() => assessments.id).notNull(),
  score: integer('score').notNull(),
  attemptedAt: timestamp('attempted_at', { withTimezone: true }).defaultNow().notNull(),
});
```

## 3. Key Logic & Pseudocode

### 3.1 Authentication (Auth.js)
- **Adapter**: `DrizzleAdapter` to persist sessions/users.
- **Strategy**: `jwt`.
- **Callbacks**:
    - `jwt({ token, user })`: If `user` is present (login), add `user.role` to `token`.
    - `session({ session, token })`: Copy `token.role` to `session.user.role`.
- **Providers**:
    - `Google`: Standard OAuth.
    - `Resend`: Magic Link.
    - `Credentials`: Custom `authorize` function checking `bcrypt.compare(password, user.hashedPassword)`.

### 3.2 Payment & Funnel (Server Actions)

#### `createCoreCheckoutSession()`
1.  **Auth Check**: Ensure user is logged in.
2.  **Scarcity Check**: Query `salesPeriods`. If `now() > endTime`, redirect to `/expired`.
3.  **Price Fetch**: Query DB for current price (do not trust client).
4.  **Stripe Session**:
    ```typescript
    stripe.checkout.sessions.create({
      mode: 'payment',
      setup_future_usage: 'on_session', // CRITICAL for Upsell
      metadata: { userId, offerType: 'core' },
      success_url: '.../confirmation?session_id={CHECKOUT_SESSION_ID}',
      // ...
    })
    ```

#### `handleOneClickUpsell()`
1.  **Auth Check**: Ensure user is logged in.
2.  **Customer Check**: Fetch `stripeCustomerId` from `users` table.
3.  **Charge**:
    ```typescript
    stripe.paymentIntents.create({
      amount: upsellPrice,
      customer: stripeCustomerId,
      off_session: true, // CRITICAL: No user interaction required
      confirm: true,
      metadata: { userId, offerType: 'upsell' }
    })
    ```
4.  **Fulfillment**: Call `fulfillOrder` immediately on success.

### 3.3 Fulfillment (Idempotent)

#### `fulfillOrder(userId, offerType, paymentRef)`
1.  **Idempotency**: Check `transactions` table. If `paymentIntentId == paymentRef` AND `status == 'completed'`, return immediately (ignore duplicate).
2.  **Transaction**: Start DB transaction.
    -   Insert `transactions` record with `status: 'completed'`.
    -   If `offerType == 'core'`, update `users.stripeCustomerId`.
3.  **Email**: Send confirmation email via Resend.
4.  **Cache**: `revalidateTag('user-purchases')`.

### 3.4 Content Access (Secure Proxy)

#### `getSecureAttachmentUrl(attachmentId)`
1.  **Guard**: `enforcePaidAccess()`.
2.  **Fetch**: Get `storageUrl` from `attachments` table.
3.  **Return**: Return the URL to the client (client then redirects).
    -   *Note*: Since Vercel Blob URLs are public but unguessable, this proxy prevents users from listing files or sharing the direct link easily without auth.

## 4. Security Controls
- **CSP**:
    - `script-src`: 'self', 'unsafe-inline' (for hydration), `https://js.stripe.com`, `https://www.googletagmanager.com`, `https://www.clarity.ms`.
    - `frame-src`: `https://player.vimeo.com`, `https://js.stripe.com`.
    - `connect-src`: 'self', `https://api.stripe.com`, analytics endpoints.
- **RBAC**:
    - Middleware protects `/admin` routes.
    - `auth-guards.ts` protects Server Actions.
