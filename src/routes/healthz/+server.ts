import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';

export const GET: RequestHandler = async () => {
	try {
		await db.execute(sql`SELECT 1`);
		return json({ status: 'ok', database: 'connected' });
	} catch {
		return json({ status: 'error', database: 'disconnected' }, { status: 503 });
	}
};
