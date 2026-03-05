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

export async function retrieveContext(
	query: string,
	userId: string,
	topK = 5
): Promise<RetrievedChunk[]> {
	const queryEmbedding = await embedText(query);
	const embeddingStr = `[${queryEmbedding.join(',')}]`;

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

	return results;
}

export function buildContextPrompt(chunks: RetrievedChunk[]): string {
	if (chunks.length === 0) return '';

	const contextParts = chunks.map(
		(c, i) => `[Source: ${c.filename}, Chunk ${c.chunkIndex + 1}] (similarity: ${(c.similarity * 100).toFixed(1)}%)\n${c.content}`
	);

	return `\n\nRelevant context from uploaded documents:\n---\n${contextParts.join('\n\n')}\n---\n\nUse the above context to inform your answer. When you use information from the context, cite the source filename. If the context is not relevant to the question, you may ignore it.`;
}
