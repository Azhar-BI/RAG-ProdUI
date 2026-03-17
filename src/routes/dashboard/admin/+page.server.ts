import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users, conversations, chatMessages, documents, activityLogs } from '$lib/server/schema';
import { eq, sql, ilike, or, desc, asc, count } from 'drizzle-orm';

const PAGE_SIZE = 15;

export const load: PageServerLoad = async ({ parent, url }) => {
	const { role } = await parent();

	if (role !== 'admin') {
		throw redirect(303, '/dashboard');
	}

	// Query params
	const search = url.searchParams.get('search')?.trim() || '';
	const roleFilter = url.searchParams.get('role') || 'all';
	const statusFilter = url.searchParams.get('status') || 'all';
	const sortBy = url.searchParams.get('sort') || 'newest';
	const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));

	// Fetch all users for stats (lightweight)
	const allUsers = await db
		.select({
			id: users.id,
			name: users.name,
			email: users.email,
			role: users.role,
			disabled: users.disabled,
			emailVerified: users.emailVerified,
			lastLoginAt: users.lastLoginAt,
			loginCount: users.loginCount,
			createdAt: users.createdAt
		})
		.from(users);

	// ── Analytics ────────────────────────────────────────
	const totalUsers = allUsers.length;
	const verifiedCount = allUsers.filter((u) => u.emailVerified !== null).length;
	const unverifiedCount = totalUsers - verifiedCount;
	const adminCount = allUsers.filter((u) => u.role === 'admin').length;
	const disabledCount = allUsers.filter((u) => u.disabled === 'true').length;
	const activeCount = totalUsers - disabledCount;

	const now = Date.now();
	const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
	const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
	const recentSignups = allUsers.filter(
		(u) => u.createdAt && new Date(u.createdAt) >= sevenDaysAgo
	).length;
	const monthlySignups = allUsers.filter(
		(u) => u.createdAt && new Date(u.createdAt) >= thirtyDaysAgo
	).length;
	const activeToday = allUsers.filter(
		(u) => u.lastLoginAt && new Date(u.lastLoginAt) >= new Date(now - 24 * 60 * 60 * 1000)
	).length;

	// Signups per day (last 14 days) for bar chart
	const signupsByDay: { label: string; value: number }[] = [];
	for (let i = 13; i >= 0; i--) {
		const dayStart = new Date(now - i * 24 * 60 * 60 * 1000);
		dayStart.setHours(0, 0, 0, 0);
		const dayEnd = new Date(dayStart);
		dayEnd.setHours(23, 59, 59, 999);
		const count = allUsers.filter(
			(u) => u.createdAt && new Date(u.createdAt) >= dayStart && new Date(u.createdAt) <= dayEnd
		).length;
		signupsByDay.push({
			label: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
			value: count
		});
	}

	// Platform stats
	const [conversationStats] = await db.select({ count: count() }).from(conversations);
	const [messageStats] = await db.select({ count: count() }).from(chatMessages);
	const [documentStats] = await db.select({ count: count() }).from(documents);

	// Top users by conversations
	const topUsers = await db
		.select({
			userId: conversations.userId,
			userName: users.name,
			userEmail: users.email,
			convCount: count()
		})
		.from(conversations)
		.leftJoin(users, eq(conversations.userId, users.id))
		.groupBy(conversations.userId, users.name, users.email)
		.orderBy(desc(count()))
		.limit(5);

	// Auth method breakdown
	const credentialsCount = allUsers.filter((u) => u.email && !!(u as any).password).length;

	// ── Filtered + paginated user list ───────────────────
	let filtered = [...allUsers];

	if (search) {
		const lower = search.toLowerCase();
		filtered = filtered.filter(
			(u) =>
				(u.name && u.name.toLowerCase().includes(lower)) || u.email.toLowerCase().includes(lower)
		);
	}

	if (roleFilter !== 'all') {
		filtered = filtered.filter((u) => u.role === roleFilter);
	}

	if (statusFilter === 'active') {
		filtered = filtered.filter((u) => u.disabled !== 'true');
	} else if (statusFilter === 'disabled') {
		filtered = filtered.filter((u) => u.disabled === 'true');
	} else if (statusFilter === 'verified') {
		filtered = filtered.filter((u) => u.emailVerified !== null);
	} else if (statusFilter === 'unverified') {
		filtered = filtered.filter((u) => u.emailVerified === null);
	}

	// Sort
	if (sortBy === 'newest') {
		filtered.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
	} else if (sortBy === 'oldest') {
		filtered.sort((a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0));
	} else if (sortBy === 'name') {
		filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
	} else if (sortBy === 'last-active') {
		filtered.sort((a, b) => (b.lastLoginAt?.getTime() ?? 0) - (a.lastLoginAt?.getTime() ?? 0));
	}

	const totalFiltered = filtered.length;
	const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
	const safePage = Math.min(page, totalPages);
	const paginatedUsers = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

	// Recent activity logs
	const recentActivity = await db
		.select({
			id: activityLogs.id,
			action: activityLogs.action,
			userId: activityLogs.userId,
			targetUserId: activityLogs.targetUserId,
			metadata: activityLogs.metadata,
			createdAt: activityLogs.createdAt
		})
		.from(activityLogs)
		.orderBy(desc(activityLogs.createdAt))
		.limit(10);

	// Resolve names for activity logs
	const logUserIds = [
		...new Set(recentActivity.flatMap((l) => [l.userId, l.targetUserId].filter(Boolean)))
	] as string[];
	const logUsers =
		logUserIds.length > 0
			? await db.select({ id: users.id, name: users.name, email: users.email }).from(users)
			: [];
	const userMap = new Map(logUsers.map((u) => [u.id, u.name || u.email]));

	return {
		users: paginatedUsers.map((u) => ({
			...u,
			emailVerified: u.emailVerified?.toISOString() ?? null,
			lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
			createdAt: u.createdAt?.toISOString() ?? null
		})),
		stats: {
			totalUsers,
			verifiedCount,
			unverifiedCount,
			adminCount,
			disabledCount,
			activeCount,
			recentSignups,
			monthlySignups,
			activeToday,
			totalConversations: conversationStats.count,
			totalMessages: messageStats.count,
			totalDocuments: documentStats.count
		},
		charts: {
			signupsByDay,
			roleDistribution: [
				{ label: 'Users', value: totalUsers - adminCount, color: '#64748b' },
				{ label: 'Admins', value: adminCount, color: '#84cc16' }
			],
			verificationStatus: [
				{ label: 'Verified', value: verifiedCount, color: '#10b981' },
				{ label: 'Unverified', value: unverifiedCount, color: '#f59e0b' }
			],
			accountStatus: [
				{ label: 'Active', value: activeCount, color: '#10b981' },
				{ label: 'Disabled', value: disabledCount, color: '#ef4444' }
			],
			topUsers: topUsers.map((u) => ({
				label: u.userName || u.userEmail || 'Unknown',
				value: Number(u.convCount)
			}))
		},
		recentActivity: recentActivity.map((l) => ({
			...l,
			actorName: l.userId ? userMap.get(l.userId) || 'Unknown' : 'System',
			targetName: l.targetUserId ? userMap.get(l.targetUserId) || 'Unknown' : null,
			createdAt: l.createdAt?.toISOString() ?? null
		})),
		pagination: {
			page: safePage,
			totalPages,
			totalFiltered,
			pageSize: PAGE_SIZE
		},
		filters: {
			search,
			role: roleFilter,
			status: statusFilter,
			sort: sortBy
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

		if (userId === session.user.id && newRole !== 'admin') {
			return fail(400, { error: 'You cannot remove your own admin role.' });
		}

		await db.update(users).set({ role: newRole }).where(eq(users.id, userId));

		await db.insert(activityLogs).values({
			userId: session.user.id,
			action: newRole === 'admin' ? 'promote_to_admin' : 'demote_to_user',
			targetUserId: userId,
			metadata: { newRole }
		});

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

		if (userId === session.user.id) {
			return fail(400, { error: 'You cannot disable your own account.' });
		}

		const newDisabled = currentDisabled === 'true' ? 'false' : 'true';
		await db.update(users).set({ disabled: newDisabled }).where(eq(users.id, userId));

		await db.insert(activityLogs).values({
			userId: session.user.id,
			action: newDisabled === 'true' ? 'disable_account' : 'enable_account',
			targetUserId: userId,
			metadata: { newDisabled }
		});

		return { success: true, action: 'toggleDisabled' };
	}
};
