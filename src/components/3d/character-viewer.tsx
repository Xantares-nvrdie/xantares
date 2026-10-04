'use client'

import { Environment, useGLTF, useProgress } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as React from 'react'
import * as THREE from 'three'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'

import { cn } from '@/lib/utils'

const MODEL_URL = '/models/gta5finalsmartrig.glb'

/**
 * Konfigurasi gerak "nengok ngikut kursor".
 * Kalau arahnya kebalik atau gerakannya kurang/kelebihan, cukup ubah angka di sini.
 */
const LOOK = {
	/** Batas putar kiri-kanan kepala (derajat). */
	maxYaw: 34,
	/** Batas angguk atas-bawah kepala (derajat). */
	maxPitch: 20,
	/** Balik arah kalau nengoknya ke sisi yang salah. */
	invertYaw: false,
	invertPitch: false,
	/** Makin besar makin cepat menyusul kursor (smoothing, stabil di semua FPS). */
	followSpeed: 5.5,
	/**
	 * Koreksi arah pandang default (derajat), dipakai kalau rest pose kepalanya
	 * sudah nengok duluan dan mau ditengahin ke kamera. 0 = pakai pose asli dari file.
	 */
	baseYaw: 0,
	basePitch: 0,
	/** Rotasi seluruh karakter (derajat) kalau badannya belum menghadap kamera. */
	modelYaw: 0,
	/** Set true untuk nge-print semua nama bone di console (buat mapping rig baru). */
	debugBones: false
}

/**
 * Framing kamera. Dihitung manual (bukan pakai <Bounds>/<Center> dari drei) karena
 * Box3.expandByObject milik three salah ngukur SkinnedMesh: SkinnedMesh.computeBoundingBox()
 * sudah menghasilkan box di ruang dunia (dia pakai bone.matrixWorld), lalu three mengalikan
 * object.matrixWorld sekali lagi. Jadi begitu modelnya digeser (misal oleh <Center>),
 * box-nya kegeser dua kali dan kamera jadi ngebidik ke bawah badan -> kepala kepotong.
 */
const FRAME = {
	/** Porsi tinggi viewport yang diisi karakter. 1 = pas penuh, >1 = zoom in (sebagian kepotong). */
	fill: 0.92,
	/** Titik fokus vertikal: 0 = kaki, 0.5 = tengah badan, 1 = ujung kepala. */
	focusY: 0.5
}

/**
 * Bone yang ikut nengok, urut dari badan ke kepala (parent dulu, baru child).
 * `weight` = porsi rotasi: 1 berarti kena rotasi penuh `maxYaw`/`maxPitch`.
 * Bone perantara dibuat kecil supaya gerakannya natural (badan ikut sedikit, kepala penuh).
 *
 * Nama bone di rig ini generic (hasil auto-rig). Hasil pemetaan dari bobot skinning-nya:
 *   Bone_002 -> dada atas/punggung, Bone_001 -> pangkal leher, Bone_010 -> kepala (plus semua
 *   bone wajah/aksesoris yang jadi anaknya, jadi ikut terbawa otomatis).
 */
const LOOK_BONES: ReadonlyArray<{ name: string; weight: number }> = [
	{ name: 'Bone_002', weight: 0.1 },
	{ name: 'Bone_001', weight: 0.22 },
	{ name: 'Bone_010', weight: 1 }
]

type Pointer = { x: number; y: number }

type LookBone = {
	object: THREE.Object3D
	weight: number
	/** Rotasi dunia saat rest pose, diisi di frame pertama dan jadi acuan rotasi. */
	restWorld: THREE.Quaternion
}

/**
 * Ukur bounding box model dari geometry (bind space), bukan lewat Box3.setFromObject,
 * supaya kebal dari bug double-transform di SkinnedMesh yang dijelaskan di atas.
 */
function useModelBox(model: THREE.Object3D) {
	return React.useMemo(() => {
		model.updateMatrixWorld(true)

		const box = new THREE.Box3()
		const temp = new THREE.Box3()

		model.traverse((child) => {
			const mesh = child as THREE.Mesh
			if (!mesh.isMesh || !mesh.geometry) return

			if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox()
			if (!mesh.geometry.boundingBox) return

			temp.copy(mesh.geometry.boundingBox)
			// SkinnedMesh: geometry sudah di bind space yang sama dengan hasil skinning-nya,
			// mesh biasa: perlu dikali transform-nya sendiri.
			if (!(mesh as THREE.SkinnedMesh).isSkinnedMesh) temp.applyMatrix4(mesh.matrixWorld)
			box.union(temp)
		})

		return box
	}, [model])
}

/** Posisikan kamera supaya karakter pas di dalam canvas, ikut nyesuain saat ukuran box berubah. */
function useFitCamera(box: THREE.Box3) {
	const camera = useThree((state) => state.camera)
	const size = useThree((state) => state.size)

	React.useLayoutEffect(() => {
		if (!(camera as THREE.PerspectiveCamera).isPerspectiveCamera) return
		const cam = camera as THREE.PerspectiveCamera
		if (box.isEmpty() || size.height === 0) return

		const extent = box.getSize(new THREE.Vector3())
		const aspect = size.width / size.height
		const halfTan = Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2)

		// Jarak minimal supaya tinggi dan lebar karakter dua-duanya masuk frame.
		const distanceForHeight = extent.y / FRAME.fill / (2 * halfTan)
		const distanceForWidth = extent.x / FRAME.fill / (2 * halfTan * aspect)
		// + setengah ketebalan badan, biar sisi yang paling dekat kamera ikut aman.
		const distance = Math.max(distanceForHeight, distanceForWidth) + extent.z / 2

		cam.position.set(0, 0, distance)
		// The R3F camera is mutable by design; these values must be updated after fitting.
		// eslint-disable-next-line react-hooks/immutability
		cam.near = Math.max(0.05, distance - extent.z * 2)
		cam.far = distance + extent.z * 4 + 10
		cam.lookAt(0, 0, 0)
		cam.updateProjectionMatrix()
	}, [box, camera, size])
}

/** Normalisasi posisi kursor relatif ke titik tengah canvas, hasilnya -1..1. */
function useWindowPointer(target: React.RefObject<Pointer>) {
	const { gl } = useThree()

	React.useEffect(() => {
		const canvas = gl.domElement

		const handleMove = (event: PointerEvent) => {
			const rect = canvas.getBoundingClientRect()
			const centerX = rect.left + rect.width / 2
			const centerY = rect.top + rect.height / 2

			target.current.x = THREE.MathUtils.clamp((event.clientX - centerX) / (window.innerWidth / 2), -1, 1)
			target.current.y = THREE.MathUtils.clamp((event.clientY - centerY) / (window.innerHeight / 2), -1, 1)
		}

		// Kursor keluar dari window -> balik ke posisi netral.
		const handleLeave = () => {
			target.current.x = 0
			target.current.y = 0
		}

		window.addEventListener('pointermove', handleMove, { passive: true })
		window.addEventListener('blur', handleLeave)
		document.addEventListener('mouseleave', handleLeave)

		return () => {
			window.removeEventListener('pointermove', handleMove)
			window.removeEventListener('blur', handleLeave)
			document.removeEventListener('mouseleave', handleLeave)
		}
	}, [gl, target])
}

function Character() {
	const { scene } = useGLTF(MODEL_URL)
	const pointer = React.useRef<Pointer>({ x: 0, y: 0 })

	useWindowPointer(pointer)

	// SkeletonUtils.clone (bukan scene.clone) supaya skeleton ter-rebind ke bone hasil clone.
	const model = React.useMemo(() => cloneSkinned(scene), [scene])

	const lookBones = React.useMemo<LookBone[]>(() => {
		if (LOOK.debugBones) {
			const names: string[] = []
			model.traverse((child) => {
				if ((child as THREE.Bone).isBone) names.push(child.name)
			})
			console.info('[character-viewer] bone yang tersedia:', names)
		}

		return LOOK_BONES.flatMap(({ name, weight }) => {
			const object = model.getObjectByName(name)
			if (!object) {
				console.warn(`[character-viewer] bone "${name}" tidak ada di ${MODEL_URL}`)
				return []
			}
			return [{ object, weight, restWorld: new THREE.Quaternion() }]
		})
	}, [model])

	const restCaptured = React.useRef(false)

	React.useEffect(() => {
		restCaptured.current = false
	}, [lookBones])

	// SkinnedMesh gampang salah ter-cull waktu bone-nya diputar, jadi culling dimatikan.
	React.useEffect(() => {
		model.traverse((child) => {
			const mesh = child as THREE.Mesh
			if (mesh.isMesh) {
				mesh.frustumCulled = false
				mesh.castShadow = false
				mesh.receiveShadow = false
			}
		})
	}, [model])

	// Objek kerja, dibuat sekali supaya tidak alokasi tiap frame.
	const tmp = React.useMemo(
		() => ({
			euler: new THREE.Euler(0, 0, 0, 'YXZ'),
			offset: new THREE.Quaternion(),
			parentWorld: new THREE.Quaternion(),
			targetLocal: new THREE.Quaternion(),
			scratchVec: new THREE.Vector3(),
			scratchScale: new THREE.Vector3()
		}),
		[]
	)

	useFrame((_state, delta) => {
		if (lookBones.length === 0) return

		// Frame pertama: rekam rotasi dunia tiap bone di rest pose sebagai titik nol.
		if (!restCaptured.current) {
			for (const bone of lookBones) {
				bone.object.updateWorldMatrix(true, false)
				bone.object.matrixWorld.decompose(tmp.scratchVec, bone.restWorld, tmp.scratchScale)
			}
			restCaptured.current = true
		}

		const yaw =
			THREE.MathUtils.degToRad(LOOK.baseYaw) +
			(LOOK.invertYaw ? -1 : 1) * pointer.current.x * THREE.MathUtils.degToRad(LOOK.maxYaw)
		const pitch =
			THREE.MathUtils.degToRad(LOOK.basePitch) +
			(LOOK.invertPitch ? -1 : 1) * pointer.current.y * THREE.MathUtils.degToRad(LOOK.maxPitch)
		const alpha = 1 - Math.exp(-LOOK.followSpeed * delta)

		for (const bone of lookBones) {
			tmp.euler.set(pitch * bone.weight, yaw * bone.weight, 0)
			tmp.offset.setFromEuler(tmp.euler)

			// Rest pose rig ini miring (karakternya memang sudah dipose), jadi rotasi dihitung
			// di ruang dunia: target_dunia = offset * restWorld. Hasilnya dikonversi balik ke
			// rotasi lokal pakai world rotation parent yang sudah ter-update.
			const parent = bone.object.parent

			if (parent) {
				parent.updateWorldMatrix(true, false)
				parent.matrixWorld.decompose(tmp.scratchVec, tmp.parentWorld, tmp.scratchScale)
				tmp.targetLocal.copy(tmp.parentWorld).invert().multiply(tmp.offset).multiply(bone.restWorld)
			} else {
				tmp.targetLocal.copy(tmp.offset).multiply(bone.restWorld)
			}

			bone.object.quaternion.slerp(tmp.targetLocal, alpha)
		}
	})

	// Geser model supaya titik fokus (default tengah badan) ada di origin, lalu kamera
	// cukup ngelihat ke origin tanpa perlu dimiringin.
	const box = useModelBox(model)
	useFitCamera(box)

	const offset = React.useMemo(() => {
		if (box.isEmpty()) return new THREE.Vector3()
		const center = box.getCenter(new THREE.Vector3())
		const focus = box.min.y + (box.max.y - box.min.y) * FRAME.focusY
		return new THREE.Vector3(-center.x, -focus, -center.z)
	}, [box])

	return (
		<group rotation={[0, THREE.MathUtils.degToRad(LOOK.modelYaw), 0]}>
			<primitive object={model} position={offset} />
		</group>
	)
}

function LoadingOverlay() {
	const { active, progress } = useProgress()

	if (!active) return null

	return (
		<div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-neutral-950/60 backdrop-blur-sm">
			<div className="h-1 w-24 overflow-hidden rounded-full bg-neutral-800">
				<div
					className="h-full rounded-full bg-white transition-all duration-200"
					style={{ width: `${progress}%` }}
				/>
			</div>
			<span className="text-xs font-medium text-neutral-400">{Math.round(progress)}%</span>
		</div>
	)
}

function CharacterViewer({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div className={cn('relative size-full', className)} {...props}>
			<Canvas
				camera={{ fov: 32, position: [0, 0, 4] }}
				dpr={[1, 2]}
				gl={{
					antialias: true,
					alpha: true,
					toneMapping: THREE.ACESFilmicToneMapping,
					toneMappingExposure: 1.15
				}}
				// Canvas hanya visual, jadi disembunyikan dari screen reader.
				aria-hidden="true"
			>
				{/* Cahaya dasar supaya sisi gelap karakter tidak hitam pekat. */}
				<ambientLight intensity={0.35} />

				{/* Key light: sumber cahaya utama dari kiri atas, bikin dimensi wajah lebih kelihatan. */}
				<directionalLight position={[-5, 7, 4]} intensity={3.4} color="#fff3e0" />

				{/* Fill light: redup dari kanan bawah, biar sisi gelap tetap kelihatan detailnya. */}
				<directionalLight position={[3, -1, 3]} intensity={0.5} color="#bcd9ff" />

				{/* Rim light: dari belakang buat misahin siluet karakter dari background. */}
				<directionalLight position={[-2, 2, -5]} intensity={1.4} color="#a900ff" />

				{/* Environment map: nambahin reflection/ambient yang bikin material kelihatan lebih "HD". */}
				<Environment preset="city" environmentIntensity={0.5} />

				<React.Suspense fallback={null}>
					<Character />
				</React.Suspense>
			</Canvas>

			<LoadingOverlay />
		</div>
	)
}

useGLTF.preload(MODEL_URL)

export { CharacterViewer }
