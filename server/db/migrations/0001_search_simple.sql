ALTER TABLE "notes" drop column "search";--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "search" "tsvector" GENERATED ALWAYS AS (setweight(to_tsvector('simple', title), 'A') || setweight(to_tsvector('simple', content), 'B')) STORED;--> statement-breakpoint
CREATE INDEX "notes_search_idx" ON "notes" USING gin ("search");