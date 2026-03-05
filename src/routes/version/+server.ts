import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	return json({
		name: 'auth-ai-chat',
		version: '1.0.0',
		features: ['auth', 'oauth', 'rag', 'chat', 'admin']
	});
};
