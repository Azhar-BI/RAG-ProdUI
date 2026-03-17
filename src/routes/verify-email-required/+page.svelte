<script lang="ts">
	import { enhance } from '$app/forms';
	let { data, form } = $props();
	let sending = $state(false);
</script>

<div class="min-h-screen bg-slate-50">
	<!-- Navbar -->
	<nav class="fixed top-0 z-50 w-full bg-white shadow-sm">
		<div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
			<a href="/" class="text-xl font-bold tracking-tight">
				<span class="text-slate-900">Auth</span><span class="text-lime-500">Flow</span>
			</a>
			<a href="/logout" class="text-sm font-medium text-slate-600 transition hover:text-slate-900">
				Logout
			</a>
		</div>
	</nav>

	<!-- Centered card layout -->
	<div class="flex min-h-screen items-center justify-center px-4 pt-20">
		<div class="w-full max-w-md animate-[fadeInUp_0.5s_ease-out]">
			<div class="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg md:p-10">
				<div
					class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="h-8 w-8 text-amber-600"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
						/>
					</svg>
				</div>

				<div class="mb-5 rounded-xl border border-green-200 bg-green-50 p-3">
					<p class="text-sm font-medium text-green-700">Account created successfully!</p>
				</div>

				<h1 class="mb-2 text-2xl font-bold text-slate-900">Verify Your Email</h1>
				<p class="mb-2 text-slate-500">We sent a verification link to</p>
				<p class="mb-6 font-medium text-slate-900">{data.email}</p>
				<p class="mb-8 text-sm text-slate-500">
					Please check your inbox and click the link to verify your email before accessing the
					dashboard.
				</p>

				{#if form?.sent}
					<div class="mb-6 rounded-xl border border-green-200 bg-green-50 p-3">
						<p class="text-sm font-medium text-green-700">
							Verification email sent! Check your inbox.
						</p>
					</div>
				{/if}

				<form
					method="POST"
					action="?/resend"
					use:enhance={() => {
						sending = true;
						return async ({ update }) => {
							sending = false;
							await update();
						};
					}}
				>
					<button
						type="submit"
						disabled={sending}
						class="w-full rounded-xl bg-slate-900 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-slate-800 disabled:opacity-50"
					>
						{sending ? 'Sending...' : 'Resend Verification Email'}
					</button>
				</form>
			</div>
		</div>
	</div>
</div>

<style>
	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(16px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
