<script lang="ts">
	import ChatMessage from '$lib/components/chat/ChatMessage.svelte';
	import { onMount, tick } from 'svelte';

	type Citation = {
		filename: string;
		chunkIndex: number;
		similarity: number;
	};

	type TreeMessage = {
		id: string;
		parentId: string | null;
		role: 'user' | 'assistant';
		content: string;
		createdAt: string;
		citations?: Citation[];
	};

	type Conversation = { id: string; title: string; updatedAt: string };

	let allMessages: TreeMessage[] = $state([]);
	let activePath: TreeMessage[] = $state([]);
	let branchSelections: Record<string, string> = $state({});

	let input = $state('');
	let loading = $state(false);
	let error = $state('');
	let messagesContainer: HTMLDivElement;
	let textareaEl: HTMLTextAreaElement;
	let editingMessageId: string | null = $state(null);
	let editContent = $state('');

	let conversationList: Conversation[] = $state([]);
	let activeConversationId: string | null = $state(null);
	let sidebarOpen = $state(false);
	let searchQuery = $state('');

	type Document = { id: string; filename: string; mimeType: string; createdAt: string };
	let userDocuments: Document[] = $state([]);
	let uploading = $state(false);
	let uploadError = $state('');
	let showDocPanel = $state(false);
	let fileInput: HTMLInputElement = $state(null!);

	let filteredConversations = $derived(
		searchQuery.trim()
			? conversationList.filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
			: conversationList
	);

	onMount(() => {
		loadConversations();
		loadDocuments();
	});

	// --- Auto-resize textarea ---
	function autoResize() {
		if (!textareaEl) return;
		textareaEl.style.height = 'auto';
		textareaEl.style.height = Math.min(textareaEl.scrollHeight, 160) + 'px';
	}

	// --- Document management ---
	async function loadDocuments() {
		try {
			const res = await fetch('/api/documents');
			if (res.ok) {
				const data = await res.json();
				if (Array.isArray(data)) userDocuments = data;
			}
		} catch {
			/* silent */
		}
	}

	async function uploadDocument(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;
		uploading = true;
		uploadError = '';
		const formData = new FormData();
		formData.append('file', file);
		try {
			const res = await fetch('/api/documents', { method: 'POST', body: formData });
			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || 'Upload failed');
			}
			await loadDocuments();
		} catch (err: any) {
			uploadError = err.message || 'Failed to upload document.';
		} finally {
			uploading = false;
			target.value = '';
		}
	}

	async function deleteDocument(id: string) {
		try {
			await fetch(`/api/documents/${id}`, { method: 'DELETE' });
			userDocuments = userDocuments.filter((d) => d.id !== id);
		} catch {
			/* silent */
		}
	}

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
			const selectedId: string | undefined =
				parentId !== null ? branchSelections[parentId] : branchSelections['root'];
			const selected: TreeMessage =
				children.find((c) => c.id === selectedId) || children[children.length - 1];
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
		return getSiblings(msg).findIndex((s) => s.id === msg.id);
	}

	function switchBranch(msg: TreeMessage, direction: -1 | 1) {
		const siblings = getSiblings(msg);
		const currentIdx = siblings.findIndex((s) => s.id === msg.id);
		const newIdx = currentIdx + direction;
		if (newIdx < 0 || newIdx >= siblings.length) return;
		branchSelections[msg.parentId ?? 'root'] = siblings[newIdx].id;
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
			/* silent */
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
			await tick();
			scrollToBottom();
		} catch {
			error = 'Failed to load conversation.';
		}
	}

	function startNewChat() {
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
				startNewChat();
			}
		} catch {
			/* silent */
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
			/* silent */
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
		if (textareaEl) {
			textareaEl.style.height = 'auto';
		}

		const parentId = activePath.length > 0 ? activePath[activePath.length - 1].id : null;

		if (!activeConversationId) {
			try {
				const res = await fetch('/api/conversations', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ title: 'New Chat' })
				});
				if (!res.ok) throw new Error();
				const conv = await res.json();
				if (!conv?.id) throw new Error();
				activeConversationId = conv.id;
				conversationList = [conv, ...conversationList];
			} catch {
				error = 'Failed to create conversation.';
				loading = false;
				return;
			}
		}

		const userMsg = await saveMessage(activeConversationId!, 'user', trimmed, parentId);
		if (!userMsg) {
			error = 'Failed to save message.';
			loading = false;
			return;
		}

		allMessages = [...allMessages, userMsg];
		branchSelections[parentId ?? 'root'] = userMsg.id;
		rebuildActivePath();
		await tick();
		scrollToBottom();
		await streamAIResponse(userMsg.id);
	}

	async function streamAIResponse(parentId: string) {
		const pathUpToParent = [];
		for (const msg of activePath) {
			pathUpToParent.push({ role: msg.role, content: msg.content });
			if (msg.id === parentId) break;
		}

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
		await tick();
		scrollToBottom();

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

			let responseCitations: Citation[] = [];
			const citationsHeader = res.headers.get('X-Citations');
			if (citationsHeader) {
				try {
					responseCitations = JSON.parse(citationsHeader);
				} catch {
					/* ignore */
				}
			}

			const reader = res.body?.getReader();
			const decoder = new TextDecoder();
			if (!reader) throw new Error('No response stream');

			let assistantContent = '';
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				assistantContent += decoder.decode(value, { stream: true });
				allMessages = allMessages.map((m) =>
					m.id === placeholderId ? { ...m, content: assistantContent } : m
				);
				rebuildActivePath();
				scrollToBottom();
			}

			const assistantMsg = await saveMessage(
				activeConversationId!,
				'assistant',
				assistantContent,
				parentId
			);
			if (assistantMsg) {
				allMessages = allMessages.map((m) =>
					m.id === placeholderId ? { ...assistantMsg, citations: responseCitations } : m
				);
				branchSelections[parentId] = assistantMsg.id;
				rebuildActivePath();
			}
			await loadConversations();
		} catch (err: any) {
			error = err.message || 'Something went wrong. Please try again.';
			allMessages = allMessages.filter((m) => m.id !== placeholderId);
			rebuildActivePath();
		} finally {
			loading = false;
			await tick();
			scrollToBottom();
		}
	}

	// --- Edit / Regenerate ---
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
		const parentId = msg.parentId;
		const userMsg = await saveMessage(activeConversationId!, 'user', trimmed, parentId);
		if (!userMsg) {
			error = 'Failed to save edited message.';
			loading = false;
			return;
		}
		allMessages = [...allMessages, userMsg];
		branchSelections[parentId ?? 'root'] = userMsg.id;
		rebuildActivePath();
		await tick();
		scrollToBottom();
		await streamAIResponse(userMsg.id);
	}

	async function regenerateResponse(msg: TreeMessage) {
		if (loading) return;
		loading = true;
		error = '';
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

<!-- Full-bleed dark chat layout -->
<div class="flex h-[calc(100vh-4rem)]">
	<!-- Mobile sidebar toggle -->
	<button
		onclick={() => (sidebarOpen = !sidebarOpen)}
		class="fixed top-20 left-4 z-30 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-400 shadow-lg transition hover:text-white md:hidden"
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

	<!-- ========== SIDEBAR (ChatGPT style: very dark, nav links) ========== -->
	<div
		class="fixed inset-y-0 left-0 z-20 w-[260px] transform bg-slate-950 shadow-2xl transition-transform duration-200 md:relative md:inset-auto md:z-auto md:flex md:w-[260px] md:flex-shrink-0 md:translate-x-0 {sidebarOpen
			? 'translate-x-0'
			: '-translate-x-full'}"
	>
		<div class="flex h-full w-full flex-col">
			<!-- Sidebar top: New Chat button -->
			<div class="flex items-center gap-2 p-3">
				<button
					onclick={startNewChat}
					class="flex flex-1 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="h-5 w-5"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
					</svg>
					New chat
				</button>
			</div>

			<!-- Search -->
			<div class="px-3 pb-2">
				<div class="relative">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
						/>
					</svg>
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Search chats"
						class="w-full rounded-lg border-0 bg-slate-800/60 py-2 pr-3 pl-9 text-sm text-slate-300 placeholder:text-slate-500 focus:bg-slate-800 focus:ring-1 focus:ring-slate-600 focus:outline-none"
						aria-label="Search conversations"
					/>
				</div>
			</div>

			<!-- Your chats label -->
			<div class="px-5 pt-3 pb-1">
				<span class="text-xs font-medium text-slate-500">Your chats</span>
			</div>

			<!-- Conversation list -->
			<div class="flex-1 space-y-0.5 overflow-y-auto px-2 pb-2">
				{#if filteredConversations.length === 0}
					<div class="flex flex-col items-center justify-center px-3 py-10 text-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1"
							stroke="currentColor"
							class="mb-2 h-7 w-7 text-slate-700"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
							/>
						</svg>
						<p class="text-xs text-slate-600">
							{searchQuery ? 'No matches found' : 'No conversations yet'}
						</p>
					</div>
				{:else}
					{#each filteredConversations as conv}
						<div
							class="group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition {activeConversationId ===
							conv.id
								? 'bg-slate-800 text-white'
								: 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}"
							role="button"
							tabindex="0"
							onclick={() => selectConversation(conv.id)}
							onkeydown={(e) => e.key === 'Enter' && selectConversation(conv.id)}
						>
							<div class="min-w-0 flex-1">
								<p class="truncate text-[13px]">{conv.title}</p>
							</div>
							<button
								onclick={(e) => deleteConversation(conv.id, e)}
								class="flex-shrink-0 rounded p-1 opacity-0 transition group-hover:opacity-100 {activeConversationId ===
								conv.id
									? 'text-slate-500 hover:text-red-400'
									: 'text-slate-600 hover:text-red-400'}"
								aria-label="Delete conversation"
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

	<!-- Mobile sidebar backdrop -->
	{#if sidebarOpen}
		<button
			class="fixed inset-0 z-10 bg-black/60 md:hidden"
			onclick={() => (sidebarOpen = false)}
			aria-label="Close sidebar"
		></button>
	{/if}

	<!-- ========== MAIN CHAT AREA (ChatGPT style: dark bg, centered column) ========== -->
	<div class="flex min-w-0 flex-1 flex-col bg-slate-900">
		<!-- Minimal top bar: model name centered, like ChatGPT -->
		<div class="relative flex items-center justify-center border-b border-slate-800 px-4 py-3">
			<div class="flex items-center gap-2">
				<div class="flex h-6 w-6 items-center justify-center rounded-full bg-lime-500">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="h-3.5 w-3.5 text-slate-900"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
						/>
					</svg>
				</div>
				<span class="text-sm font-medium text-slate-300">AuthFlow AI</span>
				<span class="flex items-center gap-1 text-[10px] text-slate-500">
					<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-500"></span>
					Gemini
				</span>
			</div>
			<!-- Right side: new chat -->
			<div class="absolute right-3 flex items-center gap-1">
				{#if activePath.length > 0}
					<button
						onclick={startNewChat}
						class="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-slate-300"
						aria-label="New chat"
						title="New chat"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="h-4.5 w-4.5"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
						</svg>
					</button>
				{/if}
			</div>
		</div>

		<!-- Hidden file input (always in DOM so + button works) -->
		<input
			bind:this={fileInput}
			type="file"
			accept=".txt,text/plain"
			onchange={uploadDocument}
			class="hidden"
			aria-label="Upload document"
		/>

		<!-- Document panel (overlay on dark bg) -->
		{#if showDocPanel}
			<div class="mx-auto w-full max-w-3xl px-4 pt-3">
				<div class="rounded-xl border border-slate-700 bg-slate-800 p-4">
					<div class="mb-3 flex items-center justify-between">
						<div>
							<h3 class="text-sm font-semibold text-slate-200">Knowledge Base</h3>
							<p class="text-[11px] text-slate-500">
								Upload documents for context-aware answers
							</p>
						</div>
						<div class="flex items-center gap-2">
							<button
								onclick={() => (showDocPanel = false)}
								class="rounded-lg p-1 text-slate-500 transition hover:bg-slate-700 hover:text-slate-300"
								aria-label="Close"
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
					</div>
					{#if uploadError}
						<p class="mb-2 text-xs text-red-400">{uploadError}</p>
					{/if}
					{#if userDocuments.length === 0}
						<div class="rounded-lg border-2 border-dashed border-slate-600 px-4 py-5 text-center">
							<p class="text-xs text-slate-500">No documents yet. Upload .txt files to enable RAG.</p>
						</div>
					{:else}
						<div class="max-h-32 space-y-1 overflow-y-auto">
							{#each userDocuments as doc}
								<div
									class="group flex items-center justify-between rounded-lg bg-slate-700/40 px-3 py-2 transition hover:bg-slate-700/70"
								>
									<div class="flex items-center gap-2 overflow-hidden">
										<div
											class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-lime-500/20"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke-width="1.5"
												stroke="currentColor"
												class="h-3 w-3 text-lime-400"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
												/>
											</svg>
										</div>
										<span class="truncate text-xs text-slate-300">{doc.filename}</span>
									</div>
									<button
										onclick={() => deleteDocument(doc.id)}
										class="flex-shrink-0 rounded p-1 text-slate-600 opacity-0 transition group-hover:opacity-100 hover:text-red-400"
										aria-label="Delete document {doc.filename}"
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
												d="M6 18 18 6M6 6l12 12"
											/>
										</svg>
									</button>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Messages area (scrollable, centered column) -->
		<div bind:this={messagesContainer} class="flex-1 overflow-y-auto">
			{#if activePath.length === 0}
				<!-- Empty state: centered like ChatGPT -->
				<div class="flex h-full flex-col items-center justify-center px-4">
					<div
						class="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-lime-500"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="h-7 w-7 text-slate-900"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
							/>
						</svg>
					</div>
					<h2 class="mb-2 text-2xl font-semibold text-slate-100">What can I help with?</h2>
					<p class="mb-10 max-w-md text-center text-sm text-slate-500">
						Ask anything — code, writing, analysis. Upload documents for context-aware answers.
					</p>

					<div class="mx-auto grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
						{#each [{ icon: 'M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z', color: 'text-blue-400', label: 'Learn', text: 'Explain how authentication works in web apps' }, { icon: 'M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5', color: 'text-purple-400', label: 'Code', text: 'Write a JavaScript function to validate an email address' }, { icon: 'M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z', color: 'text-lime-400', label: 'Security', text: 'What are the best practices for database security?' }, { icon: 'm16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10', color: 'text-amber-400', label: 'Write', text: 'Help me write a professional bio for my portfolio' }] as prompt}
							<button
								onclick={() => {
									input = prompt.text;
									sendMessage();
								}}
								class="group rounded-xl border border-slate-700 bg-slate-800/50 p-3.5 text-left transition hover:border-slate-600 hover:bg-slate-800"
							>
								<div class="mb-1 flex items-center gap-2">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="1.5"
										stroke="currentColor"
										class="h-3.5 w-3.5 {prompt.color}"
									>
										<path stroke-linecap="round" stroke-linejoin="round" d={prompt.icon} />
									</svg>
									<span class="text-[10px] font-bold tracking-wider text-slate-500 uppercase"
										>{prompt.label}</span
									>
								</div>
								<p
									class="text-[13px] leading-snug text-slate-400 transition group-hover:text-slate-200"
								>
									{prompt.text}
								</p>
							</button>
						{/each}
					</div>
				</div>
			{:else}
				<!-- Messages in centered column -->
				<div class="mx-auto max-w-3xl space-y-5 px-4 py-6">
					{#each activePath as msg, i (msg.id)}
						{@const siblings = getSiblings(msg)}
						{@const siblingIdx = getSiblingIndex(msg)}
						{@const hasBranches = siblings.length > 1}
						{@const isLastAndLoading = loading && i === activePath.length - 1}

						<!-- Branch navigator -->
						{#if hasBranches}
							<div class="flex items-center justify-center gap-1 py-1">
								<button
									onclick={() => switchBranch(msg, -1)}
									disabled={siblingIdx === 0}
									class="rounded-md p-1 text-slate-500 transition hover:bg-slate-700 hover:text-slate-300 disabled:opacity-30"
									aria-label="Previous branch"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="2.5"
										stroke="currentColor"
										class="h-3 w-3"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M15.75 19.5 8.25 12l7.5-7.5"
										/>
									</svg>
								</button>
								<span
									class="min-w-[3rem] rounded-md bg-slate-800 px-2 py-0.5 text-center text-[11px] font-semibold text-slate-400"
								>
									{siblingIdx + 1} / {siblings.length}
								</span>
								<button
									onclick={() => switchBranch(msg, 1)}
									disabled={siblingIdx === siblings.length - 1}
									class="rounded-md p-1 text-slate-500 transition hover:bg-slate-700 hover:text-slate-300 disabled:opacity-30"
									aria-label="Next branch"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="2.5"
										stroke="currentColor"
										class="h-3 w-3"
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

						<!-- Edit mode -->
						{#if editingMessageId === msg.id}
							<div class="flex justify-end">
								<div class="flex max-w-[70%] flex-col items-end gap-2">
									<textarea
										bind:value={editContent}
										rows="3"
										class="w-full min-w-[300px] rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-sm text-slate-200 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 focus:outline-none"
										aria-label="Edit message"
									></textarea>
									<div class="flex gap-2">
										<button
											onclick={cancelEdit}
											class="rounded-lg border border-slate-600 px-4 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-slate-800"
										>
											Cancel
										</button>
										<button
											onclick={() => submitEdit(msg)}
											class="rounded-lg bg-lime-500 px-4 py-1.5 text-xs font-medium text-slate-900 transition hover:bg-lime-400"
										>
											Save & Submit
										</button>
									</div>
								</div>
							</div>
						{:else}
							<ChatMessage
								role={msg.role}
								content={msg.content}
								loading={isLastAndLoading}
								createdAt={msg.createdAt}
								citations={msg.citations}
								showActions={!isLastAndLoading}
								onEdit={msg.role === 'user' ? () => startEdit(msg) : undefined}
								onRegenerate={msg.role === 'assistant'
									? () => regenerateResponse(msg)
									: undefined}
							/>
						{/if}
					{/each}
				</div>
			{/if}
		</div>

		<!-- Error -->
		{#if error}
			<div class="mx-auto w-full max-w-3xl px-4">
				<div
					class="mb-2 flex items-center justify-between rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3"
				>
					<div class="flex items-center gap-2">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="h-4 w-4 flex-shrink-0 text-red-400"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
							/>
						</svg>
						<p class="text-sm text-red-300">{error}</p>
					</div>
					<button
						onclick={() => (error = '')}
						class="rounded-lg p-1 text-red-400 transition hover:bg-red-500/20"
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
			</div>
		{/if}

		<!-- Input area: ChatGPT style rounded pill at bottom center -->
		<div class="mx-auto w-full max-w-3xl px-4 pt-2 pb-3">
			<div
				class="relative rounded-3xl border border-slate-700 bg-slate-800 shadow-xl transition-all focus-within:border-slate-600 focus-within:bg-slate-800/90"
			>
				<textarea
					bind:this={textareaEl}
					bind:value={input}
					onkeydown={handleKeydown}
					oninput={autoResize}
					placeholder="Ask anything"
					rows="1"
					class="w-full resize-none rounded-3xl bg-transparent pr-5 pl-14 pt-3.5 pb-12 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
					aria-label="Chat message input"
				></textarea>
				<!-- + button (upload document) on left like ChatGPT -->
				<button
					onclick={() => fileInput.click()}
					disabled={uploading}
					class="absolute left-3 bottom-2.5 flex h-8 w-8 items-center justify-center rounded-full border border-slate-600 text-slate-400 transition hover:border-slate-500 hover:bg-slate-700 hover:text-slate-200 disabled:opacity-50"
					title="Upload document"
					aria-label="Upload document"
				>
					{#if uploading}
						<svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
						</svg>
					{:else}
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-4 w-4">
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
						</svg>
					{/if}
				</button>
				<div class="absolute right-2.5 bottom-2.5 flex items-center gap-2">
					<span class="hidden text-[10px] text-slate-600 sm:block">
						{#if loading}Generating...{:else}Shift+Enter for new line{/if}
					</span>
					<button
						onclick={sendMessage}
						disabled={loading || !input.trim()}
						class="flex h-8 w-8 items-center justify-center rounded-full transition {loading || !input.trim()
							? 'bg-slate-700 text-slate-500 cursor-not-allowed'
							: 'bg-lime-500 text-slate-900 hover:bg-lime-400'}"
						aria-label="Send message"
					>
						{#if loading}
							<svg
								class="h-4 w-4 animate-spin"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
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
								class="h-4 w-4"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
								/>
							</svg>
						{/if}
					</button>
				</div>
			</div>
			<!-- Disclaimer like ChatGPT -->
			<p class="mt-2 text-center text-[11px] text-slate-600">
				AuthFlow AI can make mistakes. Check important info.
			</p>
		</div>
	</div>
</div>
