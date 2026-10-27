import * as React from 'react'

import { cn } from '@/lib/utils'
import { IconBrandGithub, IconMail } from '@tabler/icons-react'
import { LocalTime } from './local-time'

// LinkedIn sengaja belum ada: tambahkan lagi begitu URL profil aslinya tersedia, jangan arahkan ke linkedin.com umum.
const LINKS = [
	{ name: 'GitHub', href: 'https://github.com/Xantares-nvrdie', icon: IconBrandGithub },
	{ name: 'Email', href: 'mailto:bintangfajarputra@gmail.com', icon: IconMail }
]

function ConnectCard({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div className={cn('flex flex-col justify-between rounded-2xl p-4 lg:p-5', className)} {...props}>
			<span className="font-mono text-xs text-neutral-500">{"// let's connect"}</span>

			<div className="space-y-1">
				<p className="flex items-start gap-2 text-xs leading-snug text-green-400 lg:items-center">
					<span className="relative mt-1 flex size-2 shrink-0 lg:mt-0" aria-hidden="true">
						<span className="absolute inline-flex size-full rounded-full bg-green-400 opacity-75 motion-safe:animate-ping" />
						<span className="relative inline-flex size-2 rounded-full bg-green-500" />
					</span>
					Terbuka untuk magang &amp; freelance
				</p>
				<LocalTime className="hidden pl-4 text-xs text-neutral-500 lg:block" />
			</div>

			<div className="flex items-center gap-3">
				{LINKS.map(({ name, href, icon: Icon }) => (
					<a
						key={name}
						href={href}
						target={href.startsWith('http') ? '_blank' : undefined}
						rel="noreferrer noopener"
						aria-label={name}
						className="flex size-9 items-center justify-center rounded-full border border-neutral-800 bg-neutral-950/60 text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400"
					>
						<Icon className="size-5" />
					</a>
				))}
			</div>
		</div>
	)
}

export { ConnectCard }
