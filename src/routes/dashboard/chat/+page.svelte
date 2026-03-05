<script lang="ts">
	import ChatMessage from '$lib/components/chat/ChatMessage.svelte';
	import { onMount } from 'svelte';

	type TreeMessage = {
		id: string;
		parentId: string | null;
		role: 'user' | 'assistant';
		content: string;
		createdAt: string;
	};

	type Conversation = { id: string; title: string; updatedAt: string };

	// All messages in tree form
	let allMessages: TreeMessage[] = $state([]);
	// The active path (linear list derived from tree)
	let activePath: TreeMessage[] = $state([]);
	// Track which sibling is selected at each branch point: parentId -> selected child id
	let branchSelections: Record<string, string> = $state({});

	let input = $state('');
	let loading = $state(false);
	let error = $state('');
	let messagesContainer: HTMLDivElement;
	let editingMessageId: string | null = $state(null);
	let editContent = $state('');

	let conversationList: Conversation[] = $state([]);
	let activeConversationId: string | null = $state(null);
	let sidebarOpen = $state(false);
	let searchQuery = $state('');

	let filteredConversations = $derived(
		searchQuery.trim()
			? conversationList.filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
			: conversationList
	);

	onMount(() => {
		loadConversations();
	});

	// --- Tree utilities ---

	function getChildren(parentId: string | null): TreeMessage[] {
		return allMessages.filter((m) => m.parentId === parentId);
	}

	function rebuildActivePath() {
		const path: TreeMessage[] = [];
		let parentId: string | null = null;

		while (true) {
			const children = getChildren(parentId);
			if (children.length === 0) break;

			// Use branch selection or default to last child
			const selectedId: string | undefined =
				parentId !== null ? branchSelections[parentId] : branchSelections['root'];
			const selected: TreeMessage =
				children.find((c) => c.id === selectedId) || children[children.length - 1];

			// Store the selection
			if (parentId !== null) {
				branchSelections[parentId] = selected.id;
			} else {
				branchSelections['root'] = selected.id;
			}

			path.push(selected);
			parentId = selected.id;
		}

		activePath = path;
	}

	function getSiblings(msg: TreeMessage): TreeMessage[] {
		return getChildren(msg.parentId);
	}

	function getSiblingIndex(msg: TreeMessage): number {
		const siblings = getSiblings(msg);
		return siblings.findIndex((s) => s.id === msg.id);
	}

	function switchBranch(msg: TreeMessage, direction: -1 | 1) {
		const siblings = getSiblings(msg);
		const currentIdx = siblings.findIndex((s) => s.id === msg.id);
		const newIdx = currentIdx + direction;
		if (newIdx < 0 || newIdx >= siblings.length) return;

		const newSelected = siblings[newIdx];
		const key = msg.parentId ?? 'root';
		branchSelections[key] = newSelected.id;
		rebuildActivePath();
	}

	// --- API calls ---

	async function loadConversations() {
		try {
			const res = await fetch('/api/conversations');
			if (res.ok) {
				const data = await res.json();
				if (Array.isArray(data)) conversationList = data;
			}
		} catch {
			// silently fail
		}
	}

	async function selectConversation(id: string) {
		try {
			const res = await fetch(`/api/conversations/${id}`);
			if (!res.ok) return;
			const data = await res.json();
			activeConversationId = id;
			allMessages = data.messages;
			branchSelections = {};
			rebuildActivePath();
			sidebarOpen = false;
			setTimeout(scrollToBottom, 0);
		} catch {
			error = 'Failed to load conversation.';
		}
	}

	async function startNewChat() {
		activeConversationId = null;
		allMessages = [];
		activePath = [];
		branchSelections = {};
		error = '';
		sidebarOpen = false;
	}

	async function deleteConversation(id: string, e: Event) {
		e.stopPropagation();
		try {
			await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
			conversationList = conversationList.filter((c) => c.id !== id);
			if (activeConversationId === id) {
				activeConversationId = null;
				allMessages = [];
				activePath = [];
				branchSelections = {};
			}
		} catch {
			// silently fail
		}
	}

	async function saveMessage(
		conversationId: string,
		role: string,
		content: string,
		parentId: string | null
	): Promise<TreeMessage | null> {
		try {
			const res = await fetch(`/api/conversations/${conversationId}/messages`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ role, content, parentId })
			});
			if (res.ok) return await res.json();
		} catch {
			// fail silently
		}
		return null;
	}

	function scrollToBottom() {
		if (messagesContainer) {
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		}
	}

	// --- Send message ---

	async function sendMessage() {
		const trimmed = input.trim();
		if (!trimmed || loading) return;

		error = '';
		loading = true;
		input = '';

		// Determine parent: last message in active path
		const parentId = activePath.length > 0 ? activePath[activePath.length - 1].id : null;

		// Create conversation if new
		if (!activeConversationId) {
			try {
				const res = await fetch('/api/conversations', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ title: 'New Chat' })
				});
				if (!res.ok) throw new Error('Failed to create conversation');
				const conv = await res.json();
				if (!conv?.id) throw new Error('Invalid conversation response');
				activeConversationId = conv.id;
				conversationList = [conv, ...conversationList];
			} catch {
				error = 'Failed to create conversation.';
				loading = false;
				return;
			}
		}

		// Save user message
		const userMsg = await saveMessage(activeConversationId!, 'user', trimmed, parentId);
		if (!userMsg) {
			error = 'Failed to save message.';
			loading = false;
			return;
		}

		allMessages = [...allMessages, userMsg];
		const key = parentId ?? 'root';
		branchSelections[key] = userMsg.id;
		rebuildActivePath();
		setTimeout(scrollToBottom, 0);

		// Stream AI response
		await streamAIResponse(userMsg.id);
	}

	async function streamAIResponse(parentId: string) {
		// Build messages for the API from active path up to parentId
		const pathUpToParent = [];
		for (const msg of activePath) {
			pathUpToParent.push({ role: msg.role, content: msg.content });
			if (msg.id === parentId) break;
		}

		// Add placeholder for streaming
		const placeholderId = 'streaming-' + Date.now();
		const placeholder: TreeMessage = {
			id: placeholderId,
			parentId,
			role: 'assistant',
			content: '',
			createdAt: new Date().toISOString()
		};
		allMessages = [...allMessages, placeholder];
		branchSelections[parentId] = placeholderId;
		rebuildActivePath();
		setTimeout(scrollToBottom, 0);

		try {
			const res = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ messages: pathUpToParent })
			});

			if (!res.ok) {
				const text = await res.text();
				throw new Error(text || `Error: ${res.status}`);
			}

			const reader = res.body?.getReader();
			const decoder = new TextDecoder();
			if (!reader) throw new Error('No response stream');

			let assistantContent = '';

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value, { stream: true });
				assistantContent += chunk;

				// Update placeholder content
				allMessages = allMessages.map((m) =>
					m.id === placeholderId ? { ...m, content: assistantContent } : m
				);
				rebuildActivePath();
				setTimeout(scrollToBottom, 0);
			}

			// Save the real assistant message to DB
			const assistantMsg = await saveMessage(
				activeConversationId!,
				'assistant',
				assistantContent,
				parentId
			);

			if (assistantMsg) {
				// Replace placeholder with real message
				allMessages = allMessages.map((m) => (m.id === placeholderId ? assistantMsg : m));
				branchSelections[parentId] = assistantMsg.id;
				rebuildActivePath();
			}

			await loadConversations();
		} catch (err: any) {
			error = err.message || 'Something went wrong. Please try again.';
			// Remove placeholder
			allMessages = allMessages.filter((m) => m.id !== placeholderId);
			rebuildActivePath();
		} finally {
			loading = false;
			setTimeout(scrollToBottom, 0);
		}
	}

	// --- Edit a user message (creates a new branch) ---

	function startEdit(msg: TreeMessage) {
		editingMessageId = msg.id;
		editContent = msg.content;
	}

	function cancelEdit() {
		editingMessageId = null;
		editContent = '';
	}

	async function submitEdit(msg: TreeMessage) {
		const trimmed = editContent.trim();
		if (!trimmed || loading) return;

		editingMessageId = null;
		editContent = '';
		loading = true;
		error = '';

		// The new edited message branches from the same parent as the original
		const parentId = msg.parentId;

		const userMsg = await saveMessage(activeConversationId!, 'user', trimmed, parentId);
		if (!userMsg) {
			error = 'Failed to save edited message.';
			loading = false;
			return;
		}

		allMessages = [...allMessages, userMsg];
		const key = parentId ?? 'root';
		branchSelections[key] = userMsg.id;
		rebuildActivePath();
		setTimeout(scrollToBottom, 0);

		// Stream new AI response
		await streamAIResponse(userMsg.id);
	}

	// --- Regenerate AI response (creates a new branch from the user message) ---

	async function regenerateResponse(msg: TreeMessage) {
		if (loading) return;
		loading = true;
		error = '';

		// The AI message's parent is a user message — regenerate creates a new sibling
		const parentId = msg.parentId;
		if (!parentId) return;

		await streamAIResponse(parentId);
	}

	// --- UI helpers ---

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	}

	function formatDate(dateStr: string): string {
		const date = new Date(dateStr);
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		if (days === 0) return 'Today';
		if (days === 1) return 'Yesterday';
		if (days < 7) return `${days}d ago`;
		return date.toLocaleDateString();
	}
</script>

<svelte:head>
	<title>AI Chat — AuthFlow</title>
</svelte:head>

<div class="flex h-[calc(100vh-6rem)] gap-4">
	<!-- Sidebar toggle (mobile) -->
	<button
		onclick={() => (sidebarOpen = !sidebarOpen)}
		class="fixed top-20 left-4 z-30 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-md transition hover:bg-gray-50 md:hidden"
		aria-label="Toggle chat history"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="h-5 w-5"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
			/>
		</svg>
	</button>

	<!-- Sidebar -->
	<div
		class="fixed inset-y-0 left-0 z-20 w-72 transform border-r border-gray-200 bg-white pt-20 shadow-lg transition-transform duration-200 md:relative md:inset-auto md:z-auto md:w-64 md:flex-shrink-0 md:translate-x-0 md:rounded-2xl md:border md:pt-0 md:shadow-none {sidebarOpen
			? 'translate-x-0'
			: '-translate-x-full'}"
	>
		<div class="flex h-full flex-col">
			<div class="flex items-center justify-between border-b border-gray-200 p-4">
				<h2 class="text-sm font-semibold text-gray-700">Chat History</h2>
				<button
					onclick={startNewChat}
					class="flex items-center gap-1.5 rounded-lg bg-black px-3 py-1.5 text-xs font-medium text-white transition hover:bg-gray-800"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="2"
						stroke="currentColor"
						class="h-3.5 w-3.5"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
					</svg>
					New
				</button>
			</div>

			<!-- Search -->
			<div class="border-b border-gray-100 p-2">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search conversations..."
					class="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-black focus:outline-none"
					aria-label="Search conversations"
				/>
			</div>

			<div class="flex-1 space-y-1 overflow-y-auto p-2">
				{#if filteredConversations.length === 0}
					<p class="px-3 py-8 text-center text-xs text-gray-400">
						{searchQuery ? 'No matches found' : 'No conversations yet'}
					</p>
				{:else}
					{#each filteredConversations as conv}
						<div
							class="group flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left transition {activeConversationId ===
							conv.id
								? 'bg-gray-100 text-black'
								: 'text-gray-600 hover:bg-gray-50 hover:text-black'}"
							role="button"
							tabindex="0"
							onclick={() => selectConversation(conv.id)}
							onkeydown={(e) => e.key === 'Enter' && selectConversation(conv.id)}
						>
							<div class="min-w-0 flex-1">
								<p class="truncate text-sm font-medium">{conv.title}</p>
								<p class="text-xs text-gray-400">{formatDate(conv.updatedAt)}</p>
							</div>
							<button
								onclick={(e) => deleteConversation(conv.id, e)}
								class="flex-shrink-0 rounded p-1 text-gray-300 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
								aria-label="Delete conversation"
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
										d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
									/>
								</svg>
							</button>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</div>

	<!-- Backdrop for mobile sidebar -->
	{#if sidebarOpen}
		<button
			class="fixed inset-0 z-10 bg-black/30 backdrop-blur-sm md:hidden"
			onclick={() => (sidebarOpen = false)}
			aria-label="Close sidebar"
		></button>
	{/if}

	<!-- Main chat area -->
	<div class="flex min-w-0 flex-1 flex-col">
		<!-- Header -->
		<div class="mb-5 flex items-center justify-between border-b border-gray-200 pb-4">
			<div class="flex items-center gap-4">
				<div
					class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="white"
						class="h-6 w-6"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
						/>
					</svg>
				</div>
				<div>
					<h1 class="text-xl font-bold text-gray-900">AI Assistant</h1>
					<div class="mt-0.5 flex items-center gap-2">
						<span class="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
						<p class="text-xs text-gray-500">Powered by Google Gemini — Online</p>
					</div>
				</div>
			</div>
			{#if activePath.length > 0}
				<button
					onclick={startNewChat}
					class="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-500 transition hover:border-gray-300 hover:bg-gray-50 hover:text-black"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="h-4 w-4"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
					</svg>
					New Chat
				</button>
			{/if}
		</div>

		<!-- Messages area -->
		<div
			bind:this={messagesContainer}
			class="mb-4 flex-1 space-y-5 overflow-y-auto rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-inner"
		>
			{#if activePath.length === 0}
				<div class="flex h-full flex-col items-center justify-center px-4 text-center">
					<div
						class="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-100 to-purple-100 shadow-sm"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="h-10 w-10 text-blue-500"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
							/>
						</svg>
					</div>
					<h2 class="mb-2 text-2xl font-bold text-gray-900">How can I help you?</h2>
					<p class="mb-8 max-w-sm text-sm text-gray-400">
						Ask me anything — from coding questions to creative writing. I'm powered by Google
						Gemini and ready to assist.
					</p>

					<div class="grid w-full max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
						<button
							onclick={() => {
								input = 'Explain how authentication works in web apps';
								sendMessage();
							}}
							class="group rounded-xl border border-gray-200 bg-white p-4 text-left transition hover:border-gray-300 hover:shadow-sm"
						>
							<div class="mb-1.5 flex items-center gap-3">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="h-4 w-4 text-blue-500"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
									/>
								</svg>
								<span class="text-xs font-semibold tracking-wide text-gray-400 uppercase"
									>Learn</span
								>
							</div>
							<p class="text-sm text-gray-700 transition group-hover:text-black">
								Explain how authentication works in web apps
							</p>
						</button>
						<button
							onclick={() => {
								input = 'Write a JavaScript function to validate an email address';
								sendMessage();
							}}
							class="group rounded-xl border border-gray-200 bg-white p-4 text-left transition hover:border-gray-300 hover:shadow-sm"
						>
							<div class="mb-1.5 flex items-center gap-3">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="h-4 w-4 text-purple-500"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
									/>
								</svg>
								<span class="text-xs font-semibold tracking-wide text-gray-400 uppercase">Code</span
								>
							</div>
							<p class="text-sm text-gray-700 transition group-hover:text-black">
								Write a JS function to validate email addresses
							</p>
						</button>
						<button
							onclick={() => {
								input = 'What are the best practices for database security?';
								sendMessage();
							}}
							class="group rounded-xl border border-gray-200 bg-white p-4 text-left transition hover:border-gray-300 hover:shadow-sm"
						>
							<div class="mb-1.5 flex items-center gap-3">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="h-4 w-4 text-green-500"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
									/>
								</svg>
								<span class="text-xs font-semibold tracking-wide text-gray-400 uppercase"
									>Security</span
								>
							</div>
							<p class="text-sm text-gray-700 transition group-hover:text-black">
								Best practices for database security
							</p>
						</button>
						<button
							onclick={() => {
								input = 'Help me write a professional bio for my portfolio';
								sendMessage();
							}}
							class="group rounded-xl border border-gray-200 bg-white p-4 text-left transition hover:border-gray-300 hover:shadow-sm"
						>
							<div class="mb-1.5 flex items-center gap-3">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="h-4 w-4 text-amber-500"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
									/>
								</svg>
								<span class="text-xs font-semibold tracking-wide text-gray-400 uppercase"
									>Write</span
								>
							</div>
							<p class="text-sm text-gray-700 transition group-hover:text-black">
								Help me write a professional portfolio bio
							</p>
						</button>
					</div>
				</div>
			{:else}
				{#each activePath as msg, i (msg.id)}
					{@const siblings = getSiblings(msg)}
					{@const siblingIdx = getSiblingIndex(msg)}
					{@const hasBranches = siblings.length > 1}

					<!-- Branch navigator -->
					{#if hasBranches}
						<div class="flex items-center justify-center gap-2 py-1">
							<button
								onclick={() => switchBranch(msg, -1)}
								disabled={siblingIdx === 0}
								class="rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30"
								aria-label="Previous branch"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="2"
									stroke="currentColor"
									class="h-3.5 w-3.5"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M15.75 19.5 8.25 12l7.5-7.5"
									/>
								</svg>
							</button>
							<span class="text-xs font-medium text-gray-400">
								{siblingIdx + 1} / {siblings.length}
							</span>
							<button
								onclick={() => switchBranch(msg, 1)}
								disabled={siblingIdx === siblings.length - 1}
								class="rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30"
								aria-label="Next branch"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="2"
									stroke="currentColor"
									class="h-3.5 w-3.5"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="m8.25 4.5 7.5 7.5-7.5 7.5"
									/>
								</svg>
							</button>
						</div>
					{/if}

					<!-- Editing state -->
					{#if editingMessageId === msg.id}
						<div class="flex justify-end gap-3">
							<div class="flex max-w-[75%] flex-col items-end gap-2">
								<textarea
									bind:value={editContent}
									rows="3"
									class="w-full min-w-[300px] rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-black focus:outline-none"
									aria-label="Edit message"
								></textarea>
								<div class="flex gap-2">
									<button
										onclick={cancelEdit}
										class="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 transition hover:bg-gray-50"
									>
										Cancel
									</button>
									<button
										onclick={() => submitEdit(msg)}
										class="rounded-lg bg-black px-3 py-1.5 text-xs text-white transition hover:bg-gray-800"
									>
										Submit
									</button>
								</div>
							</div>
						</div>
					{:else}
						<ChatMessage
							role={msg.role}
							content={msg.content}
							loading={loading && i === activePath.length - 1}
						/>

						<!-- Action buttons under each message -->
						{#if !loading || i !== activePath.length - 1}
							<div
								class="flex {msg.role === 'user'
									? 'justify-end pr-11'
									: 'justify-start pl-11'} -mt-3 gap-1"
							>
								{#if msg.role === 'user'}
									<button
										onclick={() => startEdit(msg)}
										class="rounded p-1 text-gray-300 transition hover:bg-gray-100 hover:text-gray-600"
										title="Edit message"
										aria-label="Edit message"
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
												d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
											/>
										</svg>
									</button>
								{/if}
								{#if msg.role === 'assistant' && msg.content}
									<button
										onclick={() => regenerateResponse(msg)}
										class="rounded p-1 text-gray-300 transition hover:bg-gray-100 hover:text-gray-600"
										title="Regenerate response"
										aria-label="Regenerate response"
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
												d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182M2.985 14.652"
											/>
										</svg>
									</button>
									<button
										onclick={() => navigator.clipboard.writeText(msg.content)}
										class="rounded p-1 text-gray-300 transition hover:bg-gray-100 hover:text-gray-600"
										title="Copy to clipboard"
										aria-label="Copy to clipboard"
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
												d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
											/>
										</svg>
									</button>
								{/if}
							</div>
						{/if}
					{/if}
				{/each}
			{/if}
		</div>

		<!-- Error display -->
		{#if error}
			<div
				class="mb-3 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4"
			>
				<div class="flex items-center gap-3">
					<div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-100">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="h-4 w-4 text-red-600"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
							/>
						</svg>
					</div>
					<p class="text-sm text-red-700">{error}</p>
				</div>
				<button
					onclick={() => (error = '')}
					class="rounded-lg p-1 text-red-400 transition hover:bg-red-100 hover:text-red-600"
					aria-label="Dismiss error"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="2"
						stroke="currentColor"
						class="h-4 w-4"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		{/if}

		<!-- Input area -->
		<div class="flex items-end gap-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-lg">
			<textarea
				bind:value={input}
				onkeydown={handleKeydown}
				placeholder="Message AI Assistant..."
				rows="1"
				class="flex-1 resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-black focus:outline-none"
				aria-label="Chat message input"
			></textarea>
			<button
				onclick={sendMessage}
				disabled={loading || !input.trim()}
				class="flex flex-shrink-0 items-center justify-center rounded-xl bg-black p-3 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-30"
				aria-label="Send message"
			>
				{#if loading}
					<svg
						class="h-5 w-5 animate-spin"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="2"
						stroke="currentColor"
						class="h-5 w-5"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
						/>
					</svg>
				{/if}
			</button>
		</div>
	</div>
</div>
