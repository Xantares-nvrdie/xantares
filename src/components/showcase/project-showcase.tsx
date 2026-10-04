import * as React from 'react'
import { IconArrowUpRight } from '@tabler/icons-react'

import { cn } from '@/lib/utils'

type Project = {
	title: string
	tags: string[]
	href: string
	/** Gradasi placeholder sampai ada screenshot asli — ganti ke <Image> begitu ada aset. */
	gradient: string
	/** Rasio tinggi kartu, dipakai buat variasi tinggi antar kolom (efek masonry). */
	aspect: 'tall' | 'square' | 'wide'
}

const PROJECTS: Project[] = [
	{
		title: 'Personal Portfolio v2',
		tags: ['UI/UX', 'Three.js', 'WebGL'],
		href: '#',
		gradient: 'linear-gradient(155deg, #2b0a4e 0%, #6b1fb3 45%, #c084fc 100%)',
		aspect: 'tall'
	},
	{
		title: 'Secure Auth Service',
		tags: ['Go', 'JWT', 'Backend'],
		href: '#',
		gradient: 'radial-gradient(circle at 35% 30%, #bef264 0%, #4d7c0f 55%, #0a0a0a 100%)',
		aspect: 'square'
	},
	{
		title: 'Campus Event Platform',
		tags: ['Vue', 'Fastify', 'MySQL'],
		href: '#',
		gradient: 'linear-gradient(160deg, #334155 0%, #1e293b 50%, #0f172a 100%)',
		aspect: 'tall'
	},
	{
		title: 'Realtime Chat App',
		tags: ['React', 'WebSocket', 'Frontend'],
		href: '#',
		gradient: 'linear-gradient(145deg, #7c2d12 0%, #c2410c 45%, #fb923c 100%)',
		aspect: 'wide'
	},
	{
		title: 'CTF Writeups & Tools',
		tags: ['Python', 'Web Exploitation'],
		href: '#',
		gradient: 'linear-gradient(160deg, #082f49 0%, #0369a1 50%, #38bdf8 100%)',
		aspect: 'square'
	},
	{
		title: 'Design System Kit',
		tags: ['Figma', 'Design System'],
		href: '#',
		gradient: 'linear-gradient(150deg, #450a0a 0%, #b91c1c 45%, #fca5a5 100%)',
		aspect: 'wide'
	}
]

const ASPECT_CLASS: Record<Project['aspect'], string> = {
	tall: 'aspect-[4/5]',
	square: 'aspect-square',
	wide: 'aspect-[4/3]'
}

/** Satu kolom kartu untuk layout masonry tiga kolom. */
function ProjectColumn({ projects, offsetClass }: { projects: Project[]; offsetClass?: string }) {
	return (
		<div className={cn('flex flex-col gap-10 sm:gap-14', offsetClass)}>
			{projects.map((project) => (
				<a key={project.title} href={project.href} className="group flex flex-col gap-4">
					<div
						className={cn(
							'relative overflow-hidden rounded-2xl border border-white/10 transition-transform duration-500 ease-out group-hover:-translate-y-1.5',
							ASPECT_CLASS[project.aspect]
						)}
						style={{ backgroundImage: project.gradient }}
					>
						<div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />
						<span className="absolute right-4 bottom-4 flex size-10 items-center justify-center rounded-full bg-white/0 text-white/0 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/90 group-hover:text-black">
							<IconArrowUpRight className="size-5" />
						</span>
					</div>

					<div className="flex flex-col gap-1.5">
						<span className="font-mono text-[11px] tracking-[0.14em] text-neutral-500 uppercase">
							{project.tags.join(' / ')}
						</span>
						<span className="font-serif text-2xl text-neutral-200 transition-colors duration-300 group-hover:text-white sm:text-[28px]">
							{project.title}
						</span>
					</div>
				</a>
			))}
		</div>
	)
}

/**
 * Showcase project ala https://emotion-agency.com/: headline editorial besar
 * (sans + italic serif berselang) di atas, lalu grid 3-kolom masonry dengan
 * kolom tengah digeser turun biar nggak kaku kayak grid kartu biasa.
 */
function ProjectShowcase({ className, ...props }: React.ComponentProps<'section'>) {
	const columns = [
		[PROJECTS[0], PROJECTS[3]],
		[PROJECTS[1], PROJECTS[4]],
		[PROJECTS[2], PROJECTS[5]]
	]

	return (
		<section className={cn('relative w-full overflow-hidden bg-black py-28 sm:py-36', className)} {...props}>
			<div className="relative z-10 container mx-auto px-6">
				<div className="mb-20 flex flex-wrap items-start justify-between gap-x-6 gap-y-6 sm:mb-28">
					<h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">SOME</h2>

					<div className="flex flex-col gap-3">
						<h2 className="font-serif text-5xl text-neutral-100 italic sm:text-6xl lg:text-7xl">
							Of our
						</h2>
						<p className="max-w-[260px] font-mono text-[11px] leading-relaxed tracking-wide text-neutral-500 uppercase">
							A selection of projects where design, technology, and strategy come together
						</p>
					</div>

					<h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
						PROJECTS
					</h2>
				</div>

				<div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
					<ProjectColumn projects={columns[0]} />
					<ProjectColumn projects={columns[1]} offsetClass="sm:pt-24" />
					<ProjectColumn projects={columns[2]} />
				</div>
			</div>
		</section>
	)
}

export { ProjectShowcase }
