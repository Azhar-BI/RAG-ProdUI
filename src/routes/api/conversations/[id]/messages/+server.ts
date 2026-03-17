import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { conversations, chatMessages } from '$lib/server/schema';
import { eq, and } from 'drizzle-orm';

// POST — save a message to a conversation
export const POST: RequestHandler = async ({ params, request, locals }) => {
	const session = await locals.auth();
	if (!session?.user?.id) {
		return new Response('Unauthorized', { status: 401 });
	}

	const [conversation] = await db
		.select()
		.from(conversations)
		.where(and(eq(conversations.id, params.id), eq(conversations.userId, session.user.id)));

	if (!conversation) {
		return new Response('Not found', { status: 404 });
	}

	const { role, content, parentId, citations } = await request.json();

	const [message] = await db
		.insert(chatMessages)
		.values({
			conversationId: params.id,
			parentId: parentId || null,
			role,
			content,
			citations: citations ? JSON.stringify(citations) : null
		})
		.returning();

	// Update conversation timestamp
	await db
		.update(conversations)
		.set({ updatedAt: new Date() })
		.where(eq(conversations.id, params.id));

	return Response.json(message);
};
