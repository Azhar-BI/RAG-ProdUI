import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ locals }) => {
	const session = await locals.auth();
	if (!session?.user) {
		throw redirect(303, '/login');
	}

	if (!(session.user as any).emailVerified) {
		throw redirect(303, '/verify-email-required');
	}

	return {
		user: session.user,
		role: (session.user as any).role ?? 'user'
	};
};
