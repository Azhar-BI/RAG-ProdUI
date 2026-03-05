import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { conversations, chatMessages } from '$lib/server/schema';
import { eq, desc } from 'drizzle-orm';

// GET — list all conversations for the current user
export const GET: RequestHandler = async ({ locals }) => {
	const session = await locals.auth();
	if (!session?.user?.id) {
		return new Response('Unauthorized', { status: 401 });
	}

	const result = await db
		.select({
			id: conversations.id,
			title: conversations.title,
			createdAt: conversations.createdAt,
			updatedAt: conversations.updatedAt
		})
		.from(conversations)
		.where(eq(conversations.userId, session.user.id))
		.orderBy(desc(conversations.updatedAt));

	return Response.json(result);
};

// POST — create a new conversation
export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.auth();
	if (!session?.user?.id) {
		return new Response('Unauthorized', { status: 401 });
	}

	const { title } = await request.json();

	const [conversation] = await db
		.insert(conversations)
		.values({
			userId: session.user.id,
			title: title || 'New Chat'
		})
		.returning();

	return Response.json(conversation);
};
