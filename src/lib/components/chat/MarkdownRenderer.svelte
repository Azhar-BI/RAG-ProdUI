<script lang="ts">
	import { onMount } from 'svelte';
	import { Marked } from 'marked';
	import hljs from 'highlight.js';

	interface Props {
		content: string;
	}

	let { content }: Props = $props();
	let htmlContent = $state('');

	const marked = new Marked({
		breaks: true,
		gfm: true,
		renderer: {
			code({ text, lang }: { text: string; lang?: string }) {
				const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
				const highlighted = hljs.highlight(text, { language }).value;
				return `<div class="code-block-wrapper"><div class="code-block-header"><span class="code-lang">${lang || 'code'}</span><button class="copy-code-btn" onclick="navigator.clipboard.writeText(this.closest('.code-block-wrapper').querySelector('code').textContent)"><svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='9' y='9' width='13' height='13' rx='2' ry='2'/><path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'/></svg><span>Copy</span></button></div><pre><code class="hljs language-${language}">${highlighted}</code></pre></div>`;
			}
		}
	});

	$effect(() => {
		const raw = content;
		const result = marked.parse(raw);
		if (typeof result === 'string') {
			htmlContent = result;
		} else {
			result.then((html) => {
				htmlContent = html;
			});
		}
	});
</script>

<div class="markdown-body">
	{@html htmlContent}
</div>

<style>
	.markdown-body :global(p) {
		margin-bottom: 0.5rem;
		line-height: 1.6;
	}

	.markdown-body :global(p:last-child) {
		margin-bottom: 0;
	}

	.markdown-body :global(h1),
	.markdown-body :global(h2),
	.markdown-body :global(h3),
	.markdown-body :global(h4) {
		font-weight: 700;
		margin-top: 1rem;
		margin-bottom: 0.5rem;
		line-height: 1.3;
	}

	.markdown-body :global(h1) {
		font-size: 1.25rem;
	}
	.markdown-body :global(h2) {
		font-size: 1.125rem;
	}
	.markdown-body :global(h3) {
		font-size: 1rem;
	}

	.markdown-body :global(ul),
	.markdown-body :global(ol) {
		padding-left: 1.5rem;
		margin-bottom: 0.5rem;
	}

	.markdown-body :global(ul) {
		list-style-type: disc;
	}

	.markdown-body :global(ol) {
		list-style-type: decimal;
	}

	.markdown-body :global(li) {
		margin-bottom: 0.25rem;
		line-height: 1.5;
	}

	.markdown-body :global(blockquote) {
		border-left: 3px solid #d1d5db;
		padding-left: 0.75rem;
		margin: 0.5rem 0;
		color: #6b7280;
		font-style: italic;
	}

	.markdown-body :global(code) {
		background-color: rgba(0, 0, 0, 0.06);
		border-radius: 4px;
		padding: 0.15rem 0.35rem;
		font-size: 0.85em;
		font-family: 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
	}

	.markdown-body :global(pre code) {
		background: none;
		padding: 0;
		border-radius: 0;
		font-size: 0.8rem;
	}

	.markdown-body :global(.code-block-wrapper) {
		margin: 0.75rem 0;
		border-radius: 0.5rem;
		overflow: hidden;
		border: 1px solid #e5e7eb;
	}

	.markdown-body :global(.code-block-header) {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.4rem 0.75rem;
		background: #1e1e2e;
		border-bottom: 1px solid #313244;
	}

	.markdown-body :global(.code-lang) {
		font-size: 0.7rem;
		color: #a6adc8;
		text-transform: uppercase;
		font-weight: 600;
		letter-spacing: 0.05em;
	}

	.markdown-body :global(.copy-code-btn) {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.7rem;
		color: #a6adc8;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.2rem 0.4rem;
		border-radius: 0.25rem;
		transition: all 0.15s;
	}

	.markdown-body :global(.copy-code-btn:hover) {
		background: rgba(255, 255, 255, 0.1);
		color: #cdd6f4;
	}

	.markdown-body :global(pre) {
		background: #1e1e2e;
		color: #cdd6f4;
		padding: 0.75rem 1rem;
		overflow-x: auto;
		margin: 0;
		line-height: 1.5;
	}

	.markdown-body :global(a) {
		color: #3b82f6;
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.markdown-body :global(a:hover) {
		color: #2563eb;
	}

	.markdown-body :global(table) {
		width: 100%;
		border-collapse: collapse;
		margin: 0.75rem 0;
		font-size: 0.85rem;
	}

	.markdown-body :global(th),
	.markdown-body :global(td) {
		padding: 0.4rem 0.75rem;
		border: 1px solid #e5e7eb;
		text-align: left;
	}

	.markdown-body :global(th) {
		background: #f9fafb;
		font-weight: 600;
	}

	.markdown-body :global(hr) {
		border: none;
		border-top: 1px solid #e5e7eb;
		margin: 1rem 0;
	}

	.markdown-body :global(strong) {
		font-weight: 700;
	}

	/* highlight.js theme overrides for dark code blocks */
	.markdown-body :global(.hljs-keyword) {
		color: #cba6f7;
	}
	.markdown-body :global(.hljs-string) {
		color: #a6e3a1;
	}
	.markdown-body :global(.hljs-number) {
		color: #fab387;
	}
	.markdown-body :global(.hljs-comment) {
		color: #6c7086;
		font-style: italic;
	}
	.markdown-body :global(.hljs-function) {
		color: #89b4fa;
	}
	.markdown-body :global(.hljs-title) {
		color: #89b4fa;
	}
	.markdown-body :global(.hljs-built_in) {
		color: #f38ba8;
	}
	.markdown-body :global(.hljs-type) {
		color: #f9e2af;
	}
	.markdown-body :global(.hljs-attr) {
		color: #89b4fa;
	}
	.markdown-body :global(.hljs-variable) {
		color: #cdd6f4;
	}
	.markdown-body :global(.hljs-params) {
		color: #fab387;
	}
	.markdown-body :global(.hljs-meta) {
		color: #f38ba8;
	}
	.markdown-body :global(.hljs-literal) {
		color: #fab387;
	}
</style>
