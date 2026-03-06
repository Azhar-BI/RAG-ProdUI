<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	function formatDate(iso: string | null): string {
		if (!iso) return '\u2014';
		return new Date(iso).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Admin Panel &mdash; AuthFlow</title>
</svelte:head>

<div class="space-y-8">
	<!-- Header -->
	<div class="rounded-2xl bg-slate-900 p-6 text-white">
		<h1 class="text-3xl font-bold tracking-tight">Admin Panel</h1>
		<p class="mt-2 text-slate-400">Manage users and monitor application statistics.</p>
	</div>

	<!-- Error/Success messages -->
	{#if form?.error}
		<div class="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
			{form.error}
		</div>
	{/if}
	{#if form?.success}
		<div class="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
			Action completed successfully.
		</div>
	{/if}

	<!-- Stats Cards -->
	<div class="grid grid-cols-2 gap-5 lg:grid-cols-4">
		<!-- Total Users -->
		<div class="rounded-2xl border border-slate-200 border-t-4 border-t-lime-500 bg-white p-6 shadow-sm">
			<div class="mb-3 flex items-center gap-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
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
							d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
						/>
					</svg>
				</div>
			</div>
			<p class="text-3xl font-bold text-slate-900">{data.stats.totalUsers}</p>
			<p class="mt-1 text-sm text-slate-500">Total Users</p>
		</div>

		<!-- Verified -->
		<div class="rounded-2xl border border-slate-200 border-t-4 border-t-emerald-500 bg-white p-6 shadow-sm">
			<div class="mb-3 flex items-center gap-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="h-5 w-5 text-emerald-600"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
						/>
					</svg>
				</div>
			</div>
			<p class="text-3xl font-bold text-slate-900">{data.stats.verifiedCount}</p>
			<p class="mt-1 text-sm text-slate-500">Verified Users</p>
		</div>

		<!-- Admins -->
		<div class="rounded-2xl border border-slate-200 border-t-4 border-t-slate-500 bg-white p-6 shadow-sm">
			<div class="mb-3 flex items-center gap-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800">
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
							d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
						/>
					</svg>
				</div>
			</div>
			<p class="text-3xl font-bold text-slate-900">{data.stats.adminCount}</p>
			<p class="mt-1 text-sm text-slate-500">Admins</p>
		</div>

		<!-- Last 7 Days -->
		<div class="rounded-2xl border border-slate-200 border-t-4 border-t-lime-400 bg-white p-6 shadow-sm">
			<div class="mb-3 flex items-center gap-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-700">
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
							d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
						/>
					</svg>
				</div>
			</div>
			<p class="text-3xl font-bold text-slate-900">{data.stats.recentSignups}</p>
			<p class="mt-1 text-sm text-slate-500">Last 7 Days</p>
		</div>
	</div>

	<!-- Users Table -->
	<div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
		<div class="bg-slate-900 px-6 py-5">
			<h2 class="text-lg font-semibold text-white">All Users</h2>
		</div>

		<!-- Desktop table -->
		<div class="hidden overflow-x-auto md:block">
			<table class="w-full text-sm">
				<thead class="bg-slate-900 text-left text-white">
					<tr>
						<th class="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide">Name</th>
						<th class="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide">Email</th>
						<th class="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide">Role</th>
						<th class="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide">Verified</th>
						<th class="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide">Status</th>
						<th class="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide">Joined</th>
						<th class="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wide">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each data.allUsers as user}
						<tr class="transition hover:bg-slate-50 {user.disabled === 'true' ? 'opacity-50' : ''}">
							<td class="px-6 py-4 font-medium text-slate-900">{user.name || '\u2014'}</td>
							<td class="px-6 py-4 text-slate-600">{user.email}</td>
							<td class="px-6 py-4">
								<span
									class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold {user.role ===
									'admin'
										? 'bg-lime-100 text-lime-700'
										: 'bg-slate-100 text-slate-700'}"
								>
									{user.role}
								</span>
							</td>
							<td class="px-6 py-4">
								{#if user.emailVerified}
									<span class="inline-flex items-center gap-1.5 text-emerald-600">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke-width="2"
											stroke="currentColor"
											class="h-4 w-4"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="m4.5 12.75 6 6 9-13.5"
											/>
										</svg>
										Yes
									</span>
								{:else}
									<span class="text-slate-400">No</span>
								{/if}
							</td>
							<td class="px-6 py-4">
								<span
									class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold {user.disabled ===
									'true'
										? 'bg-red-100 text-red-700'
										: 'bg-emerald-100 text-emerald-700'}"
								>
									{user.disabled === 'true' ? 'Disabled' : 'Active'}
								</span>
							</td>
							<td class="px-6 py-4 text-slate-500">{formatDate(user.createdAt)}</td>
							<td class="px-6 py-4 text-right">
								<div class="flex items-center justify-end gap-2">
									<!-- Toggle Role -->
									<form method="POST" action="?/changeRole" use:enhance>
										<input type="hidden" name="userId" value={user.id} />
										<input
											type="hidden"
											name="role"
											value={user.role === 'admin' ? 'user' : 'admin'}
										/>
										<button
											type="submit"
											class="rounded-lg border px-3 py-1.5 text-xs font-medium transition {user.role ===
											'admin'
												? 'border-lime-200 text-lime-700 hover:bg-lime-50'
												: 'border-slate-200 text-slate-700 hover:bg-slate-50'}"
											title={user.role === 'admin' ? 'Demote to user' : 'Promote to admin'}
										>
											{user.role === 'admin' ? 'Demote' : 'Promote'}
										</button>
									</form>

									<!-- Toggle Disabled -->
									<form method="POST" action="?/toggleDisabled" use:enhance>
										<input type="hidden" name="userId" value={user.id} />
										<input type="hidden" name="disabled" value={user.disabled} />
										<button
											type="submit"
											class="rounded-lg border px-3 py-1.5 text-xs font-medium transition {user.disabled ===
											'true'
												? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
												: 'border-red-200 text-red-700 hover:bg-red-50'}"
											title={user.disabled === 'true' ? 'Enable account' : 'Disable account'}
										>
											{user.disabled === 'true' ? 'Enable' : 'Disable'}
										</button>
									</form>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Mobile cards -->
		<div class="divide-y divide-slate-100 md:hidden">
			{#each data.allUsers as user}
				<div class="space-y-3 p-5 {user.disabled === 'true' ? 'opacity-50' : ''}">
					<div class="flex items-center justify-between">
						<div>
							<p class="font-medium text-slate-900">{user.name || '\u2014'}</p>
							<p class="mt-0.5 text-sm text-slate-500">{user.email}</p>
						</div>
						<span
							class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold {user.role ===
							'admin'
								? 'bg-lime-100 text-lime-700'
								: 'bg-slate-100 text-slate-700'}"
						>
							{user.role}
						</span>
					</div>
					<div class="flex items-center gap-4 text-xs text-slate-500">
						<span class="flex items-center gap-1">
							{#if user.emailVerified}
								<span class="font-medium text-emerald-600">Verified</span>
							{:else}
								<span class="text-slate-400">Unverified</span>
							{/if}
						</span>
						<span
							class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold {user.disabled ===
							'true'
								? 'bg-red-100 text-red-700'
								: 'bg-emerald-100 text-emerald-700'}"
						>
							{user.disabled === 'true' ? 'Disabled' : 'Active'}
						</span>
						<span>Joined {formatDate(user.createdAt)}</span>
					</div>
					<div class="flex gap-2">
						<form method="POST" action="?/changeRole" use:enhance>
							<input type="hidden" name="userId" value={user.id} />
							<input type="hidden" name="role" value={user.role === 'admin' ? 'user' : 'admin'} />
							<button
								type="submit"
								class="rounded-lg border px-3 py-1.5 text-xs font-medium transition {user.role ===
								'admin'
									? 'border-lime-200 text-lime-700 hover:bg-lime-50'
									: 'border-slate-200 text-slate-700 hover:bg-slate-50'}"
							>
								{user.role === 'admin' ? 'Demote' : 'Promote'}
							</button>
						</form>
						<form method="POST" action="?/toggleDisabled" use:enhance>
							<input type="hidden" name="userId" value={user.id} />
							<input type="hidden" name="disabled" value={user.disabled} />
							<button
								type="submit"
								class="rounded-lg border px-3 py-1.5 text-xs font-medium transition {user.disabled ===
								'true'
									? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
									: 'border-red-200 text-red-700 hover:bg-red-50'}"
							>
								{user.disabled === 'true' ? 'Enable' : 'Disable'}
							</button>
						</form>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
