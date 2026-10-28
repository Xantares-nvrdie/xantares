/**
 * Kuda dot-matrix yang berlari dengan efek glitch. Siluetnya dirakit dari kapsul meruncing yang disatukan
 * secara halus (smooth union), kaki digerakkan pakai IK dua ruas mengikuti siklus gallop, surai dan ekor
 * berkibar. Tiap sel grid digambar sebagai titik bulat: bagian dalam diberi tekstur noise krem-cyan-biru,
 * tepinya dapat warna dari pergeseran kanal RGB, dan di sekitarnya ada garis gerak horizontal.
 * Semuanya deterministik (tanpa Math.random) supaya tiap frame konsisten.
 */
export const COLS = 80
export const ROWS = 44

const GROUND = 40.5
const CYCLE_SECONDS = 0.5
/** Porsi siklus saat satu kaki menapak. Sisanya kaki diayun, termasuk fase "melayang" khas gallop. */
const STANCE = 0.3
const STRIDE = 4.4
/** Kecepatan tanah (sel/detik), dicocokkan dengan gerak kuku saat menapak supaya kaki tidak "meluncur". */
const GROUND_SPEED = (2 * STRIDE) / (STANCE * CYCLE_SECONDS)
const TAU = Math.PI * 2

type Point = [number, number]
/** Kapsul meruncing: ruas (x1, y1)-(x2, y2) dengan jari-jari r1 di pangkal dan r2 di ujung. */
type Capsule = [x1: number, y1: number, x2: number, y2: number, r1: number, r2: number]
type Horse = { outline: number[]; ears: Capsule[]; legs: Capsule[][]; hair: Capsule[]; eye: Point; bob: number }

/**
 * Garis luar badan, leher, dan kepala (tanpa kaki, telinga, surai, dan ekor), menghadap kiri.
 * Angka ketiga = seberapa ikut mengangguk: 1 = kepala/leher penuh, 0 = badan.
 */
const OUTLINE: [x: number, y: number, nod: number][] = [
	// Puncak kepala dan jambul leher
	[21.2, 7.8, 1],
	[23, 7.6, 1],
	[25, 8.2, 1],
	[27.2, 9.6, 0.9],
	[29.4, 11.4, 0.7],
	[31.4, 13.2, 0.4],
	// Gumba, punggung yang sedikit melengkung, pinggang, croup
	[33.2, 13.8, 0.1],
	[35, 14.4, 0],
	[37.5, 15.4, 0],
	[40, 16, 0],
	[42.5, 16.2, 0],
	[45, 15.8, 0],
	[47.5, 15.1, 0],
	[50, 15, 0],
	[52, 15.6, 0],
	// Pangkal ekor, pantat, dan paha belakang
	[53.6, 16.6, 0],
	[55, 18.4, 0],
	[55.7, 20.5, 0],
	[55.6, 22.8, 0],
	[54.8, 24.9, 0],
	[53.5, 26.7, 0],
	[52, 28, 0],
	[50.2, 28, 0],
	[48.6, 26.6, 0],
	// Perut yang naik ke arah pinggang
	[46.5, 24.8, 0],
	[43.5, 26, 0],
	[40, 26.9, 0],
	[36.5, 27.5, 0],
	[33, 27.8, 0],
	[30.5, 27.6, 0],
	[29.2, 28.2, 0],
	[26.4, 28.2, 0],
	// Dada dan bawah leher
	[24.8, 26.4, 0],
	[24, 24.2, 0],
	[23.8, 22, 0.1],
	[23.6, 20.4, 0.3],
	[22.8, 18.6, 0.6],
	[21.8, 16.8, 0.8],
	[21.2, 15, 1],
	// Rahang, dagu, moncong, dan garis wajah
	[21.4, 13.6, 1],
	[19.6, 14.4, 1],
	[18, 15.6, 1],
	[16.8, 16.8, 1],
	[15.6, 17, 1],
	[14.8, 16.4, 1],
	[14, 15.4, 1],
	[14.1, 14.4, 1],
	[15.6, 12.8, 1],
	[17.6, 10.8, 1],
	[19.6, 9, 1]
]

const PALETTE = [
	'#f6efe9', // 0 krem
	'#cdeeea', // 1 cyan pucat
	'#79d8d0', // 2 cyan
	'#3fb0c0', // 3 teal
	'#3b7fd6', // 4 biru
	'#1e3a78', // 5 biru gelap (mata)
	'#5fd08a', // 6 hijau (kanal G saja)
	'#4a72ff', // 7 biru terang (kanal B saja)
	'#f0505e', // 8 merah (kanal R saja)
	'#f1d36b', // 9 kuning (R + G)
	'#ef77b4', // 10 pink (R + B)
	'#58d6e6' // 11 cyan terang (G + B)
]
/** Warna tepi berdasarkan kanal yang menutupi sel, indeks = R | G << 1 | B << 2 (7 = bagian dalam). */
const FRINGE = [-1, 8, 6, 9, 7, 10, 11, -1]
/** Geseran siluet per kanal (dalam sel): R naik, G ke kiri, B ke kanan bawah. */
const SPLIT: Point[] = [
	[0, -0.4],
	[-0.7, 0],
	[0.7, 0.2]
]
const SPLIT_REACH = Math.max(...SPLIT.map(([x, y]) => Math.hypot(x, y)))
const STREAK_COLOR = 'rgb(214, 218, 232)'
const STREAK_ALPHA = [0.07, 0.13, 0.2, 0.28]
const GROUND_COLOR = 'rgba(236, 232, 228, 0.55)'

const REGION_BODY = 0
const REGION_HAIR = 1
const REGION_FAR_LEG = 2

/** Hash deterministik kecil, pengganti Math.random. */
function hash(x: number, y: number, z = 0): number {
	let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(z | 0, 2246822519)
	h = Math.imul(h ^ (h >>> 13), 1274126177)
	return (h ^ (h >>> 16)) >>> 0
}

const rand = (x: number, y: number, z = 0) => hash(x, y, z) / 4294967296

/** Value noise 2D yang halus, hasil 0..1. */
function noise(x: number, y: number): number {
	const xi = Math.floor(x)
	const yi = Math.floor(y)
	const u = x - xi
	const v = y - yi
	const su = u * u * (3 - 2 * u)
	const sv = v * v * (3 - 2 * v)
	const a = rand(xi, yi)
	const b = rand(xi + 1, yi)
	const c = rand(xi, yi + 1)
	const d = rand(xi + 1, yi + 1)
	return a + (b - a) * su + (c - a) * sv + (a - b - c + d) * su * sv
}

const cap = (a: Point, b: Point, r1: number, r2 = r1): Capsule => [a[0], a[1], b[0], b[1], r1, r2]

function rotate([x, y]: Point, [px, py]: Point, angle: number): Point {
	const cos = Math.cos(angle)
	const sin = Math.sin(angle)
	const dx = x - px
	const dy = y - py
	return [px + dx * cos - dy * sin, py + dx * sin + dy * cos]
}

/** Jalur kuku dalam satu siklus: menapak sambil terdorong ke belakang (kanan), lalu terangkat dan diayun ke depan. */
function foot(phase: number, x0: number, lift: number): Point {
	const u = ((phase % 1) + 1) % 1
	const y0 = GROUND - 1.85
	if (u < STANCE) return [x0 - STRIDE + (2 * STRIDE * u) / STANCE, y0]
	const t = (u - STANCE) / (1 - STANCE)
	return [x0 + STRIDE * Math.cos(Math.PI * t), y0 - lift * Math.sin(Math.PI * t ** 0.75)]
}

/** IK dua ruas: posisi sendi tengah. `bend` = arah sendi menonjol (-1 ke depan/kiri, +1 ke belakang/kanan). */
function knee(joint: Point, target: Point, upper: number, lower: number, bend: number): Point {
	const dx = target[0] - joint[0]
	const dy = target[1] - joint[1]
	const reach = Math.hypot(dx, dy) || 1e-6
	const d = Math.min(Math.max(reach, Math.abs(upper - lower) + 0.01), upper + lower - 0.01)
	const a = (upper * upper - lower * lower + d * d) / (2 * d)
	const h = Math.sqrt(Math.max(upper * upper - a * a, 0))
	const ux = dx / reach
	const uy = dy / reach
	return [joint[0] + ux * a + bend * h * uy, joint[1] + uy * a - bend * h * ux]
}

/** Satu kaki: kaki depan menekuk ke depan (lutut), kaki belakang menekuk ke belakang (hock). */
function leg(joint: Point, phase: number, x0: number, hind: boolean): Capsule[] {
	const hoof = foot(phase, x0, hind ? 6 : 7.5)
	const k = knee(joint, hoof, hind ? 6.8 : 6.4, hind ? 7.6 : 7.2, hind ? 1 : -1)
	const length = Math.hypot(hoof[0] - k[0], hoof[1] - k[1]) || 1
	const tip: Point = [hoof[0] + ((hoof[0] - k[0]) / length) * 0.8, hoof[1] + ((hoof[1] - k[1]) / length) * 0.8]
	return [
		cap(joint, k, hind ? 2.2 : 1.8, hind ? 1.2 : 1.1),
		cap(k, hoof, hind ? 1.1 : 1.05, 0.95),
		cap(hoof, tip, 1.05, 1.15)
	]
}

/** Pose kuda (menghadap kiri) pada waktu tertentu. Satuan koordinat = satu sel grid. */
function buildHorse(time: number): Horse {
	const u = (((time / CYCLE_SECONDS) % 1) + 1) % 1
	const bob = -1.2 * (0.5 + 0.5 * Math.cos(TAU * (u - 0.92)))
	const pitch = 0.045 * Math.cos(TAU * (u - 0.2))
	const nod = 0.06 * Math.cos(TAU * (u - 0.1))
	const wave = time * 12

	const pivot: Point = [40, 21]
	const neckBase: Point = [31, 19]
	/** Titik badan: ikut berayun (pitch) dan naik-turun (bob). */
	const B = (x: number, y: number): Point => {
		const [rx, ry] = rotate([x, y], pivot, pitch)
		return [rx, ry + bob]
	}
	/** Titik leher dan kepala: mengangguk di pangkal leher, lalu ikut gerak badan. */
	const H = (x: number, y: number): Point => B(...rotate([x, y], neckBase, nod))

	const outline = OUTLINE.flatMap(([x, y, weight]) => B(...rotate([x, y], neckBase, nod * weight)))
	const ears = [cap(H(21.6, 8.2), H(22.2, 5.2), 0.75, 0.3), cap(H(22.9, 8.2), H(24.2, 5.6), 0.7, 0.3)]

	// Urutan gallop: belakang, belakang, depan, depan, lalu melayang. Indeks ganjil = kaki sisi jauh.
	const fore = B(27.6, 26.6)
	const hind = B(51.2, 26)
	const legs = [
		leg(hind, u, 50.2, true),
		leg(hind, u + 0.82, 47.2, true),
		leg(fore, u + 0.62, 27.9, false),
		leg(fore, u + 0.46, 25.4, false)
	]

	const hair: Capsule[] = []
	// Surai: helai-helai di sepanjang jambul leher, tertiup ke belakang atas
	const crestA: Point = [23.8, 8.6]
	const crestB: Point = [32.4, 14.4]
	const mane = [4.4, 3.4, 4.8, 3.6, 4.2, 3.2]
	mane.forEach((length, i) => {
		const s = i / (mane.length - 1)
		const base = H(crestA[0] + (crestB[0] - crestA[0]) * s, crestA[1] + (crestB[1] - crestA[1]) * s)
		const angle = 0.55 - 0.15 * s + 0.12 * Math.sin(wave - i * 0.9)
		const dx = Math.cos(angle) * length
		const dy = -Math.sin(angle) * length
		const mid: Point = [base[0] + dx * 0.5, base[1] + dy * 0.5 + 0.3 * Math.sin(wave * 1.3 - i)]
		hair.push(cap(base, mid, 0.9, 0.5), cap(mid, [base[0] + dx, base[1] + dy], 0.5, 0.1))
	})
	// Ekor: berkibar memanjang ke belakang dengan dua helai tambahan
	const tailBase = B(53.4, 17.4)
	const t1: Point = [tailBase[0] + 3.6, tailBase[1] + 0.5 + 0.5 * Math.sin(wave)]
	const t2: Point = [t1[0] + 3.6, t1[1] + 1.1 + 0.8 * Math.sin(wave - 1)]
	const t3: Point = [t2[0] + 3.3, t2[1] + 1.4 + 1.1 * Math.sin(wave - 2)]
	hair.push(
		cap(tailBase, t1, 1.5, 1.25),
		cap(t1, t2, 1.25, 0.85),
		cap(t2, t3, 0.85, 0.2),
		cap(t1, [t1[0] + 3.4, t1[1] + 2.6 + 0.7 * Math.sin(wave - 1.6)], 0.7, 0.15),
		cap(t2, [t2[0] + 3.2, t2[1] - 0.4 + 0.9 * Math.sin(wave - 2.4)], 0.55, 0.12)
	)

	return { outline, ears, legs, hair, eye: H(20.3, 10.4), bob }
}

/** Jarak bertanda ke poligon (flat [x0, y0, x1, y1, ...]), negatif di dalam (aturan even-odd). */
function polygon(px: number, py: number, points: number[]): number {
	let best = Infinity
	let inside = false
	for (let i = 0, j = points.length - 2; i < points.length; j = i, i += 2) {
		const ax = points[j]
		const ay = points[j + 1]
		const ex = points[i] - ax
		const ey = points[i + 1] - ay
		const wx = px - ax
		const wy = py - ay
		const t = Math.min(Math.max((wx * ex + wy * ey) / (ex * ex + ey * ey), 0), 1)
		const dx = wx - ex * t
		const dy = wy - ey * t
		best = Math.min(best, dx * dx + dy * dy)
		if (ay > py !== points[i + 1] > py && px < ax + (ex * (py - ay)) / ey) inside = !inside
	}
	return inside ? -Math.sqrt(best) : Math.sqrt(best)
}

function capsule(px: number, py: number, c: Capsule): number {
	const vx = c[2] - c[0]
	const vy = c[3] - c[1]
	const lengthSquared = vx * vx + vy * vy
	const t = lengthSquared === 0 ? 0 : Math.min(Math.max(((px - c[0]) * vx + (py - c[1]) * vy) / lengthSquared, 0), 1)
	const dx = px - c[0] - t * vx
	const dy = py - c[1] - t * vy
	return Math.sqrt(dx * dx + dy * dy) - c[4] - (c[5] - c[4]) * t
}

/** Smooth minimum: menyatukan dua bentuk dengan sambungan yang membulat selebar `k`. */
function smin(a: number, b: number, k: number): number {
	const h = Math.max(k - Math.abs(a - b), 0) / k
	return Math.min(a, b) - h * h * k * 0.25
}

/** Bagian kuda yang paling dekat dengan titik terakhir yang diukur `distance` (badan, rambut, atau kaki sisi jauh). */
let region = REGION_BODY

/** Jarak bertanda ke siluet kuda, negatif berarti di dalam. */
function distance(horse: Horse, x: number, y: number): number {
	let body = polygon(x, y, horse.outline)
	for (const part of horse.ears) body = smin(body, capsule(x, y, part), 0.6)
	let solid = body
	let nearest = body
	let farLeg = Infinity
	for (let i = 0; i < horse.legs.length; i++) {
		let limb = Infinity
		for (const part of horse.legs[i]) limb = smin(limb, capsule(x, y, part), 0.5)
		// Tiap kaki disambung halus ke badan saja, supaya kaki yang bersilangan tidak saling melebur.
		solid = Math.min(solid, smin(body, limb, 1.2))
		if (i % 2) farLeg = Math.min(farLeg, limb)
		else nearest = Math.min(nearest, limb)
	}
	let hair = Infinity
	for (const part of horse.hair) hair = Math.min(hair, capsule(x, y, part))
	region = hair < solid ? REGION_HAIR : farLeg < nearest ? REGION_FAR_LEG : REGION_BODY
	return smin(solid, hair, 0.7)
}

function bounds(horse: Horse): [minX: number, minY: number, maxX: number, maxY: number] {
	let minX = Infinity
	let minY = Infinity
	let maxX = -Infinity
	let maxY = -Infinity
	for (let i = 0; i < horse.outline.length; i += 2) {
		minX = Math.min(minX, horse.outline[i])
		minY = Math.min(minY, horse.outline[i + 1])
		maxX = Math.max(maxX, horse.outline[i])
		maxY = Math.max(maxY, horse.outline[i + 1])
	}
	for (const part of [...horse.ears, ...horse.legs.flat(), ...horse.hair]) {
		const r = Math.max(part[4], part[5]) + 0.5
		minX = Math.min(minX, part[0] - r, part[2] - r)
		minY = Math.min(minY, part[1] - r, part[3] - r)
		maxX = Math.max(maxX, part[0] + r, part[2] + r)
		maxY = Math.max(maxY, part[1] + r, part[3] + r)
	}
	return [minX, minY, maxX, maxY]
}

/** Pilih warna titik bagian dalam dari tekstur noise yang menempel di badan (ikut naik-turun). */
function interiorColor(x: number, y: number, depth: number, area: number, sparkle: number): number {
	// Campuran bidang besar (bayangan otot) dan bintik halus, supaya krem dominan dengan taburan cyan.
	const n = 0.55 * noise(x * 0.16, y * 0.16) + 0.45 * noise(x * 0.8 + 17, y * 0.8 + 5)
	if (area === REGION_HAIR) return n < 0.4 ? 4 : n < 0.52 ? 3 : n < 0.64 ? 2 : 0
	if (area === REGION_FAR_LEG) return n < 0.45 ? 4 : n < 0.6 ? 3 : 2
	// Kilau glitch: sesekali satu titik berubah pink/merah/kuning
	if (sparkle < 0.012) return 10
	if (sparkle < 0.018) return 8
	if (sparkle < 0.024) return 9
	if (n < 0.24) return 4
	if (n < 0.3 || (depth < 0.8 && n < 0.48)) return 3
	if (n > 0.64) return 2
	if (n > 0.57) return 1
	return 0
}

/**
 * Gambar satu frame ke canvas berukuran `width` x `height` (piksel CSS). Grid diskalakan supaya muat
 * di tengah. `glitchy` = aktifkan glitch acak (geser baris dan RGB split melebar), matikan untuk reduce motion.
 */
export function drawHorse(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, glitchy = true) {
	ctx.clearRect(0, 0, width, height)
	const cell = Math.min(width / COLS, height / ROWS)
	if (!(cell > 0)) return
	const ox = (width - COLS * cell) / 2
	const oy = (height - ROWS * cell) / 2

	const horse = buildHorse(time)
	const travelled = time * GROUND_SPEED
	const bucket = Math.floor(time * 10)
	const glitch = glitchy && rand(bucket, 3, 1) < 0.07
	const spread = glitch ? 2.2 : 1
	// Batas aman: geseran kanal terlebar (spread x 1.45 per baris) ditambah jitter per sel.
	const reach = SPLIT_REACH * spread * 1.45 + 0.55
	const sparkleFrame = Math.floor(time * 8)
	const eyeCol = Math.floor(horse.eye[0])
	const eyeRow = Math.floor(horse.eye[1])
	const [minX, minY, maxX, maxY] = bounds(horse)

	const dots: number[][] = PALETTE.map(() => [])
	const mask = new Uint8Array(COLS * ROWS)

	for (let row = 0; row < ROWS; row++) {
		const y = row + 0.5
		if (y < minY - reach || y > maxY + reach) continue
		const band = row >> 2
		const shift = glitch && rand(band, bucket, 2) < 0.35 ? Math.round((rand(band, bucket, 4) - 0.5) * 6) : 0
		// Lebar RGB split beda-beda per baris (dan berganti pelan), seperti scanline yang tidak sejajar.
		const rowSpread = spread * (0.55 + 0.9 * rand(row, Math.floor(time * 4), 5))
		for (let col = 0; col < COLS; col++) {
			const x = col + 0.5 - shift
			if (x < minX - reach || x > maxX + reach) continue
			const d = distance(horse, x, y)
			const area = region
			if (d > reach) continue
			if (d < 0) mask[row * COLS + col] = 1

			// Sel dekat tepi: cek tiap kanal RGB dengan siluet yang digeser, hasilnya jadi warna tepi.
			// Geseran diberi sedikit jitter per sel supaya tepinya bertekstur, bukan garis warna yang rata.
			let channels = 7
			if (d > -reach) {
				channels = 0
				const jx = (rand(col, row, 11) - 0.5) * 0.6
				const jy = (rand(col, row, 12) - 0.5) * 0.6
				for (let k = 0; k < 3; k++) {
					const sx = x - SPLIT[k][0] * rowSpread + jx
					const sy = y - SPLIT[k][1] * rowSpread + jy
					if (distance(horse, sx, sy) < 0) channels |= 1 << k
				}
			}
			if (channels === 0) continue

			let color = FRINGE[channels]
			let size = channels === 1 || channels === 2 || channels === 4 ? 0.78 : 0.86
			if (channels === 7) {
				const isEye = Math.floor(x) === eyeCol && row === eyeRow
				color = isEye ? 5 : interiorColor(x, y - horse.bob, -d, area, rand(col, row, sparkleFrame))
				size = d > -0.5 ? 0.88 : 1
			}
			dots[color].push(ox + (col + 0.5) * cell, oy + y * cell, size)
		}
	}

	// Garis gerak: tiap baris "dilumuri" ke kiri dan kanan dari siluet, makin jauh makin pudar.
	const streaks: number[][] = STREAK_ALPHA.map(() => [])
	const ahead = new Float32Array(COLS)
	for (let row = 0; row < ROWS; row++) {
		const strength = Math.min(Math.max(noise(row * 0.55 + 9, time * 1.3) * 1.7 - 0.45, 0), 1)
		if (strength === 0) continue
		const front = 5 + 9 * noise(row * 0.37, time * 0.9)
		const back = 9 + 14 * noise(row * 0.37 + 50, time * 0.9)
		let run = 0
		for (let col = COLS - 1; col >= 0; col--) {
			run = mask[row * COLS + col] ? 1 : Math.max(run - 1 / front, 0)
			ahead[col] = run
		}
		run = 0
		for (let col = 0; col < COLS; col++) {
			run = mask[row * COLS + col] ? 1 : Math.max(run - 1 / back, 0)
			const flow = 0.5 + 0.5 * noise((col - travelled * 0.5) * 0.18, row * 0.9)
			const value = Math.max(run, ahead[col]) * strength * flow
			if (value >= 0.08)
				streaks[Math.min(3, Math.floor(value * 4))].push(ox + col * cell, oy + (row + 0.22) * cell)
		}
	}

	ctx.fillStyle = STREAK_COLOR
	streaks.forEach((rects, level) => {
		ctx.globalAlpha = STREAK_ALPHA[level]
		ctx.beginPath()
		for (let i = 0; i < rects.length; i += 2) ctx.rect(rects[i], rects[i + 1], cell, cell * 0.56)
		ctx.fill()
	})
	ctx.globalAlpha = 1

	const radius = cell * 0.43

	// Garis tanah dari titik-titik yang memudar ke samping dan ikut bergeser.
	const groundY = oy + (Math.floor(GROUND) + 1.5) * cell
	ctx.fillStyle = GROUND_COLOR
	ctx.beginPath()
	for (let col = 0; col < COLS; col++) {
		const fade = 1 - Math.abs(col + 0.5 - 40) / 26
		if (fade <= 0) continue
		const r = radius * fade * (0.45 + 0.55 * noise((col - travelled * 0.5) * 0.35, 3.7))
		const cx = ox + (col + 0.5) * cell
		ctx.moveTo(cx + r, groundY)
		ctx.arc(cx, groundY, r, 0, TAU)
	}
	ctx.fill()

	dots.forEach((list, color) => {
		if (!list.length) return
		ctx.fillStyle = PALETTE[color]
		ctx.beginPath()
		for (let i = 0; i < list.length; i += 3) {
			const r = radius * list[i + 2]
			ctx.moveTo(list[i] + r, list[i + 1])
			ctx.arc(list[i], list[i + 1], r, 0, TAU)
		}
		ctx.fill()
	})
}
