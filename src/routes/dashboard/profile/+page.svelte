<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

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

<div>
	<!-- Page Header -->
	<div class="mb-8 rounded-2xl bg-slate-900 p-6 text-white">
		<div class="flex items-center gap-4">
			<div
				class="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-lime-500 text-xl font-bold text-slate-900"
			>
				{getInitials(data.user?.name, data.user?.email)}
			</div>
			<div>
				<h1 class="text-3xl font-bold">Edit Profile</h1>
				<p class="mt-1 text-sm text-slate-200">Update your personal information and password.</p>
			</div>
		</div>
	</div>

	<!-- Profile Info Card -->
	<div
		class="mb-6 max-w-xl rounded-2xl border border-t-4 border-slate-200 border-t-lime-500 bg-white p-6 shadow-sm md:p-8"
	>
		<!-- Avatar and user info header -->
		<div class="mb-6 flex items-center gap-4 border-b border-slate-100 pb-6">
			<div
				class="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-lime-500 text-xl font-bold text-slate-900"
			>
				{getInitials(data.user?.name, data.user?.email)}
			</div>
			<div class="min-w-0">
				<p class="truncate font-semibold text-slate-900">{data.user?.name || 'User'}</p>
				<p class="truncate text-sm text-slate-700">{data.user?.email}</p>
			</div>
		</div>

		{#if form?.success}
			<div
				class="mb-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="h-5 w-5 flex-shrink-0"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
					/>
				</svg>
				Profile updated successfully!
			</div>
		{/if}

		{#if form?.error}
			<div
				class="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="h-5 w-5 flex-shrink-0"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
					/>
				</svg>
				{form.error}
			</div>
		{/if}

		<form method="POST" action="?/profile" class="flex flex-col gap-5" use:enhance>
			<div>
				<label for="name" class="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
				<input
					id="name"
					name="name"
					type="text"
					required
					value={data.user?.name || ''}
					class="w-full rounded-xl border border-slate-200 p-2.5 transition focus:border-transparent focus:ring-2 focus:ring-lime-500 focus:outline-none"
				/>
			</div>

			<div>
				<label for="email" class="mb-1.5 block text-sm font-medium text-slate-700"
					>Email Address</label
				>
				<input
					id="email"
					name="email"
					type="email"
					required
					value={data.user?.email || ''}
					class="w-full rounded-xl border border-slate-200 p-2.5 transition focus:border-transparent focus:ring-2 focus:ring-lime-500 focus:outline-none"
				/>
			</div>

			<button
				type="submit"
				class="flex items-center justify-center gap-2 rounded-xl bg-lime-500 py-3 font-medium text-slate-900 shadow-lg shadow-lime-500/25 transition-all duration-200 hover:bg-lime-400 hover:shadow-lime-500/40"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="h-4 w-4"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
				</svg>
				Save Changes
			</button>
		</form>
	</div>

	<!-- Change Password Card -->
	<div
		class="max-w-xl rounded-2xl border border-t-4 border-slate-200 border-t-lime-500 bg-white p-6 shadow-sm md:p-8"
	>
		<div class="mb-6 border-b border-slate-100 pb-4">
			<h2 class="flex items-center gap-2 text-xl font-semibold text-slate-900">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="h-5 w-5 text-lime-600"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
					/>
				</svg>
				Change Password
			</h2>
			<p class="mt-1 text-sm text-slate-700">
				Keep your account secure by updating your password regularly.
			</p>
		</div>

		{#if form?.passwordSuccess}
			<div
				class="mb-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="h-5 w-5 flex-shrink-0"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
					/>
				</svg>
				Password changed successfully!
			</div>
		{/if}

		{#if form?.passwordError}
			<div
				class="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="h-5 w-5 flex-shrink-0"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
					/>
				</svg>
				{form.passwordError}
			</div>
		{/if}

		<form method="POST" action="?/password" class="flex flex-col gap-5" use:enhance>
			<div>
				<label for="currentPassword" class="mb-1.5 block text-sm font-medium text-slate-700"
					>Current Password</label
				>
				<input
					id="currentPassword"
					name="currentPassword"
					type="password"
					required
					placeholder="Enter your current password"
					class="w-full rounded-xl border border-slate-200 p-2.5 transition focus:border-transparent focus:ring-2 focus:ring-lime-500 focus:outline-none"
				/>
			</div>

			<div>
				<label for="newPassword" class="mb-1.5 block text-sm font-medium text-slate-700"
					>New Password</label
				>
				<input
					id="newPassword"
					name="newPassword"
					type="password"
					required
					minlength={6}
					placeholder="At least 6 characters"
					class="w-full rounded-xl border border-slate-200 p-2.5 transition focus:border-transparent focus:ring-2 focus:ring-lime-500 focus:outline-none"
				/>
			</div>

			<div>
				<label for="confirmPassword" class="mb-1.5 block text-sm font-medium text-slate-700"
					>Confirm New Password</label
				>
				<input
					id="confirmPassword"
					name="confirmPassword"
					type="password"
					required
					minlength={6}
					placeholder="Re-enter your new password"
					class="w-full rounded-xl border border-slate-200 p-2.5 transition focus:border-transparent focus:ring-2 focus:ring-lime-500 focus:outline-none"
				/>
			</div>

			<button
				type="submit"
				class="flex items-center justify-center gap-2 rounded-xl bg-lime-500 py-3 font-medium text-slate-900 shadow-lg shadow-lime-500/25 transition-all duration-200 hover:bg-lime-400 hover:shadow-lime-500/40"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="h-4 w-4"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
					/>
				</svg>
				Update Password
			</button>
		</form>
	</div>
</div>
