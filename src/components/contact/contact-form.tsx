'use client'

import { useActionState } from 'react'
import { IconSend } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { sendMessage, type ContactState } from './send-message'

const inputClass =
	'w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-purple-500'

function ContactForm() {
	const [state, action, pending] = useActionState<ContactState, FormData>(sendMessage, null)

	return (
		<form action={action} className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
			<div className="grid gap-4 sm:grid-cols-2">
				<label className="space-y-2 text-sm text-neutral-400">
					Nama
					<input
						name="name"
						required
						maxLength={100}
						autoComplete="name"
						defaultValue={state?.fields?.name}
						placeholder="Nama kamu"
						className={inputClass}
					/>
				</label>
				<label className="space-y-2 text-sm text-neutral-400">
					Email
					<input
						name="email"
						type="email"
						required
						maxLength={200}
						autoComplete="email"
						defaultValue={state?.fields?.email}
						placeholder="kamu@perusahaan.com"
						className={inputClass}
					/>
				</label>
			</div>

			<label className="block space-y-2 text-sm text-neutral-400">
				Pesan
				<textarea
					name="message"
					required
					minLength={10}
					maxLength={2000}
					rows={5}
					defaultValue={state?.fields?.message}
					placeholder="Ceritakan singkat soal peluang atau kolaborasinya..."
					className={`${inputClass} resize-y`}
				/>
			</label>

			{/* Honeypot: disembunyikan dari manusia & screen reader, bot biasanya mengisinya. */}
			<input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

			<div className="flex flex-wrap items-center gap-4">
				<Button type="submit" size="lg" disabled={pending} className="bg-purple-600 text-white hover:bg-purple-500">
					<IconSend />
					{pending ? 'Mengirim...' : 'Kirim pesan'}
				</Button>
				{state && (
					<p role="status" className={state.ok ? 'text-sm text-green-500' : 'text-sm text-red-400'}>
						{state.message}
					</p>
				)}
			</div>
		</form>
	)
}

export { ContactForm }
