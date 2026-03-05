import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { documents, documentChunks } from '$lib/server/schema';
import { chunkText } from '$lib/server/chunker';
import { embedBatch } from '$lib/server/embeddings';
import { eq, desc } from 'drizzle-orm';

export const GET: RequestHandler = async ({ locals }) => {
	const session = await locals.auth();
	if (!session?.user?.id) return json({ error: 'Unauthorized' }, { status: 401 });

	const docs = await db
		.select({
			id: documents.id,
			filename: documents.filename,
			mimeType: documents.mimeType,
			createdAt: documents.createdAt
		})
		.from(documents)
		.where(eq(documents.userId, session.user.id))
		.orderBy(desc(documents.createdAt));

	return json(docs);
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.auth();
	if (!session?.user?.id) return json({ error: 'Unauthorized' }, { status: 401 });

	const formData = await request.formData();
	const file = formData.get('file') as File | null;

	if (!file) return json({ error: 'No file provided' }, { status: 400 });

	const allowedTypes = ['text/plain'];
	if (!allowedTypes.includes(file.type) && !file.name.endsWith('.txt')) {
		return json({ error: 'Only text files are supported' }, { status: 400 });
	}

	const content = await file.text();
	if (!content.trim()) return json({ error: 'File is empty' }, { status: 400 });

	// Save document
	const [doc] = await db
		.insert(documents)
		.values({
			userId: session.user.id,
			filename: file.name,
			mimeType: file.type || 'text/plain',
			content
		})
		.returning();

	// Chunk the text
	const chunks = chunkText(content);

	// Generate embeddings for all chunks
	const embeddings = await embedBatch(chunks);

	// Store chunks with embeddings
	await db.insert(documentChunks).values(
		chunks.map((chunkContent, i) => ({
			documentId: doc.id,
			content: chunkContent,
			chunkIndex: i,
			embedding: embeddings[i]
		}))
	);

	return json({ id: doc.id, filename: doc.filename, chunks: chunks.length });
};
