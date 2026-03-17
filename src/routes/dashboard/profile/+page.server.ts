import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();
	return { user };
};

export const actions: Actions = {
	profile: async ({ request, locals }) => {
		const session = await locals.auth();
		if (!session?.user) {
			return fail(401, { error: 'Not authenticated.' });
		}

		const data = await request.formData();
		const name = data.get('name')?.toString().trim();
		const email = data.get('email')?.toString().trim().toLowerCase();

		if (!name || !email) {
			return fail(400, { error: 'Name and email are required.' });
		}

		// Check if email is taken by another user
		if (email !== session.user.email) {
			const existing = await db
				.select()
				.from(users)
				.where(eq(users.email, email))
				.then((res) => res[0]);

			if (existing) {
				return fail(400, { error: 'Email is already taken by another account.' });
			}
		}

		await db.update(users).set({ name, email }).where(eq(users.id, session.user.id!));

		return { success: true };
	},

	password: async ({ request, locals }) => {
		const session = await locals.auth();
		if (!session?.user) {
			return fail(401, { passwordError: 'Not authenticated.' });
		}

		const data = await request.formData();
		const currentPassword = data.get('currentPassword')?.toString();
		const newPassword = data.get('newPassword')?.toString();
		const confirmPassword = data.get('confirmPassword')?.toString();

		if (!currentPassword || !newPassword || !confirmPassword) {
			return fail(400, { passwordError: 'All password fields are required.' });
		}

		if (newPassword.length < 6) {
			return fail(400, { passwordError: 'New password must be at least 6 characters.' });
		}

		if (newPassword !== confirmPassword) {
			return fail(400, { passwordError: 'New passwords do not match.' });
		}

		// Get user with password from DB
		const user = await db
			.select()
			.from(users)
			.where(eq(users.id, session.user.id!))
			.then((res) => res[0]);

		if (!user?.password) {
			return fail(400, {
				passwordError: 'Password change is not available for OAuth accounts.'
			});
		}

		const valid = await bcrypt.compare(currentPassword, user.password);
		if (!valid) {
			return fail(400, { passwordError: 'Current password is incorrect.' });
		}

		const hashed = await bcrypt.hash(newPassword, 10);
		await db.update(users).set({ password: hashed }).where(eq(users.id, session.user.id!));

		return { passwordSuccess: true };
	}
};
