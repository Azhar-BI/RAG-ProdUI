<script lang="ts">
	import { enhance } from '$app/forms';
	let { data, form } = $props();
</script>

<div class="min-h-screen bg-slate-50">
	<!-- Navbar -->
	<nav class="fixed top-0 z-50 w-full bg-white shadow-sm">
		<div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
			<a href="/" class="text-xl font-bold tracking-tight">
				<span class="text-slate-900">Auth</span><span class="text-lime-500">Flow</span>
			</a>
			<a href="/login" class="text-sm font-medium text-slate-600 transition hover:text-slate-900">
				Back to Login
			</a>
		</div>
	</nav>

	<!-- Centered card -->
	<div class="flex min-h-screen items-center justify-center px-4 pt-20">
		<div class="w-full max-w-md">
			<div class="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg md:p-10">
				{#if !data.valid}
					<div class="text-center">
						<div
							class="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="h-7 w-7 text-red-500"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
								/>
							</svg>
						</div>
						<h1 class="mb-2 text-2xl font-bold text-slate-900">Invalid Link</h1>
						<p class="mb-6 text-slate-500">{data.error}</p>
						<a
							href="/forgot-password"
							class="inline-block rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-slate-800"
						>
							Request New Link
						</a>
					</div>
				{:else}
					<div class="mb-8 text-center">
						<div
							class="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="white"
								class="h-7 w-7"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
								/>
							</svg>
						</div>
						<h1 class="text-3xl font-bold text-slate-900">Reset Password</h1>
						<p class="mt-2 text-sm text-slate-500">Enter your new password below.</p>
					</div>

					{#if form?.error}
						<div
							class="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600"
						>
							{form.error}
						</div>
					{/if}

					<form method="POST" class="flex flex-col gap-5" use:enhance>
						<input type="hidden" name="token" value={data.token} />
						<input type="hidden" name="email" value={data.email} />

						<div>
							<label for="password" class="mb-1.5 block text-sm font-medium text-slate-700"
								>New Password</label
							>
							<input
								id="password"
								name="password"
								type="password"
								required
								minlength="6"
								class="w-full rounded-xl border border-slate-200 p-2.5 transition focus:border-transparent focus:ring-2 focus:ring-lime-500 focus:outline-none"
								placeholder="Min. 6 characters"
							/>
							<p class="mt-1.5 text-xs text-slate-400">Must be at least 6 characters.</p>
						</div>

						<button
							type="submit"
							class="rounded-xl bg-slate-900 py-3 font-medium text-white transition-all duration-200 hover:bg-slate-800"
						>
							Reset Password
						</button>
					</form>
				{/if}
			</div>
		</div>
	</div>
</div>
