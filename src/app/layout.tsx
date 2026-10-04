import type { Metadata } from 'next'
import { Geist_Mono, Instrument_Serif, Syne } from 'next/font/google'
import './globals.css'
import AppNavbar from '@/components/layout/app-navbar'

const syne = Syne({
	variable: '--font-syne',
	subsets: ['latin'],
	weight: ['400', '500', '600', '700', '800']
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin']
})

/** Serif aksen buat headline editorial (dipakai di showcase & judul hero). */
const instrumentSerif = Instrument_Serif({
	variable: '--font-instrument-serif',
	subsets: ['latin'],
	weight: ['400'],
	style: ['normal', 'italic']
})

export const metadata: Metadata = {
	title: 'Xantares',
	description: 'Personal portfolio of Xantares — Computer Science student focused on Software Engineering & Cybersecurity.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body
				className={`${syne.variable} ${geistMono.variable} ${instrumentSerif.variable} min-h-screen font-sans antialiased`}
			>
				<AppNavbar />
				<div className="relative min-h-screen">
					<main className="relative z-10">{children}</main>
				</div>
			</body>
		</html>
	)
}
