'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import { drawHorse } from './horse-dots'

const FRAME_MS = 1000 / 30
/** Pose diam untuk pengunjung dengan "reduce motion" (dan titik awal animasi). */
const STATIC_TIME = 0.25

function HorseCard({ className, ...props }: React.ComponentProps<'div'>) {
	const canvasRef = React.useRef<HTMLCanvasElement>(null)

	React.useEffect(() => {
		const canvas = canvasRef.current
		const ctx = canvas?.getContext('2d')
		if (!canvas || !ctx) return

		const animate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
		const start = performance.now()
		let width = 0
		let height = 0
		let time = STATIC_TIME
		let frame = 0
		let last = 0

		const draw = () => drawHorse(ctx, width, height, time, animate)

		// Ukuran canvas mengikuti kartu, dengan resolusi layar (maks 2x) supaya titiknya tajam.
		const resizeObserver = new ResizeObserver(() => {
			const dpr = Math.min(window.devicePixelRatio || 1, 2)
			width = canvas.clientWidth
			height = canvas.clientHeight
			canvas.width = Math.round(width * dpr)
			canvas.height = Math.round(height * dpr)
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
			draw()
		})
		resizeObserver.observe(canvas)

		const tick = (now: number) => {
			frame = requestAnimationFrame(tick)
			if (now - last < FRAME_MS) return
			last = now
			time = STATIC_TIME + (now - start) / 1000
			draw()
		}

		// Hanya animasi saat kartu terlihat, supaya hemat baterai saat di-scroll jauh.
		const intersectionObserver = new IntersectionObserver(([entry]) => {
			cancelAnimationFrame(frame)
			if (animate && entry.isIntersecting) frame = requestAnimationFrame(tick)
		})
		intersectionObserver.observe(canvas)

		return () => {
			resizeObserver.disconnect()
			intersectionObserver.disconnect()
			cancelAnimationFrame(frame)
		}
	}, [])

	return (
		<div
			role="img"
			aria-label="Animasi kuda dot-matrix yang berlari dengan efek glitch warna"
			className={cn(
				'relative min-h-[150px] flex-1 overflow-hidden rounded-2xl border border-neutral-800 bg-black bg-[radial-gradient(ellipse_at_50%_60%,rgb(45_212_191/0.08),transparent_70%)]',
				className
			)}
			{...props}
		>
			<canvas
				ref={canvasRef}
				className="pointer-events-none absolute inset-0 size-full drop-shadow-[0_0_6px_rgb(120_220_215/0.25)]"
			/>
		</div>
	)
}

export { HorseCard }
