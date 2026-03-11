<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Toast from '$lib/components/admin/Toast.svelte';
	import ConfirmModal from '$lib/components/admin/ConfirmModal.svelte';
	import MiniBarChart from '$lib/components/admin/MiniBarChart.svelte';
	import DonutChart from '$lib/components/admin/DonutChart.svelte';

	let { data, form } = $props();

	// Tab state
	let activeTab: 'overview' | 'users' | 'activity' = $state('overview');

	// Toast
	let toastVisible = $state(false);
	let toastMessage = $state('');
	let toastType: 'success' | 'error' = $state('success');

	$effect(() => {
		if (form?.success) {
			toastMessage = 'Action completed successfully.';
			toastType = 'success';
			toastVisible = true;
		} else if (form?.error) {
			toastMessage = form.error as string;
			toastType = 'error';
			toastVisible = true;
		}
	});

	// Confirm modal state
	let confirmOpen = $state(false);
	let confirmTitle = $state('');
	let confirmMessage = $state('');
	let confirmLabel = $state('Confirm');
	let confirmVariant: 'danger' | 'warning' | 'info' = $state('danger');
	let pendingForm: HTMLFormElement | null = $state(null);

	function requestConfirm(
		formEl: HTMLFormElement,
		title: string,
		message: string,
		label: string,
		variant: 'danger' | 'warning' | 'info'
	) {
		pendingForm = formEl;
		confirmTitle = title;
		confirmMessage = message;
		confirmLabel = label;
		confirmVariant = variant;
		confirmOpen = true;
	}

	function handleConfirmed() {
		if (pendingForm) {
			pendingForm.requestSubmit();
			pendingForm = null;
		}
	}

	// Search & filters
	let searchInput = $state('');

	$effect(() => {
		searchInput = data.filters.search;
	});

	function updateFilters(params: Record<string, string>) {
		const url = new URL($page.url);
		for (const [key, val] of Object.entries(params)) {
			if (val && val !== 'all' && val !== '') {
				url.searchParams.set(key, val);
			} else {
				url.searchParams.delete(key);
			}
		}
		url.searchParams.delete('page');
		goto(url.toString(), { keepFocus: true, noScroll: true });
	}

	function goToPage(p: number) {
		const url = new URL($page.url);
		if (p > 1) {
			url.searchParams.set('page', String(p));
		} else {
			url.searchParams.delete('page');
		}
		goto(url.toString(), { noScroll: true });
	}

	function formatDate(iso: string | null): string {
		if (!iso) return '—';
		return new Date(iso).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function relativeTime(iso: string | null): string {
		if (!iso) return 'Never';
		const diff = Date.now() - new Date(iso).getTime();
		const mins = Math.floor(diff / 60000);
		if (mins < 1) return 'Just now';
		if (mins < 60) return `${mins}m ago`;
		const hours = Math.floor(mins / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		if (days < 30) return `${days}d ago`;
		return formatDate(iso);
	}

	function getInitials(name: string | null): string {
		if (!name) return '?';
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}

	function actionLabel(action: string): string {
		const labels: Record<string, string> = {
			login: 'Logged in',
			promote_to_admin: 'Promoted user to admin',
			demote_to_user: 'Demoted admin to user',
			disable_account: 'Disabled account',
			enable_account: 'Enabled account'
		};
		return labels[action] || action;
	}

	function actionColor(action: string): string {
		if (action === 'login') return 'bg-blue-100 text-blue-700';
		if (action.includes('promote')) return 'bg-lime-100 text-lime-700';
		if (action.includes('demote')) return 'bg-amber-100 text-amber-700';
		if (action.includes('disable')) return 'bg-red-100 text-red-700';
		if (action.includes('enable')) return 'bg-emerald-100 text-emerald-700';
		return 'bg-slate-100 text-slate-700';
	}

	// CSV export
	function exportCSV() {
		const headers = ['Name', 'Email', 'Role', 'Verified', 'Status', 'Last Login', 'Joined'];
		const rows = data.users.map((u: any) => [
			u.name || '',
			u.email,
			u.role,
			u.emailVerified ? 'Yes' : 'No',
			u.disabled === 'true' ? 'Disabled' : 'Active',
			u.lastLoginAt || 'Never',
			u.createdAt || ''
		]);
		const csv = [headers, ...rows].map((r) => r.map((c: string) => `"${c}"`).join(',')).join('\n');
		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `users-export-${new Date().toISOString().slice(0, 10)}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<svelte:head>
	<title>Admin Panel — AuthFlow</title>
</svelte:head>

<Toast bind:visible={toastVisible} message={toastMessage} type={toastType} />
<ConfirmModal
	bind:open={confirmOpen}
	title={confirmTitle}
	message={confirmMessage}
	{confirmLabel}
	variant={confirmVariant}
	onconfirm={handleConfirmed}
/>

<div class="space-y-6">
	<!-- Header -->
	<div
		class="flex flex-col gap-4 rounded-2xl bg-slate-900 p-6 text-white sm:flex-row sm:items-center sm:justify-between"
	>
		<div>
			<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Admin Panel</h1>
			<p class="mt-1 text-sm text-slate-400">Manage users, view analytics, and monitor activity.</p>
		</div>
		<div class="flex items-center gap-2">
			<span class="rounded-full bg-lime-500/20 px-3 py-1 text-xs font-semibold text-lime-400">
				{data.stats.totalUsers} users
			</span>
			<span class="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-400">
				{data.stats.activeToday} active today
			</span>
		</div>
	</div>

	<!-- Tab navigation -->
	<div class="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
		<button
			onclick={() => (activeTab = 'overview')}
			class="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition {activeTab === 'overview'
				? 'bg-slate-900 text-white shadow-sm'
				: 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}"
		>
			Overview
		</button>
		<button
			onclick={() => (activeTab = 'users')}
			class="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition {activeTab === 'users'
				? 'bg-slate-900 text-white shadow-sm'
				: 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}"
		>
			Users
		</button>
		<button
			onclick={() => (activeTab = 'activity')}
			class="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition {activeTab === 'activity'
				? 'bg-slate-900 text-white shadow-sm'
				: 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}"
		>
			Activity Log
		</button>
	</div>

	<!-- ═══════════════ OVERVIEW TAB ═══════════════ -->
	{#if activeTab === 'overview'}
		<!-- Stats Grid -->
		<div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
			<!-- Total Users -->
			<div
				class="rounded-2xl border border-t-4 border-slate-200 border-t-lime-500 bg-white p-5 shadow-sm"
			>
				<div class="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="h-4.5 w-4.5 text-white"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
						/>
					</svg>
				</div>
				<p class="text-2xl font-bold text-slate-900">{data.stats.totalUsers}</p>
				<p class="mt-0.5 text-xs text-slate-500">Total Users</p>
			</div>

			<!-- Verified -->
			<div
				class="rounded-2xl border border-t-4 border-slate-200 border-t-emerald-500 bg-white p-5 shadow-sm"
			>
				<div class="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="h-4.5 w-4.5 text-emerald-600"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
						/>
					</svg>
				</div>
				<p class="text-2xl font-bold text-slate-900">{data.stats.verifiedCount}</p>
				<p class="mt-0.5 text-xs text-slate-500">Verified Users</p>
			</div>

			<!-- Active Today -->
			<div
				class="rounded-2xl border border-t-4 border-slate-200 border-t-blue-500 bg-white p-5 shadow-sm"
			>
				<div class="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="h-4.5 w-4.5 text-blue-600"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
						/>
					</svg>
				</div>
				<p class="text-2xl font-bold text-slate-900">{data.stats.activeToday}</p>
				<p class="mt-0.5 text-xs text-slate-500">Active Today</p>
			</div>

			<!-- 7-Day Signups -->
			<div
				class="rounded-2xl border border-t-4 border-slate-200 border-t-lime-400 bg-white p-5 shadow-sm"
			>
				<div class="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-700">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="h-4.5 w-4.5 text-white"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
						/>
					</svg>
				</div>
				<p class="text-2xl font-bold text-slate-900">{data.stats.recentSignups}</p>
				<p class="mt-0.5 text-xs text-slate-500">Last 7 Days</p>
			</div>

			<!-- Conversations -->
			<div
				class="rounded-2xl border border-t-4 border-slate-200 border-t-violet-500 bg-white p-5 shadow-sm"
			>
				<div class="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="h-4.5 w-4.5 text-violet-600"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
						/>
					</svg>
				</div>
				<p class="text-2xl font-bold text-slate-900">{data.stats.totalConversations}</p>
				<p class="mt-0.5 text-xs text-slate-500">Conversations</p>
			</div>

			<!-- Messages -->
			<div
				class="rounded-2xl border border-t-4 border-slate-200 border-t-cyan-500 bg-white p-5 shadow-sm"
			>
				<div class="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="h-4.5 w-4.5 text-cyan-600"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
						/>
					</svg>
				</div>
				<p class="text-2xl font-bold text-slate-900">{data.stats.totalMessages}</p>
				<p class="mt-0.5 text-xs text-slate-500">Messages</p>
			</div>

			<!-- Documents -->
			<div
				class="rounded-2xl border border-t-4 border-slate-200 border-t-amber-500 bg-white p-5 shadow-sm"
			>
				<div class="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="h-4.5 w-4.5 text-amber-600"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
						/>
					</svg>
				</div>
				<p class="text-2xl font-bold text-slate-900">{data.stats.totalDocuments}</p>
				<p class="mt-0.5 text-xs text-slate-500">Documents</p>
			</div>

			<!-- Admins -->
			<div
				class="rounded-2xl border border-t-4 border-slate-200 border-t-slate-500 bg-white p-5 shadow-sm"
			>
				<div class="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="h-4.5 w-4.5 text-white"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
						/>
					</svg>
				</div>
				<p class="text-2xl font-bold text-slate-900">{data.stats.adminCount}</p>
				<p class="mt-0.5 text-xs text-slate-500">Admins</p>
			</div>
		</div>

		<!-- Charts Row -->
		<div class="grid grid-cols-1 gap-5 lg:grid-cols-3">
			<!-- Signups Chart -->
			<div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
				<h3 class="mb-4 text-sm font-semibold text-slate-900">New Signups (Last 14 Days)</h3>
				<MiniBarChart data={data.charts.signupsByDay} color="#84cc16" />
			</div>

			<!-- Role Distribution -->
			<div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
				<h3 class="mb-4 text-sm font-semibold text-slate-900">Role Distribution</h3>
				<DonutChart segments={data.charts.roleDistribution} size={100} strokeWidth={14} />
			</div>
		</div>

		<div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
			<!-- Verification Status -->
			<div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
				<h3 class="mb-4 text-sm font-semibold text-slate-900">Verification Status</h3>
				<DonutChart segments={data.charts.verificationStatus} size={100} strokeWidth={14} />
			</div>

			<!-- Account Status -->
			<div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
				<h3 class="mb-4 text-sm font-semibold text-slate-900">Account Status</h3>
				<DonutChart segments={data.charts.accountStatus} size={100} strokeWidth={14} />
			</div>

			<!-- Top Users -->
			<div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
				<h3 class="mb-4 text-sm font-semibold text-slate-900">Top Users by Conversations</h3>
				{#if data.charts.topUsers.length > 0}
					<MiniBarChart data={data.charts.topUsers} color="#8b5cf6" />
				{:else}
					<p class="py-6 text-center text-sm text-slate-400">No conversations yet</p>
				{/if}
			</div>
		</div>

		<!-- ═══════════════ USERS TAB ═══════════════ -->
	{:else if activeTab === 'users'}
		<div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
			<!-- Toolbar -->
			<div class="border-b border-slate-200 bg-slate-50 p-4">
				<div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
					<!-- Search -->
					<div class="relative flex-1 lg:max-w-sm">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
							/>
						</svg>
						<input
							type="text"
							placeholder="Search by name or email..."
							class="w-full rounded-lg border border-slate-200 bg-white py-2 pr-4 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 focus:outline-none"
							bind:value={searchInput}
							onkeydown={(e) => {
								if (e.key === 'Enter') updateFilters({ search: searchInput });
							}}
						/>
					</div>

					<!-- Filters -->
					<div class="flex flex-wrap items-center gap-2">
						<select
							class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-lime-500 focus:outline-none"
							value={data.filters.role}
							onchange={(e) => updateFilters({ role: (e.target as HTMLSelectElement).value })}
						>
							<option value="all">All Roles</option>
							<option value="admin">Admins</option>
							<option value="user">Users</option>
						</select>

						<select
							class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-lime-500 focus:outline-none"
							value={data.filters.status}
							onchange={(e) => updateFilters({ status: (e.target as HTMLSelectElement).value })}
						>
							<option value="all">All Status</option>
							<option value="active">Active</option>
							<option value="disabled">Disabled</option>
							<option value="verified">Verified</option>
							<option value="unverified">Unverified</option>
						</select>

						<select
							class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-lime-500 focus:outline-none"
							value={data.filters.sort}
							onchange={(e) => updateFilters({ sort: (e.target as HTMLSelectElement).value })}
						>
							<option value="newest">Newest First</option>
							<option value="oldest">Oldest First</option>
							<option value="name">Name A-Z</option>
							<option value="last-active">Last Active</option>
						</select>

						<button
							onclick={exportCSV}
							class="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="h-3.5 w-3.5"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
								/>
							</svg>
							Export CSV
						</button>
					</div>
				</div>
				<div class="mt-2 text-xs text-slate-500">
					Showing {data.pagination.totalFiltered} user{data.pagination.totalFiltered !== 1
						? 's'
						: ''}
					{#if data.filters.search || data.filters.role !== 'all' || data.filters.status !== 'all'}
						<button
							class="ml-1 font-medium text-lime-600 hover:text-lime-700"
							onclick={() => {
								searchInput = '';
								updateFilters({ search: '', role: 'all', status: 'all', sort: 'newest' });
							}}
						>
							Clear filters
						</button>
					{/if}
				</div>
			</div>

			<!-- Desktop table -->
			<div class="hidden overflow-x-auto md:block">
				<table class="w-full text-sm">
					<thead class="bg-slate-900 text-left text-white">
						<tr>
							<th class="px-5 py-3 text-xs font-semibold tracking-wide uppercase">User</th>
							<th class="px-5 py-3 text-xs font-semibold tracking-wide uppercase">Role</th>
							<th class="px-5 py-3 text-xs font-semibold tracking-wide uppercase">Status</th>
							<th class="px-5 py-3 text-xs font-semibold tracking-wide uppercase">Last Active</th>
							<th class="px-5 py-3 text-xs font-semibold tracking-wide uppercase">Joined</th>
							<th class="px-5 py-3 text-right text-xs font-semibold tracking-wide uppercase"
								>Actions</th
							>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#each data.users as user}
							<tr
								class="transition hover:bg-slate-50 {user.disabled === 'true' ? 'opacity-50' : ''}"
							>
								<td class="px-5 py-3.5">
									<div class="flex items-center gap-3">
										<div
											class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600"
										>
											{getInitials(user.name)}
										</div>
										<div class="min-w-0">
											<p class="truncate font-medium text-slate-900">{user.name || '—'}</p>
											<p class="truncate text-xs text-slate-500">{user.email}</p>
										</div>
									</div>
								</td>
								<td class="px-5 py-3.5">
									<span
										class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold {user.role ===
										'admin'
											? 'bg-lime-100 text-lime-700'
											: 'bg-slate-100 text-slate-600'}"
									>
										{user.role}
									</span>
								</td>
								<td class="px-5 py-3.5">
									<div class="flex flex-col gap-1">
										<span
											class="inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-semibold {user.disabled ===
											'true'
												? 'bg-red-100 text-red-700'
												: 'bg-emerald-100 text-emerald-700'}"
										>
											{user.disabled === 'true' ? 'Disabled' : 'Active'}
										</span>
										{#if !user.emailVerified}
											<span class="text-[10px] text-amber-600">Unverified email</span>
										{/if}
									</div>
								</td>
								<td class="px-5 py-3.5 text-xs text-slate-500">
									{relativeTime(user.lastLoginAt)}
								</td>
								<td class="px-5 py-3.5 text-xs text-slate-500">{formatDate(user.createdAt)}</td>
								<td class="px-5 py-3.5 text-right">
									<div class="flex items-center justify-end gap-1.5">
										<!-- Toggle Role -->
										<form
											method="POST"
											action="?/changeRole"
											use:enhance={() => {
												return async ({ update }) => {
													await update();
												};
											}}
											onsubmit={(e) => {
												e.preventDefault();
												requestConfirm(
													e.currentTarget as HTMLFormElement,
													user.role === 'admin' ? 'Demote Admin' : 'Promote to Admin',
													user.role === 'admin'
														? `Remove admin privileges from ${user.name || user.email}?`
														: `Grant admin privileges to ${user.name || user.email}?`,
													user.role === 'admin' ? 'Demote' : 'Promote',
													user.role === 'admin' ? 'warning' : 'info'
												);
											}}
										>
											<input type="hidden" name="userId" value={user.id} />
											<input
												type="hidden"
												name="role"
												value={user.role === 'admin' ? 'user' : 'admin'}
											/>
											<button
												type="submit"
												class="rounded-lg border px-2.5 py-1.5 text-xs font-medium transition {user.role ===
												'admin'
													? 'border-lime-200 text-lime-700 hover:bg-lime-50'
													: 'border-slate-200 text-slate-600 hover:bg-slate-50'}"
												title={user.role === 'admin' ? 'Demote to user' : 'Promote to admin'}
											>
												{user.role === 'admin' ? 'Demote' : 'Promote'}
											</button>
										</form>

										<!-- Toggle Disabled -->
										<form
											method="POST"
											action="?/toggleDisabled"
											use:enhance={() => {
												return async ({ update }) => {
													await update();
												};
											}}
											onsubmit={(e) => {
												e.preventDefault();
												requestConfirm(
													e.currentTarget as HTMLFormElement,
													user.disabled === 'true' ? 'Enable Account' : 'Disable Account',
													user.disabled === 'true'
														? `Re-enable the account for ${user.name || user.email}?`
														: `Disable the account for ${user.name || user.email}? They will not be able to log in.`,
													user.disabled === 'true' ? 'Enable' : 'Disable',
													user.disabled === 'true' ? 'info' : 'danger'
												);
											}}
										>
											<input type="hidden" name="userId" value={user.id} />
											<input type="hidden" name="disabled" value={user.disabled} />
											<button
												type="submit"
												class="rounded-lg border px-2.5 py-1.5 text-xs font-medium transition {user.disabled ===
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
						{:else}
							<tr>
								<td colspan="6" class="py-12 text-center">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="1"
										stroke="currentColor"
										class="mx-auto h-12 w-12 text-slate-300"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
										/>
									</svg>
									<p class="mt-2 text-sm text-slate-500">No users found</p>
									<p class="text-xs text-slate-400">Try adjusting your search or filters</p>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Mobile cards -->
			<div class="divide-y divide-slate-100 md:hidden">
				{#each data.users as user}
					<div class="space-y-3 p-4 {user.disabled === 'true' ? 'opacity-50' : ''}">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								<div
									class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600"
								>
									{getInitials(user.name)}
								</div>
								<div class="min-w-0">
									<p class="font-medium text-slate-900">{user.name || '—'}</p>
									<p class="truncate text-xs text-slate-500">{user.email}</p>
								</div>
							</div>
							<span
								class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold {user.role ===
								'admin'
									? 'bg-lime-100 text-lime-700'
									: 'bg-slate-100 text-slate-600'}"
							>
								{user.role}
							</span>
						</div>
						<div class="flex flex-wrap items-center gap-2 text-xs text-slate-500">
							<span
								class="inline-flex items-center rounded-full px-2 py-0.5 font-semibold {user.disabled ===
								'true'
									? 'bg-red-100 text-red-700'
									: 'bg-emerald-100 text-emerald-700'}"
							>
								{user.disabled === 'true' ? 'Disabled' : 'Active'}
							</span>
							{#if user.emailVerified}
								<span class="text-emerald-600">Verified</span>
							{:else}
								<span class="text-amber-600">Unverified</span>
							{/if}
							<span>{relativeTime(user.lastLoginAt)}</span>
						</div>
						<div class="flex gap-2">
							<form
								method="POST"
								action="?/changeRole"
								use:enhance
								onsubmit={(e) => {
									e.preventDefault();
									requestConfirm(
										e.currentTarget as HTMLFormElement,
										user.role === 'admin' ? 'Demote Admin' : 'Promote to Admin',
										user.role === 'admin'
											? `Remove admin privileges from ${user.name || user.email}?`
											: `Grant admin privileges to ${user.name || user.email}?`,
										user.role === 'admin' ? 'Demote' : 'Promote',
										user.role === 'admin' ? 'warning' : 'info'
									);
								}}
							>
								<input type="hidden" name="userId" value={user.id} />
								<input type="hidden" name="role" value={user.role === 'admin' ? 'user' : 'admin'} />
								<button
									type="submit"
									class="rounded-lg border px-3 py-1.5 text-xs font-medium transition {user.role ===
									'admin'
										? 'border-lime-200 text-lime-700 hover:bg-lime-50'
										: 'border-slate-200 text-slate-600 hover:bg-slate-50'}"
								>
									{user.role === 'admin' ? 'Demote' : 'Promote'}
								</button>
							</form>
							<form
								method="POST"
								action="?/toggleDisabled"
								use:enhance
								onsubmit={(e) => {
									e.preventDefault();
									requestConfirm(
										e.currentTarget as HTMLFormElement,
										user.disabled === 'true' ? 'Enable Account' : 'Disable Account',
										user.disabled === 'true'
											? `Re-enable the account for ${user.name || user.email}?`
											: `Disable the account for ${user.name || user.email}?`,
										user.disabled === 'true' ? 'Enable' : 'Disable',
										user.disabled === 'true' ? 'info' : 'danger'
									);
								}}
							>
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
				{:else}
					<div class="py-12 text-center">
						<p class="text-sm text-slate-500">No users found</p>
					</div>
				{/each}
			</div>

			<!-- Pagination -->
			{#if data.pagination.totalPages > 1}
				<div
					class="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3"
				>
					<p class="text-xs text-slate-500">
						Page {data.pagination.page} of {data.pagination.totalPages}
					</p>
					<div class="flex items-center gap-1">
						<button
							onclick={() => goToPage(data.pagination.page - 1)}
							disabled={data.pagination.page <= 1}
							class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
						>
							Previous
						</button>
						{#each Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1) as p}
							{#if p === 1 || p === data.pagination.totalPages || Math.abs(p - data.pagination.page) <= 1}
								<button
									onclick={() => goToPage(p)}
									class="rounded-lg border px-3 py-1.5 text-xs font-medium transition {p ===
									data.pagination.page
										? 'border-lime-500 bg-lime-500 text-white'
										: 'border-slate-200 text-slate-600 hover:bg-white'}"
								>
									{p}
								</button>
							{:else if p === 2 || p === data.pagination.totalPages - 1}
								<span class="px-1 text-xs text-slate-400">...</span>
							{/if}
						{/each}
						<button
							onclick={() => goToPage(data.pagination.page + 1)}
							disabled={data.pagination.page >= data.pagination.totalPages}
							class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
						>
							Next
						</button>
					</div>
				</div>
			{/if}
		</div>

		<!-- ═══════════════ ACTIVITY TAB ═══════════════ -->
	{:else if activeTab === 'activity'}
		<div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
			<div class="bg-slate-900 px-6 py-4">
				<h2 class="text-lg font-semibold text-white">Recent Activity</h2>
				<p class="mt-0.5 text-xs text-slate-400">Audit trail of admin actions and user logins</p>
			</div>

			{#if data.recentActivity.length > 0}
				<div class="divide-y divide-slate-100">
					{#each data.recentActivity as log}
						<div class="flex items-start gap-4 px-6 py-4">
							<div
								class="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100"
							>
								{#if log.action === 'login'}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="1.5"
										stroke="currentColor"
										class="h-4 w-4 text-blue-600"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
										/>
									</svg>
								{:else}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="1.5"
										stroke="currentColor"
										class="h-4 w-4 text-slate-600"
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
								{/if}
							</div>
							<div class="min-w-0 flex-1">
								<div class="flex items-center gap-2">
									<span
										class="rounded-full px-2 py-0.5 text-[10px] font-semibold {actionColor(
											log.action
										)}"
									>
										{actionLabel(log.action)}
									</span>
								</div>
								<p class="mt-1 text-sm text-slate-700">
									<span class="font-medium">{log.actorName}</span>
									{#if log.targetName}
										<span class="text-slate-400"> → </span>
										<span class="font-medium">{log.targetName}</span>
									{/if}
								</p>
								<p class="mt-0.5 text-xs text-slate-400">{relativeTime(log.createdAt)}</p>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="py-16 text-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1"
						stroke="currentColor"
						class="mx-auto h-12 w-12 text-slate-300"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
						/>
					</svg>
					<p class="mt-3 text-sm text-slate-500">No activity logged yet</p>
					<p class="text-xs text-slate-400">Actions will appear here as they happen</p>
				</div>
			{/if}
		</div>
	{/if}
</div>
