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
		onEdit?: () => void;
		onRegenerate?: () => void;
		onCopy?: () => void;
		showActions?: boolean;
	}

	let {
		role,
		content,
		loading = false,
		createdAt,
		citations = [],
		onEdit,
		onRegenerate,
		onCopy,
		showActions = true
	}: Props = $props();

	let showCitations = $state(false);
	let copied = $state(false);

	function formatTime(dateStr?: string): string {
		if (!dateStr) return '';
		const date = new Date(dateStr);
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	function handleCopy() {
		navigator.clipboard.writeText(content);
		copied = true;
		setTimeout(() => (copied = false), 2000);
		onCopy?.();
	}
</script>

{#if role === 'user'}
	<!-- User message: right-aligned dark bubble -->
	<div class="group flex justify-end">
		<div class="flex max-w-[70%] flex-col items-end">
			<div class="rounded-3xl bg-slate-700/80 px-5 py-3">
				<p class="text-sm leading-relaxed whitespace-pre-wrap text-slate-100">{content}</p>
			</div>

			<!-- Action row -->
			<div class="mt-1.5 flex items-center gap-2 px-1">
				{#if showActions && content && !loading}
					<div
						class="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100"
					>
						{#if onEdit}
							<button
								onclick={onEdit}
								class="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-700 hover:text-slate-300"
								title="Edit message"
								aria-label="Edit message"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="h-3.5 w-3.5"
									aria-hidden="true"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
									/>
								</svg>
							</button>
						{/if}
					</div>
				{/if}
				{#if createdAt}
					<span class="text-xs text-slate-300">{formatTime(createdAt)}</span>
				{/if}
			</div>
		</div>
	</div>
{:else}
	<!-- Assistant message: left-aligned, flowing text -->
	<div class="group">
		<div class="flex items-start gap-3">
			<!-- AI avatar -->
			<div
				class="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-lime-500"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="h-4 w-4 text-slate-900"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
					/>
				</svg>
			</div>

			<div class="min-w-0 flex-1">
				{#if content === '' && loading}
					<div class="flex items-center gap-2 py-2" role="status" aria-label="Generating response">
						<div class="flex gap-1">
							<div
								class="h-2 w-2 animate-bounce rounded-full bg-lime-500"
								style="animation-delay: 0ms"
							></div>
							<div
								class="h-2 w-2 animate-bounce rounded-full bg-lime-400"
								style="animation-delay: 150ms"
							></div>
							<div
								class="h-2 w-2 animate-bounce rounded-full bg-lime-500"
								style="animation-delay: 300ms"
							></div>
						</div>
						<span class="text-xs text-slate-300">Thinking...</span>
					</div>
				{:else}
					<div class="prose-sm leading-relaxed text-slate-200">
						<MarkdownRenderer {content} />{#if loading}<span
								class="ml-0.5 inline-block h-4 w-[3px] animate-pulse rounded-sm bg-lime-400 align-middle"
								role="status"
								aria-label="Streaming response"
							></span>{/if}
					</div>
				{/if}

				<!-- Action icons row -->
				{#if showActions && content && !loading}
					<div
						class="mt-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"
					>
						<button
							onclick={handleCopy}
							class="rounded-md p-1.5 transition {copied
								? 'text-lime-400'
								: 'text-slate-500 hover:bg-slate-700 hover:text-slate-300'}"
							title="Copy to clipboard"
							aria-label={copied ? 'Copied' : 'Copy to clipboard'}
						>
							{#if copied}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="h-4 w-4"
									aria-hidden="true"
								>
									<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
								</svg>
							{:else}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="h-4 w-4"
									aria-hidden="true"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
									/>
								</svg>
							{/if}
						</button>
						{#if onRegenerate}
							<button
								onclick={onRegenerate}
								class="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-700 hover:text-slate-300"
								title="Regenerate response"
								aria-label="Regenerate response"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="h-4 w-4"
									aria-hidden="true"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182M2.985 14.652"
									/>
								</svg>
							</button>
						{/if}
					</div>
				{/if}

				<!-- Citations -->
				{#if citations.length > 0}
					<div class="mt-2">
						<button
							onclick={() => (showCitations = !showCitations)}
							class="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-lime-400 transition hover:bg-slate-700/50"
							aria-expanded={showCitations}
							aria-label="{citations.length} source{citations.length > 1 ? 's' : ''} cited"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="h-3.5 w-3.5"
								aria-hidden="true"
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
								class="h-3 w-3 transition-transform {showCitations ? 'rotate-180' : ''}"
								aria-hidden="true"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="m19.5 8.25-7.5 7.5-7.5-7.5"
								/>
							</svg>
						</button>

						{#if showCitations}
							<div
								class="mt-1.5 space-y-1.5 rounded-xl border border-slate-700 bg-slate-800/50 p-3"
							>
								{#each citations as cite}
									<div class="flex items-center justify-between gap-3">
										<div class="flex items-center gap-2 text-xs">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke-width="1.5"
												stroke="currentColor"
												class="h-3.5 w-3.5 flex-shrink-0 text-lime-400"
												aria-hidden="true"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
												/>
											</svg>
											<span class="font-medium text-slate-300">{cite.filename}</span>
											<span class="text-slate-500">chunk {cite.chunkIndex}</span>
										</div>
										<span
											class="rounded-full px-2 py-0.5 text-xs font-bold {cite.similarity >= 70
												? 'bg-lime-500/20 text-lime-400'
												: cite.similarity >= 40
													? 'bg-yellow-500/20 text-yellow-400'
													: 'bg-slate-700 text-slate-400'}"
										>
											{cite.similarity}%
										</span>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
