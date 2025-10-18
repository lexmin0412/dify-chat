import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('dify_apps')
export class DifyApp {
	@PrimaryGeneratedColumn('uuid')
	id!: string

	@CreateDateColumn({ name: 'created_at' })
	createdAt!: Date

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt!: Date

	// 应用基本信息
	@Column()
	name!: string

	@Column({ nullable: true })
	mode?: string

	@Column({ nullable: true })
	description?: string

	@Column({ nullable: true })
	tags?: string // JSON 字符串存储数组

	// 应用状态：1-启用，2-禁用
	@Column({ name: 'is_enabled', default: 1, nullable: true })
	isEnabled?: number

	// 请求配置
	@Column({ name: 'api_base' })
	apiBase!: string

	@Column({ name: 'api_key' })
	apiKey!: string

	// 回复表单配置
	@Column({ name: 'enable_answer_form', default: false })
	enableAnswerForm!: boolean

	@Column({ name: 'answer_form_feedback_text', nullable: true })
	answerFormFeedbackText?: string

	// 输入参数配置
	@Column({ name: 'enable_update_input_after_starts', default: false })
	enableUpdateInputAfterStarts!: boolean

	// 扩展配置
	@Column({ name: 'opening_statement_display_mode', nullable: true })
	openingStatementDisplayMode?: string // 'default' | 'always'
}
