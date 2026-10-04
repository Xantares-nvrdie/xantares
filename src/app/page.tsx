import { CharacterViewer } from '@/components/3d/character-viewer'
import { BentoCard, BentoGrid } from '@/components/bento/bento-grid'
import { ConnectCard } from '@/components/bento/connect-card'
import { GreetingCard } from '@/components/bento/greeting-card'
import { QuoteCard } from '@/components/bento/quote-card'
import { StatusCard } from '@/components/bento/status-card'
import { TechStackCard } from '@/components/bento/tech-stack-card'
import { TerminalCard } from '@/components/bento/terminal-card'
import Silk from '@/components/Silk'
import { ProjectShowcase } from '@/components/showcase/project-showcase'
import { WindowFrame } from '@/components/ui/window-frame'
import { Code2, Globe, Terminal } from 'lucide-react'

export default function Home() {
	return (
		<main className="relative min-h-screen w-full bg-black text-white">
			{/* SECTION 1: Hero Bento Grid, dipaskan dalam satu viewport (h-screen) dan digeser ke atas */}
			<section className="relative flex h-screen w-full flex-col overflow-hidden pt-20 pb-6 sm:pt-24 sm:pb-8">
				<div className="pointer-events-none absolute inset-0 z-0">
					<Silk speed={4} scale={1} color="#441f62" noiseIntensity={4.1} rotation={0} />
				</div>
				{/* Fade halus di tepi bawah doang, biar transisi ke section showcase mulus. */}
				<div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-40 bg-gradient-to-b from-transparent to-black" />

				<div className="relative z-10 container mx-auto flex w-full flex-1 flex-col justify-center px-4 sm:px-8">
					<WindowFrame>
						<div className="p-3 sm:p-4">
							<BentoGrid className="md:auto-rows-[130px] lg:auto-rows-[150px]">
								{/* Tulisan sapaan + nama, digedein jadi tile utama */}
								<BentoCard colSpan={2} rowSpan={2} className="p-0">
									<GreetingCard className="size-full border-none" />
								</BentoCard>

								{/* Karakter 3D interaktif */}
								<BentoCard colSpan={2} rowSpan={2} className="p-0">
									<span className="absolute top-4 left-5 z-10 font-mono text-xs text-neutral-500">
										{'// gerakin kursor, dia nengok 👀'}
									</span>
									<CharacterViewer className="size-full" />
								</BentoCard>

								{/* Terminal interaktif: coba ketik whoami, skills, dll */}
								<BentoCard colSpan={2} rowSpan={2} className="p-0">
									<TerminalCard className="size-full border-none" />
								</BentoCard>

								<BentoCard>
									<TechStackCard className="size-full border-none" />
								</BentoCard>

								<BentoCard>
									<StatusCard className="size-full border-none" />
								</BentoCard>

								<BentoCard>
									<ConnectCard className="size-full border-none" />
								</BentoCard>

								<BentoCard>
									<QuoteCard className="size-full border-none" />
								</BentoCard>
							</BentoGrid>
						</div>
					</WindowFrame>
				</div>
			</section>

			{/* Fluid divider: jembatani hero gelap ke showcase lilac dengan gelombang yang nyata. */}
			<div className="relative -mt-px h-28 overflow-hidden bg-black sm:h-36" aria-hidden="true">
				<svg className="absolute inset-0 size-full" viewBox="0 0 1440 180" preserveAspectRatio="none">
					<path
						fill="#f3edff"
						d="M0 82C154 35 294 123 478 78c187-46 311 10 482-26 178-37 306-70 480 7v121H0V82Z"
					/>
					<path
						d="M0 82C154 35 294 123 478 78c187-46 311 10 482-26 178-37 306-70 480 7"
						fill="none"
						stroke="rgba(255,255,255,0.34)"
						strokeWidth="1.5"
					/>
				</svg>
			</div>

			{/* SECTION 2: Project Showcase (ala emotion-agency.com) */}
			<ProjectShowcase />

			{/* SECTION 3: Profile / About Me */}
			<section className="relative w-full border-t border-neutral-800 bg-neutral-950 py-24">
				<div className="container mx-auto px-6">
					<div className="grid gap-12 lg:grid-cols-2 lg:items-start">
						{/* Kolom Kiri: Teks Pengantar */}
						<div className="space-y-6">
							<h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">About Me</h2>
							<p className="text-lg leading-relaxed text-neutral-400">
								Saya adalah mahasiswa Ilmu Komputer semester 2 di UPI yang memiliki ketertarikan
								mendalam pada
								<span className="text-white"> Software Engineering</span> dan{' '}
								<span className="text-white">Cybersecurity</span>.
							</p>
							<p className="text-base leading-relaxed text-neutral-500">
								Saat ini fokus mendalami ekosistem JavaScript/TypeScript (Next.js, Vue, Fastify) serta
								eksplorasi bahasa Go dan konsep Low-level programming dengan C/C++.
							</p>
						</div>

						{/* Kolom Kanan: Cards / Stats */}
						<div className="grid gap-4 sm:grid-cols-2">
							{/* Card 1 */}
							<div className="group rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 transition hover:border-neutral-600 hover:bg-neutral-900">
								<Code2 className="mb-4 h-8 w-8 text-blue-500" />
								<h3 className="mb-2 font-semibold text-white">Frontend</h3>
								<p className="text-sm text-neutral-400">
									Next.js, React, Vue, Tailwind CSS & Animation
								</p>
							</div>

							{/* Card 2 */}
							<div className="group rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 transition hover:border-neutral-600 hover:bg-neutral-900">
								<Terminal className="mb-4 h-8 w-8 text-purple-500" />
								<h3 className="mb-2 font-semibold text-white">Backend</h3>
								<p className="text-sm text-neutral-400">Fastify, Go, PHP, Database Design & API</p>
							</div>

							{/* Card 3 (Full Width di mobile) */}
							<div className="group rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 transition hover:border-neutral-600 hover:bg-neutral-900 sm:col-span-2">
								<Globe className="mb-4 h-8 w-8 text-emerald-500" />
								<h3 className="mb-2 font-semibold text-white">Current Focus</h3>
								<p className="text-sm text-neutral-400">
									Mempelajari arsitektur sistem yang scalable dan keamanan aplikasi web (Web
									Exploitation).
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>
		</main>
	)
}
