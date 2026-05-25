'use client'

import React, { createContext, useContext, useRef } from 'react'

interface ThinkBlockContextValue {
	messageId: string
	nextIndex: () => number
}

const ThinkBlockContext = createContext<ThinkBlockContextValue | null>(null)

export function ThinkBlockProvider({
	messageId,
	children,
}: {
	messageId: string
	children: React.ReactNode
}) {
	const indexRef = useRef(0)
	const ctx: ThinkBlockContextValue = {
		messageId,
		nextIndex: () => indexRef.current++,
	}
	return <ThinkBlockContext.Provider value={ctx}>{children}</ThinkBlockContext.Provider>
}

export function useThinkBlockContext() {
	return useContext(ThinkBlockContext)
}
