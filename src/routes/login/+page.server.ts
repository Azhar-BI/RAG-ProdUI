import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { users, sessions } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { redirect, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();
	if (session?.user && (session.user as any).emailVerified) {
		throw redirect(303, '/dashboard');
	}
	return {
		hasUnverifiedSession: !!(session?.user && !(session.user as any).emailVerified)
	};
};

export const actions: Actions = {
	credentials: async ({ request, cookies }) => {
		const data = await request.formData();

		const email = data.get('email')?.toString().trim().toLowerCase();
		const password = data.get('password')?.toString();

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required.' });
		}

		const result = await db.select().from(users).where(eq(users.email, email));
		const user = result[0];

		if (!user || !user.password) {
			return fail(400, { error: 'Invalid email or password.' });
		}

		const isValid = await bcrypt.compare(password, user.password);

		if (!isValid) {
			return fail(400, { error: 'Invalid email or password.' });
		}

		if (!user.emailVerified) {
			return fail(403, {
				error:
					'Please verify your email before logging in. Check your inbox for a verification link.'
			});
		}

		if (user.disabled === 'true') {
			return fail(403, {
				error: 'Your account has been disabled. Please contact an administrator.'
			});
		}

		// Create database session (Auth.js database strategy)
		const sessionToken = crypto.randomUUID();
		const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

		await db.insert(sessions).values({
			sessionToken,
			userId: user.id,
			expires
		});

		cookies.set('authjs.session-token', sessionToken, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: false,
			expires
		});

		throw redirect(303, '/dashboard');
	}
};
