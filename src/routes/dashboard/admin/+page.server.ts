import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ parent }) => {
	const { role } = await parent();

	// Admin auth guard
	if (role !== 'admin') {
		throw redirect(303, '/dashboard');
	}

	// Fetch all users
	const allUsers = await db
		.select({
			id: users.id,
			name: users.name,
			email: users.email,
			role: users.role,
			disabled: users.disabled,
			emailVerified: users.emailVerified,
			createdAt: users.createdAt
		})
		.from(users)
		.orderBy(users.createdAt);

	// Analytics
	const totalUsers = allUsers.length;
	const verifiedCount = allUsers.filter((u) => u.emailVerified !== null).length;
	const adminCount = allUsers.filter((u) => u.role === 'admin').length;
	const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
	const recentSignups = allUsers.filter(
		(u) => u.createdAt && new Date(u.createdAt) >= sevenDaysAgo
	).length;

	return {
		allUsers: allUsers.map((u) => ({
			...u,
			emailVerified: u.emailVerified?.toISOString() ?? null,
			createdAt: u.createdAt?.toISOString() ?? null
		})),
		stats: {
			totalUsers,
			verifiedCount,
			adminCount,
			recentSignups
		}
	};
};

export const actions: Actions = {
	changeRole: async ({ request, locals }) => {
		const session = await locals.auth();
		if (!(session?.user && (session.user as any).role === 'admin')) {
			return fail(403, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const userId = data.get('userId')?.toString();
		const newRole = data.get('role')?.toString();

		if (!userId || !newRole || !['user', 'admin'].includes(newRole)) {
			return fail(400, { error: 'Invalid request' });
		}

		// Prevent admin from demoting themselves
		if (userId === session.user.id && newRole !== 'admin') {
			return fail(400, { error: 'You cannot remove your own admin role.' });
		}

		await db.update(users).set({ role: newRole }).where(eq(users.id, userId));
		return { success: true, action: 'roleChanged' };
	},

	toggleDisabled: async ({ request, locals }) => {
		const session = await locals.auth();
		if (!(session?.user && (session.user as any).role === 'admin')) {
			return fail(403, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const userId = data.get('userId')?.toString();
		const currentDisabled = data.get('disabled')?.toString();

		if (!userId) {
			return fail(400, { error: 'Invalid request' });
		}

		// Prevent admin from disabling themselves
		if (userId === session.user.id) {
			return fail(400, { error: 'You cannot disable your own account.' });
		}

		const newDisabled = currentDisabled === 'true' ? 'false' : 'true';
		await db.update(users).set({ disabled: newDisabled }).where(eq(users.id, userId));
		return { success: true, action: 'toggleDisabled' };
	}
};
