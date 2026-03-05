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
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900">Edit Profile</h1>
		<p class="mt-2 text-gray-500">Update your personal information.</p>
	</div>

	<div class="max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
		<!-- Avatar and user info header -->
		<div class="mb-6 flex items-center gap-4 border-b border-gray-100 pb-6">
			<div
				class="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-black text-xl font-bold text-white"
			>
				{getInitials(data.user?.name, data.user?.email)}
			</div>
			<div class="min-w-0">
				<p class="truncate font-semibold text-gray-900">{data.user?.name || 'User'}</p>
				<p class="truncate text-sm text-gray-500">{data.user?.email}</p>
			</div>
		</div>

		{#if form?.success}
			<div
				class="mb-6 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700"
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

		<form method="POST" class="flex flex-col gap-5" use:enhance>
			<div>
				<label for="name" class="mb-1.5 block text-sm font-medium text-gray-700">Full Name</label>
				<input
					id="name"
					name="name"
					type="text"
					required
					value={data.user?.name || ''}
					class="w-full rounded-xl border border-gray-300 p-2.5 transition focus:border-transparent focus:ring-2 focus:ring-black focus:outline-none"
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
					value={data.user?.email || ''}
					class="w-full rounded-xl border border-gray-300 p-2.5 transition focus:border-transparent focus:ring-2 focus:ring-black focus:outline-none"
				/>
			</div>

			<button
				type="submit"
				class="flex items-center justify-center gap-2 rounded-xl bg-black py-3 font-medium text-white transition-all duration-200 hover:bg-gray-800"
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
</div>
