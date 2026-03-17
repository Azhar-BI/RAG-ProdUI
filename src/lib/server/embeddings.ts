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

export async function parsePdf(file: File): Promise<string> {
	const formData = new FormData();
	formData.append('file', file);

	const res = await fetch(`${getBaseUrl()}/parse-pdf`, {
		method: 'POST',
		body: formData
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({ detail: 'Failed to parse PDF' }));
		throw new Error(err.detail || 'Failed to parse PDF');
	}

	const data = await res.json();
	return data.text;
}
