import { db } from '$lib/server/db';
import { documentChunks, documents } from '$lib/server/schema';
import { embedText } from '$lib/server/embeddings';
import { eq, sql, and } from 'drizzle-orm';

export interface RetrievedChunk {
	content: string;
	filename: string;
	documentId: string;
	chunkIndex: number;
	similarity: number;
}

const MIN_SIMILARITY = 0.15;

export async function retrieveContext(
	query: string,
	userId: string,
	topK = 5
): Promise<RetrievedChunk[]> {
	console.log(`[RAG] Embedding query for user ${userId}...`);
	const queryEmbedding = await embedText(query);
	console.log(`[RAG] Got embedding with ${queryEmbedding.length} dimensions`);
	const embeddingStr = `[${queryEmbedding.join(',')}]`;

	// Debug: check how many chunks exist for this user
	const totalChunks = await db
		.select({ count: sql<number>`count(*)` })
		.from(documentChunks)
		.innerJoin(documents, eq(documentChunks.documentId, documents.id))
		.where(eq(documents.userId, userId));

	const withEmbeddings = await db
		.select({ count: sql<number>`count(*)` })
		.from(documentChunks)
		.innerJoin(documents, eq(documentChunks.documentId, documents.id))
		.where(and(eq(documents.userId, userId), sql`${documentChunks.embedding} IS NOT NULL`));

	console.log(
		`[RAG] User has ${totalChunks[0].count} total chunks, ${withEmbeddings[0].count} with embeddings`
	);

	const results = await db
		.select({
			content: documentChunks.content,
			filename: documents.filename,
			documentId: documentChunks.documentId,
			chunkIndex: documentChunks.chunkIndex,
			similarity: sql<number>`1 - (${documentChunks.embedding} <=> ${embeddingStr}::vector)`
		})
		.from(documentChunks)
		.innerJoin(documents, eq(documentChunks.documentId, documents.id))
		.where(and(eq(documents.userId, userId), sql`${documentChunks.embedding} IS NOT NULL`))
		.orderBy(sql`${documentChunks.embedding} <=> ${embeddingStr}::vector`)
		.limit(topK);

	// Log all results with their similarity before filtering
	if (results.length > 0) {
		console.log(`[RAG] Top results before threshold filter:`);
		results.forEach((r, i) =>
			console.log(
				`  [${i}] ${r.filename} chunk ${r.chunkIndex}: ${(r.similarity * 100).toFixed(1)}%`
			)
		);
	}

	// Apply minimum similarity filter
	return results.filter((r) => r.similarity >= MIN_SIMILARITY);
}

export function buildContextPrompt(chunks: RetrievedChunk[]): string {
	if (chunks.length === 0) return '';

	const contextParts = chunks.map(
		(c, i) =>
			`[Source: ${c.filename}, Chunk ${c.chunkIndex + 1}] (similarity: ${(c.similarity * 100).toFixed(1)}%)\n${c.content}`
	);

	return `\n\nRelevant context from uploaded documents:\n---\n${contextParts.join('\n\n')}\n---\n\nUse the above context to inform your answer. When you use information from the context, cite the source filename. If the context is not relevant to the question, you may ignore it.`;
}
