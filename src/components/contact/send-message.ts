'use server'

import { headers } from 'next/headers'

type Fields = { name: string; email: string; message: string }
export type ContactState = { ok: boolean; message: string; fields?: Fields } | null

const COOLDOWN_MS = 30_000
// ponytail: memori per-instance, hilang saat restart / tidak shared antar instance serverless. Pakai KV/Upstash kalau trafik spam beneran muncul.
const lastSent = new Map<string, number>()

export async function sendMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
	const read = (key: string) => String(formData.get(key) ?? '').trim()
	const fields: Fields = { name: read('name'), email: read('email'), message: read('message') }

	// Honeypot: field tersembunyi, hanya bot yang mengisinya. Pura-pura sukses supaya bot tidak adaptasi.
	if (read('website')) return { ok: true, message: 'Pesan terkirim.' }

	const valid =
		fields.name.length > 0 &&
		fields.name.length <= 100 &&
		fields.email.length <= 200 &&
		/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email) &&
		fields.message.length >= 10 &&
		fields.message.length <= 2000
	if (!valid) return { ok: false, message: 'Cek lagi isian kamu: nama, email valid, dan pesan minimal 10 karakter.', fields }

	const apiKey = process.env.RESEND_API_KEY
	const to = process.env.CONTACT_TO_EMAIL
	if (!apiKey || !to) {
		console.error('[contact] RESEND_API_KEY atau CONTACT_TO_EMAIL belum di-set')
		return { ok: false, message: 'Form belum dikonfigurasi. Coba lewat email langsung dulu ya.', fields }
	}

	const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
	const now = Date.now()
	if (now - (lastSent.get(ip) ?? 0) < COOLDOWN_MS) {
		return { ok: false, message: 'Tunggu sebentar sebelum kirim pesan lagi.', fields }
	}
	if (lastSent.size > 1000) lastSent.clear()
	lastSent.set(ip, now)

	try {
		const res = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
			body: JSON.stringify({
				from: process.env.CONTACT_FROM ?? 'Portfolio <onboarding@resend.dev>',
				to,
				reply_to: fields.email,
				subject: `Pesan portfolio dari ${fields.name.replace(/\s+/g, ' ')}`,
				text: `${fields.message}\n\n-- ${fields.name} <${fields.email}>`
			}),
			signal: AbortSignal.timeout(10_000)
		})
		if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`)
	} catch (error) {
		console.error('[contact] gagal kirim email', error)
		lastSent.delete(ip)
		return { ok: false, message: 'Gagal mengirim pesan. Coba lagi sebentar lagi ya.', fields }
	}

	return { ok: true, message: 'Pesan terkirim. Terima kasih, nanti saya balas ke email kamu.' }
}
