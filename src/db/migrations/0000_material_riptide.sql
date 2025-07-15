CREATE TABLE "short_urls" (
	"id" serial PRIMARY KEY NOT NULL,
	"original_url" text NOT NULL,
	"short_code" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
