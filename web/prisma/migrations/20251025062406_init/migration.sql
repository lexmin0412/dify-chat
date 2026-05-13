-- CreateTable
CREATE TABLE `dify_apps` (
    `id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `mode` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `tags` VARCHAR(191) NULL,
    `is_enabled` INTEGER NULL DEFAULT 1,
    `api_base` VARCHAR(191) NOT NULL,
    `api_key` VARCHAR(191) NOT NULL,
    `enable_answer_form` BOOLEAN NOT NULL DEFAULT false,
    `answer_form_feedback_text` VARCHAR(191) NULL,
    `enable_update_input_after_starts` BOOLEAN NOT NULL DEFAULT false,
    `opening_statement_display_mode` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
