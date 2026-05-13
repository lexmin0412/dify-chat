import type { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'

import { ConversationList } from '../src/conversation-list'
import { type IConversationItem } from '../src/conversation-list'

const conversationItems: IConversationItem[] = [
	{
		key: '1',
		label: '对话1',
	},
	{
		key: '2',
		label: '对话2',
	},
]

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
	title: 'Example/ConversationList',
	component: ConversationList,
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
} satisfies Meta<typeof ConversationList>

export default meta
type Story = StoryObj<typeof meta>

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
	args: {},
	render: function Render() {
		const [items, setItems] = useState(conversationItems)
		return (
			<div className="w-full">
				<ConversationList
					items={items}
					deleteConversationPromise={(conversationId: string) => {
						setItems(
							conversationItems.slice(
								conversationItems.findIndex(item => item.key === conversationId),
								1,
							),
						)
						return Promise.resolve()
					}}
					renameConversationPromise={(conversationId: string, newLabel: string) => {
						conversationItems.find(item => item.key === conversationId)!.label = newLabel
						return Promise.resolve()
					}}
					refreshItems={() => {
						return Promise.resolve()
					}}
				/>
			</div>
		)
	},
}
