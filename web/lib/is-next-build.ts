export const isNextBuild = () =>
	process.env.NEXT_PHASE === 'phase-production-build' || process.env.NEXT_PHASE === 'phase-export'
