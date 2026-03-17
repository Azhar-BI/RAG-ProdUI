import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { users, verificationTokens } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { redirect, fail } from '@sveltejs/kit';
import { sendVerificationEmail } from '$lib/server/email';

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
	register: async ({ request, url }) => {
		const data = await request.formData();

		const name = data.get('name')?.toString().trim();
		const email = data.get('email')?.toString().trim().toLowerCase();
		const password = data.get('password')?.toString();

		if (!name || !email || !password) {
			return fail(400, { error: 'All fields are required.' });
		}

		if (password.length < 6) {
			return fail(400, { error: 'Password must be at least 6 characters.' });
		}

		if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
			return fail(400, { error: 'Password must contain both letters and numbers.' });
		}

		const existingUser = await db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.then((res) => res[0]);

		if (existingUser) {
			return fail(400, { error: 'User already exists with this email.' });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		await db.insert(users).values({
			name,
			email,
			password: hashedPassword,
			role: 'user'
		});

		const token = crypto.randomUUID();
		const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

		await db.insert(verificationTokens).values({
			identifier: email,
			token,
			expires
		});

		try {
			await sendVerificationEmail(email, token, url.origin);
		} catch (err) {
			console.error('Failed to send verification email:', err);
			return fail(500, {
				error:
					"Account created but we couldn't send the verification email. Please contact support."
			});
		}

		throw redirect(303, '/login?registered=true');
	}
};
