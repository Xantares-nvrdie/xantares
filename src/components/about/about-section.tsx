import * as React from 'react'
import { ArrowUpRight, Briefcase, GraduationCap, MapPin, Mail } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

const EMAIL = 'bintangfajarputra@gmail.com'

const badgeClass =
	'flex size-8 shrink-0 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950 text-purple-300 transition-colors group-hover:border-purple-500/40'
const labelClass = 'font-mono text-xs tracking-[0.09em] text-neutral-400 uppercase'

function Fact({
	icon: Icon,
	label,
	className,
	children
}: {
	icon: LucideIcon
	label: string
	className?: string
	children: React.ReactNode
}) {
	return (
		<div
			className={cn(
				'reveal group rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 transition-colors hover:border-purple-500/40 sm:p-6',
				className
			)}
		>
			<dt className={cn(labelClass, 'flex items-center gap-3')}>
				<span className={badgeClass}>
					<Icon className="size-4" aria-hidden="true" />
				</span>
				{label}
			</dt>
			<dd className="mt-5">{children}</dd>
		</div>
	)
}

/** Section About Me: ringkas, scannable, dan berisi info yang dicari HRD (siapa, cari apa, di mana, kontak). */
function AboutSection({ className, ...props }: React.ComponentProps<'section'>) {
	return (
		<>
			{/* Gelombang penyambung showcase lilac ke section gelap, pasangan dari divider hero. */}
			<div className="relative -mt-px h-16 overflow-hidden bg-[#f3edff] sm:h-24" aria-hidden="true">
				<svg className="absolute inset-0 size-full" viewBox="0 0 1440 120" preserveAspectRatio="none">
					<path
						className="fill-neutral-950"
						d="M0 58C160 18 300 98 480 60c190-40 320 24 500-8 170-30 310 8 460-22V120H0Z"
					/>
				</svg>
			</div>

			<section
				id="about"
				aria-labelledby="about-heading"
				className={cn('relative overflow-hidden bg-neutral-950 pt-10 pb-24 text-white sm:pt-14', className)}
				{...props}
			>
				<div
					className="pointer-events-none absolute top-40 -right-40 size-[28rem] rounded-full bg-purple-700/15 blur-3xl"
					aria-hidden="true"
				/>

				<div className="relative z-10 container mx-auto px-6">
					<p className={cn(labelClass, 'reveal text-purple-300')} aria-hidden="true">
						{'// about me'}
					</p>

					<div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-x-12">
						<h2
							id="about-heading"
							className="reveal font-serif text-[clamp(2.5rem,5vw,4.25rem)] leading-[1.02] text-balance text-white lg:col-span-7"
						>
							Mahasiswa Ilmu Komputer yang membangun web yang{' '}
							<em className="text-purple-300">cepat, rapi, dan aman.</em>
						</h2>

						<p className="reveal text-base leading-relaxed text-neutral-400 sm:text-lg lg:col-span-5">
							Saya <strong className="font-semibold text-white">Bintang Fajar Putra Pamungkas</strong>, mahasiswa
							Ilmu Komputer semester 5 di Universitas Pendidikan Indonesia, Bandung. Saya membangun aplikasi web
							dengan Next.js, TypeScript, Go, dan Elysia, dan sedang mendalami keamanan aplikasi web. Saat ini
							saya mencari <span className="text-white">magang dan proyek freelance</span> di bidang Frontend,
							Fullstack, Backend, atau Data Science.
						</p>
					</div>

					<dl className="mt-14 grid gap-4 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3">
						<Fact
							icon={Briefcase}
							label="Mencari"
							className="border-purple-500/25 bg-gradient-to-br from-purple-950/50 to-neutral-900/40 sm:col-span-2 lg:col-span-1"
						>
							<div className="flex items-center gap-3">
								<span className="relative flex size-3 shrink-0" aria-hidden="true">
									<span className="absolute inline-flex size-full rounded-full bg-green-400 opacity-75 motion-safe:animate-ping" />
									<span className="relative inline-flex size-3 rounded-full bg-green-500" />
								</span>
								<p className="font-serif text-3xl leading-tight text-white sm:text-4xl">Magang dan proyek freelance</p>
							</div>
						</Fact>

						<Fact icon={MapPin} label="Lokasi">
							<p className="text-xl text-white">Bandung</p>
							<p className="mt-1 text-sm text-neutral-400">Siap onsite dan remote</p>
						</Fact>

						<Fact icon={GraduationCap} label="Pendidikan">
							<p className="text-xl text-white">Ilmu Komputer</p>
							<p className="mt-1 text-sm text-neutral-400">Universitas Pendidikan Indonesia, semester 5</p>
						</Fact>
					</dl>

					<a
						href={`mailto:${EMAIL}`}
						className="reveal group mt-4 flex items-center justify-between gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 transition-colors hover:border-purple-500/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400 sm:p-6"
					>
						<span className="flex min-w-0 items-center gap-4">
							<span className={badgeClass}>
								<Mail className="size-4" aria-hidden="true" />
							</span>
							<span className="min-w-0">
								<span className={cn(labelClass, 'block')}>Email</span>
								<span className="mt-1 block text-base text-white [overflow-wrap:anywhere] sm:text-xl">{EMAIL}</span>
							</span>
						</span>
						<span className="hidden size-10 shrink-0 items-center justify-center rounded-full border border-neutral-800 text-neutral-400 transition-colors group-hover:border-purple-400 group-hover:bg-purple-400 group-hover:text-neutral-950 sm:flex">
							<ArrowUpRight
								className="size-5 transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
								aria-hidden="true"
							/>
						</span>
					</a>
				</div>
			</section>
		</>
	)
}

export { AboutSection }
