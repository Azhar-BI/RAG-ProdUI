<script lang="ts">
	let { data } = $props();
</script>

<div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
	<!-- Navbar -->
	<nav class="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
		<div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
			<a href="/" class="text-xl font-bold tracking-tight">
				<span class="text-black">Auth</span><span class="text-gray-500">Flow</span>
			</a>
			<a href="/login" class="text-sm font-medium text-gray-700 transition hover:text-black">
				Go to Login
			</a>
		</div>
	</nav>

	<!-- Verification Result -->
	<div class="flex min-h-screen items-center justify-center px-4 pt-20">
		<div class="w-full max-w-md animate-[fadeInUp_0.5s_ease-out]">
			<div class="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-xl md:p-10">
				{#if data.success}
					<div
						class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="h-8 w-8 text-green-600"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
							/>
						</svg>
					</div>
					<h1 class="mb-2 text-2xl font-bold text-gray-900">Email Verified!</h1>
					<p class="mb-8 text-gray-500">
						Your email has been verified successfully.
						{#if data.isLoggedIn}
							You can now access your dashboard.
						{:else}
							You can now login to your account.
						{/if}
					</p>
					<a
						href={data.isLoggedIn ? '/dashboard' : '/login'}
						class="inline-block rounded-xl bg-black px-8 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-gray-800"
					>
						{#if data.isLoggedIn}
							Go to Dashboard
						{:else}
							Go to Login
						{/if}
					</a>
				{:else}
					<div
						class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="h-8 w-8 text-red-500"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
							/>
						</svg>
					</div>
					<h1 class="mb-2 text-2xl font-bold text-gray-900">Verification Failed</h1>
					<p class="mb-8 text-gray-500">{data.error}</p>
					<a
						href="/login"
						class="inline-block rounded-xl bg-black px-8 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-gray-800"
					>
						Go to Login
					</a>
				{/if}
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
