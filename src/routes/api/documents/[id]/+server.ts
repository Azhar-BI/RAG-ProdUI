import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { documents } from '$lib/server/schema';
import { eq, and } from 'drizzle-orm';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const session = await locals.auth();
	if (!session?.user?.id) return json({ error: 'Unauthorized' }, { status: 401 });

	const [deleted] = await db
		.delete(documents)
		.where(and(eq(documents.id, params.id), eq(documents.userId, session.user.id)))
		.returning();

	if (!deleted) return json({ error: 'Document not found' }, { status: 404 });

	return json({ success: true });
};
