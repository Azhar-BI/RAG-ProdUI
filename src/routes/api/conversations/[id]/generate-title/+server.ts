import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { conversations } from '$lib/server/schema';
import { eq, and } from 'drizzle-orm';

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

	const { userMessage, assistantMessage } = await request.json();

	const google = createGoogleGenerativeAI({
		apiKey: env.GEMINI_API_KEY
	});

	try {
		const result = await generateText({
			model: google('gemini-2.5-flash'),
			system:
				'Generate a short, descriptive title (3-6 words max) for this conversation. Return ONLY the title text, no quotes, no punctuation at the end, no explanation.',
			messages: [
				{
					role: 'user',
					content: `User: ${userMessage}\n\nAssistant: ${assistantMessage.slice(0, 200)}`
				}
			]
		});

		const title = result.text.trim().slice(0, 80);

		await db.update(conversations).set({ title }).where(eq(conversations.id, params.id));

		return Response.json({ title });
	} catch {
		// Fallback to truncated user message
		const title = userMessage.length > 50 ? userMessage.slice(0, 50) + '...' : userMessage;
		await db.update(conversations).set({ title }).where(eq(conversations.id, params.id));

		return Response.json({ title });
	}
};
