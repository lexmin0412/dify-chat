import { Button, DatePicker, Input, Select } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

enum DATA_FORMAT {
	TEXT = 'text',
	JSON = 'json',
}
enum SUPPORTED_TAGS {
	LABEL = 'label',
	INPUT = 'input',
	TEXTAREA = 'textarea',
	BUTTON = 'button',
}
enum SUPPORTED_TYPES {
	TEXT = 'text',
	PASSWORD = 'password',
	EMAIL = 'email',
	NUMBER = 'number',
	DATE = 'date',
	TIME = 'time',
	DATETIME = 'datetime',
	CHECKBOX = 'checkbox',
	SELECT = 'select',
}
const MarkdownForm = ({ node, onSend }: any) => {
	const [formValues, setFormValues] = useState<{ [key: string]: any }>({})

	useEffect(() => {
		const initialValues: { [key: string]: any } = {}
		node.children.forEach((child: any) => {
			if ([SUPPORTED_TAGS.INPUT, SUPPORTED_TAGS.TEXTAREA].includes(child.tagName))
				initialValues[child.properties.name] = child.properties.value
		})
		setFormValues(initialValues)
	}, [node.children])

	const getFormValues = (children: any) => {
		const values: { [key: string]: any } = {}
		children.forEach((child: any) => {
			if ([SUPPORTED_TAGS.INPUT, SUPPORTED_TAGS.TEXTAREA].includes(child.tagName))
				values[child.properties.name] = formValues[child.properties.name]
		})
		return values
	}

	const onSubmit = (e: any) => {
		e.preventDefault()
		const format = node.properties.dataFormat || DATA_FORMAT.TEXT
		const result = getFormValues(node.children)

		if (format === DATA_FORMAT.JSON) {
			onSend?.(
				JSON.stringify({
					...result,
					isFormSubmit: true,
				}),
			)
		} else {
			const textResult = Object.entries(result)
				.map(([key, value]) => `${key}: ${value}`)
				.join('\n')
			onSend?.(textResult)
		}
	}

	return (
		<form
			autoComplete="off"
			className="flex flex-col self-stretch pb-3"
			onSubmit={(e: any) => {
				e.preventDefault()
				e.stopPropagation()
			}}
		>
			{node.children
				.filter((i: any) => i.type === 'element')
				.map((child: any, index: number) => {
					if (child.tagName === SUPPORTED_TAGS.LABEL) {
						return (
							<label
								key={index}
								htmlFor={child.properties.for}
								className="system-md-semibold my-2 text-text-secondary"
							>
								{child.children[0]?.value || ''}
							</label>
						)
					}
					if (
						child.tagName === SUPPORTED_TAGS.INPUT) {
						// 隐藏字段
						if (child.properties.type === 'hidden') {
							return <Input key={index} hidden {...child.properties || {}} />
						}

						if (child.properties.type === SUPPORTED_TYPES.DATE || child.properties.type === SUPPORTED_TYPES.DATETIME) {
							const format = child.properties.type === SUPPORTED_TYPES.DATE ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'
							let value = null
							// 如果有值，尝试解析为日期
							if (formValues[child.properties.name]) {
								try {
									value = dayjs(formValues[child.properties.name])
								} catch (error) {
									console.error('解析日期值失败', error)
									// 如果解析报错，置空
									value = null
								}
							}
						  return (
						    <DatePicker
						      key={index}
						      value={value}
						      showTime={child.properties.type === SUPPORTED_TYPES.DATETIME}
						      onChange={(date) => {
						        setFormValues(prevValues => ({
						          ...prevValues,
						          [child.properties.name]: dayjs(date).format(format),
						        }))
						      }}
									allowClear
						    />
						  )
						}
						// if (child.properties.type === SUPPORTED_TYPES.TIME) {
						//   return (
						//     <TimePicker
						//       key={index}
						//       value={formValues[child.properties.name]}
						//       onChange={(time) => {
						//         setFormValues(prevValues => ({
						//           ...prevValues,
						//           [child.properties.name]: time,
						//         }))
						//       }}
						//       onClear={() => {
						//         setFormValues(prevValues => ({
						//           ...prevValues,
						//           [child.properties.name]: undefined,
						//         }))
						//       }}
						//     />
						//   )
						// }
						// if (child.properties.type === SUPPORTED_TYPES.CHECKBOX) {
						//   return (
						//     <div className='mt-2 flex h-6 items-center space-x-2' key={index}>
						//       <Checkbox
						//         key={index}
						//         checked={formValues[child.properties.name]}
						//         onCheck={() => {
						//           setFormValues(prevValues => ({
						//             ...prevValues,
						//             [child.properties.name]: !prevValues[child.properties.name],
						//           }))
						//         }}
						//       />
						//       <span>{child.properties.dataTip || child.properties['data-tip'] || ''}</span>
						//     </div>
						//   )
						// }
						if (child.properties.type === SUPPORTED_TYPES.SELECT) {
						  return (
						    <Select
						      key={index}
						      className="w-full"
						      options={(() => {
						        let options = child.properties.dataOptions || child.properties['data-options'] || []
						        if (typeof options === 'string') {
						          try {
						            options = JSON.parse(options)
						          }
						          catch (e) {
						            console.error('Failed to parse options:', e)
						            options = []
						          }
						        }
						        return options.map((option: string) => ({
						          label: option,
						          value: option,
						        }))
						      })()}
						      defaultValue={formValues[child.properties.name]}
						      onChange={(value) => {
						        setFormValues(prevValues => ({
						          ...prevValues,
						          [child.properties.name]: value,
						        }))
						      }}
						    />
						  )
						}

						return (
							<Input
								key={index}
								type={child.properties.type}
								name={child.properties.name}
								placeholder={child.properties.placeholder}
								value={formValues[child.properties.name]}
								onChange={e => {
									setFormValues(prevValues => ({
										...prevValues,
										[child.properties.name]: e.target.value,
									}))
								}}
							/>
						)
					}
					if (child.tagName === SUPPORTED_TAGS.TEXTAREA) {
						return (
							<Input.TextArea
								key={index}
								name={child.properties.name}
								placeholder={child.properties.placeholder}
								value={formValues[child.properties.name]}
								onChange={e => {
									setFormValues(prevValues => ({
										...prevValues,
										[child.properties.name]: e.target.value,
									}))
								}}
							/>
						)
					}
					if (child.tagName === SUPPORTED_TAGS.BUTTON) {
						const variant = child.properties.dataVariant

						return (
							<Button
								type="primary"
								variant={variant}
								// size={size}
								className="mt-4"
								key={index}
								onClick={onSubmit}
							>
								{child.children[0]?.value || ''}
							</Button>
						)
					}

					return <p key={index}>Unsupported tag: {child.tagName}</p>
				})}
		</form>
	)
}
MarkdownForm.displayName = 'MarkdownForm'
export default MarkdownForm
