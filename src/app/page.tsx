'use client'

import { useEffect, useState } from 'react'

import { CharacterViewer } from '@/components/3d/character-viewer'
import ScrambledText from '@/components/ScrambledText'
import Silk from '@/components/Silk'
import { Code2, Globe, Terminal } from 'lucide-react'

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

export default function Home() {
	const [welcomeIndex, setWelcomeIndex] = useState(0)
	const [welcomeText, setWelcomeText] = useState('')

	useEffect(() => {
		const message = WELCOME_MESSAGES[welcomeIndex]
		let characterIndex = 0
		let timer: number

		const typeNextCharacter = () => {
			characterIndex += 1
			setWelcomeText(message.slice(0, characterIndex))

			if (characterIndex < message.length) {
				timer = window.setTimeout(typeNextCharacter, 180)
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
		<main className="relative min-h-screen w-full bg-black text-white">
			{/* SECTION 1: Hero Area (Full Screen) */}
			<section className="relative h-screen w-full overflow-hidden">
				<div className="absolute inset-0 z-0 pointer-events-none">
					<Silk speed={4} scale={1} color="#441f62" noiseIntensity={4.1} rotation={0} />
				</div>

				<div className="relative z-10 flex h-full flex-col items-center justify-center gap-4 text-center">
					<h1 className="text-6xl font-bold tracking-tighter sm:text-8xl">FUCK YOU</h1>
					<p className="text-xl font-medium text-neutral-400">ON PROCESS CMON</p>
				</div>

				{/* Sapaan multilingual di atas karakter 3D */}
				<div className="absolute top-[54%] left-6 z-20 hidden w-[300px] -translate-y-1/2 md:block lg:left-10 lg:w-[340px]">
					<div className="flex items-center gap-1" aria-live="polite">
						<ScrambledText
							key={welcomeText}
							className="!m-0 !max-w-none !text-base font-semibold tracking-wide text-purple-100"
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

					<div className="h-[420px] overflow-hidden rounded-2xl border border-white/15 bg-transparent backdrop-blur-md lg:h-[480px]">
						<CharacterViewer />
					</div>
				</div>
			</section>

			{/* SECTION 2: Profile / About Me */}
			<section className="relative w-full border-t border-neutral-800 bg-neutral-950 py-24">
				<div className="container mx-auto px-6">
					<div className="grid gap-12 lg:grid-cols-2 lg:items-start">
						{/* Kolom Kiri: Teks Pengantar */}
						<div className="space-y-6">
							<h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">About Me</h2>
							<p className="text-lg leading-relaxed text-neutral-400">
								Saya adalah mahasiswa Ilmu Komputer semester 2 di UPI yang memiliki ketertarikan
								mendalam pada
								<span className="text-white"> Software Engineering</span> dan{' '}
								<span className="text-white">Cybersecurity</span>.
							</p>
							<p className="text-base leading-relaxed text-neutral-500">
								Saat ini fokus mendalami ekosistem JavaScript/TypeScript (Next.js, Vue, Fastify) serta
								eksplorasi bahasa Go dan konsep Low-level programming dengan C/C++.
							</p>

							{/* Status Indikator */}
							<div className="flex items-center gap-3 pt-4">
								<span className="relative flex h-3 w-3">
									<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
									<span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
								</span>
								<span className="text-sm font-medium text-green-500">Available for Projects</span>
							</div>
						</div>

						{/* Kolom Kanan: Cards / Stats */}
						<div className="grid gap-4 sm:grid-cols-2">
							{/* Card 1 */}
							<div className="group rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 transition hover:border-neutral-600 hover:bg-neutral-900">
								<Code2 className="mb-4 h-8 w-8 text-blue-500" />
								<h3 className="mb-2 font-semibold text-white">Frontend</h3>
								<p className="text-sm text-neutral-400">
									Next.js, React, Vue, Tailwind CSS & Animation
								</p>
							</div>

							{/* Card 2 */}
							<div className="group rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 transition hover:border-neutral-600 hover:bg-neutral-900">
								<Terminal className="mb-4 h-8 w-8 text-purple-500" />
								<h3 className="mb-2 font-semibold text-white">Backend</h3>
								<p className="text-sm text-neutral-400">Fastify, Go, PHP, Database Design & API</p>
							</div>

							{/* Card 3 (Full Width di mobile) */}
							<div className="group rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 transition hover:border-neutral-600 hover:bg-neutral-900 sm:col-span-2">
								<Globe className="mb-4 h-8 w-8 text-emerald-500" />
								<h3 className="mb-2 font-semibold text-white">Current Focus</h3>
								<p className="text-sm text-neutral-400">
									Mempelajari arsitektur sistem yang scalable dan keamanan aplikasi web (Web
									Exploitation).
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>
		</main>
	)
}
