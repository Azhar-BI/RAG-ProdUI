<script lang="ts">
	let { data } = $props();
	let mobileMenuOpen = $state(false);

	const services = [
		{
			title: 'Web Development',
			description:
				'Custom websites and web applications built with modern frameworks for performance, scalability, and seamless user experience.',
			icon: 'M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418',
			gradient: 'from-blue-500 to-cyan-400'
		},
		{
			title: 'Cloud Solutions',
			description:
				'Scalable cloud infrastructure and migration services to keep your business agile, secure, and always available.',
			icon: 'M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z',
			gradient: 'from-violet-500 to-purple-400'
		},
		{
			title: 'Cybersecurity',
			description:
				'Comprehensive security audits, penetration testing, and compliance solutions to protect your digital assets.',
			icon: 'M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z',
			gradient: 'from-emerald-500 to-teal-400'
		},
		{
			title: 'Data Analytics',
			description:
				'Turn raw data into actionable insights with our advanced analytics, dashboards, and business intelligence tools.',
			icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z',
			gradient: 'from-amber-500 to-orange-400'
		},
		{
			title: 'Mobile Apps',
			description:
				'Native and cross-platform mobile applications designed for performance, usability, and engagement.',
			icon: 'M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-6 18.75h6',
			gradient: 'from-pink-500 to-rose-400'
		},
		{
			title: 'IT Consulting',
			description:
				'Strategic technology consulting to align your IT infrastructure with business goals and drive digital transformation.',
			icon: 'M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155',
			gradient: 'from-indigo-500 to-blue-400'
		}
	];

	const stats = [
		{ value: '200+', label: 'Projects Delivered' },
		{ value: '50+', label: 'Team Members' },
		{ value: '99.9%', label: 'Uptime Guarantee' },
		{ value: '24/7', label: 'Support Available' }
	];

	const testimonials = [
		{
			name: 'Sarah Mitchell',
			role: 'CTO, FinEdge',
			quote:
				'AuthFlow transformed our infrastructure. Their cloud solutions reduced our operational costs by 40% while improving reliability.',
			avatar: 'SM'
		},
		{
			name: 'James Rodriguez',
			role: 'Founder, ShopNova',
			quote:
				'The web application they built handles millions of transactions seamlessly. Their team is technically brilliant and a joy to work with.',
			avatar: 'JR'
		},
		{
			name: 'Emily Chen',
			role: 'VP Engineering, MedSync',
			quote:
				'Their cybersecurity audit uncovered critical vulnerabilities we had missed. We now have complete confidence in our security posture.',
			avatar: 'EC'
		}
	];
</script>

<div class="min-h-screen">
	<!-- Navbar -->
	<nav class="fixed top-0 z-50 w-full bg-white shadow-sm">
		<div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
			<a href="/" class="text-xl font-bold tracking-tight">
				<span class="text-slate-900">Auth</span><span class="text-lime-500">Flow</span>
			</a>
			<div class="hidden items-center gap-8 text-sm font-medium md:flex">
				<a href="#services" class="text-slate-600 transition hover:text-slate-900">Services</a>
				<a href="#about" class="text-slate-600 transition hover:text-slate-900">About</a>
				<a href="#testimonials" class="text-slate-600 transition hover:text-slate-900"
					>Testimonials</a
				>
				<a href="#contact" class="text-slate-600 transition hover:text-slate-900">Contact</a>
			</div>
			<div class="hidden items-center gap-3 md:flex">
				{#if data.user}
					<a
						href="/dashboard"
						class="text-sm font-medium text-slate-600 transition hover:text-slate-900">Dashboard</a
					>
					<form method="POST" action="/logout">
						<button
							type="submit"
							class="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
							>Logout</button
						>
					</form>
				{:else}
					<a
						href="/login"
						class="text-sm font-medium text-slate-600 transition hover:text-slate-900">Login</a
					>
					<a
						href="/register"
						class="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
						>Get Started</a
					>
				{/if}
			</div>

			<button
				class="flex h-10 w-10 flex-col items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 md:hidden"
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
	</nav>

	<!-- Mobile menu -->
	{#if mobileMenuOpen}
		<div class="fixed inset-0 z-40 md:hidden">
			<button
				class="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onclick={() => (mobileMenuOpen = false)}
				aria-label="Close menu"
			></button>
			<div class="absolute top-0 right-0 flex h-full w-72 flex-col bg-white shadow-2xl">
				<div class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
					<span class="text-lg font-bold">
						<span class="text-slate-900">Auth</span><span class="text-lime-500">Flow</span>
					</span>
					<button
						class="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100"
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
							><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg
						>
					</button>
				</div>
				<nav class="flex flex-col gap-1 px-6 py-6">
					<a
						href="#services"
						class="rounded-xl px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
						onclick={() => (mobileMenuOpen = false)}>Services</a
					>
					<a
						href="#about"
						class="rounded-xl px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
						onclick={() => (mobileMenuOpen = false)}>About</a
					>
					<a
						href="#testimonials"
						class="rounded-xl px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
						onclick={() => (mobileMenuOpen = false)}>Testimonials</a
					>
					<a
						href="#contact"
						class="rounded-xl px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
						onclick={() => (mobileMenuOpen = false)}>Contact</a
					>
				</nav>
				<div class="mt-auto flex flex-col gap-3 px-6 pb-8">
					{#if data.user}
						<a
							href="/dashboard"
							class="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
							>Dashboard</a
						>
						<form method="POST" action="/logout">
							<button
								type="submit"
								class="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
								>Logout</button
							>
						</form>
					{:else}
						<a
							href="/login"
							class="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
							>Login</a
						>
						<a
							href="/register"
							class="rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-slate-800"
							>Get Started</a
						>
					{/if}
				</div>
			</div>
		</div>
	{/if}

	<!-- Hero Section -->
	<section class="relative flex min-h-screen items-center overflow-hidden bg-slate-900 pt-20">
		<!-- Subtle gradient orbs -->
		<div class="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-lime-500/10 blur-3xl"></div>
		<div
			class="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl"
		></div>

		<div class="relative z-10 mx-auto max-w-6xl px-6 py-20">
			<div class="grid items-center gap-12 md:grid-cols-2">
				<div>
					<div
						class="mb-6 inline-flex items-center gap-2 rounded-full border border-lime-500/20 bg-lime-500/10 px-4 py-1.5 text-xs font-semibold text-lime-400"
					>
						<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-400"></span>
						Trusted by 200+ Companies
					</div>
					<h1 class="text-4xl leading-tight font-bold text-white md:text-5xl lg:text-6xl">
						Technology Solutions That
						<span class="text-lime-400">Drive Growth</span>
					</h1>
					<p class="mt-6 max-w-lg text-base leading-relaxed text-slate-400 md:text-lg">
						We design, build, and scale digital products and infrastructure that help businesses
						thrive in the modern world.
					</p>
					<div class="mt-8 flex flex-wrap gap-4">
						<a
							href="/register"
							class="rounded-xl bg-lime-500 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-lime-500/25 transition hover:bg-lime-400"
						>
							Start a Project
						</a>
						<a
							href="#services"
							class="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
						>
							Explore Services
						</a>
					</div>
				</div>
				<div class="hidden justify-center md:flex">
					<div class="relative h-80 w-80">
						<div class="absolute inset-0 rotate-6 rounded-3xl bg-lime-500/20 blur-sm"></div>
						<div
							class="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-3xl border border-white/10 bg-slate-800/80 p-8 shadow-2xl backdrop-blur-sm"
						>
							<div
								class="flex h-16 w-16 items-center justify-center rounded-2xl bg-lime-500 shadow-lg shadow-lime-500/30"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1"
									stroke="currentColor"
									class="h-8 w-8 text-slate-900"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
									/>
								</svg>
							</div>
							<p class="text-2xl font-bold text-white">AuthFlow</p>
							<p class="text-center text-sm text-slate-400">
								Enterprise-grade solutions for modern businesses
							</p>
							<div class="mt-2 flex gap-2">
								<span class="h-3 w-3 rounded-full bg-lime-500"></span>
								<span class="h-3 w-3 rounded-full bg-lime-500/50"></span>
								<span class="h-3 w-3 rounded-full bg-lime-500/30"></span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Stats Bar -->
	<section class="bg-slate-900 py-12 text-white">
		<div class="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 text-center md:grid-cols-4">
			{#each stats as stat}
				<div>
					<p class="text-3xl font-bold md:text-4xl">{stat.value}</p>
					<p class="mt-1 text-sm text-slate-400">{stat.label}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- Services Section -->
	<section id="services" class="bg-white py-24">
		<div class="mx-auto max-w-6xl px-6">
			<div class="mb-16 text-center">
				<p class="mb-2 text-sm font-semibold tracking-wide text-lime-600 uppercase">What We Do</p>
				<h2 class="text-4xl font-bold text-slate-900">Our Services</h2>
				<p class="mx-auto mt-4 max-w-2xl text-slate-500">
					We deliver end-to-end technology services tailored to your business needs, helping you
					innovate faster and operate smarter.
				</p>
			</div>
			<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each services as service}
					<div
						class="group rounded-2xl border border-slate-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-lime-200 hover:shadow-xl hover:shadow-lime-500/5"
					>
						<div
							class="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br {service.gradient} shadow-lg"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="white"
								class="h-6 w-6"
							>
								<path stroke-linecap="round" stroke-linejoin="round" d={service.icon} />
							</svg>
						</div>
						<h3 class="mb-3 text-xl font-semibold text-slate-900">{service.title}</h3>
						<p class="text-sm leading-relaxed text-slate-500">{service.description}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- About Section -->
	<section id="about" class="bg-slate-50 py-24">
		<div class="mx-auto max-w-6xl px-6">
			<div class="grid items-center gap-16 md:grid-cols-2">
				<div>
					<p class="mb-2 text-sm font-semibold tracking-wide text-lime-600 uppercase">About Us</p>
					<h2 class="mb-6 text-4xl font-bold text-slate-900">
						Built on Trust, Driven by Innovation
					</h2>
					<p class="mb-4 leading-relaxed text-slate-600">
						AuthFlow is a full-service technology company helping startups and enterprises build,
						scale, and secure their digital products. With over a decade of experience, our team of
						engineers, designers, and strategists delivers solutions that make a real impact.
					</p>
					<p class="mb-8 leading-relaxed text-slate-600">
						We believe in transparent partnerships, clean code, and measurable results. Every
						project starts with understanding your goals and ends with exceeding your expectations.
					</p>
					<div class="flex flex-wrap gap-4">
						<div class="rounded-xl border border-slate-200 bg-white px-5 py-3">
							<p class="text-2xl font-bold text-slate-900">10+</p>
							<p class="text-xs text-slate-500">Years in Business</p>
						</div>
						<div class="rounded-xl border border-slate-200 bg-white px-5 py-3">
							<p class="text-2xl font-bold text-slate-900">15+</p>
							<p class="text-xs text-slate-500">Industries Served</p>
						</div>
						<div class="rounded-xl border border-slate-200 bg-white px-5 py-3">
							<p class="text-2xl font-bold text-slate-900">98%</p>
							<p class="text-xs text-slate-500">Client Retention</p>
						</div>
					</div>
				</div>
				<div class="rounded-2xl border border-slate-200 bg-white p-10 shadow-xl">
					<h3 class="mb-6 text-lg font-semibold text-slate-900">Why Choose AuthFlow?</h3>
					<ul class="space-y-4">
						{#each ['Agile development with weekly progress demos and transparent communication', 'Security-first approach with SOC 2 compliance and regular audits', 'Scalable architecture designed for growth from day one', 'Dedicated support team with 24/7 monitoring and rapid incident response'] as item}
							<li class="flex items-start gap-3">
								<span
									class="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-lime-500"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="2.5"
										stroke="white"
										class="h-3 w-3"
										><path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="m4.5 12.75 6 6 9-13.5"
										/></svg
									>
								</span>
								<p class="text-sm text-slate-600">{item}</p>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	</section>

	<!-- Testimonials Section -->
	<section id="testimonials" class="bg-white py-24">
		<div class="mx-auto max-w-6xl px-6">
			<div class="mb-16 text-center">
				<p class="mb-2 text-sm font-semibold tracking-wide text-lime-600 uppercase">Testimonials</p>
				<h2 class="text-4xl font-bold text-slate-900">What Our Clients Say</h2>
			</div>
			<div class="grid gap-8 md:grid-cols-3">
				{#each testimonials as testimonial}
					<div
						class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
					>
						<div class="mb-4 flex gap-1">
							{#each Array(5) as _}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									class="h-4 w-4 text-amber-400"
								>
									<path
										fill-rule="evenodd"
										d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
										clip-rule="evenodd"
									/>
								</svg>
							{/each}
						</div>
						<p class="mb-6 text-sm leading-relaxed text-slate-600">"{testimonial.quote}"</p>
						<div class="flex items-center gap-3">
							<div
								class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white"
							>
								{testimonial.avatar}
							</div>
							<div>
								<p class="text-sm font-semibold text-slate-900">{testimonial.name}</p>
								<p class="text-xs text-slate-500">{testimonial.role}</p>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section id="contact" class="relative overflow-hidden bg-slate-900 py-24 text-white">
		<!-- Subtle lime glow orbs -->
		<div
			class="absolute top-1/2 left-1/4 h-64 w-64 -translate-y-1/2 rounded-full bg-lime-500/10 blur-3xl"
		></div>
		<div
			class="absolute top-1/2 right-1/4 h-64 w-64 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl"
		></div>

		<div class="relative z-10 mx-auto max-w-4xl px-6 text-center">
			<h2 class="mb-4 text-4xl font-bold">Ready to Build Something Great?</h2>
			<p class="mx-auto mb-10 max-w-2xl text-lg text-slate-400">
				Let's discuss how AuthFlow can help you achieve your technology goals. Get started with a
				free consultation today.
			</p>
			<div class="flex flex-wrap justify-center gap-4">
				<a
					href="/register"
					class="rounded-xl bg-lime-500 px-8 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-lime-500/25 transition hover:bg-lime-400"
				>
					Get Started Free
				</a>
				<a
					href="mailto:hello@authflow.dev"
					class="rounded-xl border border-white/10 bg-white/5 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
				>
					Contact Sales
				</a>
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="bg-slate-950 py-16 text-slate-400">
		<div class="mx-auto max-w-6xl px-6">
			<div class="mb-12 grid grid-cols-2 gap-10 md:grid-cols-4">
				<div class="col-span-2 md:col-span-1">
					<p class="mb-4 text-lg font-bold">
						<span class="text-white">Auth</span><span class="text-lime-500">Flow</span>
					</p>
					<p class="text-sm leading-relaxed">
						Enterprise-grade technology solutions for businesses that want to move fast and stay
						secure.
					</p>
				</div>
				<div>
					<p class="mb-4 text-sm font-semibold text-white">Services</p>
					<ul class="space-y-2 text-sm">
						<li><a href="#services" class="transition hover:text-lime-400">Web Development</a></li>
						<li><a href="#services" class="transition hover:text-lime-400">Cloud Solutions</a></li>
						<li><a href="#services" class="transition hover:text-lime-400">Cybersecurity</a></li>
						<li><a href="#services" class="transition hover:text-lime-400">Data Analytics</a></li>
					</ul>
				</div>
				<div>
					<p class="mb-4 text-sm font-semibold text-white">Company</p>
					<ul class="space-y-2 text-sm">
						<li><a href="#about" class="transition hover:text-lime-400">About</a></li>
						<li><a href="#testimonials" class="transition hover:text-lime-400">Testimonials</a></li>
						<li><a href="#contact" class="transition hover:text-lime-400">Contact</a></li>
						<li><a href="/login" class="transition hover:text-lime-400">Client Portal</a></li>
					</ul>
				</div>
				<div>
					<p class="mb-4 text-sm font-semibold text-white">Connect</p>
					<ul class="space-y-2 text-sm">
						<li>
							<a href="mailto:hello@authflow.dev" class="transition hover:text-lime-400"
								>hello@authflow.dev</a
							>
						</li>
						<li><span class="cursor-pointer transition hover:text-lime-400">LinkedIn</span></li>
						<li><span class="cursor-pointer transition hover:text-lime-400">GitHub</span></li>
						<li><span class="cursor-pointer transition hover:text-lime-400">Twitter</span></li>
					</ul>
				</div>
			</div>
			<div
				class="flex flex-col items-center justify-between border-t border-white/10 pt-8 text-xs md:flex-row"
			>
				<p>&copy; 2026 AuthFlow. All rights reserved.</p>
				<div class="mt-4 flex gap-6 md:mt-0">
					<span class="cursor-pointer transition hover:text-lime-400">Privacy Policy</span>
					<span class="cursor-pointer transition hover:text-lime-400">Terms of Service</span>
				</div>
			</div>
		</div>
	</footer>
</div>
