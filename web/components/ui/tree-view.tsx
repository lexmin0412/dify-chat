'use client'

import * as CollapsiblePrimitive from '@radix-ui/react-collapsible'
import { ChevronRight } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

function TreeView({ className, children, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="tree-view"
			className={cn('text-sm', className)}
			{...props}
		>
			{children}
		</div>
	)
}

function TreeItem({
	className,
	children,
	...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
	return (
		<CollapsiblePrimitive.Root
			data-slot="tree-item"
			className={cn('group/tree-item', className)}
			{...props}
		>
			{children}
		</CollapsiblePrimitive.Root>
	)
}

function TreeItemTrigger({
	className,
	children,
	...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Trigger>) {
	return (
		<CollapsiblePrimitive.Trigger
			data-slot="tree-item-trigger"
			className={cn(
				'flex w-full items-center gap-1.5 rounded-md py-1.5 text-left text-sm font-medium outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring',
				className,
			)}
			{...props}
		>
			<ChevronRight className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]/tree-item:rotate-90" />
			{children}
		</CollapsiblePrimitive.Trigger>
	)
}

function TreeItemContent({
	className,
	children,
	...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Content>) {
	return (
		<CollapsiblePrimitive.Content
			data-slot="tree-item-content"
			className={cn(
				'overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down',
				className,
			)}
			{...props}
		>
			<div className="pb-0.5 pt-0">{children}</div>
		</CollapsiblePrimitive.Content>
	)
}

export { TreeView, TreeItem, TreeItemTrigger, TreeItemContent }
