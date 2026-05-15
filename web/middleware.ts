import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl

	if (pathname.startsWith('/app-management') || pathname.startsWith('/user-management')) {
		const token = await getToken({ req: request })
		if (!token) {
			const loginUrl = new URL('/login', request.url)
			return NextResponse.redirect(loginUrl)
		}
	}

	return NextResponse.next()
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
