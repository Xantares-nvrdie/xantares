import type * as React from 'react'

/** Ungu aksen brand, sama dengan purple-500 di Tailwind. */
const ACCENT = '#a855f7'

/**
 * Logo utama (opsi 1, "Bintang X"): bintang empat sudut yang terbaca sebagai X, dengan sinar ungu di
 * sela-selanya. Warna bintang mengikuti `currentColor`, jadi atur lewat class `text-*`.
 */
function LogoStar({ className, ...props }: React.ComponentProps<'svg'>) {
	return (
		<svg viewBox="18 18 84 84" fill="none" aria-hidden="true" className={className} {...props}>
			<path fill={ACCENT} d="M60 26C60 51 69 60 94 60C69 60 60 69 60 94C60 69 51 60 26 60C51 60 60 51 60 26Z" />
			<path
				fill="currentColor"
				d="M22 22C56 56 64 56 98 22C64 56 64 64 98 98C64 64 56 64 22 98C56 64 56 56 22 22Z"
			/>
		</svg>
	)
}

/**
 * Logo alternatif (opsi 5, "Serif X"): monogram X italic bergaya editorial dengan bintang kecil sebagai
 * aksen. Belum dipakai di mana pun, disimpan untuk keperluan lain (misalnya kop CV atau versi editorial).
 * Paling serasi dipasangkan dengan wordmark berfont `font-serif italic` (Instrument Serif).
 */
function LogoSerif({ className, ...props }: React.ComponentProps<'svg'>) {
	return (
		<svg viewBox="10 10 100 100" fill="none" aria-hidden="true" className={className} {...props}>
			<g fill="currentColor">
				<path d="M36 22H56L86 98H66Z" />
				<path d="M92 22H99L29 98H22Z" />
				<rect x="26" y="19" width="40" height="4" rx="1" />
				<rect x="84" y="19" width="24" height="4" rx="1" />
				<rect x="12" y="97" width="26" height="4" rx="1" />
				<rect x="56" y="97" width="40" height="4" rx="1" />
			</g>
			<path fill={ACCENT} d="M71 24C71 30 73 32 79 32C73 32 71 34 71 40C71 34 69 32 63 32C69 32 71 30 71 24Z" />
		</svg>
	)
}

export { LogoSerif, LogoStar }
