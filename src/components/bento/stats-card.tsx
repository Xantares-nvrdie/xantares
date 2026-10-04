import * as React from 'react'

import { cn } from '@/lib/utils'

const STATS = [
	{ label: 'Projects dibangun', value: '12+' },
	{ label: 'Bahasa dikuasai', value: '6' },
	{ label: 'Cup kopi/minggu', value: '∞' }
]

function StatsCard({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn(
				'flex flex-col justify-center gap-4 divide-y divide-neutral-800/80 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 sm:flex-row sm:divide-x sm:divide-y-0',
				className
			)}
			{...props}
		>
			{STATS.map(({ label, value }) => (
				<div key={label} className="flex flex-1 items-center justify-between gap-4 pt-4 first:pt-0 sm:flex-col sm:items-start sm:justify-center sm:gap-1 sm:px-6 sm:pt-0 sm:first:px-0">
					<span className="text-sm text-neutral-500">{label}</span>
					<span className="font-mono text-lg font-semibold text-white">{value}</span>
				</div>
			))}
		</div>
	)
}

export { StatsCard }
