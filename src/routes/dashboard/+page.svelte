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
</script>

<div>
	<!-- Welcome Banner -->
	<div
		class="relative mb-8 overflow-hidden rounded-2xl border-l-4 border-lime-500 bg-slate-900 p-6 text-white md:p-8"
	>
		<!-- Decorative elements -->
		<div
			class="absolute top-0 right-0 h-40 w-40 translate-x-1/4 -translate-y-1/2 rounded-full bg-lime-500/10"
		></div>
		<div class="absolute right-20 bottom-0 h-24 w-24 translate-y-1/2 rounded-full bg-lime-500/5"></div>

		<div class="relative z-10 flex items-center gap-5">
			<div
				class="hidden h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-lime-500/30 bg-lime-500/15 text-xl font-bold text-lime-400 backdrop-blur-sm sm:flex"
			>
				{getInitials(data.user?.name, data.user?.email)}
			</div>
			<div>
				<h1 class="text-2xl font-bold md:text-3xl">
					Welcome, {data.user?.name || 'User'}!
				</h1>
				<p class="mt-1 text-sm text-slate-400 md:text-base">{today}</p>
			</div>
		</div>
	</div>

	<!-- Stats Cards -->
	<div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
		<!-- Name Card -->
		<div
			class="group rounded-2xl border border-slate-200 border-t-4 border-t-lime-500 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-lime-500/5"
		>
			<div
				class="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="h-5 w-5 text-white"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
					/>
				</svg>
			</div>
			<p class="mb-1 text-xs font-semibold tracking-wide text-slate-500 uppercase">Full Name</p>
			<p class="text-lg font-semibold text-slate-900">{data.user?.name || 'Not set'}</p>
		</div>

		<!-- Email Card -->
		<div
			class="group rounded-2xl border border-slate-200 border-t-4 border-t-lime-500 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-lime-500/5"
		>
			<div
				class="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="h-5 w-5 text-white"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
					/>
				</svg>
			</div>
			<p class="mb-1 text-xs font-semibold tracking-wide text-slate-500 uppercase">Email</p>
			<p class="text-lg font-semibold break-all text-slate-900">{data.user?.email}</p>
		</div>

		<!-- Verification Status Card -->
		<div
			class="group rounded-2xl border border-slate-200 border-t-4 border-t-lime-500 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-lime-500/5"
		>
			<div
				class="mb-4 flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-300 {data
					.user?.emailVerified
					? 'bg-green-100 group-hover:bg-green-600'
					: 'bg-yellow-100 group-hover:bg-yellow-500'}"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="h-5 w-5 transition-colors duration-300 {data.user?.emailVerified
						? 'text-green-600 group-hover:text-white'
						: 'text-yellow-600 group-hover:text-white'}"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
					/>
				</svg>
			</div>
			<p class="mb-1 text-xs font-semibold tracking-wide text-slate-500 uppercase">Email Status</p>
			{#if data.user?.emailVerified}
				<p class="text-lg font-semibold text-green-600">Verified</p>
			{:else}
				<p class="text-lg font-semibold text-yellow-600">Not Verified</p>
			{/if}
		</div>
	</div>

	<!-- Quick Actions -->
	<div class="mb-8">
		<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
			<span class="h-5 w-1 rounded-full bg-lime-500"></span>
			Quick Actions
		</h2>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<a
				href="/dashboard/profile"
				class="group flex items-center gap-4 rounded-2xl border border-l-4 border-slate-200 border-l-transparent bg-white p-5 shadow-sm transition-all duration-300 hover:border-l-lime-500 hover:shadow-lg hover:shadow-lime-500/5"
			>
				<div
					class="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-50 transition-all duration-300 group-hover:bg-slate-900"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="h-5 w-5 text-lime-600 transition-colors duration-300 group-hover:text-white"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
						/>
					</svg>
				</div>
				<div>
					<p class="font-medium text-slate-900">Edit Profile</p>
					<p class="text-sm text-slate-500">Update your name and details</p>
				</div>
			</a>

			<a
				href="/dashboard/profile"
				class="group flex items-center gap-4 rounded-2xl border border-l-4 border-slate-200 border-l-transparent bg-white p-5 shadow-sm transition-all duration-300 hover:border-l-lime-500 hover:shadow-lg hover:shadow-lime-500/5"
			>
				<div
					class="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-50 transition-all duration-300 group-hover:bg-slate-900"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="h-5 w-5 text-lime-600 transition-colors duration-300 group-hover:text-white"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
						/>
					</svg>
				</div>
				<div>
					<p class="font-medium text-slate-900">Change Password</p>
					<p class="text-sm text-slate-500">Keep your account secure</p>
				</div>
			</a>

			<form method="POST" action="/logout" class="contents">
				<button
					type="submit"
					class="group flex w-full items-center gap-4 rounded-2xl border border-l-4 border-slate-200 border-l-transparent bg-white p-5 text-left shadow-sm transition-all duration-300 hover:border-l-red-500 hover:shadow-lg hover:shadow-red-500/5"
				>
					<div
						class="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 transition-all duration-300 group-hover:bg-red-500"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="h-5 w-5 text-red-600 transition-colors duration-300 group-hover:text-white"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
							/>
						</svg>
					</div>
					<div>
						<p class="font-medium text-slate-900">Sign Out</p>
						<p class="text-sm text-slate-500">End your current session</p>
					</div>
				</button>
			</form>
		</div>
	</div>

	<!-- Account Security Section -->
	<div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
		<div class="bg-slate-900 px-6 py-4">
			<h2 class="text-lg font-semibold text-white">Account Security</h2>
		</div>
		<div class="p-6 md:p-8">
			<div class="divide-y divide-slate-100">
				<div class="flex items-center justify-between py-4 first:pt-0 last:pb-0">
					<div class="flex items-center gap-3">
						<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-lime-50">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="h-4.5 w-4.5 text-lime-600"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
								/>
							</svg>
						</div>
						<div>
							<p class="text-sm font-medium text-slate-900">Email Verification</p>
							<p class="text-xs text-slate-500">Verify your email to unlock full access</p>
						</div>
					</div>
					{#if data.user?.emailVerified}
						<span
							class="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700"
						>
							<span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
							Verified
						</span>
					{:else}
						<span
							class="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700"
						>
							<span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
							Pending
						</span>
					{/if}
				</div>

				<div class="flex items-center justify-between py-4">
					<div class="flex items-center gap-3">
						<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-lime-50">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="h-4.5 w-4.5 text-lime-600"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
								/>
							</svg>
						</div>
						<div>
							<p class="text-sm font-medium text-slate-900">Password</p>
							<p class="text-xs text-slate-500">Secure your account with a strong password</p>
						</div>
					</div>
					<span
						class="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700"
					>
						<span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
						Set
					</span>
				</div>

				<div class="flex items-center justify-between py-4 last:pb-0">
					<div class="flex items-center gap-3">
						<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-lime-50">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="h-4.5 w-4.5 text-lime-600"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
								/>
							</svg>
						</div>
						<div>
							<p class="text-sm font-medium text-slate-900">Two-Factor Authentication</p>
							<p class="text-xs text-slate-500">Add an extra layer of security</p>
						</div>
					</div>
					<span
						class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600"
					>
						Coming Soon
					</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Footer -->
	<div
		class="mt-8 overflow-hidden rounded-2xl bg-slate-900 px-6 py-4"
	>
		<div class="flex flex-col items-center justify-between gap-3 text-xs sm:flex-row">
			<p class="text-slate-400">AuthFlow &mdash; Secure Authentication Platform</p>
			<p class="text-slate-400">Logged in as <span class="font-medium text-lime-400">{data.user?.email}</span></p>
		</div>
	</div>
</div>
