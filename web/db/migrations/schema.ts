import { mysqlTable, mysqlSchema, AnyMySqlColumn, varchar, datetime, text, int, boolean, uniqueIndex } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const prismaMigrations = mysqlTable("_prisma_migrations", {
	id: varchar({ length: 36 }).charSet("utf8mb4").collate("utf8mb4_unicode_ci").primaryKey(),
	checksum: varchar({ length: 64 }).charSet("utf8mb4").collate("utf8mb4_unicode_ci").notNull(),
	finishedAt: datetime("finished_at", { fsp: 3 }),
	migrationName: varchar("migration_name", { length: 255 }).charSet("utf8mb4").collate("utf8mb4_unicode_ci").notNull(),
	logs: text().charSet("utf8mb4").collate("utf8mb4_unicode_ci"),
	rolledBackAt: datetime("rolled_back_at", { fsp: 3 }),
	startedAt: datetime("started_at", { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
	appliedStepsCount: int("applied_steps_count", { unsigned: true }).default(0).notNull(),
});

export const users = mysqlTable("users", {
	id: varchar({ length: 191 }).charSet("utf8mb4").collate("utf8mb4_unicode_ci").primaryKey(),
	name: varchar({ length: 191 }).charSet("utf8mb4").collate("utf8mb4_unicode_ci"),
	email: varchar({ length: 191 }).charSet("utf8mb4").collate("utf8mb4_unicode_ci").notNull(),
	password: varchar({ length: 191 }).charSet("utf8mb4").collate("utf8mb4_unicode_ci").notNull(),
	createdAt: datetime("created_at", { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
	updatedAt: datetime("updated_at", { fsp: 3 }).notNull(),
},
(table) => [
	uniqueIndex("users_email_key").on(table.email),
]);

export const difyApps = mysqlTable("dify_apps", {
	id: varchar({ length: 191 }).charSet("utf8mb4").collate("utf8mb4_unicode_ci").primaryKey(),
	createdAt: datetime("created_at", { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
	updatedAt: datetime("updated_at", { fsp: 3 }).notNull(),
	name: varchar({ length: 191 }).charSet("utf8mb4").collate("utf8mb4_unicode_ci").notNull(),
	mode: varchar({ length: 191 }).charSet("utf8mb4").collate("utf8mb4_unicode_ci"),
	description: varchar({ length: 191 }).charSet("utf8mb4").collate("utf8mb4_unicode_ci"),
	tags: varchar({ length: 191 }).charSet("utf8mb4").collate("utf8mb4_unicode_ci"),
	isEnabled: int("is_enabled").default(1),
	apiBase: varchar("api_base", { length: 191 }).charSet("utf8mb4").collate("utf8mb4_unicode_ci").notNull(),
	apiKey: varchar("api_key", { length: 191 }).charSet("utf8mb4").collate("utf8mb4_unicode_ci").notNull(),
	enableAnswerForm: boolean("enable_answer_form").default(false).notNull(),
	answerFormFeedbackText: varchar("answer_form_feedback_text", { length: 191 }).charSet("utf8mb4").collate("utf8mb4_unicode_ci"),
	enableUpdateInputAfterStarts: boolean("enable_update_input_after_starts").default(false).notNull(),
	openingStatementDisplayMode: varchar("opening_statement_display_mode", { length: 191 }).charSet("utf8mb4").collate("utf8mb4_unicode_ci"),
	enableAnnotation: boolean("enable_annotation").default(false).notNull(),
});
