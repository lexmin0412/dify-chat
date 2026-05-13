import { IMessageItem4Render } from '@dify-chat/api'
import { generateUuidV4 } from '@dify-chat/helpers'
import type { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'

import { Chatbox } from '../src/chatbox'

const messageItems: IMessageItem4Render[] = [
	{
		id: '1',
		role: 'ai',
		content: '你好',
		status: 'success',
	},
	{
		id: '2',
		role: 'user',
		content: '你好',
		status: 'success',
	},
]

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
	title: 'Example/Chatbox',
	component: Chatbox,
	parameters: {
		// Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
		layout: 'centered',
	},
	// This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
	tags: ['autodocs'],
	// More on argTypes: https://storybook.js.org/docs/api/argtypes
	argTypes: {
		// deleteConversationPromise: { control: 'text' },
	},
	// Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
	args: {},
} satisfies Meta<typeof Chatbox>

export default meta
type Story = StoryObj<typeof meta>

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
	args: {},
	render: function Render() {
		const [messages, setMessages] = useState(messageItems)
		const [isRequesting, setIsRequesting] = useState(false)
		return (
			<div className="relative w-[800px]">
				<Chatbox
					messageItems={messageItems}
					isRequesting={isRequesting}
					nextSuggestions={[]}
					onPromptsItemClick={() => void 0}
					feedbackApi={() => Promise.resolve({ result: 'success' })}
					onSubmit={content => {
						setMessages([
							...messages,
							{
								id: generateUuidV4(),
								role: 'user',
								content,
								status: 'local',
							},
						])
					}}
					onCancel={() => {
						setIsRequesting(false)
					}}
					conversationId="1"
					uploadFileApi={() => {
						return Promise.resolve({
							id: 'mock-file-id',
							name: 'mock-file.txt',
							size: 1024,
							extension: 'txt',
							mime_type: 'text/plain',
							created_by: 123,
							created_at: Date.now(),
						})
					}}
				/>
			</div>
		)
	},
}
