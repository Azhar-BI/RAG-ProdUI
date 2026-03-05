import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { conversations, chatMessages } from '$lib/server/schema';
import { eq, and, asc } from 'drizzle-orm';

// GET — load all messages for a conversation (full tree)
export const GET: RequestHandler = async ({ params, locals }) => {
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

	const messages = await db
		.select({
			id: chatMessages.id,
			parentId: chatMessages.parentId,
			role: chatMessages.role,
			content: chatMessages.content,
			createdAt: chatMessages.createdAt
		})
		.from(chatMessages)
		.where(eq(chatMessages.conversationId, params.id))
		.orderBy(asc(chatMessages.createdAt));

	return Response.json({ conversation, messages });
};

// DELETE — delete a conversation
export const DELETE: RequestHandler = async ({ params, locals }) => {
	const session = await locals.auth();
	if (!session?.user?.id) {
		return new Response('Unauthorized', { status: 401 });
	}

	await db
		.delete(conversations)
		.where(and(eq(conversations.id, params.id), eq(conversations.userId, session.user.id)));

	return new Response(null, { status: 204 });
};
