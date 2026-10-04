import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * Bingkai kotak rounded transparan, dipakai buat ngebungkus section hero supaya
 * background (Silk) tetap kelihatan ngintip dari dalam kotak, bukan ketutup solid.
 */
function WindowFrame({ className, children, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn('rounded-[28px] border border-white/10 bg-white/[0.02] backdrop-blur-md', className)}
			{...props}
		>
			{children}
		</div>
	)
}

export { WindowFrame }
