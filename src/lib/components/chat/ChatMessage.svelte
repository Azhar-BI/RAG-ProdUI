<script lang="ts">
	import MarkdownRenderer from './MarkdownRenderer.svelte';

	interface Citation {
		filename: string;
		chunkIndex: number;
		similarity: number;
	}

	interface Props {
		role: 'user' | 'assistant';
		content: string;
		loading?: boolean;
		createdAt?: string;
		citations?: Citation[];
	}

	let { role, content, loading = false, createdAt, citations = [] }: Props = $props();

	let showCitations = $state(false);

	function formatTime(dateStr?: string): string {
		if (!dateStr) return '';
		const date = new Date(dateStr);
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}
</script>

<div class="flex {role === 'user' ? 'justify-end' : 'justify-start'} gap-3">
	<!-- Assistant avatar -->
	{#if role === 'assistant'}
		<div
			class="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-sm"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="white"
				class="h-4 w-4"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
				/>
			</svg>
		</div>
	{/if}

	<!-- Message bubble -->
	<div class="flex max-w-[75%] flex-col {role === 'user' ? 'items-end' : 'items-start'}">
		<div
			class="{role === 'user'
				? 'rounded-2xl rounded-tr-md bg-black text-white shadow-lg'
				: 'rounded-2xl rounded-tl-md border border-gray-200 bg-gray-100 text-gray-900 shadow-sm'} px-5 py-3.5"
		>
			{#if role === 'assistant' && content === '' && loading}
				<div class="flex items-center gap-2 py-1">
					<div
						class="h-2 w-2 animate-bounce rounded-full bg-blue-400"
						style="animation-delay: 0ms"
					></div>
					<div
						class="h-2 w-2 animate-bounce rounded-full bg-purple-400"
						style="animation-delay: 150ms"
					></div>
					<div
						class="h-2 w-2 animate-bounce rounded-full bg-blue-400"
						style="animation-delay: 300ms"
					></div>
					<span class="ml-1 text-xs text-gray-400">Thinking...</span>
				</div>
			{:else if role === 'assistant'}
				<div class="text-sm leading-relaxed">
					<MarkdownRenderer {content} />
				</div>
			{:else}
				<p class="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
			{/if}
		</div>

		<!-- Timestamp -->
		{#if createdAt}
			<span class="mt-1 px-1 text-[10px] text-gray-400">{formatTime(createdAt)}</span>
		{/if}

		<!-- Citations -->
		{#if citations.length > 0}
			<div class="mt-1 w-full">
				<button
					onclick={() => (showCitations = !showCitations)}
					class="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium text-blue-500 transition hover:bg-blue-50"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="h-3 w-3"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
						/>
					</svg>
					{citations.length} source{citations.length > 1 ? 's' : ''} cited
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="2"
						stroke="currentColor"
						class="h-2.5 w-2.5 transition-transform {showCitations ? 'rotate-180' : ''}"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
					</svg>
				</button>

				{#if showCitations}
					<div class="mt-1 space-y-1 rounded-lg border border-blue-100 bg-blue-50/50 p-2">
						{#each citations as cite}
							<div class="flex items-center justify-between text-[11px]">
								<span class="font-medium text-gray-700">
									{cite.filename}
									<span class="text-gray-400">chunk {cite.chunkIndex}</span>
								</span>
								<span
									class="rounded-full px-1.5 py-0.5 text-[10px] font-semibold {cite.similarity >= 70
										? 'bg-green-100 text-green-700'
										: cite.similarity >= 40
											? 'bg-yellow-100 text-yellow-700'
											: 'bg-gray-100 text-gray-500'}"
								>
									{cite.similarity}% match
								</span>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<!-- User avatar -->
	{#if role === 'user'}
		<div
			class="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-black shadow-sm"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="white"
				class="h-4 w-4"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
				/>
			</svg>
		</div>
	{/if}
</div>
