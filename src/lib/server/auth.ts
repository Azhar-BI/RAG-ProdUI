import { SvelteKitAuth } from '@auth/sveltekit';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import Google from '@auth/core/providers/google';
import GitHub from '@auth/core/providers/github';
import { db } from '$lib/server/db';
import { users, accounts, sessions, verificationTokens } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import { sendVerificationEmail } from '$lib/server/email';
import crypto from 'crypto';

export const { handle, signIn, signOut } = SvelteKitAuth({
	adapter: DrizzleAdapter(db, {
		usersTable: users,
		accountsTable: accounts,
		sessionsTable: sessions,
		verificationTokensTable: verificationTokens
	}),

	session: {
		strategy: 'database',
		maxAge: 30 * 24 * 60 * 60 // 30 days
	},

	providers: [
		Google({
			clientId: process.env.AUTH_GOOGLE_ID,
			clientSecret: process.env.AUTH_GOOGLE_SECRET,
			allowDangerousEmailAccountLinking: true
		}),
		GitHub({
			clientId: process.env.AUTH_GITHUB_ID,
			clientSecret: process.env.AUTH_GITHUB_SECRET,
			allowDangerousEmailAccountLinking: true
		})
	],

	pages: {
		signIn: '/login'
	},

	events: {
		createUser: async ({ user }) => {
			if (user.email) {
				try {
					// Reset emailVerified so OAuth users must also verify
					await db.update(users).set({ emailVerified: null }).where(eq(users.email, user.email));

					const token = crypto.randomUUID();
					const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

					await db.insert(verificationTokens).values({
						identifier: user.email,
						token,
						expires
					});

					const baseUrl = process.env.AUTH_URL || 'http://localhost:5173';
					await sendVerificationEmail(user.email, token, baseUrl);
					console.log('Verification email sent to:', user.email);
				} catch (err) {
					console.error('Failed to send verification email in createUser event:', err);
				}
			}
		}
	},

	callbacks: {
		async session({ session, user }) {
			if (session.user) {
				session.user.id = user.id;
				(session.user as any).emailVerified = user.emailVerified;

				const dbUser = await db
					.select({ role: users.role, disabled: users.disabled })
					.from(users)
					.where(eq(users.id, user.id))
					.then((res) => res[0]);
				(session.user as any).role = dbUser?.role ?? 'user';
				(session.user as any).disabled = dbUser?.disabled ?? 'false';
			}
			return session;
		}
	},

	secret: process.env.AUTH_SECRET,
	trustHost: true
});
