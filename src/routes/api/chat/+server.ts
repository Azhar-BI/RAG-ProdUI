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
			console.log(`[RAG] Query: "${lastUserMessage.content.slice(0, 80)}" → ${chunks.length} chunks found`);
			if (chunks.length > 0) {
				console.log(`[RAG] Top similarity: ${(chunks[0].similarity * 100).toFixed(1)}% from ${chunks[0].filename}`);
			}
			contextPrompt = buildContextPrompt(chunks);
			citations = chunks.map((c) => ({
				filename: c.filename,
				chunkIndex: c.chunkIndex + 1,
				similarity: Math.round(c.similarity * 100)
			}));
		} catch (err) {
			console.error('[RAG] Retrieval failed:', err);
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

	const stream = result.textStream;

	const headers: Record<string, string> = {
		'Content-Type': 'text/plain; charset=utf-8',
		'Transfer-Encoding': 'chunked'
	};
	if (citations.length > 0) {
		headers['X-Citations'] = JSON.stringify(citations);
	}

	const encoder = new TextEncoder();
	const readable = new ReadableStream({
		async start(controller) {
			try {
				for await (const chunk of stream) {
					controller.enqueue(encoder.encode(chunk));
				}
			} catch {
				// stream error
			} finally {
				controller.close();
			}
		}
	});

	return new Response(readable, { headers });
};
