import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import { retrieveContext, buildContextPrompt } from '$lib/server/rag';

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.auth();
	if (!session?.user?.id) {
		return new Response('Unauthorized', { status: 401 });
	}

	const { messages } = await request.json();

	// Get the latest user message for RAG retrieval
	const lastUserMessage = [...messages].reverse().find((m: { role: string }) => m.role === 'user');
	let contextPrompt = '';
	let citations: { filename: string; chunkIndex: number; similarity: number }[] = [];

	if (lastUserMessage) {
		try {
			const chunks = await retrieveContext(lastUserMessage.content, session.user.id);
			contextPrompt = buildContextPrompt(chunks);
			citations = chunks.map((c) => ({
				filename: c.filename,
				chunkIndex: c.chunkIndex + 1,
				similarity: Math.round(c.similarity * 100)
			}));
		} catch {
			// RAG retrieval failed — continue without context
		}
	}

	const google = createGoogleGenerativeAI({
		apiKey: env.GEMINI_API_KEY
	});

	const result = streamText({
		model: google('gemini-2.5-flash'),
		system: `You are a helpful AI assistant. Be concise and friendly in your responses.${contextPrompt}`,
		messages
	});

	// Add citations as a custom header
	const response = result.toTextStreamResponse();
	if (citations.length > 0) {
		response.headers.set('X-Citations', JSON.stringify(citations));
	}
	return response;
};
