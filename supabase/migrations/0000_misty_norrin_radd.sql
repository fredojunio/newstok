CREATE TABLE "generated_contents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"model_used" text NOT NULL,
	"selected_version" integer,
	"hook" text,
	"bridge" text,
	"value" text,
	"cta" text,
	"full_content" text,
	"style" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
