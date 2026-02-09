CREATE TYPE "public"."product_status" AS ENUM('AVAILABLE', 'GONE');--> statement-breakpoint
CREATE TYPE "public"."subscription" AS ENUM('FREE', 'PREMIUM');--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"status" "product_status" DEFAULT 'AVAILABLE' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subscription" "subscription" DEFAULT 'FREE' NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
