import { pgTable, text, timestamp, varchar, integer, boolean, pgEnum, primaryKey, uuid, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

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
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 2. Courses (New)
export const courses = pgTable('courses', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 256 }).notNull(),
  subtitle: text('subtitle'),
  description: text('description'),
  imageUrl: text('image_url'),
  priceCents: integer('price_cents').notNull().default(0),
  isPublished: boolean('is_published').default(false),
  language: text('language').default('English'),
  level: text('level').default('All Levels'),
  category: text('category'),
  primaryTopic: text('primary_topic'),
  allowDownload: boolean('allow_download').default(false),
  features: json('features').$type<{ label: string; value: string }[]>(),
  guarantee: text('guarantee'),
  accessMonths: integer('access_months'),
  startDate: timestamp('start_date', { withTimezone: true }).defaultNow(),
  endDate: timestamp('end_date', { withTimezone: true }).default(new Date('2100-12-31')),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 3. Modules (Sections)
export const modules = pgTable('modules', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id').references(() => courses.id).notNull(),
  title: varchar('title', { length: 256 }).notNull(),
  orderIndex: integer('order_index').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 4. Lessons
export const lessons = pgTable('lessons', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id').references(() => courses.id), // Kept for easier querying, but modules is the structural parent
  moduleId: uuid('module_id').references(() => modules.id), // New structural parent
  title: varchar('title', { length: 256 }).notNull(),
  orderIndex: integer('order_index').notNull(), // Determines sequence within module
  videoEmbedUrl: text('video_embed_url').notNull(), // Vimeo URL
  description: text('description'),
  slug: text('slug').unique(),
  downloadUrl: text('download_url'),
  hasAttachment: boolean('has_attachment').default(false),
  hasAssessment: boolean('has_assessment').default(false),
});

// 4. Transactions (Sales History)
export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  courseId: uuid('course_id').references(() => courses.id), // Link transaction to course
  amountCents: integer('amount_cents').notNull(),
  status: transactionStatus('status').default('pending').notNull(),
  type: offerType('type').notNull(),
  paymentIntentId: text('payment_intent_id').unique(), // For Idempotency
  isVaulted: boolean('is_vaulted').default(false), // Was card saved?
  saleDate: timestamp('sale_date', { withTimezone: true }).defaultNow().notNull(),
});

// 5. Lesson Completion (Progress)
export const lessonCompletion = pgTable('lesson_completion', {
  userId: text('user_id').references(() => users.id).notNull(),
  lessonId: uuid('lesson_id').references(() => lessons.id).notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.lessonId] }),
}));

// 6. Attachments
export const attachments = pgTable('attachments', {
  id: uuid('id').defaultRandom().primaryKey(),
  lessonId: uuid('lesson_id').references(() => lessons.id).notNull(),
  fileName: varchar('file_name', { length: 256 }).notNull(),
  storageUrl: text('storage_url').notNull(), // Vercel Blob URL (Hidden behind proxy)
});

// 7. Q&A Messages (Self-Referencing)
export const qaMessages = pgTable('qa_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  authorId: text('author_id').references(() => users.id).notNull(),
  lessonId: uuid('lesson_id').references(() => lessons.id).notNull(),
  parentId: uuid('parent_id'), // Self-reference for replies
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 8. Sales Periods (Scarcity)
export const salesPeriods = pgTable('sales_periods', {
  id: uuid('id').defaultRandom().primaryKey(),
  offerType: offerType('offer_type').notNull(),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
});

// 9. Assessments
export const assessments = pgTable('assessments', {
  id: uuid('id').defaultRandom().primaryKey(),
  lessonId: uuid('lesson_id').references(() => lessons.id).notNull(),
  questionText: text('question_text').notNull(),
  correctAnswer: text('correct_answer').notNull(), // Server-only!
});

export const userAttempts = pgTable('user_attempts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  assessmentId: uuid('assessment_id').references(() => assessments.id).notNull(),
  score: integer('score').notNull(),
  attemptedAt: timestamp('attempted_at', { withTimezone: true }).defaultNow().notNull(),
});

// 10. Relations

export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions),
  lessonCompletion: many(lessonCompletion),
  qaMessages: many(qaMessages),
  userAttempts: many(userAttempts),
  enrollments: many(enrollments),
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  modules: many(modules),
  lessons: many(lessons),
  transactions: many(transactions),
  enrollments: many(enrollments),
}));

export const modulesRelations = relations(modules, ({ one, many }) => ({
  course: one(courses, {
    fields: [modules.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [transactions.courseId],
    references: [courses.id],
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

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  course: one(courses, {
    fields: [lessons.courseId],
    references: [courses.id],
  }),
  module: one(modules, {
    fields: [lessons.moduleId],
    references: [modules.id],
  }),
  attachments: many(attachments),
  assessments: many(assessments),
  lessonCompletion: many(lessonCompletion),
  qaMessages: many(qaMessages),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  lesson: one(lessons, {
    fields: [attachments.lessonId],
    references: [lessons.id],
  }),
}));

export const assessmentsRelations = relations(assessments, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [assessments.lessonId],
    references: [lessons.id],
  }),
  userAttempts: many(userAttempts),
}));

export const userAttemptsRelations = relations(userAttempts, ({ one }) => ({
  user: one(users, {
    fields: [userAttempts.userId],
    references: [users.id],
  }),
  assessment: one(assessments, {
    fields: [userAttempts.assessmentId],
    references: [assessments.id],
  }),
}));

export const qaMessagesRelations = relations(qaMessages, ({ one, many }) => ({
  author: one(users, {
    fields: [qaMessages.authorId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [qaMessages.lessonId],
    references: [lessons.id],
  }),
  parent: one(qaMessages, {
    fields: [qaMessages.parentId],
    references: [qaMessages.id],
    relationName: 'replies',
  }),
  replies: many(qaMessages, {
    relationName: 'replies',
  }),
}));

// 11. Enrollments (Access Control)
export const enrollments = pgTable('enrollments', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  courseId: uuid('course_id').references(() => courses.id).notNull(),
  enrolledAt: timestamp('enrolled_at', { withTimezone: true }).defaultNow().notNull(),
  firstAccessedAt: timestamp('first_accessed_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
});

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, {
    fields: [enrollments.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
}));
