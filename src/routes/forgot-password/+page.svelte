<script lang="ts">
	import { enhance } from '$app/forms';
	export let form;
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
								d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
							/>
						</svg>
					</div>
					<h1 class="text-3xl font-bold text-slate-900">Forgot Password</h1>
					<p class="mt-2 text-sm text-slate-500">
						Enter your email to receive a password reset link.
					</p>
				</div>

				{#if form?.success}
					<div
						class="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-center text-sm text-green-700"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="-mt-0.5 mr-1 inline-block h-5 w-5"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
							/>
						</svg>
						If an account exists with that email, a reset link has been sent.
					</div>
				{/if}

				{#if form?.error}
					<div
						class="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600"
					>
						{form.error}
					</div>
				{/if}

				<form method="POST" class="flex flex-col gap-5" use:enhance>
					<div>
						<label for="email" class="mb-1.5 block text-sm font-medium text-slate-700">Email</label
						>
						<input
							id="email"
							name="email"
							type="email"
							required
							class="w-full rounded-xl border border-slate-200 p-2.5 transition focus:border-transparent focus:ring-2 focus:ring-lime-500 focus:outline-none"
							placeholder="you@example.com"
						/>
					</div>

					<button
						type="submit"
						class="rounded-xl bg-slate-900 py-3 font-medium text-white transition-all duration-200 hover:bg-slate-800"
					>
						Send Reset Link
					</button>

					<p class="text-center text-sm text-slate-500">
						Remember your password?
						<a href="/login" class="font-medium text-lime-600 hover:text-lime-700">Login</a>
					</p>
				</form>
			</div>
		</div>
	</div>
</div>
