<script lang="ts">
	interface Props {
		role: 'user' | 'assistant';
		content: string;
		loading?: boolean;
	}

	let { role, content, loading = false }: Props = $props();
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
			{:else}
				<p class="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
			{/if}
		</div>
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
