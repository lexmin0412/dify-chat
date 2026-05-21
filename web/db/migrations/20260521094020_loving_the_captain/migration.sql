-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `_prisma_migrations` (
	`id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci PRIMARY KEY,
	`checksum` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
	`finished_at` datetime(3),
	`migration_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
	`logs` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
	`rolled_back_at` datetime(3),
	`started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`applied_steps_count` int unsigned NOT NULL DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci PRIMARY KEY,
	`name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
	`email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
	`password` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `users_email_key` UNIQUE INDEX(`email`)
);
--> statement-breakpoint
CREATE TABLE `dify_apps` (
	`id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci PRIMARY KEY,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL,
	`name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
	`mode` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
	`description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
	`tags` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
	`is_enabled` int DEFAULT 1,
	`api_base` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
	`api_key` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
	`enable_answer_form` tinyint(1) NOT NULL DEFAULT false,
	`answer_form_feedback_text` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
	`enable_update_input_after_starts` tinyint(1) NOT NULL DEFAULT false,
	`opening_statement_display_mode` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
	`enable_annotation` tinyint(1) NOT NULL DEFAULT false
);

*/