<script lang="ts">
	let {
		open = $bindable(false),
		title = 'Confirm Action',
		message = 'Are you sure?',
		confirmLabel = 'Confirm',
		cancelLabel = 'Cancel',
		variant = 'danger',
		onconfirm
	}: {
		open: boolean;
		title?: string;
		message?: string;
		confirmLabel?: string;
		cancelLabel?: string;
		variant?: 'danger' | 'warning' | 'info';
		onconfirm: () => void;
	} = $props();

	function handleConfirm() {
		onconfirm();
		open = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			open = false;
		}
	}

	const btnStyles = {
		danger: 'bg-red-600 hover:bg-red-700 text-white',
		warning: 'bg-amber-500 hover:bg-amber-600 text-white',
		info: 'bg-lime-500 hover:bg-lime-400 text-slate-900'
	};
</script>

<svelte:window onkeydown={open ? handleKeydown : undefined} />

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center">
		<!-- Backdrop -->
		<button
			class="absolute inset-0 bg-black/50 backdrop-blur-sm"
			onclick={() => (open = false)}
			aria-label="Close dialog"
			tabindex="-1"
		></button>

		<!-- Modal -->
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="confirm-modal-title"
			aria-describedby="confirm-modal-message"
			class="relative mx-4 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
		>
			<h3 id="confirm-modal-title" class="text-lg font-bold text-slate-900">{title}</h3>
			<p id="confirm-modal-message" class="mt-2 text-sm text-slate-600">{message}</p>

			<div class="mt-6 flex items-center justify-end gap-3">
				<button
					onclick={() => (open = false)}
					class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
				>
					{cancelLabel}
				</button>
				<button
					onclick={handleConfirm}
					class="rounded-lg px-4 py-2 text-sm font-medium transition {btnStyles[variant]}"
				>
					{confirmLabel}
				</button>
			</div>
		</div>
	</div>
{/if}
