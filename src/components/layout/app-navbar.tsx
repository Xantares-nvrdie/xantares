'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'

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

import { ThemeToggleButton } from '@/components/ui/theme-button'

const navItems = [
	{ name: 'Home', link: '/' },
	{ name: 'Features', link: '/features' },
	{ name: 'About Me', link: '/about' }
]

export default function AppNavbar() {
	const [open, setOpen] = useState(false)
	const { theme, setTheme } = useTheme()

	const currentTheme = theme === 'dark' ? 'dark' : 'light'

	return (
		<Navbar className="fixed top-5 left-0 z-50 w-full bg-transparent">
			<NavBody>
				<NavbarLogo />
				<NavItems items={navItems} />

				<div className="ml-auto flex items-center gap-2">
					<ThemeToggleButton
						theme={currentTheme}
						variant="circle-blur"
						start="top-right"
						onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
					/>
				</div>
			</NavBody>

			{/* HAPUS isOpen={open} DARI SINI */}
			<MobileNav>
				<MobileNavHeader>
					<NavbarLogo />

					<div className="flex items-center gap-2">
						<ThemeToggleButton
							theme={currentTheme}
							variant="circle-blur"
							start="top-right"
							onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
						/>

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
