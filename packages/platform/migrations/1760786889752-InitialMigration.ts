import type { MigrationInterface, QueryRunner } from 'typeorm'

export class InitialMigration1760786889752 implements MigrationInterface {
	name = 'InitialMigration1760786889752'

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "dify_apps" ("id" varchar PRIMARY KEY NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "mode" varchar, "description" varchar, "tags" varchar, "is_enabled" integer DEFAULT (1), "api_base" varchar NOT NULL, "api_key" varchar NOT NULL, "enable_answer_form" boolean NOT NULL DEFAULT (0), "answer_form_feedback_text" varchar, "enable_update_input_after_starts" boolean NOT NULL DEFAULT (0), "opening_statement_display_mode" varchar)`,
		)
		await queryRunner.query(
			`CREATE TABLE "users" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar, "email" varchar NOT NULL, "password" varchar NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"))`,
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE "users"`)
		await queryRunner.query(`DROP TABLE "dify_apps"`)
	}
}
