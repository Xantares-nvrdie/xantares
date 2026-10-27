'use client'

import * as React from 'react'

import ScrambledText from '@/components/ScrambledText'
import { cn } from '@/lib/utils'

const WELCOME_MESSAGES = [
	'Selamat datang',
	'Welcome',
	'Bienvenido',
	'Bienvenue',
	'Willkommen',
	'Benvenuto',
	'ようこそ',
	'환영합니다'
]

/** Tulisan sapaan multibahasa versi besar, dipakai sebagai tile utama bento grid. */
function GreetingCard({ className, ...props }: React.ComponentProps<'div'>) {
	const [welcomeIndex, setWelcomeIndex] = React.useState(0)
	const [welcomeText, setWelcomeText] = React.useState('')

	React.useEffect(() => {
		const message = WELCOME_MESSAGES[welcomeIndex]
		let characterIndex = 0
		let timer: number

		const typeNextCharacter = () => {
			characterIndex += 1
			setWelcomeText(message.slice(0, characterIndex))

			if (characterIndex < message.length) {
				timer = window.setTimeout(typeNextCharacter, 140)
			} else {
				timer = window.setTimeout(() => {
					setWelcomeText('')
					setWelcomeIndex((index) => (index + 1) % WELCOME_MESSAGES.length)
				}, 1800)
			}
		}

		timer = window.setTimeout(typeNextCharacter, 220)

		return () => window.clearTimeout(timer)
	}, [welcomeIndex])

	return (
		<div
			className={cn(
				'relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900 to-neutral-950 p-6 sm:p-8',
				className
			)}
			{...props}
		>
			<div className="flex items-center gap-1" aria-live="polite">
				<ScrambledText
					key={welcomeText}
					className="!m-0 !max-w-none !text-base font-semibold tracking-wide text-purple-200"
					radius={60}
					duration={1.2}
					speed={0.5}
					scrambleChars=".:"
				>
					{welcomeText}
				</ScrambledText>
				<span aria-hidden="true" className="typing-cursor inline-block text-purple-300">
					|
				</span>
			</div>

			<div>
				<h1 className="text-5xl font-bold tracking-tighter text-white sm:text-6xl lg:text-7xl">Xantares</h1>
				<p className="mt-3 max-w-md text-lg leading-snug text-neutral-300 lg:text-xl">
					I build <span className="text-white">experiences people remember.</span>
				</p>
				<p className="mt-2 max-w-md text-sm text-neutral-400 lg:text-base">
					<span className="text-white">Fullstack developer</span> dan{' '}
					<span className="text-white">machine learning</span>. Mahasiswa Ilmu Komputer UPI, Bandung.
				</p>
			</div>
		</div>
	)
}

export { GreetingCard }
