'use client'

import {
	Navbar,
	NavBody,
	NavItems,
	MobileNav,
	MobileNavHeader,
	MobileNavMenu,
	MobileNavToggle,
	NavbarLogo,
	NavbarButton
} from '@/components/ui/resizable-navbar'
import { useState } from 'react'

const navItems = [
	{ name: 'Home', link: '/' },
	{ name: 'Features', link: '/features' },
	{ name: 'Pricing', link: '/pricing' }
]

export default function AppNavbar() {
	const [open, setOpen] = useState(false)

	return (
		<Navbar>
			{/* DESKTOP */}
			<NavBody>
				<NavbarLogo />
				<NavItems items={navItems} />
				<NavbarButton variant="primary">Sign Up</NavbarButton>
			</NavBody>

			{/* MOBILE */}
			<MobileNav>
				<MobileNavHeader>
					<NavbarLogo />
					<MobileNavToggle isOpen={open} onClick={() => setOpen(!open)} />
				</MobileNavHeader>

				<MobileNavMenu isOpen={open} onClose={() => setOpen(false)}>
					{navItems.map((item) => (
						<a key={item.name} href={item.link}>
							{item.name}
						</a>
					))}
				</MobileNavMenu>
			</MobileNav>
		</Navbar>
	)
}
