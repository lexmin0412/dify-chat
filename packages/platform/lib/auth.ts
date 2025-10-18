import bcrypt from 'bcryptjs'
import CredentialsProvider from 'next-auth/providers/credentials'

import { getRepository } from './typeorm'
import { User } from '@/entities/User'

export const authOptions = {
	providers: [
		CredentialsProvider({
			name: 'credentials',
			credentials: {
				email: { label: '邮箱', type: 'email' },
				password: { label: '密码', type: 'password' },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null
				}

				const userRepo = await getRepository(User)
				const user = await userRepo.findOne({
					where: {
						email: credentials.email,
					},
				})

				if (!user) {
					return null
				}

				const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

				if (!isPasswordValid) {
					return null
				}

				return {
					id: user.id,
					email: user.email,
					name: user.name,
				}
			},
		}),
	],
	session: {
		strategy: 'jwt' as const,
	},
	pages: {
		signIn: '/login',
	},
	callbacks: {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		async jwt({ token, user }: any) {
			if (user) {
				token.id = user.id
			}
			return token
		},
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		session({ session, token }: any) {
			if (token && session.user) {
				session.user.id = token.id as string
			}
			return session
		},
	},
}
