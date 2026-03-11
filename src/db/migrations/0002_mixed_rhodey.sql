ALTER TABLE `hanuman_documents` ADD `origin` text;--> statement-breakpoint
ALTER TABLE `hanuman_documents` ADD `project` text;--> statement-breakpoint
ALTER TABLE `hanuman_documents` ADD `created_by` text;--> statement-breakpoint
CREATE INDEX `idx_origin` ON `hanuman_documents` (`origin`);--> statement-breakpoint
CREATE INDEX `idx_project` ON `hanuman_documents` (`project`);--> statement-breakpoint
ALTER TABLE `search_log` ADD `results` text;