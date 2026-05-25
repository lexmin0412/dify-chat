'use client'

import React, { createContext, useContext, useRef } from 'react'

interface ThinkBlockContextValue {
	appId: string
	messageId: string
	nextIndex: () => number
}

const ThinkBlockContext = createContext<ThinkBlockContextValue | null>(null)

export function ThinkBlockProvider({
	appId,
	messageId,
	children,
}: {
	appId: string
	messageId: string
	children: React.ReactNode
}) {
	const indexRef = useRef(0)
	const ctx: ThinkBlockContextValue = {
		appId,
		messageId,
		nextIndex: () => indexRef.current++,
	}
	return <ThinkBlockContext.Provider value={ctx}>{children}</ThinkBlockContext.Provider>
}

export function useThinkBlockContext() {
	return useContext(ThinkBlockContext)
}
