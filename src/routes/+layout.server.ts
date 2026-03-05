import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const session = await locals.auth();
	// Only treat user as logged in if email is verified
	const user = session?.user && (session.user as any).emailVerified ? session.user : null;
	return { user };
};
