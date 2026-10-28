'use client'

import Image from 'next/image'
import * as React from 'react'

import { cn } from '@/lib/utils'

/*
 * Port komponen MetallicPaint (React Bits) yang dipakai untuk logo Lost & Found di OSTRICT. Shader-nya
 * sama persis. Bedanya: canvas mengikuti ukuran elemen (bukan selalu 1000px), gambar baru diproses saat
 * komponen hampir terlihat, animasi berhenti di luar layar, "reduce motion" hanya menggambar satu frame,
 * dan ada fallback gambar biasa kalau WebGL2 tidak tersedia.
 */

const VERTEX_SHADER = `#version 300 es
precision highp float;
in vec2 a_position;
out vec2 vP;
void main(){vP=a_position*.5+.5;gl_Position=vec4(a_position,0.,1.);}`

const FRAGMENT_SHADER = `#version 300 es
precision highp float;
in vec2 vP;
out vec4 oC;
uniform sampler2D u_tex;
uniform float u_time,u_ratio,u_imgRatio,u_seed,u_scale,u_refract,u_blur,u_liquid;
uniform float u_bright,u_contrast,u_angle,u_fresnel,u_sharp,u_wave,u_noise,u_chroma;
uniform float u_distort,u_contour;
uniform vec3 u_lightColor,u_darkColor,u_tint;

vec3 sC,sM;

vec3 pW(vec3 v){
  vec3 i=floor(v),f=fract(v),s=sign(fract(v*.5)-.5),h=fract(sM*i+i.yzx),c=f*(f-1.);
  return s*c*((h*16.-4.)*c-1.);
}

vec3 aF(vec3 b,vec3 c){return pW(b+c.zxy-pW(b.zxy+c.yzx)+pW(b.yzx+c.xyz));}
vec3 lM(vec3 s,vec3 p){return(p+aF(s,p))*.5;}

vec2 fA(){
  vec2 c=vP-.5;
  c.x*=u_ratio>u_imgRatio?u_ratio/u_imgRatio:1.;
  c.y*=u_ratio>u_imgRatio?1.:u_imgRatio/u_ratio;
  return vec2(c.x+.5,.5-c.y);
}

vec2 rot(vec2 p,float r){float c=cos(r),s=sin(r);return vec2(p.x*c+p.y*s,p.y*c-p.x*s);}

float bM(vec2 c,float t){
  vec2 l=smoothstep(vec2(0.),vec2(t),c),u=smoothstep(vec2(0.),vec2(t),1.-c);
  return l.x*l.y*u.x*u.y;
}

float mG(float hi,float lo,float t,float sh,float cv){
  sh*=(2.-u_sharp);
  float ci=smoothstep(.15,.85,cv),r=lo;
  float e1=.08/u_scale;
  r=mix(r,hi,smoothstep(0.,sh*1.5,t));
  r=mix(r,lo,smoothstep(e1-sh,e1+sh,t));
  float e2=e1+.05/u_scale*(1.-ci*.35);
  r=mix(r,hi,smoothstep(e2-sh,e2+sh,t));
  float e3=e2+.025/u_scale*(1.-ci*.45);
  r=mix(r,lo,smoothstep(e3-sh,e3+sh,t));
  float e4=e1+.1/u_scale;
  r=mix(r,hi,smoothstep(e4-sh,e4+sh,t));
  float rm=1.-e4,gT=clamp((t-e4)/rm,0.,1.);
  r=mix(r,mix(hi,lo,smoothstep(0.,1.,gT)),smoothstep(e4-sh*.5,e4+sh*.5,t));
  return r;
}

void main(){
  sC=fract(vec3(.7548,.5698,.4154)*(u_seed+17.31))+.5;
  sM=fract(sC.zxy-sC.yzx*1.618);
  vec2 sc=vec2(vP.x*u_ratio,1.-vP.y);
  float angleRad=u_angle*3.14159/180.;
  sc=rot(sc-.5,angleRad)+.5;
  sc=clamp(sc,0.,1.);
  float sl=sc.x-sc.y,an=u_time*.001;
  vec2 iC=fA();
  vec4 texSample=texture(u_tex,iC);
  float dp=texSample.r;
  float shapeMask=texSample.a;
  vec3 hi=u_lightColor*u_bright;
  vec3 lo=u_darkColor*(2.-u_bright);
  lo.b+=smoothstep(.6,1.4,sc.x+sc.y)*.08;
  vec2 fC=sc-.5;
  float rd=length(fC+vec2(0.,sl*.15));
  vec2 ag=rot(fC,(.22-sl*.18)*3.14159);
  float cv=1.-pow(rd*1.65,1.15);
  cv*=pow(sc.y,.35);
  float vs=shapeMask;
  vs*=bM(iC,.01);
  float fr=pow(1.-cv,u_fresnel)*.3;
  vs=min(vs+fr*vs,1.);
  float mT=an*.0625;
  vec3 wO=vec3(-1.05,1.35,1.55);
  vec3 wA=aF(vec3(31.,73.,56.),mT+wO)*.22*u_wave;
  vec3 wB=aF(vec3(24.,64.,42.),mT-wO.yzx)*.22*u_wave;
  vec2 nC=sc*45.*u_noise;
  nC+=aF(sC.zxy,an*.17*sC.yzx-sc.yxy*.35).xy*18.*u_wave;
  vec3 tC=vec3(.00041,.00053,.00076)*mT+wB*nC.x+wA*nC.y;
  tC=lM(sC,tC);
  tC=lM(sC+1.618,tC);
  float tb=sin(tC.x*3.14159)*.5+.5;
  tb=tb*2.-1.;
  float noiseVal=pW(vec3(sc*8.+an,an*.5)).x;
  float edgeFactor=smoothstep(0.,.5,dp)*smoothstep(1.,.5,dp);
  float lD=dp+(1.-dp)*u_liquid*tb;
  lD+=noiseVal*u_distort*.15*edgeFactor;
  float rB=clamp(1.-cv,0.,1.);
  float fl=ag.x+sl;
  fl+=noiseVal*sl*u_distort*edgeFactor;
  fl*=mix(1.,1.-dp*.5,u_contour);
  fl-=dp*u_contour*.8;
  float eI=smoothstep(0.,1.,lD)*smoothstep(1.,0.,lD);
  fl-=tb*sl*1.8*eI;
  float cA=cv*clamp(pow(sc.y,.12),.25,1.);
  fl*=.12+(1.05-lD)*cA;
  fl*=smoothstep(1.,.65,lD);
  float vA1=smoothstep(.08,.18,sc.y)*smoothstep(.38,.18,sc.y);
  float vA2=smoothstep(.08,.18,1.-sc.y)*smoothstep(.38,.18,1.-sc.y);
  fl+=vA1*.16+vA2*.025;
  fl*=.45+pow(sc.y,2.)*.55;
  fl*=u_scale;
  fl-=an;
  float rO=rB+cv*tb*.025;
  float vM1=smoothstep(-.12,.18,sc.y)*smoothstep(.48,.08,sc.y);
  float cM1=smoothstep(.35,.55,cv)*smoothstep(.95,.35,cv);
  rO+=vM1*cM1*4.5;
  rO-=sl;
  float bO=rB*1.25;
  float vM2=smoothstep(-.02,.35,sc.y)*smoothstep(.75,.08,sc.y);
  float cM2=smoothstep(.35,.55,cv)*smoothstep(.75,.35,cv);
  bO+=vM2*cM2*.9;
  bO-=lD*.18;
  rO*=u_refract*u_chroma;
  bO*=u_refract*u_chroma;
  float sf=u_blur;
  float rP=fract(fl+rO);
  float rC=mG(hi.r,lo.r,rP,sf+.018+u_refract*cv*.025,cv);
  float gP=fract(fl);
  float gC=mG(hi.g,lo.g,gP,sf+.008/max(.01,1.-sl),cv);
  float bP=fract(fl-bO);
  float bC=mG(hi.b,lo.b,bP,sf+.008,cv);
  vec3 col=vec3(rC,gC,bC);
  col=(col-.5)*u_contrast+.5;
  col=clamp(col,0.,1.);
  col=mix(col,1.-min(vec3(1.),(1.-col)/max(u_tint,vec3(.001))),length(u_tint-1.)*.5);
  col=clamp(col,0.,1.);
  oC=vec4(col*vs,vs);
}`

type ShaderParams = {
	seed: number
	scale: number
	refraction: number
	blur: number
	liquid: number
	speed: number
	brightness: number
	contrast: number
	angle: number
	fresnel: number
	lightColor: string
	darkColor: string
	patternSharpness: number
	waveAmplitude: number
	noiseScale: number
	chromaticSpread: number
	distortion: number
	contour: number
	tintColor: string
}

type MetallicPaintProps = Omit<React.ComponentProps<'div'>, 'children'> &
	Partial<ShaderParams> & {
		/** Gambar bentuk logo (PNG transparan). Bagian transparan/putih dianggap latar. */
		imageSrc: string
		/** Class untuk gambar cadangan saat WebGL2 tidak tersedia, misalnya `invert` di latar gelap. */
		fallbackClassName?: string
	}

/**
 * Ubah siluet gambar jadi peta kedalaman (tengah tebal, tepi tipis) dengan menyelesaikan persamaan
 * Poisson lewat SOR. Hasilnya dipakai shader untuk efek cairan logam.
 */
function processImage(img: HTMLImageElement): ImageData | null {
	const MAX_SIZE = 1000
	const MIN_SIZE = 500
	let width = img.naturalWidth || img.width
	let height = img.naturalHeight || img.height

	if (width > MAX_SIZE || height > MAX_SIZE || width < MIN_SIZE || height < MIN_SIZE) {
		const longest = Math.max(width, height)
		const scale = longest > MAX_SIZE ? MAX_SIZE / longest : longest < MIN_SIZE ? MIN_SIZE / longest : 1
		width = Math.round(width * scale)
		height = Math.round(height * scale)
	}

	const canvas = document.createElement('canvas')
	canvas.width = width
	canvas.height = height
	const ctx = canvas.getContext('2d')
	if (!ctx) return null
	ctx.drawImage(img, 0, 0, width, height)

	const data = ctx.getImageData(0, 0, width, height).data
	const size = width * height
	const alphaValues = new Float32Array(size)
	const shapeMask = new Uint8Array(size)
	const boundaryMask = new Uint8Array(size)

	for (let i = 0; i < size; i++) {
		const idx = i * 4
		const a = data[idx + 3]
		const isBackground = (data[idx] > 250 && data[idx + 1] > 250 && data[idx + 2] > 250 && a === 255) || a < 5
		alphaValues[i] = isBackground ? 0 : a / 255
		shapeMask[i] = alphaValues[i] > 0.1 ? 1 : 0
	}

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const idx = y * width + x
			if (!shapeMask[idx]) continue
			if (
				x === 0 ||
				x === width - 1 ||
				y === 0 ||
				y === height - 1 ||
				!shapeMask[idx - 1] ||
				!shapeMask[idx + 1] ||
				!shapeMask[idx - width] ||
				!shapeMask[idx + width]
			) {
				boundaryMask[idx] = 1
			}
		}
	}

	const u = new Float32Array(size)
	const ITERATIONS = 200
	const C = 0.01
	const OMEGA = 1.85
	for (let iter = 0; iter < ITERATIONS; iter++) {
		for (let y = 1; y < height - 1; y++) {
			for (let x = 1; x < width - 1; x++) {
				const idx = y * width + x
				if (!shapeMask[idx] || boundaryMask[idx]) continue
				const sum =
					(shapeMask[idx + 1] ? u[idx + 1] : 0) +
					(shapeMask[idx - 1] ? u[idx - 1] : 0) +
					(shapeMask[idx + width] ? u[idx + width] : 0) +
					(shapeMask[idx - width] ? u[idx - width] : 0)
				u[idx] = OMEGA * ((C + sum) / 4) + (1 - OMEGA) * u[idx]
			}
		}
	}

	let maxVal = 0
	for (let i = 0; i < size; i++) if (u[i] > maxVal) maxVal = u[i]
	if (maxVal === 0) maxVal = 1

	const out = ctx.createImageData(width, height)
	for (let i = 0; i < size; i++) {
		const px = i * 4
		const depth = u[i] / maxVal
		const gray = Math.round(255 * (1 - depth * depth))
		out.data[px] = out.data[px + 1] = out.data[px + 2] = gray
		out.data[px + 3] = Math.round(alphaValues[i] * 255)
	}
	return out
}

/** Hex 6 digit ke RGB 0..1. Format lain (termasuk hex 8 digit) dianggap putih, sama seperti versi aslinya. */
function hexToRgb(hex: string): [number, number, number] {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
	return result
		? [
				Number.parseInt(result[1], 16) / 255,
				Number.parseInt(result[2], 16) / 255,
				Number.parseInt(result[3], 16) / 255
			]
		: [1, 1, 1]
}

function createProgram(gl: WebGL2RenderingContext): WebGLProgram | null {
	const compile = (source: string, type: number) => {
		const shader = gl.createShader(type)
		if (!shader) return null
		gl.shaderSource(shader, source)
		gl.compileShader(shader)
		if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader
		console.error(gl.getShaderInfoLog(shader))
		gl.deleteShader(shader)
		return null
	}
	const vertex = compile(VERTEX_SHADER, gl.VERTEX_SHADER)
	const fragment = compile(FRAGMENT_SHADER, gl.FRAGMENT_SHADER)
	const program = gl.createProgram()
	if (!vertex || !fragment || !program) return null
	gl.attachShader(program, vertex)
	gl.attachShader(program, fragment)
	gl.linkProgram(program)
	gl.deleteShader(vertex)
	gl.deleteShader(fragment)
	if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program
	console.error(gl.getProgramInfoLog(program))
	gl.deleteProgram(program)
	return null
}

/** Logo bergaya cairan logam yang bergerak (WebGL2). Ukurannya selalu persegi, atur lebar lewat `className`. */
function MetallicPaint({
	imageSrc,
	seed = 42,
	scale = 4,
	refraction = 0.01,
	blur = 0.015,
	liquid = 0.75,
	speed = 0.3,
	brightness = 2,
	contrast = 0.5,
	angle = 0,
	fresnel = 1,
	lightColor = '#ffffff',
	darkColor = '#000000',
	patternSharpness = 1,
	waveAmplitude = 1,
	noiseScale = 0.5,
	chromaticSpread = 2,
	distortion = 1,
	contour = 0.2,
	tintColor = '#feb3ff',
	fallbackClassName,
	className,
	...props
}: MetallicPaintProps) {
	const canvasRef = React.useRef<HTMLCanvasElement>(null)
	const [failed, setFailed] = React.useState(false)

	const params: ShaderParams = {
		seed,
		scale,
		refraction,
		blur,
		liquid,
		speed,
		brightness,
		contrast,
		angle,
		fresnel,
		lightColor,
		darkColor,
		patternSharpness,
		waveAmplitude,
		noiseScale,
		chromaticSpread,
		distortion,
		contour,
		tintColor
	}
	// Parameter dibaca lewat ref tiap frame, jadi perubahan props tidak perlu membuat ulang konteks WebGL.
	const paramsRef = React.useRef(params)
	React.useEffect(() => {
		paramsRef.current = params
	})

	React.useEffect(() => {
		const canvas = canvasRef.current
		const gl = canvas?.getContext('webgl2', { antialias: true, alpha: true })
		const program = gl ? createProgram(gl) : null
		if (!canvas || !gl || !program) {
			setFailed(true)
			return
		}

		const uniforms: Record<string, WebGLUniformLocation | null> = {}
		const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
		for (let i = 0; i < count; i++) {
			const info = gl.getActiveUniform(program, i)
			if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name)
		}

		const buffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
		// biome-ignore lint/correctness/useHookAtTopLevel: ini method WebGL, bukan React hook.
		gl.useProgram(program)
		const position = gl.getAttribLocation(program, 'a_position')
		gl.enableVertexAttribArray(position)
		gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
		let texture: WebGLTexture | null = null
		let loading = false
		let visible = false
		let disposed = false
		let frame = 0
		let time = 0
		let last = 0

		const applyUniforms = () => {
			const p = paramsRef.current
			gl.uniform1f(uniforms.u_seed, p.seed)
			gl.uniform1f(uniforms.u_scale, p.scale)
			gl.uniform1f(uniforms.u_refract, p.refraction)
			gl.uniform1f(uniforms.u_blur, p.blur)
			gl.uniform1f(uniforms.u_liquid, p.liquid)
			gl.uniform1f(uniforms.u_bright, p.brightness)
			gl.uniform1f(uniforms.u_contrast, p.contrast)
			gl.uniform1f(uniforms.u_angle, p.angle)
			gl.uniform1f(uniforms.u_fresnel, p.fresnel)
			gl.uniform1f(uniforms.u_sharp, p.patternSharpness)
			gl.uniform1f(uniforms.u_wave, p.waveAmplitude)
			gl.uniform1f(uniforms.u_noise, p.noiseScale)
			gl.uniform1f(uniforms.u_chroma, p.chromaticSpread)
			gl.uniform1f(uniforms.u_distort, p.distortion)
			gl.uniform1f(uniforms.u_contour, p.contour)
			gl.uniform3f(uniforms.u_lightColor, ...hexToRgb(p.lightColor))
			gl.uniform3f(uniforms.u_darkColor, ...hexToRgb(p.darkColor))
			gl.uniform3f(uniforms.u_tint, ...hexToRgb(p.tintColor))
			gl.uniform1f(uniforms.u_time, time)
		}

		const draw = () => {
			if (!texture) return
			applyUniforms()
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
		}

		const tick = (now: number) => {
			frame = requestAnimationFrame(tick)
			time += (now - last) * paramsRef.current.speed
			last = now
			draw()
		}
		const start = () => {
			if (frame || !texture || reduceMotion) return
			last = performance.now()
			frame = requestAnimationFrame(tick)
		}
		const stop = () => {
			cancelAnimationFrame(frame)
			frame = 0
		}

		const load = () => {
			loading = true
			const img = new window.Image()
			img.crossOrigin = 'anonymous'
			img.onload = () => {
				const depth = disposed ? null : processImage(img)
				if (!depth) return
				texture = gl.createTexture()
				gl.activeTexture(gl.TEXTURE0)
				gl.bindTexture(gl.TEXTURE_2D, texture)
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
				gl.texImage2D(
					gl.TEXTURE_2D,
					0,
					gl.RGBA,
					depth.width,
					depth.height,
					0,
					gl.RGBA,
					gl.UNSIGNED_BYTE,
					depth.data
				)
				gl.uniform1i(uniforms.u_tex, 0)
				gl.uniform1f(uniforms.u_imgRatio, depth.width / depth.height)
				gl.uniform1f(uniforms.u_ratio, 1)
				draw()
				if (visible) start()
			}
			img.onerror = () => {
				if (!disposed) setFailed(true)
			}
			img.src = imageSrc
		}

		// Canvas persegi mengikuti lebar elemen, resolusi layar maks 2x.
		const resizeObserver = new ResizeObserver(() => {
			const side = Math.max(1, Math.round(canvas.clientWidth * Math.min(window.devicePixelRatio || 1, 2)))
			canvas.width = side
			canvas.height = side
			gl.viewport(0, 0, side, side)
			draw()
		})
		resizeObserver.observe(canvas)

		// Proses gambar baru saat hampir terlihat, dan animasi hanya jalan selama terlihat.
		const intersectionObserver = new IntersectionObserver(
			([entry]) => {
				visible = entry.isIntersecting
				if (!visible) return stop()
				if (!loading) load()
				start()
			},
			{ rootMargin: '200px' }
		)
		intersectionObserver.observe(canvas)

		return () => {
			disposed = true
			stop()
			resizeObserver.disconnect()
			intersectionObserver.disconnect()
			if (texture) gl.deleteTexture(texture)
			gl.deleteBuffer(buffer)
			gl.deleteProgram(program)
		}
	}, [imageSrc])

	return (
		<div className={cn('relative aspect-square', className)} {...props}>
			{failed ? (
				<Image src={imageSrc} alt="" fill sizes="30vw" className={cn('object-contain', fallbackClassName)} />
			) : (
				<canvas ref={canvasRef} className="block size-full" />
			)}
		</div>
	)
}

export { MetallicPaint }
