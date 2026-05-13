import type { Meta, StoryObj } from '@storybook/react'
import { message } from 'antd'
import React, { useState } from 'react'

import { MessageSender } from '../src/message-sender'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
	title: 'Example/MessageSender',
	component: MessageSender,
	parameters: {
		// Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
		layout: 'centered',
	},
	// This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
	tags: ['autodocs'],
	// More on argTypes: https://storybook.js.org/docs/api/argtypes
	argTypes: {},
	// Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
	args: {},
} satisfies Meta<typeof MessageSender>

export default meta
type Story = StoryObj<typeof meta>

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
	args: {},
	render: function Render() {
		const [isRequesting, setIsRequesting] = useState(false)

		return (
			<MessageSender
				isRequesting={isRequesting}
				onCancel={() => setIsRequesting(false)}
				onSubmit={value => {
					setIsRequesting(true)
					setTimeout(() => {
						message.success(`发送成功: ${value}`)
						setIsRequesting(false)
					}, 3000)
				}}
				uploadFileApi={file =>
					Promise.resolve({
						id: '1',
						name: file.name,
						size: file.size,
						extension: file.name.slice(file.name.indexOf('.')),
						mime_type: 'image',
						created_by: 1,
						created_at: Date.now(),
					})
				}
			/>
		)
	},
}
