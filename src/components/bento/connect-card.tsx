import * as React from 'react'

import { cn } from '@/lib/utils'
import { IconBrandGithub, IconBrandInstagram, IconBrandLinkedin, IconMail } from '@tabler/icons-react'

const LINKS = [
	{ name: 'GitHub', href: 'https://github.com', icon: IconBrandGithub },
	{ name: 'LinkedIn', href: 'https://linkedin.com', icon: IconBrandLinkedin },
	{ name: 'Instagram', href: 'https://instagram.com', icon: IconBrandInstagram },
	{ name: 'Email', href: 'mailto:hello@example.com', icon: IconMail }
]

function ConnectCard({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn(
				'flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5',
				className
			)}
			{...props}
		>
			<span className="font-mono text-xs text-neutral-500">{"// let's connect"}</span>

			<div className="flex items-center gap-3 pt-2">
				{LINKS.map(({ name, href, icon: Icon }) => (
					<a
						key={name}
						href={href}
						target="_blank"
						rel="noreferrer noopener"
						aria-label={name}
						className="flex size-10 items-center justify-center rounded-full border border-neutral-800 bg-neutral-950/60 text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white"
					>
						<Icon className="size-5" />
					</a>
				))}
			</div>
		</div>
	)
}

export { ConnectCard }
