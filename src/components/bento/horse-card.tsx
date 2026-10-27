'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import { COLS, ROWS, renderHorse, type HorseLayers } from './horse-ascii'

const FRAME_MS = 1000 / 30
/** Pose diam yang dipakai untuk render server dan untuk pengunjung dengan "reduce motion". */
const STATIC_TIME = 0.38

const layer = 'm-0 font-mono leading-[1.08] whitespace-pre'

function HorseCard({ className, ...props }: React.ComponentProps<'div'>) {
	const rootRef = React.useRef<HTMLDivElement>(null)
	const initial = React.useMemo(() => renderHorse(STATIC_TIME), [])

	React.useEffect(() => {
		const root = rootRef.current
		if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

		const layers = root.querySelectorAll<HTMLPreElement>('pre[data-layer]')
		const start = performance.now()
		let frame = 0
		let last = 0
		const tick = (now: number) => {
			frame = requestAnimationFrame(tick)
			if (now - last < FRAME_MS) return
			last = now
			const next = renderHorse((now - start) / 1000)
			layers.forEach((pre) => {
				pre.textContent = next[pre.dataset.layer as keyof HorseLayers]
			})
		}

		// Hanya animasi saat kartu terlihat, supaya hemat baterai saat di-scroll jauh.
		const observer = new IntersectionObserver(([entry]) => {
			cancelAnimationFrame(frame)
			if (entry.isIntersecting) frame = requestAnimationFrame(tick)
		})
		observer.observe(root)

		return () => {
			observer.disconnect()
			cancelAnimationFrame(frame)
		}
	}, [])

	// Ukuran font mengikuti kartu (lebar dan tinggi), 0.6em = lebar satu karakter, 1.08em = tinggi baris.
	const fontSize = `min(calc(94cqw / ${COLS * 0.6}), calc(90cqh / ${ROWS * 1.08}))`

	return (
		<div
			ref={rootRef}
			role="img"
			aria-label="Animasi ASCII kuda neraka berapi yang berlari menerjang"
			className={cn(
				'relative min-h-[150px] flex-1 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/40 bg-[radial-gradient(ellipse_at_60%_100%,rgb(127_29_29/0.4),transparent_65%)] [container-type:size]',
				className
			)}
			{...props}
		>
			<div className="pointer-events-none absolute inset-0 flex items-center justify-center select-none" aria-hidden="true">
				<div className="relative" style={{ fontSize }}>
					<pre data-layer="scene" className={cn(layer, 'text-neutral-700')}>
						{initial.scene}
					</pre>
					<pre
						data-layer="body"
						className={cn(layer, 'absolute inset-0 bg-gradient-to-b from-purple-200 via-purple-500 to-red-600 bg-clip-text text-transparent')}
					>
						{initial.body}
					</pre>
					<pre
						data-layer="fire"
						className={cn(
							layer,
							'absolute inset-0 bg-gradient-to-t from-red-600 via-orange-500 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_0_4px_rgb(255_90_30/0.75)]'
						)}
					>
						{initial.fire}
					</pre>
					<pre
						data-layer="eye"
						className={cn(layer, 'absolute inset-0 text-red-500 drop-shadow-[0_0_5px_#ff1e1e] motion-safe:animate-pulse')}
					>
						{initial.eye}
					</pre>
				</div>
			</div>
		</div>
	)
}

export { HorseCard }
