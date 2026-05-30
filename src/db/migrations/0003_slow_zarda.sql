CREATE TYPE "public"."read_status" AS ENUM('unread', 'reading', 'read');--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "read_status" "read_status" DEFAULT 'unread' NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "started_at" timestamp;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "finished_at" timestamp;