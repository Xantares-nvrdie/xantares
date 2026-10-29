import { Bebas_Neue, Space_Grotesk } from 'next/font/google'

/*
 * Font brand proyek, hanya untuk wordmark di cover showcase. `preload: false` karena section ini ada di
 * bawah lipatan, jadi font tidak ikut membebani muatan awal halaman.
 */

/** Wordmark NusaRoute (font heading aslinya). */
export const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['700'], preload: false })

/** Wordmark OZPECK (font display aslinya). */
export const bebasNeue = Bebas_Neue({ subsets: ['latin'], weight: ['400'], preload: false })
