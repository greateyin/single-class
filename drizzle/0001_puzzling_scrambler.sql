ALTER TABLE "lessons" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_slug_unique" UNIQUE("slug");