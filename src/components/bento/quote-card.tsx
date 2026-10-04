import * as React from 'react'

import { cn } from '@/lib/utils'
import { IconQuote } from '@tabler/icons-react'

function QuoteCard({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn(
				'flex flex-col justify-center gap-3 rounded-2xl border border-neutral-800 bg-gradient-to-br from-purple-950/40 to-neutral-900/40 p-5',
				className
			)}
			{...props}
		>
			<IconQuote className="size-6 text-purple-400" />
			<p className="text-sm leading-relaxed text-neutral-300">
				&quot;Every pixel has a reason. Code is written once, read a hundred times.&quot;
			</p>
		</div>
	)
}

export { QuoteCard }
