import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('users')
export class User {
	@PrimaryGeneratedColumn('uuid')
	id!: string

	@Column({ nullable: true })
	name?: string

	@Column({ unique: true })
	email!: string

	@Column()
	password!: string // 密码哈希

	@CreateDateColumn({ name: 'created_at' })
	createdAt!: Date

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt!: Date
}
