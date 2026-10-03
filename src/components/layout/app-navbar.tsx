'use client'

import { useState } from 'react'

import {
	Navbar,
	NavBody,
	NavItems,
	MobileNav,
	MobileNavHeader,
	MobileNavMenu,
	MobileNavToggle,
	NavbarLogo
} from '@/components/ui/resizable-navbar'

const navItems = [
	{ name: 'Home', link: '/' },
	{ name: 'Features', link: '/features' },
	{ name: 'About Me', link: '/about' }
]

export default function AppNavbar() {
	const [open, setOpen] = useState(false)

	return (
		<Navbar className="fixed top-5 left-0 z-50 w-full bg-transparent">
			<NavBody>
				<NavbarLogo />
				<NavItems items={navItems} />

			</NavBody>


			<MobileNav>
				<MobileNavHeader>
					<NavbarLogo />

					<div className="flex items-center gap-2">
						<MobileNavToggle isOpen={open} onClick={() => setOpen(!open)} />
					</div>
				</MobileNavHeader>

				<MobileNavMenu isOpen={open} onClose={() => setOpen(false)}>
					{navItems.map((item) => (
						<a
							key={item.name}
							href={item.link}
							className="text-sm font-medium"
							onClick={() => setOpen(false)}
						>
							{item.name}
						</a>
					))}
				</MobileNavMenu>
			</MobileNav>
		</Navbar>
	)
}
