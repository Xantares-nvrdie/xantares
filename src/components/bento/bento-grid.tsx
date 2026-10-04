import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * Wrapper grid untuk bento layout. 4 kolom di desktop, auto-fit di mobile.
 * `grid-flow-dense` dipakai supaya card yang row-span-nya beda nggak nyisain lubang.
 */
function BentoGrid({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn(
				'grid grid-cols-1 gap-4 md:grid-flow-dense md:auto-rows-[160px] md:grid-cols-4',
				className
			)}
			{...props}
		/>
	)
}

/** Satu sel bento. Pakai `colSpan`/`rowSpan` (1-4 / 1-3) buat ngatur ukurannya di desktop. */
function BentoCard({
	className,
	colSpan = 1,
	rowSpan = 1,
	children,
	...props
}: React.ComponentProps<'div'> & { colSpan?: 1 | 2 | 3 | 4; rowSpan?: 1 | 2 | 3 }) {
	const colClass = {
		1: 'md:col-span-1',
		2: 'md:col-span-2',
		3: 'md:col-span-3',
		4: 'md:col-span-4'
	}[colSpan]

	const rowClass = {
		1: 'md:row-span-1',
		2: 'md:row-span-2',
		3: 'md:row-span-3'
	}[rowSpan]

	return (
		<div
			className={cn(
				'relative flex min-h-[160px] flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/40 backdrop-blur-sm transition-colors duration-300 hover:border-neutral-700',
				colClass,
				rowClass,
				className
			)}
			{...props}
		>
			{children}
		</div>
	)
}

export { BentoGrid, BentoCard }
