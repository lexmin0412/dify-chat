import { mysqlTable, varchar, datetime, int, boolean } from 'drizzle-orm/mysql-core'
import { sql } from 'drizzle-orm'

export const difyApps = mysqlTable('dify_apps', {
	id: varchar({ length: 191 }).primaryKey(),
	createdAt: datetime('created_at', { fsp: 3 })
		.default(sql`CURRENT_TIMESTAMP(3)`)
		.notNull(),
	updatedAt: datetime('updated_at', { fsp: 3 }).notNull(),
	name: varchar({ length: 191 }).notNull(),
	mode: varchar({ length: 191 }),
	description: varchar({ length: 191 }),
	tags: varchar({ length: 191 }),
	isEnabled: int('is_enabled').default(1),
	apiBase: varchar('api_base', { length: 191 }).notNull(),
	apiKey: varchar('api_key', { length: 191 }).notNull(),
	enableAnswerForm: boolean('enable_answer_form').default(false).notNull(),
	answerFormFeedbackText: varchar('answer_form_feedback_text', { length: 191 }),
	enableUpdateInputAfterStarts: boolean('enable_update_input_after_starts')
		.default(false)
		.notNull(),
	openingStatementDisplayMode: varchar('opening_statement_display_mode', { length: 191 }),
	enableAnnotation: boolean('enable_annotation').default(false).notNull(),
})
