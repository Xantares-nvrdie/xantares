'use client'

import * as React from 'react'

const formatter = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hour12: false })

const subscribe = (onChange: () => void) => {
	const id = window.setInterval(onChange, 15_000)
	return () => window.clearInterval(id)
}
const getSnapshot = () => formatter.format(new Date())
// Di server jam belum diketahui, jadi ditampilkan setelah hydration supaya tidak mismatch.
const getServerSnapshot = () => null

/** Jam WIB yang berjalan. */
function LocalTime({ className }: { className?: string }) {
	const time = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
	return <span className={className}>Bandung{time ? `, ${time} WIB` : ''}</span>
}

export { LocalTime }
