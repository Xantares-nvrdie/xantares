import * as React from 'react'

import { cn } from '@/lib/utils'

const labelClass = 'font-mono text-xs tracking-[0.09em] text-neutral-400 uppercase'

/** Section About Me: ringkas dan scannable, menjelaskan siapa saya dan bidang yang saya tekuni. */
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
							Mahasiswa Ilmu Komputer yang menjelajahi web, data, dan{' '}
							<em className="text-purple-300">machine learning.</em>
						</h2>

						<p className="reveal text-base leading-relaxed text-neutral-400 sm:text-lg lg:col-span-5">
							Saya <strong className="font-semibold text-white">Bintang Fajar Putra Pamungkas</strong>,
							mahasiswa Ilmu Komputer semester 5 di Universitas Pendidikan Indonesia, Bandung. Di sisi
							web, saya membangun aplikasi dengan Next.js, TypeScript, Go, dan Elysia serta mendalami
							keamanan aplikasi web. Di sisi data, saya tertarik pada{' '}
							<span className="text-white">data science dan machine learning</span>, yaitu mengolah data
							menjadi wawasan dan model yang berguna.
						</p>
					</div>
				</div>
			</section>
		</>
	)
}

export { AboutSection }
