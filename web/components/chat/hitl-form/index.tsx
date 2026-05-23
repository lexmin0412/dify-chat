'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button, Input } from 'antd'
import type { IHumanInputFormData, IHumanInputAction } from '@/lib/api/types'

interface HumanInterventionFormProps {
	formData: IHumanInputFormData
	disabled?: boolean
	onSubmit: (inputs: Record<string, string>, action: string) => Promise<void>
}

export default function HumanInterventionForm({
	formData,
	disabled = false,
	onSubmit,
}: HumanInterventionFormProps) {
	const { form_content, inputs, resolved_default_values, user_actions, expiration_time } = formData

	const [values, setValues] = useState<Record<string, string>>(resolved_default_values)
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [remainingSeconds, setRemainingSeconds] = useState(() =>
		Math.max(0, expiration_time - Math.floor(Date.now() / 1000)),
	)

	useEffect(() => {
		if (remainingSeconds <= 0) return
		const timer = setInterval(() => {
			setRemainingSeconds(prev => {
				if (prev <= 1) {
					clearInterval(timer)
					return 0
				}
				return prev - 1
			})
		}, 1000)
		return () => clearInterval(timer)
	}, [])

	const expired = remainingSeconds <= 0

	const handleSubmit = useCallback(
		async (action: IHumanInputAction) => {
			if (expired || disabled || submitting) return
			setSubmitting(true)
			setError(null)
			try {
				await onSubmit(values, action.id)
			} catch (e) {
				setError((e as Error).message || '提交失败，请重试')
				setSubmitting(false)
			}
		},
		[expired, disabled, submitting, values, onSubmit],
	)

	const formatTime = (seconds: number) => {
		if (seconds <= 0) return '已过期'
		const d = Math.floor(seconds / 86400)
		const h = Math.floor((seconds % 86400) / 3600)
		const m = Math.floor((seconds % 3600) / 60)
		const s = seconds % 60
		if (d > 0) return `${d}天${h}小时`
		if (h > 0) return `${h}小时${m}分`
		return `${m}分${s}秒`
	}

	return (
		<div className="hitl-form-card rounded-lg border border-orange-200 bg-orange-50 p-4">
			<div className="mb-3 flex items-center gap-2 text-orange-700">
				<span className="text-lg">🔔</span>
				<span className="font-medium">人工介入</span>
			</div>

			<div className="mb-3 text-sm">{form_content}</div>

			<div className="mb-3 flex flex-col gap-2">
				{inputs.map(field => (
					<div key={field.output_variable_name}>
						<Input
							placeholder={field.output_variable_name}
							value={values[field.output_variable_name] || ''}
							onChange={e =>
								setValues(prev => ({ ...prev, [field.output_variable_name]: e.target.value }))
							}
							disabled={expired || disabled || submitting}
						/>
					</div>
				))}
			</div>

			<div className="mb-3 text-xs text-gray-400">⏱ 剩余 {formatTime(remainingSeconds)}</div>

			{error && <div className="mb-2 text-sm text-red-500">{error}</div>}

			<div className="flex gap-2">
				{user_actions.map(action => (
					<Button
						key={action.id}
						type={action.button_style === 'primary' ? 'primary' : 'default'}
						loading={submitting}
						disabled={expired || disabled || submitting}
						onClick={() => handleSubmit(action)}
					>
						{action.title}
					</Button>
				))}
			</div>
		</div>
	)
}
