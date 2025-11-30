import { pgTable, text, timestamp, serial, varchar, integer, boolean, pgEnum, primaryKey } from 'drizzle-orm/pg-core';

// Enums
export const userRoles = pgEnum('user_role', ['student', 'admin']);
export const transactionStatus = pgEnum('transaction_status', ['pending', 'completed', 'failed', 'refunded']);
export const offerType = pgEnum('offer_type', ['core', 'upsell', 'downsell']);

// 1. Users
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Matches Auth.js ID format
  name: text('name'),
  email: text('email').notNull().unique(),
  image: text('image'),
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
  description: text('description'),
  slug: text('slug').unique(),
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

// 9. Relations
import { relations } from 'drizzle-orm';

export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions),
  lessonCompletion: many(lessonCompletion),
  qaMessages: many(qaMessages),
  userAttempts: many(userAttempts),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export const lessonCompletionRelations = relations(lessonCompletion, ({ one }) => ({
  user: one(users, {
    fields: [lessonCompletion.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [lessonCompletion.lessonId],
    references: [lessons.id],
  }),
}));
