<script lang="ts">
	import { page } from '$app/stores';

	let { children, data } = $props();
	let mobileMenuOpen = $state(false);

	function getInitials(name: string | null | undefined, email: string | null | undefined): string {
		if (name) {
			return name
				.split(' ')
				.map((n: string) => n[0])
				.join('')
				.toUpperCase()
				.slice(0, 2);
		}
		return (email?.[0] || 'U').toUpperCase();
	}
</script>

<div class="min-h-screen bg-slate-100">
	<!-- Navbar -->
	<nav class="fixed top-0 z-50 w-full border-b border-slate-700 bg-slate-900 shadow-lg shadow-slate-900/30">
		<div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
			<div class="flex items-center gap-8">
				<a href="/" class="text-xl font-bold tracking-tight">
					<span class="text-white">Auth</span><span class="text-lime-400">Flow</span>
				</a>
				<div class="hidden items-center gap-1 text-sm sm:flex">
					<a
						href="/dashboard"
						class="rounded-lg px-3 py-1.5 font-medium transition {$page.url.pathname ===
						'/dashboard'
							? 'bg-lime-500/20 text-lime-400'
							: 'text-slate-300 hover:bg-white/10 hover:text-white'}"
					>
						Dashboard
					</a>
					<a
						href="/dashboard/chat"
						class="rounded-lg px-3 py-1.5 font-medium transition {$page.url.pathname ===
						'/dashboard/chat'
							? 'bg-lime-500/20 text-lime-400'
							: 'text-slate-300 hover:bg-white/10 hover:text-white'}"
					>
						Chat
					</a>
					<a
						href="/dashboard/profile"
						class="rounded-lg px-3 py-1.5 font-medium transition {$page.url.pathname ===
						'/dashboard/profile'
							? 'bg-lime-500/20 text-lime-400'
							: 'text-slate-300 hover:bg-white/10 hover:text-white'}"
					>
						Profile
					</a>
					{#if data.role === 'admin'}
						<a
							href="/dashboard/admin"
							class="rounded-lg px-3 py-1.5 font-medium transition {$page.url.pathname ===
							('/dashboard/admin' as string)
								? 'bg-lime-500/20 text-lime-400'
								: 'text-slate-300 hover:bg-white/10 hover:text-white'}"
						>
							Admin
						</a>
					{/if}
				</div>
			</div>
			<div class="flex items-center gap-3">
				<div class="hidden items-center gap-3 md:flex">
					<form method="POST" action="/logout" class="hidden sm:block">
						<button
							type="submit"
							class="rounded-lg bg-lime-500 px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-lime-400"
						>
							Logout
						</button>
					</form>

					<!-- Mobile hamburger button -->
					<button
						class="flex h-10 w-10 flex-col items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white sm:hidden"
						onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
						aria-label="Toggle menu"
					>
						{#if mobileMenuOpen}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="2"
								stroke="currentColor"
								class="h-6 w-6"
							>
								<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
							</svg>
						{:else}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="2"
								stroke="currentColor"
								class="h-6 w-6"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
								/>
							</svg>
						{/if}
					</button>
				</div>
			</div>
		</div>
	</nav>

	<!-- Mobile menu overlay -->
	{#if mobileMenuOpen}
		<div class="fixed inset-0 z-40 sm:hidden">
			<!-- Backdrop -->
			<button
				class="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onclick={() => (mobileMenuOpen = false)}
				aria-label="Close menu"
			></button>

			<!-- Menu panel -->
			<div class="absolute top-0 right-0 flex h-full w-72 flex-col bg-slate-900 shadow-2xl">
				<div class="flex items-center justify-between border-b border-slate-700 px-6 py-4">
					<div class="flex items-center gap-3">
						<div
							class="flex h-8 w-8 items-center justify-center rounded-full border border-lime-500/30 bg-slate-800 text-xs font-semibold text-white"
						>
							{getInitials(data.user?.name, data.user?.email)}
						</div>
						<div class="min-w-0">
							<p class="truncate text-sm font-medium text-white">
								{data.user?.name || 'User'}
							</p>
							<p class="truncate text-xs text-slate-400">{data.user?.email}</p>
						</div>
					</div>
					<button
						class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
						onclick={() => (mobileMenuOpen = false)}
						aria-label="Close menu"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="2"
							stroke="currentColor"
							class="h-5 w-5"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<nav class="flex flex-col gap-1 px-6 py-6">
					<a
						href="/dashboard"
						class="rounded-xl px-4 py-3 font-medium transition {$page.url.pathname ===
						'/dashboard'
							? 'bg-lime-500/20 text-lime-400'
							: 'text-slate-300 hover:bg-white/10 hover:text-white'}"
						onclick={() => (mobileMenuOpen = false)}
					>
						<span class="flex items-center gap-3">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="h-5 w-5 {$page.url.pathname === '/dashboard' ? 'text-lime-400' : ''}"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
								/>
							</svg>
							Dashboard
						</span>
					</a>
					<a
						href="/dashboard/chat"
						class="rounded-xl px-4 py-3 font-medium transition {$page.url.pathname ===
						'/dashboard/chat'
							? 'bg-lime-500/20 text-lime-400'
							: 'text-slate-300 hover:bg-white/10 hover:text-white'}"
						onclick={() => (mobileMenuOpen = false)}
					>
						<span class="flex items-center gap-3">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="h-5 w-5 {$page.url.pathname === '/dashboard/chat' ? 'text-lime-400' : ''}"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
								/>
							</svg>
							AI Chat
						</span>
					</a>
					<a
						href="/dashboard/profile"
						class="rounded-xl px-4 py-3 font-medium transition {$page.url.pathname ===
						'/dashboard/profile'
							? 'bg-lime-500/20 text-lime-400'
							: 'text-slate-300 hover:bg-white/10 hover:text-white'}"
						onclick={() => (mobileMenuOpen = false)}
					>
						<span class="flex items-center gap-3">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="h-5 w-5 {$page.url.pathname === '/dashboard/profile' ? 'text-lime-400' : ''}"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
								/>
							</svg>
							Profile
						</span>
					</a>
					{#if data.role === 'admin'}
						<a
							href="/dashboard/admin"
							class="rounded-xl px-4 py-3 font-medium transition {$page.url.pathname ===
							('/dashboard/admin' as string)
								? 'bg-lime-500/20 text-lime-400'
								: 'text-slate-300 hover:bg-white/10 hover:text-white'}"
							onclick={() => (mobileMenuOpen = false)}
						>
							<span class="flex items-center gap-3">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="h-5 w-5 {$page.url.pathname === ('/dashboard/admin' as string) ? 'text-lime-400' : ''}"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
									/>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
									/>
								</svg>
								Admin
							</span>
						</a>
					{/if}
				</nav>

				<div class="mt-auto px-6 pb-8">
					<form method="POST" action="/logout">
						<button
							type="submit"
							class="w-full rounded-xl bg-lime-500 px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-lime-400"
						>
							Logout
						</button>
					</form>
				</div>
			</div>
		</div>
	{/if}

	<!-- Content -->
	{#if $page.url.pathname === '/dashboard/chat'}
		<main class="pt-16">
			{@render children()}
		</main>
	{:else}
		<main class="mx-auto max-w-6xl px-4 pt-24 pb-12 md:px-6">
			{@render children()}
		</main>
	{/if}

	<!-- Floating AI Chat Button -->
	{#if $page.url.pathname !== '/dashboard/chat'}
		<a
			href="/dashboard/chat"
			class="fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-500 shadow-lg shadow-lime-500/30 transition-all duration-200 hover:scale-105 hover:bg-lime-400 hover:shadow-xl hover:shadow-lime-500/40"
			aria-label="Open AI Chat"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="h-6 w-6 text-slate-900"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
				/>
			</svg>
		</a>
	{/if}
</div>
