import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	// Auth guard
	const session = await locals.auth();
	if (!session?.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const { messages } = await request.json();

	const google = createGoogleGenerativeAI({
		apiKey: env.GEMINI_API_KEY
	});

	const result = streamText({
		model: google('gemini-2.5-flash'),
		system: 'You are a helpful AI assistant. Be concise and friendly in your responses.',
		messages
	});

	return result.toTextStreamResponse();
};
