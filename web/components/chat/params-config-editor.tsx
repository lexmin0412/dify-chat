import { Checkbox, Input } from 'antd'
import { isEqual } from 'lodash-es'
import { useEffect, useState } from 'react'

/**
 * Dify 原始参数配置
 */
export interface IParamItem {
	variable: string
	required: boolean
	hide: boolean
	label: string
}

/**
 * Dify Chat 内部维护的参数配置
 */
interface IValueItem {
	variable: string
	required: boolean
	hide: boolean
}

function genDefaultValueByParams(params: IParamItem[]): IValueItem[] {
	return params.map(param => ({
		variable: param.variable,
		required: param.required,
		hide: param.hide,
	}))
}

interface IParamsConfigEditorProps {
	params: IParamItem[]
	value?: IValueItem[]
	onChange?: (value: IValueItem[]) => void
}

const formatValueByParams = (params: IParamItem[], targetValue: IValueItem[]) => {
	return params.map(param => {
		const existedItem = targetValue.find(item => item.variable === param.variable)
		if (existedItem) {
			return existedItem
		}
		return {
			variable: param.variable,
			required: param.required,
			hide: param.hide,
		}
	})
}

export default function ParamsConfigEditor(props: IParamsConfigEditorProps) {
	const { params, value: propsValue = genDefaultValueByParams(params), onChange } = props

	const [value, setValue] = useState<IValueItem[]>([])

	/**
	 * 根据 params 结构映射出合法的 value
	 */
	const updateValueByParams = (targetValue: IValueItem[]) => {
		const newValue = formatValueByParams(params, targetValue) as IValueItem[]
		setValue(newValue)
	}

	useEffect(() => {
		console.log('propsValue', propsValue)
		// 判断如果 propsValue 和 value 相等，则不更新
		if (isEqual(value, propsValue)) {
			return
		}

		// 根据 params 结构映射出合法的 value
		updateValueByParams(propsValue)
	}, [propsValue])

	// 处理单个参数变更
	const handleItemChange = (index: number, key: keyof IValueItem, val: unknown) => {
		const newValue = params.map((param, idx) => {
			const existedItem = value[idx]
			const baseItem = existedItem || {
				variable: param.variable,
				required: param.required,
				hide: param.hide || false,
			}
			if (idx === index) {
				return {
					...baseItem,
					[key]: val,
				}
			}
			return baseItem
		})
		onChange?.(newValue)
	}

	return (
		<div>
			{/* 表头 */}
			<div
				style={{
					display: 'flex',
					fontWeight: 500,
					color: '#888',
					marginBottom: 8,
					gap: 16,
				}}
			>
				<div style={{ width: 120 }}>参数名</div>
				<div style={{ width: 120 }}>标签</div>
				<div style={{ width: 60 }}>必填</div>
				<div style={{ width: 60 }}>隐藏</div>
			</div>
			{/* 参数行 */}
			{params.map((param, idx) => {
				const item = value[idx] || {
					variable: param.variable,
					required: param.required,
					hide: param.hide,
				}
				return (
					<div
						key={param.variable}
						style={{
							display: 'flex',
							alignItems: 'center',
							marginBottom: 12,
							border: '1px solid #f0f0f0',
							borderRadius: 6,
							padding: 12,
							background: '#fafafa',
							gap: 16,
						}}
					>
						<Input
							value={item.variable}
							disabled
							style={{ width: 120 }}
						/>
						<Input
							value={param.label}
							disabled
							style={{ width: 120 }}
						/>
						<Checkbox
							checked={item.required}
							onChange={e => handleItemChange(idx, 'required', e.target.checked)}
							style={{ width: 60 }}
						/>
						<Checkbox
							checked={item.hide}
							onChange={e => handleItemChange(idx, 'hide', e.target.checked)}
							style={{ width: 60 }}
						/>
					</div>
				)
			})}
		</div>
	)
}
