<script lang="ts">
	let {
		data,
		label = '',
		color = '#84cc16'
	}: { data: { label: string; value: number }[]; label?: string; color?: string } = $props();

	let maxVal = $derived(Math.max(...data.map((d) => d.value), 1));
</script>

<div class="space-y-2">
	{#if label}
		<p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">{label}</p>
	{/if}
	<div class="flex items-end gap-1.5" style="height: 80px;">
		{#each data as bar}
			<div
				class="group relative flex flex-1 flex-col items-center justify-end"
				style="height: 100%;"
			>
				<div
					class="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded-md bg-slate-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition group-hover:opacity-100"
				>
					{bar.label}: {bar.value}
				</div>
				<div
					class="min-h-[4px] w-full rounded-t-sm transition-all duration-300"
					style="height: {(bar.value / maxVal) * 100}%; background-color: {color};"
				></div>
			</div>
		{/each}
	</div>
	<div class="flex gap-1.5">
		{#each data as bar}
			<div class="flex-1 truncate text-center text-[10px] text-slate-400">{bar.label}</div>
		{/each}
	</div>
</div>
