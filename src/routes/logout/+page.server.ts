import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { sessions } from '$lib/server/schema';
import { eq } from 'drizzle-orm';

export const actions: Actions = {
	default: async ({ cookies }) => {
		const sessionToken = cookies.get('authjs.session-token');

		if (sessionToken) {
			await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken));
			cookies.delete('authjs.session-token', { path: '/' });
		}

		throw redirect(303, '/');
	}
};
