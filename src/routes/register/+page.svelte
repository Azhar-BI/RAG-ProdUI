<script lang="ts">
	import { enhance } from '$app/forms';
	import { signIn } from '@auth/sveltekit/client';

	let { data, form } = $props();
</script>

<div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
	<!-- Navbar -->
	<nav class="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
		<div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
			<a href="/" class="text-xl font-bold tracking-tight">
				<span class="text-black">Auth</span><span class="text-gray-500">Flow</span>
			</a>
			<div class="flex items-center gap-3">
				<span class="hidden text-sm text-gray-500 sm:inline">Already have an account?</span>
				<a
					href="/login"
					class="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
				>
					Login
				</a>
			</div>
		</div>
	</nav>

	<!-- Two-column layout -->
	<div class="flex min-h-screen pt-16">
		<!-- Left brand panel (hidden on mobile) -->
		<div
			class="relative sticky top-0 hidden h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 to-black md:flex md:w-[45%] lg:w-[42%]"
		>
			<div class="absolute inset-0 opacity-5">
				<div class="absolute top-20 left-10 h-40 w-40 rounded-full border border-white"></div>
				<div class="absolute right-8 bottom-32 h-64 w-64 rounded-full border border-white"></div>
				<div class="absolute top-1/2 left-1/3 h-20 w-20 rounded-full border border-white"></div>
			</div>
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
							d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
						/>
					</svg>
				</div>
				<h2 class="mb-4 text-3xl font-bold text-white lg:text-4xl">Get Started Today</h2>
				<p class="mx-auto max-w-sm text-base leading-relaxed text-gray-400 lg:text-lg">
					Join thousands of companies using AuthFlow to build, scale, and secure their products.
				</p>
				<div class="mt-10 flex justify-center gap-2">
					<span class="h-1 w-8 rounded-full bg-white/30"></span>
					<span class="h-1 w-8 rounded-full bg-white"></span>
					<span class="h-1 w-8 rounded-full bg-white/30"></span>
				</div>
			</div>
		</div>

		<!-- Right form panel -->
		<div
			class="flex w-full items-center justify-center px-4 py-12 md:w-[55%] md:px-8 lg:w-[58%] lg:px-16"
		>
			<div class="w-full max-w-md">
				<div class="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl md:p-10">
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
									d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
								/>
							</svg>
						</div>
						<h1 class="text-3xl font-bold text-gray-900">Join AuthFlow</h1>
						<p class="mt-2 text-sm text-gray-500">Create your account to access secure services.</p>
					</div>

					{#if data.hasUnverifiedSession}
						<div class="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
							<p class="mb-1 text-sm font-medium text-amber-800">You have an unverified account</p>
							<p class="mb-3 text-xs text-amber-700">
								Please verify your email or log out to use a different account.
							</p>
							<div class="flex gap-2">
								<a
									href="/verify-email-required"
									class="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-amber-700"
									>Verify Email</a
								>
								<form method="POST" action="/logout" class="inline">
									<button
										type="submit"
										class="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-800 transition hover:bg-amber-100"
										>Log Out</button
									>
								</form>
							</div>
						</div>
					{:else}
						<!-- OAuth Buttons -->
						<div class="mb-6 flex flex-col gap-3">
							<button
								onclick={() => signIn('google', { redirectTo: '/dashboard' })}
								type="button"
								class="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50"
							>
								<svg class="h-5 w-5" viewBox="0 0 24 24">
									<path
										fill="#4285F4"
										d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
									/>
									<path
										fill="#34A853"
										d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
									/>
									<path
										fill="#FBBC05"
										d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
									/>
									<path
										fill="#EA4335"
										d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
									/>
								</svg>
								Sign up with Google
							</button>
							<button
								onclick={() => signIn('github', { redirectTo: '/dashboard' })}
								type="button"
								class="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50"
							>
								<svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
									<path
										d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
									/>
								</svg>
								Sign up with GitHub
							</button>
						</div>
					{/if}

					<!-- Divider -->
					<div class="relative mb-6">
						<div class="absolute inset-0 flex items-center">
							<div class="w-full border-t border-gray-200"></div>
						</div>
						<div class="relative flex justify-center text-sm">
							<span class="bg-white px-4 text-gray-400">or continue with email</span>
						</div>
					</div>

					<form method="POST" action="?/register" class="flex flex-col gap-5" use:enhance>
						<div>
							<label for="name" class="mb-1.5 block text-sm font-medium text-gray-700"
								>Full Name</label
							>
							<input
								id="name"
								name="name"
								type="text"
								required
								class="w-full rounded-xl border border-gray-300 p-2.5 transition focus:border-transparent focus:ring-2 focus:ring-black focus:outline-none"
								placeholder="John Doe"
							/>
						</div>

						<div>
							<label for="email" class="mb-1.5 block text-sm font-medium text-gray-700"
								>Email Address</label
							>
							<input
								id="email"
								name="email"
								type="email"
								required
								class="w-full rounded-xl border border-gray-300 p-2.5 transition focus:border-transparent focus:ring-2 focus:ring-black focus:outline-none"
								placeholder="you@example.com"
							/>
						</div>

						<div>
							<label for="password" class="mb-1.5 block text-sm font-medium text-gray-700"
								>Password</label
							>
							<input
								id="password"
								name="password"
								type="password"
								required
								minlength="6"
								class="w-full rounded-xl border border-gray-300 p-2.5 transition focus:border-transparent focus:ring-2 focus:ring-black focus:outline-none"
								placeholder="Letters & numbers, min. 6 chars"
							/>
							<p class="mt-1.5 text-xs text-gray-400">
								Must be at least 6 characters with both letters and numbers.
							</p>
						</div>

						{#if form?.error}
							<div
								class="rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600"
							>
								{form.error}
							</div>
						{/if}

						<button
							type="submit"
							class="rounded-xl bg-black py-3 font-medium text-white transition-all duration-200 hover:bg-gray-800"
						>
							Create Account
						</button>

						<p class="text-center text-sm text-gray-500">
							Already have an account?
							<a href="/login" class="font-medium text-black hover:underline">Login</a>
						</p>
					</form>
				</div>
			</div>
		</div>
	</div>
</div>
