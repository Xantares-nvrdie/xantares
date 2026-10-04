'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

type Line = {
	type: 'input' | 'output' | 'error'
	text: string
}

const PROMPT = 'guest@xantares'

const HELP_TEXT = [
	'Command yang tersedia:',
	'  whoami      - tentang pemilik portfolio ini',
	'  skills      - daftar skill & tech stack',
	'  education   - riwayat pendidikan',
	'  projects    - lihat section showcase proyek',
	'  contact     - cara menghubungi',
	'  date        - waktu sekarang (WIB)',
	'  clear       - bersihkan terminal',
	'  help        - tampilkan daftar ini lagi'
].join('\n')

/** Setiap command balikin teks output. `clear` ditangani khusus karena harus kosongin history. */
const COMMANDS: Partial<Record<string, () => string>> = {
	help: () => HELP_TEXT,
	whoami: () => 'Mahasiswa Ilmu Komputer semester 2 di UPI, fokus ke Software Engineering & Cybersecurity.',
	skills: () =>
		[
			'Frontend : Next.js, React, Vue, Tailwind CSS',
			'Backend  : Fastify, Go, PHP',
			'Belajar  : C/C++, Low-level programming, Web Exploitation'
		].join('\n'),
	education: () => 'Ilmu Komputer - Universitas Pendidikan Indonesia (UPI), semester 2.',
	projects: () => "Scroll ke bawah buat liat section 'Showcase' ya 👇",
	contact: () => 'Pilih salah satu icon di card "Let\'s Connect" buat hubungi saya.',
	sudo: () => 'Permission denied: nice try 😏',
	date: () => new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
}

const WELCOME_LINES: Line[] = [{ type: 'output', text: "Selamat datang! Ketik 'help' buat lihat daftar command." }]

function TerminalCard({ className, ...props }: React.ComponentProps<'div'>) {
	const [lines, setLines] = React.useState<Line[]>(WELCOME_LINES)
	const [value, setValue] = React.useState('')
	const scrollRef = React.useRef<HTMLDivElement>(null)
	const inputRef = React.useRef<HTMLInputElement>(null)

	React.useEffect(() => {
		const node = scrollRef.current
		if (node) node.scrollTop = node.scrollHeight
	}, [lines])

	const runCommand = (raw: string) => {
		const command = raw.trim().toLowerCase()
		setLines((prev) => [...prev, { type: 'input', text: raw }])
		if (!command) return

		if (command === 'clear') {
			setLines([])
			return
		}

		const handler = COMMANDS[command]
		const output = handler
			? handler()
			: `command not found: ${command}. Ketik 'help' buat lihat daftar command.`

		setLines((prev) => [...prev, { type: handler ? 'output' : 'error', text: output }])
	}

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault()
		if (value.trim()) runCommand(value)
		setValue('')
	}

	return (
		<div
			className={cn(
				'relative flex flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm transition-colors hover:border-neutral-700',
				className
			)}
			onClick={() => inputRef.current?.focus()}
			{...props}
		>
			<div className="flex items-center gap-2 border-b border-neutral-800 px-4 py-3">
				<span className="size-2.5 rounded-full bg-red-500/70" />
				<span className="size-2.5 rounded-full bg-yellow-500/70" />
				<span className="size-2.5 rounded-full bg-green-500/70" />
				<span className="ml-2 font-mono text-xs text-neutral-500">{PROMPT}:~</span>
			</div>

			<div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-3 font-mono text-xs leading-relaxed">
				{lines.map((line, index) => (
					<div
						key={index}
						className={cn(
							'whitespace-pre-wrap',
							line.type === 'input' && 'text-neutral-300',
							line.type === 'output' && 'text-neutral-500',
							line.type === 'error' && 'text-red-400'
						)}
					>
						{line.type === 'input' ? (
							<span>
								<span className="text-purple-400">{PROMPT}</span>
								<span className="text-neutral-500">:~$ </span>
								{line.text}
							</span>
						) : (
							line.text
						)}
					</div>
				))}
			</div>

			<form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-neutral-800 px-4 py-3">
				<span className="font-mono text-xs text-purple-400">{PROMPT}:~$</span>
				<input
					ref={inputRef}
					value={value}
					onChange={(event) => setValue(event.target.value)}
					className="flex-1 bg-transparent font-mono text-xs text-white outline-none placeholder:text-neutral-600"
					placeholder="type 'help'..."
					autoComplete="off"
					aria-label="Terminal command input"
				/>
			</form>
		</div>
	)
}

export { TerminalCard }
