<script lang="ts">
	let { data } = $props();

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

	const today = new Date().toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});

	const hour = new Date().getHours();
	const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
</script>

<div>
	<!-- Hero Welcome Banner (matches landing page hero style) -->
	<div class="relative mb-8 overflow-hidden rounded-2xl bg-slate-900 p-6 text-white md:p-8">
		<!-- Gradient orbs matching landing page -->
		<div class="absolute top-1/4 left-1/4 h-48 w-48 rounded-full bg-lime-500/10 blur-3xl"></div>
		<div class="absolute right-1/4 bottom-1/4 h-36 w-36 rounded-full bg-emerald-500/10 blur-3xl"></div>

		<div class="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
			<div class="flex items-center gap-5">
				<div
					class="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border border-lime-500/30 bg-lime-500/15 text-2xl font-bold text-lime-400 backdrop-blur-sm"
				>
					{getInitials(data.user?.name, data.user?.email)}
				</div>
				<div>
					<div
						class="mb-2 inline-flex items-center gap-2 rounded-full border border-lime-500/20 bg-lime-500/10 px-3 py-1 text-xs font-semibold text-lime-400"
					>
						<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-400"></span>
						{data.role === 'admin' ? 'Administrator' : 'Team Member'}
					</div>
					<h1 class="text-2xl font-bold md:text-3xl">
						{greeting}, {data.user?.name || 'User'}
					</h1>
					<p class="mt-0.5 text-sm text-slate-300">{today}</p>
				</div>
			</div>
			<a
				href="/dashboard/chat"
				class="w-fit rounded-xl bg-lime-500 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-lime-500/25 transition hover:bg-lime-400"
			>
				Open AI Chat
			</a>
		</div>
	</div>

	<!-- Profile Overview Cards -->
	<div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
		<!-- Name -->
		<div
			class="group rounded-2xl border border-t-4 border-slate-200 border-t-lime-500 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-lime-500/5"
		>
			<div
				class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/20"
			>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5 text-white">
					<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
				</svg>
			</div>
			<p class="mb-0.5 text-sm font-bold tracking-wide text-slate-700 uppercase">Full Name</p>
			<p class="text-lg font-semibold text-slate-900">{data.user?.name || 'Not set'}</p>
		</div>

		<!-- Email -->
		<div
			class="group rounded-2xl border border-t-4 border-slate-200 border-t-lime-500 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-lime-500/5"
		>
			<div
				class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-400 shadow-lg shadow-violet-500/20"
			>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5 text-white">
					<path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
				</svg>
			</div>
			<p class="mb-0.5 text-sm font-bold tracking-wide text-slate-700 uppercase">Email</p>
			<p class="truncate text-lg font-semibold text-slate-900">{data.user?.email}</p>
		</div>

		<!-- Role -->
		<div
			class="group rounded-2xl border border-t-4 border-slate-200 border-t-lime-500 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-lime-500/5"
		>
			<div
				class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-400 shadow-lg shadow-amber-500/20"
			>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5 text-white">
					<path stroke-linecap="round" stroke-linejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
				</svg>
			</div>
			<p class="mb-0.5 text-sm font-bold tracking-wide text-slate-700 uppercase">Role</p>
			<p class="text-lg font-semibold capitalize text-slate-900">{data.role}</p>
		</div>

		<!-- Verification Status -->
		<div
			class="group rounded-2xl border border-t-4 border-slate-200 border-t-lime-500 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-lime-500/5"
		>
			<div
				class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg {data
					.user?.emailVerified
					? 'from-emerald-500 to-teal-400 shadow-emerald-500/20'
					: 'from-yellow-500 to-amber-400 shadow-yellow-500/20'}"
			>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5 text-white">
					<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
				</svg>
			</div>
			<p class="mb-0.5 text-sm font-bold tracking-wide text-slate-700 uppercase">Account Status</p>
			{#if data.user?.emailVerified}
				<p class="text-lg font-semibold text-emerald-600">Verified</p>
			{:else}
				<p class="text-lg font-semibold text-yellow-600">Pending</p>
			{/if}
		</div>
	</div>

	<!-- Platform Tools (matches landing page services grid style) -->
	<div class="mb-8">
		<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
			<span class="h-5 w-1 rounded-full bg-lime-500"></span>
			Platform Tools
		</h2>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<!-- AI Chat -->
			<a
				href="/dashboard/chat"
				class="group rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-lime-200 hover:shadow-xl hover:shadow-lime-500/5"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-lime-500 to-emerald-500 shadow-lg shadow-lime-500/20"
				>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" class="h-6 w-6">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
					</svg>
				</div>
				<h3 class="mb-1 text-base font-semibold text-slate-900">AI Assistant</h3>
				<p class="text-sm leading-relaxed text-slate-700">Chat with context-aware AI powered by RAG. Upload documents and get intelligent answers with citations.</p>
			</a>

			<!-- Edit Profile -->
			<a
				href="/dashboard/profile"
				class="group rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-lime-200 hover:shadow-xl hover:shadow-lime-500/5"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/20"
				>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" class="h-6 w-6">
						<path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
					</svg>
				</div>
				<h3 class="mb-1 text-base font-semibold text-slate-900">Edit Profile</h3>
				<p class="text-sm leading-relaxed text-slate-700">Update your personal information, change your password, and manage your account details.</p>
			</a>

			<!-- Admin Panel (conditional) -->
			{#if data.role === 'admin'}
				<a
					href="/dashboard/admin"
					class="group rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-lime-200 hover:shadow-xl hover:shadow-lime-500/5"
				>
					<div
						class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-400 shadow-lg shadow-violet-500/20"
					>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" class="h-6 w-6">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
							<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
						</svg>
					</div>
					<h3 class="mb-1 text-base font-semibold text-slate-900">Admin Panel</h3>
					<p class="text-sm leading-relaxed text-slate-700">Manage users, assign roles, view analytics, and monitor platform activity.</p>
				</a>
			{/if}
		</div>
	</div>

	<!-- Account Security -->
	<div class="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
		<div class="bg-slate-900 px-6 py-4">
			<h2 class="text-lg font-semibold text-white">Account Security</h2>
		</div>
		<div class="p-6 md:p-8">
			<div class="divide-y divide-slate-100">
				<div class="flex items-center justify-between py-4 first:pt-0 last:pb-0">
					<div class="flex items-center gap-3">
						<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-lime-50">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4.5 w-4.5 text-lime-600">
								<path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
							</svg>
						</div>
						<div>
							<p class="text-sm font-medium text-slate-900">Email Verification</p>
							<p class="text-sm text-slate-700">Verify your email to unlock full access</p>
						</div>
					</div>
					{#if data.user?.emailVerified}
						<span class="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
							<span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
							Verified
						</span>
					{:else}
						<span class="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
							<span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
							Pending
						</span>
					{/if}
				</div>

				<div class="flex items-center justify-between py-4">
					<div class="flex items-center gap-3">
						<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-lime-50">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4.5 w-4.5 text-lime-600">
								<path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
							</svg>
						</div>
						<div>
							<p class="text-sm font-medium text-slate-900">Password</p>
							<p class="text-sm text-slate-700">Secure your account with a strong password</p>
						</div>
					</div>
					<span class="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
						<span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
						Set
					</span>
				</div>

				<div class="flex items-center justify-between py-4 last:pb-0">
					<div class="flex items-center gap-3">
						<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-lime-50">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4.5 w-4.5 text-lime-600">
								<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
							</svg>
						</div>
						<div>
							<p class="text-sm font-medium text-slate-900">Two-Factor Authentication</p>
							<p class="text-sm text-slate-700">Add an extra layer of security</p>
						</div>
					</div>
					<span class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
						Coming Soon
					</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Company Stats (synced from landing page) -->
	<div class="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
		<div class="bg-slate-900 px-6 py-4">
			<h2 class="flex items-center gap-2 text-lg font-semibold text-white">
				<span class="text-lime-400">Auth</span>Flow Platform
			</h2>
		</div>
		<div class="grid grid-cols-2 gap-px bg-slate-100 sm:grid-cols-4">
			<div class="flex flex-col items-center bg-white p-5">
				<p class="text-2xl font-bold text-slate-900">200+</p>
				<p class="text-sm font-semibold text-slate-700">Projects Delivered</p>
			</div>
			<div class="flex flex-col items-center bg-white p-5">
				<p class="text-2xl font-bold text-slate-900">50+</p>
				<p class="text-sm font-semibold text-slate-700">Team Members</p>
			</div>
			<div class="flex flex-col items-center bg-white p-5">
				<p class="text-2xl font-bold text-slate-900">99.9%</p>
				<p class="text-sm font-semibold text-slate-700">Uptime Guarantee</p>
			</div>
			<div class="flex flex-col items-center bg-white p-5">
				<p class="text-2xl font-bold text-slate-900">24/7</p>
				<p class="text-sm font-semibold text-slate-700">Support Available</p>
			</div>
		</div>
	</div>

	<!-- Footer -->
	<div class="overflow-hidden rounded-2xl bg-slate-900 px-6 py-4">
		<div class="flex flex-col items-center justify-between gap-3 text-sm sm:flex-row">
			<p class="text-slate-300">
				<span class="text-white">Auth</span><span class="text-lime-400">Flow</span> &mdash; Enterprise-grade Technology Solutions
			</p>
			<p class="text-slate-300">
				Logged in as <span class="font-medium text-lime-400">{data.user?.email}</span>
			</p>
		</div>
	</div>
</div>
