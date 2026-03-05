const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;

export function chunkText(text: string): string[] {
	const words = text.split(/\s+/);
	const chunks: string[] = [];

	for (let i = 0; i < words.length; i += CHUNK_SIZE - CHUNK_OVERLAP) {
		const chunk = words.slice(i, i + CHUNK_SIZE).join(' ');
		if (chunk.trim()) {
			chunks.push(chunk.trim());
		}
	}

	return chunks;
}
