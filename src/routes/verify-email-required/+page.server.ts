import type { PageServerLoad, Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { verificationTokens } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import { sendVerificationEmail } from '$lib/server/email';
import crypto from 'crypto';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();
	if (!session?.user) {
		throw redirect(303, '/login');
	}

	if ((session.user as any).emailVerified) {
		throw redirect(303, '/dashboard');
	}

	return {
		email: session.user.email
	};
};

export const actions: Actions = {
	resend: async ({ locals, url }) => {
		const session = await locals.auth();
		if (!session?.user?.email) {
			throw redirect(303, '/login');
		}

		// Delete existing tokens for this email
		await db
			.delete(verificationTokens)
			.where(eq(verificationTokens.identifier, session.user.email));

		// Generate new token
		const token = crypto.randomUUID();
		const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

		await db.insert(verificationTokens).values({
			identifier: session.user.email,
			token,
			expires
		});

		await sendVerificationEmail(session.user.email, token, url.origin);

		return { sent: true };
	}
};
