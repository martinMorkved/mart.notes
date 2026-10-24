CREATE TABLE "task_done" (
	"note_id" uuid NOT NULL,
	"text" text NOT NULL,
	"done_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "task_done_note_id_text_pk" PRIMARY KEY("note_id","text")
);
--> statement-breakpoint
ALTER TABLE "task_done" ADD CONSTRAINT "task_done_note_id_notes_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;