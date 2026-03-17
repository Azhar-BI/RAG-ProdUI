<script lang="ts">
	let {
		message,
		type = 'success',
		visible = $bindable(false)
	}: { message: string; type?: 'success' | 'error'; visible: boolean } = $props();

	let timeout: ReturnType<typeof setTimeout>;

	$effect(() => {
		if (visible) {
			clearTimeout(timeout);
			timeout = setTimeout(() => {
				visible = false;
			}, 3500);
		}
	});
</script>

{#if visible}
	<div
		role="alert"
		aria-live="assertive"
		aria-atomic="true"
		class="fixed top-20 right-6 z-50 flex items-center gap-3 rounded-xl border px-5 py-3.5 shadow-lg transition-all duration-300 {type ===
		'success'
			? 'border-emerald-200 bg-emerald-50 text-emerald-700'
			: 'border-red-200 bg-red-50 text-red-700'}"
	>
		{#if type === 'success'}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="2"
				stroke="currentColor"
				class="h-5 w-5 flex-shrink-0"
				aria-hidden="true"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
			</svg>
		{:else}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="2"
				stroke="currentColor"
				class="h-5 w-5 flex-shrink-0"
				aria-hidden="true"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
				/>
			</svg>
		{/if}
		<span class="text-sm font-medium">{message}</span>
		<button
			onclick={() => (visible = false)}
			class="ml-2 opacity-60 hover:opacity-100"
			aria-label="Dismiss notification"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="2"
				stroke="currentColor"
				class="h-4 w-4"
				aria-hidden="true"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
			</svg>
		</button>
	</div>
{/if}
