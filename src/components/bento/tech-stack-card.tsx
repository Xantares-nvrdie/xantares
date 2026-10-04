import * as React from 'react'

import { cn } from '@/lib/utils'
import {
	IconBrandNextjs,
	IconBrandReact,
	IconBrandVue,
	IconBrandTailwind,
	IconBrandTypescript,
	IconBrandGolang,
	IconBrandPhp,
	IconBrandGit
} from '@tabler/icons-react'

const STACK = [
	{ name: 'Next.js', icon: IconBrandNextjs },
	{ name: 'React', icon: IconBrandReact },
	{ name: 'Vue', icon: IconBrandVue },
	{ name: 'Tailwind', icon: IconBrandTailwind },
	{ name: 'TypeScript', icon: IconBrandTypescript },
	{ name: 'Go', icon: IconBrandGolang },
	{ name: 'PHP', icon: IconBrandPhp },
	{ name: 'Git', icon: IconBrandGit }
]

function TechStackCard({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn(
				'flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5',
				className
			)}
			{...props}
		>
			<span className="font-mono text-xs text-neutral-500">{'// tech stack'}</span>

			<div className="grid grid-cols-4 gap-3 py-2">
				{STACK.map(({ name, icon: Icon }) => (
					<div
						key={name}
						title={name}
						className="group flex aspect-square items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950/60 transition-colors hover:border-neutral-600"
					>
						<Icon className="size-5 text-neutral-500 transition-colors group-hover:text-white" />
					</div>
				))}
			</div>
		</div>
	)
}

export { TechStackCard }
