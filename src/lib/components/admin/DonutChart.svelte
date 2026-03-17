<script lang="ts">
	let {
		segments,
		size = 120,
		strokeWidth = 18
	}: {
		segments: { label: string; value: number; color: string }[];
		size?: number;
		strokeWidth?: number;
	} = $props();

	let total = $derived(segments.reduce((s, seg) => s + seg.value, 0) || 1);
	let radius = $derived((size - strokeWidth) / 2);
	let circumference = $derived(2 * Math.PI * radius);
	let center = $derived(size / 2);

	let arcs = $derived.by(() => {
		let offset = 0;
		return segments.map((seg) => {
			const pct = seg.value / total;
			const length = pct * circumference;
			const arc = { offset, length, color: seg.color, label: seg.label, value: seg.value, pct };
			offset += length;
			return arc;
		});
	});
</script>

<div class="flex items-center gap-4">
	<svg width={size} height={size} class="flex-shrink-0 -rotate-90">
		{#each arcs as arc}
			<circle
				cx={center}
				cy={center}
				r={radius}
				fill="none"
				stroke={arc.color}
				stroke-width={strokeWidth}
				stroke-dasharray="{arc.length} {circumference - arc.length}"
				stroke-dashoffset={-arc.offset}
				stroke-linecap="round"
			/>
		{/each}
		<text
			x={center}
			y={center}
			text-anchor="middle"
			dominant-baseline="central"
			class="origin-center rotate-90 fill-slate-900 text-lg font-bold"
		>
			{total}
		</text>
	</svg>
	<div class="space-y-1.5">
		{#each segments as seg}
			<div class="flex items-center gap-2 text-xs">
				<span class="h-2.5 w-2.5 flex-shrink-0 rounded-full" style="background-color: {seg.color};"
				></span>
				<span class="text-slate-600">{seg.label}</span>
				<span class="font-semibold text-slate-900">{seg.value}</span>
			</div>
		{/each}
	</div>
</div>
