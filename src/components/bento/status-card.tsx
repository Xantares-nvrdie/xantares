import * as React from 'react'

import { cn } from '@/lib/utils'

function StatusCard({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn(
				'flex flex-col justify-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5',
				className
			)}
			{...props}
		>
			<div className="flex items-center gap-3">
				<span className="relative flex h-3 w-3">
					<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
					<span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
				</span>
				<span className="text-sm font-medium text-green-500">Available for Projects</span>
			</div>
			<p className="text-sm text-neutral-500">
				Lagi semester 2 di UPI, terbuka buat kolaborasi project, magang, atau sekadar ngobrol soal code.
			</p>
		</div>
	)
}

export { StatusCard }
