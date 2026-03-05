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

	// Verify the conversation belongs to the user
	const [conversation] = await db
		.select()
		.from(conversations)
		.where(and(eq(conversations.id, params.id), eq(conversations.userId, session.user.id)));

	if (!conversation) {
		return new Response('Not found', { status: 404 });
	}

	const { role, content } = await request.json();

	const [message] = await db
		.insert(chatMessages)
		.values({
			conversationId: params.id,
			role,
			content
		})
		.returning();

	// Update conversation title from first user message
	if (role === 'user' && conversation.title === 'New Chat') {
		const title = content.length > 50 ? content.slice(0, 50) + '...' : content;
		await db.update(conversations).set({ title }).where(eq(conversations.id, params.id));
	}

	// Update conversation timestamp
	await db
		.update(conversations)
		.set({ updatedAt: new Date() })
		.where(eq(conversations.id, params.id));

	return Response.json(message);
};
