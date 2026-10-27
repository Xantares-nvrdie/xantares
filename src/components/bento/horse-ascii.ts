/**
 * Kuda neraka ASCII yang menerjang. Badan dirakit dari kapsul (garis dengan ketebalan), kaki digerakkan
 * pakai IK dua ruas mengikuti siklus lari, surai/ekor/kuku berupa api yang berkedip, plus bara yang
 * beterbangan. Setiap sel dirender jadi karakter sesuai seberapa penuh sel itu tertutup. Fungsinya murni
 * (tanpa Math.random) supaya hasil server dan client sama.
 */
export const COLS = 44
export const ROWS = 14

/** Perbandingan tinggi : lebar satu sel karakter monospace (line-height 1.08em / advance 0.6em). */
const CELL_H = 1.8
const GROUND = 23
const CYCLE_SECONDS = 0.56
const STANCE_FRACTION = 0.56
const STRIDE = 6

/** Kecepatan tanah bergerak ke kiri (kolom/detik), dicocokkan dengan gerak kaki di tanah supaya tidak "meluncur". */
export const GROUND_SPEED = (2 * STRIDE) / (STANCE_FRACTION * CYCLE_SECONDS)

type Point = [number, number]
type Capsule = [x1: number, y1: number, x2: number, y2: number, radius: number]

const BODY_RAMP = ' .:-=+*#%@'
const FIRE_RAMP = ' .`:^*%#'
const TAU = Math.PI * 2

/** Posisi kaki dalam satu siklus: ayun ke depan sambil terangkat, lalu menapak dan terdorong ke belakang. */
function foot(phase: number, x0: number, lift: number): Point {
	const u = ((phase % 1) + 1) % 1
	const swing = 1 - STANCE_FRACTION
	if (u < swing) {
		const t = u / swing
		return [x0 - STRIDE * Math.cos(Math.PI * t), GROUND - lift * Math.sin(Math.PI * t)]
	}
	const t = (u - swing) / STANCE_FRACTION
	return [x0 + STRIDE - 2 * STRIDE * t, GROUND]
}

/** IK dua ruas: cari posisi lutut. `forward` = lutut menekuk ke depan (kaki depan), kebalikannya untuk kaki belakang. */
function knee(joint: Point, target: Point, upper: number, lower: number, forward: boolean): Point {
	const dx = target[0] - joint[0]
	const dy = target[1] - joint[1]
	const reach = Math.hypot(dx, dy)
	const d = Math.min(Math.max(reach, Math.abs(upper - lower) + 0.01), upper + lower - 0.01)
	const a = (upper * upper - lower * lower + d * d) / (2 * d)
	const h = Math.sqrt(Math.max(upper * upper - a * a, 0))
	const ux = dx / reach
	const uy = dy / reach
	const side = forward ? 1 : -1
	return [joint[0] + ux * a + side * h * uy, joint[1] + uy * a - side * h * ux]
}

function leg(joint: Point, phase: number, x0: number, forward: boolean): { bones: Capsule[]; hoof: Point } {
	const hoof = foot(phase, x0, 5.2)
	const k = knee(joint, hoof, 5.2, 5.2, forward)
	return {
		hoof,
		bones: [
			[joint[0], joint[1], k[0], k[1], 1.3],
			[k[0], k[1], hoof[0], hoof[1], 0.68],
			[hoof[0], hoof[1] - 0.2, hoof[0] + 0.6, hoof[1], 0.85]
		]
	}
}

/** Lidah api dua ruas yang meliuk, mulai dari `base` menuju (dx, dy). */
function tongue(base: Point, dx: number, dy: number, sway: number, wave: number, radius: number): Capsule[] {
	const mid: Point = [base[0] + dx * 0.55, base[1] + dy * 0.55 + sway * Math.sin(wave)]
	const tip: Point = [base[0] + dx, base[1] + dy + sway * 1.4 * Math.sin(wave - 1)]
	return [
		[base[0], base[1], mid[0], mid[1], radius],
		[mid[0], mid[1], tip[0], tip[1], radius * 0.5]
	]
}

function horse(time: number): { body: Capsule[]; fire: Capsule[]; eye: Point } {
	const u = (time / CYCLE_SECONDS) % 1
	const bob = -1.3 * (0.5 + 0.5 * Math.cos(TAU * (u - 0.28)))
	const nod = 0.6 * Math.sin(TAU * (u + 0.1))
	const flicker = TAU * u * 2

	const hip: Point = [13.5, 11.9 + bob]
	const mid: Point = [20.4, 11.3 + bob]
	const shoulder: Point = [27.4, 11.8 + bob]
	const neckBase: Point = [shoulder[0] + 0.2, shoulder[1] - 2.2]
	const poll: Point = [33.6, 4.9 + bob + nod]
	const skullEnd: Point = [poll[0] + 3.0, poll[1] + 2.3]
	const nose: Point = [skullEnd[0] + 3.4, skullEnd[1] + 2.0]
	const chin: Point = [skullEnd[0] + 2.1, skullEnd[1] + 3.9]

	const hind = { joint: [hip[0] + 1.2, hip[1] + 2.5] as Point }
	const fore = { joint: [shoulder[0] - 1, shoulder[1] + 2.9] as Point }
	const legs = [
		leg(hind.joint, u, 14.5, false),
		leg(hind.joint, u + 0.12, 13.2, false),
		leg(fore.joint, u + 0.46, 30.4, true),
		leg(fore.joint, u + 0.58, 28.8, true)
	]

	const neckAt = (t: number): Point => [
		neckBase[0] + (poll[0] - neckBase[0]) * t - 0.6,
		neckBase[1] + (poll[1] - neckBase[1]) * t - 1.9
	]
	const tailBase: Point = [hip[0] - 2.4, hip[1] - 2.6]
	const tail1: Point = [tailBase[0] - 3.4, tailBase[1] - 0.6 + 0.9 * Math.sin(flicker)]
	const tail2: Point = [tail1[0] - 3.3, tail1[1] + 0.7 + 1.1 * Math.sin(flicker - 0.9)]
	const tail3: Point = [tail2[0] - 2.8, tail2[1] + 1.9 + 1.3 * Math.sin(flicker - 1.8)]

	return {
		eye: [poll[0] + 1.7, poll[1] - 0.2],
		body: [
			[hip[0], hip[1], mid[0], mid[1], 3.0],
			[mid[0], mid[1], shoulder[0], shoulder[1], 3.4],
			[neckBase[0], neckBase[1], poll[0], poll[1], 1.9],
			[poll[0], poll[1], skullEnd[0], skullEnd[1], 1.4],
			[skullEnd[0], skullEnd[1], nose[0], nose[1], 0.95],
			[skullEnd[0] - 0.6, skullEnd[1] + 0.5, chin[0], chin[1], 0.55],
			[poll[0] - 0.2, poll[1] - 1.1, poll[0] - 2.4, poll[1] - 2.3, 0.5],
			...legs.flatMap((item) => item.bones)
		],
		fire: [
			// Surai menyala di sepanjang leher
			...tongue(neckAt(0.15), -5.4, -1.8, 0.7, flicker, 1.0),
			...tongue(neckAt(0.5), -4.6, -2.6, 0.7, flicker - 0.7, 0.9),
			...tongue(neckAt(0.9), -3.6, -2.8, 0.6, flicker - 1.4, 0.8),
			// Ekor api
			[tailBase[0], tailBase[1], tail1[0], tail1[1], 1.2],
			[tail1[0], tail1[1], tail2[0], tail2[1], 1.0],
			[tail2[0], tail2[1], tail3[0], tail3[1], 0.65],
			...tongue(tailBase, -4.8, -3, 0.8, flicker - 0.5, 0.85),
			...tongue(tailBase, -4.2, 2.6, 0.8, flicker - 1.2, 0.8),
			// Kuku menyala
			...legs.flatMap((item) => tongue([item.hoof[0], item.hoof[1] - 0.4], -2.2, -2.4, 0.4, flicker + item.hoof[0], 0.55))
		]
	}
}

function distanceToCapsule(px: number, py: number, [x1, y1, x2, y2, r]: Capsule): number {
	const vx = x2 - x1
	const vy = y2 - y1
	const lengthSquared = vx * vx + vy * vy
	const t = lengthSquared === 0 ? 0 : Math.min(Math.max(((px - x1) * vx + (py - y1) * vy) / lengthSquared, 0), 1)
	return Math.hypot(px - (x1 + t * vx), py - (y1 + t * vy)) - r
}

/** Hash deterministik kecil untuk tekstur latar dan kedipan api, tanpa Math.random. */
function hash(x: number, y: number, z = 0): number {
	let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(z | 0, 2246822519)
	h = Math.imul(h ^ (h >>> 13), 1274126177)
	return (h ^ (h >>> 16)) >>> 0
}

/** Garis kecepatan: goresan 3-6 karakter yang mulai di titik acak dan ikut bergeser bersama tanah. */
function isStreak(x: number, row: number): boolean {
	for (let k = 0; k < 6; k++) {
		const h = hash(x - k, row)
		if (h % 29 === 0 && k < 3 + ((h >>> 8) % 4)) return true
	}
	return false
}

/** Seberapa penuh (0..1) sebuah sel tertutup kapsul, dari 6 titik sampel. */
function coverage(shapes: Capsule[], col: number, row: number): number {
	let covered = 0
	for (let sy = 0; sy < 3; sy++) {
		for (let sx = 0; sx < 2; sx++) {
			const px = col + (sx + 0.5) / 2
			const py = (row + (sy + 0.5) / 3) * CELL_H
			if (shapes.some((shape) => distanceToCapsule(px, py, shape) <= 0)) covered++
		}
	}
	return covered / 6
}

const EMBERS = 16

export type HorseLayers = { scene: string; body: string; fire: string; eye: string }

/**
 * Hasilkan empat lapisan teks berukuran sama supaya masing-masing bisa diberi warna sendiri:
 * `scene` (garis kecepatan + tanah), `body` (kuda), `fire` (api + bara), dan `eye` (mata merah menyala).
 */
export function renderHorse(time: number): HorseLayers {
	const { body, fire, eye } = horse(time)
	const distance = time * GROUND_SPEED
	const frame = Math.floor(time * 20)

	// Bara: lahir di sekitar ekor, terbawa angin ke kiri sambil naik, lalu padam.
	const embers = new Map<string, string>()
	for (let i = 0; i < EMBERS; i++) {
		const p = (time * 0.85 + i / EMBERS) % 1
		const seed = hash(i, 7)
		const x = 11 + (seed % 5) - p * (14 + (seed % 7))
		const y = 7.5 + ((seed >>> 4) % 4) * 1.6 - p * 6 - 1.2 * Math.sin(p * 9 + i)
		const col = Math.round(x - 0.5)
		const row = Math.floor(y / CELL_H)
		if (col >= 0 && col < COLS && row >= 0 && row < ROWS && p < 0.9) embers.set(`${col},${row}`, p < 0.3 ? '*' : p < 0.65 ? '+' : '.')
	}

	const eyeCol = Math.floor(eye[0])
	const eyeRow = Math.floor(eye[1] / CELL_H)
	const rows: Record<keyof HorseLayers, string[]> = { scene: [], body: [], fire: [], eye: [] }

	for (let row = 0; row < ROWS; row++) {
		let sceneLine = ''
		let bodyLine = ''
		let fireLine = ''
		let eyeLine = ''
		for (let col = 0; col < COLS; col++) {
			const isEye = col === eyeCol && row === eyeRow
			const bodyCoverage = coverage(body, col, row)
			const fireValue = coverage(fire, col, row) * (0.6 + 0.4 * ((hash(col, row, frame) % 100) / 100))

			let bodyChar = ' '
			let fireChar = ' '
			if (isEye) {
				// sel mata dikosongkan di lapisan lain
			} else if (bodyCoverage >= 0.34) {
				bodyChar = BODY_RAMP[Math.max(1, Math.round(bodyCoverage * (BODY_RAMP.length - 1)))]
			} else if (fireValue >= 0.2) {
				fireChar = FIRE_RAMP[Math.min(FIRE_RAMP.length - 1, Math.round(fireValue * (FIRE_RAMP.length - 1)))]
			} else {
				fireChar = embers.get(`${col},${row}`) ?? ' '
			}
			bodyLine += bodyChar
			fireLine += fireChar
			eyeLine += isEye ? '@' : ' '

			if (row === ROWS - 1) {
				const h = hash(col + Math.floor(distance), 99) % 35
				sceneLine += h % 7 === 0 ? ',' : h % 5 === 0 ? '.' : '_'
			} else if (row === 2 || row === 5 || row === 8 || row === 10) {
				const speed = row === 2 ? 0.5 : row === 5 ? 0.75 : row === 8 ? 1 : 1.3
				sceneLine += isStreak(col + Math.floor(distance * speed), row) ? '-' : ' '
			} else {
				sceneLine += ' '
			}
		}
		rows.scene.push(sceneLine)
		rows.body.push(bodyLine)
		rows.fire.push(fireLine)
		rows.eye.push(eyeLine)
	}
	return { scene: rows.scene.join('\n'), body: rows.body.join('\n'), fire: rows.fire.join('\n'), eye: rows.eye.join('\n') }
}
