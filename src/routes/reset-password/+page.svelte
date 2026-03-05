<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();
</script>

<div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
	<!-- Navbar -->
	<nav class="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
		<div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
			<a href="/" class="text-xl font-bold tracking-tight">
				<span class="text-black">Auth</span><span class="text-gray-500">Flow</span>
			</a>
			<a href="/login" class="text-sm font-medium text-gray-700 transition hover:text-black">
				Back to Login
			</a>
		</div>
	</nav>

	<!-- Two-column layout -->
	<div class="flex min-h-screen pt-16">
		<!-- Left brand panel (hidden on mobile) -->
		<div
			class="relative sticky top-0 hidden h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 to-black md:flex md:w-[45%] lg:w-[42%]"
		>
			<!-- Decorative pattern -->
			<div class="absolute inset-0 opacity-5">
				<div class="absolute top-20 left-10 h-40 w-40 rounded-full border border-white"></div>
				<div class="absolute right-8 bottom-32 h-64 w-64 rounded-full border border-white"></div>
				<div class="absolute top-1/2 left-1/3 h-20 w-20 rounded-full border border-white"></div>
			</div>
			<!-- Subtle grid pattern -->
			<div
				class="absolute inset-0 opacity-[0.03]"
				style="background-image: url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fill-opacity=&quot;1&quot;%3E%3Cpath d=&quot;M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"
			></div>

			<div class="relative z-10 px-12 text-center lg:px-16">
				<div
					class="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 backdrop-blur-sm"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="white"
						class="h-8 w-8"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
						/>
					</svg>
				</div>
				<h2 class="mb-4 text-3xl font-bold text-white lg:text-4xl">Secure Your Account</h2>
				<p class="mx-auto max-w-sm text-base leading-relaxed text-gray-400 lg:text-lg">
					Choose a strong new password to keep your account safe and secure.
				</p>
				<div class="mt-10 flex justify-center gap-2">
					<span class="h-1 w-8 rounded-full bg-white/30"></span>
					<span class="h-1 w-8 rounded-full bg-white/30"></span>
					<span class="h-1 w-8 rounded-full bg-white"></span>
				</div>
			</div>
		</div>

		<!-- Right form panel -->
		<div
			class="flex w-full items-center justify-center px-4 py-12 md:w-[55%] md:px-8 lg:w-[58%] lg:px-16"
		>
			<div class="w-full max-w-md">
				<div class="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl md:p-10">
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
							<h1 class="mb-2 text-2xl font-bold text-gray-900">Invalid Link</h1>
							<p class="mb-6 text-gray-500">{data.error}</p>
							<a
								href="/forgot-password"
								class="inline-block rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-gray-800"
							>
								Request New Link
							</a>
						</div>
					{:else}
						<div class="mb-8 text-center">
							<div
								class="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-black"
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
							<h1 class="text-3xl font-bold text-gray-900">Reset Password</h1>
							<p class="mt-2 text-sm text-gray-500">Enter your new password below.</p>
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
								<label for="password" class="mb-1.5 block text-sm font-medium text-gray-700"
									>New Password</label
								>
								<input
									id="password"
									name="password"
									type="password"
									required
									minlength="6"
									class="w-full rounded-xl border border-gray-300 p-2.5 transition focus:border-transparent focus:ring-2 focus:ring-black focus:outline-none"
									placeholder="Min. 6 characters"
								/>
								<p class="mt-1.5 text-xs text-gray-400">Must be at least 6 characters.</p>
							</div>

							<button
								type="submit"
								class="rounded-xl bg-black py-3 font-medium text-white transition-all duration-200 hover:bg-gray-800"
							>
								Reset Password
							</button>
						</form>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
