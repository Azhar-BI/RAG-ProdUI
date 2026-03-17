import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { documents, documentChunks } from '$lib/server/schema';
import { chunkText } from '$lib/server/chunker';
import { embedBatch, parsePdf } from '$lib/server/embeddings';
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

	const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
	const isTxt = file.type === 'text/plain' || file.name.endsWith('.txt');

	if (!isPdf && !isTxt) {
		return json({ error: 'Only text (.txt) and PDF (.pdf) files are supported' }, { status: 400 });
	}

	let content: string;

	if (isPdf) {
		try {
			content = await parsePdf(file);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to parse PDF';
			return json({ error: message }, { status: 400 });
		}
	} else {
		content = await file.text();
	}

	if (!content.trim()) return json({ error: 'File is empty' }, { status: 400 });

	// Save document
	const [doc] = await db
		.insert(documents)
		.values({
			userId: session.user.id,
			filename: file.name,
			mimeType: isPdf ? 'application/pdf' : 'text/plain',
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
