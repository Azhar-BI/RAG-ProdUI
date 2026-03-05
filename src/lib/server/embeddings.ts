import { env } from '$env/dynamic/private';

const getBaseUrl = () => env.EMBEDDING_API_URL || 'http://localhost:8000';

export async function embedText(text: string): Promise<number[]> {
	const res = await fetch(`${getBaseUrl()}/embed`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ text })
	});
	if (!res.ok) throw new Error(`Embedding API error: ${res.statusText}`);
	const data = await res.json();
	return data.embedding;
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
	const res = await fetch(`${getBaseUrl()}/embed/batch`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ texts })
	});
	if (!res.ok) throw new Error(`Embedding API error: ${res.statusText}`);
	const data = await res.json();
	return data.embeddings;
}
