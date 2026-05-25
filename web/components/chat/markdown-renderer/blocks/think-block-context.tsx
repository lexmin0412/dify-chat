'use client'

import React, { createContext, useContext, useRef } from 'react'

interface ThinkBlockContextValue {
	messageId: string
	rawContent: string
	nextIndex: () => number
	getComplete: (index: number) => boolean
}

const ThinkBlockContext = createContext<ThinkBlockContextValue | null>(null)

export function ThinkBlockProvider({
	messageId,
	rawContent,
	children,
}: {
	messageId: string
	rawContent: string
	children: React.ReactNode
}) {
	const indexRef = useRef(0)
	const closes = [...rawContent.matchAll(/<\/details>/g)]
	const ctx: ThinkBlockContextValue = {
		messageId,
		rawContent,
		nextIndex: () => indexRef.current++,
		getComplete: (index: number) => closes.length > index,
	}
	return <ThinkBlockContext.Provider value={ctx}>{children}</ThinkBlockContext.Provider>
}

export function useThinkBlockContext() {
	return useContext(ThinkBlockContext)
}
