import * as React from 'react'
import { Award } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * Sertifikasi yang SEDANG diikuti, bukan yang sudah diraih. Setelah lulus: ganti teks status,
 * tulis nama sertifikasinya, dan tautkan kredensialnya agar bisa diverifikasi HRD.
 */
function CertificationCard({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div className={cn('flex flex-col justify-between rounded-2xl p-4 lg:p-5', className)} {...props}>
			<span className="font-mono text-xs text-neutral-500">{'// sertifikasi'}</span>

			<div className="flex items-center gap-3">
				<span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950/60 text-purple-300">
					<Award className="size-5" aria-hidden="true" />
				</span>
				<div className="min-w-0">
					<p className="text-base leading-tight font-semibold text-white">Oracle</p>
					<p className="text-sm text-neutral-400">Certification</p>
				</div>
			</div>

			<span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
				<span className="size-1.5 rounded-full bg-amber-400" aria-hidden="true" />
				Sedang berjalan
			</span>
		</div>
	)
}

export { CertificationCard }
