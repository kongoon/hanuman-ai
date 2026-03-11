ALTER TABLE `hanuman_documents` ADD `superseded_by` text;--> statement-breakpoint
ALTER TABLE `hanuman_documents` ADD `superseded_at` integer;--> statement-breakpoint
ALTER TABLE `hanuman_documents` ADD `superseded_reason` text;--> statement-breakpoint
CREATE INDEX `idx_superseded` ON `hanuman_documents` (`superseded_by`);