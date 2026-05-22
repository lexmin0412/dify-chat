CREATE TABLE IF NOT EXISTS `dify_apps` (
	`id` varchar(191) PRIMARY KEY,
	`created_at` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updated_at` datetime(3) NOT NULL,
	`name` varchar(191) NOT NULL,
	`mode` varchar(191),
	`description` varchar(191),
	`tags` varchar(191),
	`is_enabled` int DEFAULT 1,
	`api_base` varchar(191) NOT NULL,
	`api_key` varchar(191) NOT NULL,
	`enable_answer_form` boolean NOT NULL DEFAULT false,
	`answer_form_feedback_text` varchar(191),
	`enable_update_input_after_starts` boolean NOT NULL DEFAULT false,
	`opening_statement_display_mode` varchar(191),
	`enable_annotation` boolean NOT NULL DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `users` (
	`id` varchar(191) PRIMARY KEY,
	`name` varchar(191),
	`email` varchar(191) NOT NULL,
	`password` varchar(191) NOT NULL,
	`created_at` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `users_email_key` UNIQUE INDEX(`email`)
);
