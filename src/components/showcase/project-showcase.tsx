'use client'

import * as React from 'react'
import Image from 'next/image'
import { IconArrowUpRight } from '@tabler/icons-react'

import { MetallicPaint } from '@/components/ui/metallic-paint'
import { cn } from '@/lib/utils'

type Project = {
	title: string
	tags: string[]
	href: string
	/** Warna latar cover. */
	color: string
	/** Isi cover (logo atau visual proyek). Kosong = cover warna solid sebagai placeholder. */
	cover?: React.ReactNode
	layout: string
}

/**
 * Posisi setiap karya sengaja ditentukan sendiri, bukan dibagi rata per kolom.
 * Tiga karya teratas sudah asli; sisanya masih placeholder berwarna solid.
 */
const PROJECTS: Project[] = [
	{
		title: 'TenderSeal',
		tags: ['Fullstack', 'Blockchain', 'Cryptography'],
		href: 'https://tendersealkupie.vercel.app/',
		color: '#0a0a0a',
		cover: (
			<>
				{/* Glow emerald, warna aksen brand TenderSeal */}
				<div
					className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_45%,rgb(16_185_129/0.28),transparent_70%)]"
					aria-hidden="true"
				/>
				<div className="relative size-full">
					<Image
						src="/projects/tenderseal.png"
						alt=""
						fill
						sizes="(min-width: 768px) 25vw, 70vw"
						className="object-contain invert"
					/>
				</div>
			</>
		),
		layout: 'md:col-span-3 md:col-start-1 md:row-span-5 md:row-start-1'
	},
	{
		title: 'Inklusa',
		tags: ['Fullstack', 'EdTech'],
		href: 'https://inklusa-delta.vercel.app/',
		color: '#dff1ed',
		cover: (
			<div className="relative size-full">
				<Image
					src="/projects/inklusa.png"
					alt=""
					fill
					sizes="(min-width: 768px) 17vw, 70vw"
					className="object-contain"
				/>
			</div>
		),
		layout: 'md:col-span-2 md:col-start-6 md:row-span-3 md:row-start-4'
	},
	{
		title: 'Lost & Found',
		tags: ['Fullstack', 'Next.js', 'Elysia'],
		href: 'https://github.com/Xantares-nvrdie/lost-and-found',
		color: '#120b1d',
		// Logo cairan logam yang bergerak, parameternya sama dengan hero di repo OSTRICT.
		// (tintColor di sana "#562ba4ff" yang 8 digit, sehingga efektifnya putih.)
		cover: (
			<MetallicPaint
				imageSrc="/projects/lost-and-found.png"
				speed={0.25}
				scale={2.5}
				refraction={1}
				liquid={0.6}
				chromaticSpread={2}
				angle={10}
				brightness={1}
				contrast={1.1}
				tintColor="#ffffff"
				fallbackClassName="invert"
				// Gambar logonya punya ruang kosong di sekeliling, jadi canvas dibuat lebih lebar dari area cover.
				className="w-[130%] max-w-[28rem] shrink-0"
			/>
		),
		layout: 'md:col-span-3 md:col-start-10 md:row-span-5 md:row-start-1'
	},
	{
		title: 'Relive by Coco',
		tags: ['UI/UX', 'Frontend', 'E-commerce'],
		href: '#',
		color: '#b94223',
		layout: 'md:col-span-3 md:col-start-1 md:row-span-4 md:row-start-8'
	},
	{
		title: 'Secure Auth Service',
		tags: ['Go', 'JWT', 'Backend'],
		href: '#',
		color: '#145f88',
		layout: 'md:col-span-3 md:col-start-5 md:row-span-4 md:row-start-10'
	},
	{
		title: 'Design System Kit',
		tags: ['Figma', 'Design System'],
		href: '#',
		color: '#9e2334',
		layout: 'md:col-span-2 md:col-start-10 md:row-span-3 md:row-start-8'
	}
]

function ProjectCard({ project }: { project: Project }) {
	const handlePointerMove = (event: React.PointerEvent<HTMLAnchorElement>) => {
		const bounds = event.currentTarget.getBoundingClientRect()
		event.currentTarget.style.setProperty('--card-x', `${event.clientX - bounds.left}px`)
		event.currentTarget.style.setProperty('--card-y', `${event.clientY - bounds.top}px`)
	}

	const external = project.href.startsWith('http')

	return (
		<a
			href={project.href}
			target={external ? '_blank' : undefined}
			rel={external ? 'noopener noreferrer' : undefined}
			onPointerMove={handlePointerMove}
			className={cn('project-card group flex h-full flex-col gap-3', project.layout)}
		>
			<div
				className="project-cover relative aspect-[4/5] min-h-[200px] flex-1 overflow-hidden rounded-[22px] md:aspect-auto"
				style={{ backgroundColor: project.color }}
			>
				{project.cover && (
					<div className="absolute inset-0 z-[1] flex items-center justify-center p-[16%]">
						{project.cover}
					</div>
				)}
				<div className="project-cover-grain" aria-hidden="true" />
				<div className="project-cover-shine" aria-hidden="true" />
				<span className="project-card-arrow absolute right-4 bottom-4 flex size-10 items-center justify-center rounded-full bg-[#f6f0ff]/90 text-[#281340]">
					<IconArrowUpRight className="size-5" />
				</span>
			</div>

			<div className="flex flex-col gap-1 px-0.5">
				<span className="font-mono text-[10px] leading-none tracking-[0.09em] text-[#523d69] uppercase">
					{project.tags.join(' / ')}
				</span>
				<span className="font-serif text-[25px] leading-none text-[#2b1741] sm:text-[28px]">
					{project.title}
				</span>
			</div>
		</a>
	)
}

/** Riak tepi section merespons scroll tanpa mengubah posisi atau bentuk cursor. */
function useWaterRipple() {
	const sectionRef = React.useRef<HTMLElement>(null)

	React.useEffect(() => {
		const section = sectionRef.current
		if (!section) return

		let fadeTimeout: number | undefined
		const flashWater = () => {
			const rect = section.getBoundingClientRect()
			const visible = Math.min(window.innerHeight, rect.bottom) - Math.max(0, rect.top)
			const exposure = Math.max(0, Math.min(1, visible / Math.min(window.innerHeight, rect.height)))
			section.style.setProperty('--water-strength', String(0.2 + exposure * 0.55))
			if (fadeTimeout) window.clearTimeout(fadeTimeout)
			fadeTimeout = window.setTimeout(() => section.style.setProperty('--water-strength', '0'), 180)
		}

		section.style.setProperty('--water-strength', '0')
		window.addEventListener('scroll', flashWater, { passive: true })
		return () => {
			window.removeEventListener('scroll', flashWater)
			if (fadeTimeout) window.clearTimeout(fadeTimeout)
		}
	}, [])

	return React.useCallback((node: HTMLElement | null) => {
		sectionRef.current = node
	}, [])
}

/** Editorial project composition inspired by Emotion Agency's deliberately uneven art direction. */
function ProjectShowcase({ className, ...props }: React.ComponentProps<'section'>) {
	const setSectionNode = useWaterRipple()

	return (
		<section
			ref={setSectionNode}
			className={cn('project-showcase relative isolate overflow-hidden py-24 sm:py-32 lg:py-40', className)}
			{...props}
		>
			{/* Riak tipis di batas atas/bawah hanya muncul saat section ini sedang di-scroll. */}
			<svg
				className="water-surface water-surface--top"
				viewBox="0 0 1440 180"
				preserveAspectRatio="none"
				aria-hidden="true"
			>
				<defs>
					<filter id="showcase-water-ripple" x="-10%" y="-60%" width="120%" height="220%">
						<feTurbulence
							type="turbulence"
							baseFrequency="0.008 0.045"
							numOctaves="2"
							seed="7"
							result="noise"
						>
							<animate
								attributeName="baseFrequency"
								dur="7s"
								values="0.008 0.045;0.014 0.025;0.008 0.045"
								repeatCount="indefinite"
							/>
						</feTurbulence>
						<feDisplacementMap
							in="SourceGraphic"
							in2="noise"
							scale="18"
							xChannelSelector="R"
							yChannelSelector="G"
						/>
					</filter>
				</defs>
				<g filter="url(#showcase-water-ripple)">
					<path d="M-80 92 C180 34 326 150 548 90 S956 35 1166 92 S1358 145 1520 72" />
					<path d="M-80 126 C142 80 370 178 590 119 S940 76 1160 126 S1370 177 1520 106" />
					<path d="M-80 158 C170 109 344 197 563 151 S950 104 1180 158 S1375 197 1520 143" />
				</g>
			</svg>
			<svg
				className="water-surface water-surface--bottom"
				viewBox="0 0 1440 180"
				preserveAspectRatio="none"
				aria-hidden="true"
			>
				<g filter="url(#showcase-water-ripple)">
					<path d="M-80 25 C180 83 326 -33 548 27 S956 82 1166 25 S1358 -28 1520 45" />
					<path d="M-80 59 C142 105 370 7 590 66 S940 109 1160 59 S1370 8 1520 79" />
					<path d="M-80 93 C170 142 344 54 563 100 S950 147 1180 93 S1375 54 1520 108" />
				</g>
			</svg>

			<div className="relative z-10 container mx-auto px-6">
				<header className="mb-18 grid grid-cols-1 gap-y-5 sm:mb-24 sm:grid-cols-12 sm:items-start">
					<h2 className="font-serif sm:col-span-3 text-[clamp(3rem,6vw,6rem)] leading-[0.78] text-[#2b1741]">
						SOME
					</h2>

					<div className="sm:col-span-4 sm:col-start-4">
						<h2 className="font-serif text-[clamp(3.5rem,6.2vw,6.8rem)] leading-[0.68] text-[#2b1741] italic">
							Of our
						</h2>
						<p className="mt-7 max-w-[255px] font-mono text-[10px] leading-[1.15] tracking-[0.09em] text-[#523d69] uppercase">
							A selection of projects where design, technology, and strategy come together
						</p>
					</div>

					<h2 className="font-serif sm:col-span-4 sm:col-start-9 sm:text-right text-[clamp(3rem,6vw,6rem)] leading-[0.78] text-[#2b1741]">
						PROJECTS
					</h2>
				</header>

				<div className="relative grid grid-cols-1 gap-x-6 gap-y-11 md:auto-rows-[64px] md:grid-cols-12 md:gap-y-8 lg:auto-rows-[72px]">
					{PROJECTS.map((project) => (
						<ProjectCard key={project.title} project={project} />
					))}
				</div>
			</div>
		</section>
	)
}

export { ProjectShowcase }
