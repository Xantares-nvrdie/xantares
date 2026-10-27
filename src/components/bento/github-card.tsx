import * as React from 'react'
import { IconArrowUpRight, IconBrandGithub } from '@tabler/icons-react'

import { cn } from '@/lib/utils'

const USER = 'Xantares-nvrdie'
const DAY_MS = 86_400_000

const LANGUAGE_COLORS: Record<string, string> = {
	TypeScript: '#3178c6',
	JavaScript: '#f1e05a',
	Python: '#3572a5',
	Vue: '#41b883',
	HTML: '#e34c26',
	Go: '#00add8'
}

type Repo = { name: string; pushed_at: string; language: string | null }
type Activity = { total: number; repos: Repo[]; now: number }

/**
 * Data publik GitHub tanpa token, di-cache sejam (batas 60 request/jam per IP). Sengaja memakai daftar repo
 * terbaru, bukan Events API: Events tertinggal beberapa hari dari push asli sehingga menyesatkan.
 */
async function getActivity(): Promise<Activity | null> {
	try {
		const init = {
			next: { revalidate: 3600 },
			headers: { Accept: 'application/vnd.github+json' },
			signal: AbortSignal.timeout(8000)
		}
		const [profile, repos] = await Promise.all([
			fetch(`https://api.github.com/users/${USER}`, init),
			fetch(`https://api.github.com/users/${USER}/repos?sort=pushed&per_page=3`, init)
		])
		if (!profile.ok || !repos.ok) return null
		const { public_repos } = (await profile.json()) as { public_repos: number }
		return { total: public_repos, repos: (await repos.json()) as Repo[], now: Date.now() }
	} catch {
		return null
	}
}

function ago(iso: string, now: number): string {
	const days = Math.floor((now - Date.parse(iso)) / DAY_MS)
	if (days <= 0) return 'hari ini'
	if (days === 1) return 'kemarin'
	if (days < 30) return `${days} hari lalu`
	return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', timeZone: 'Asia/Jakarta' }).format(new Date(iso))
}

async function GithubCard({ className, ...props }: React.ComponentProps<'a'>) {
	const activity = await getActivity()

	return (
		<a
			href={`https://github.com/${USER}`}
			target="_blank"
			rel="noreferrer noopener"
			aria-label={
				activity
					? `Buka profil GitHub ${USER}: ${activity.total} repositori publik, terakhir aktif di ${activity.repos[0]?.name}`
					: `Buka profil GitHub ${USER}`
			}
			className={cn(
				'group flex flex-col justify-between rounded-2xl p-4 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-purple-400 lg:p-5',
				className
			)}
			{...props}
		>
			<span className="flex items-center justify-between font-mono text-xs text-neutral-500">
				{'// github'}
				<IconBrandGithub className="size-4 transition-colors group-hover:text-white" aria-hidden="true" />
			</span>

			{activity ? (
				<>
					<ul className="space-y-1.5">
						{activity.repos.map((repo) => (
							<li key={repo.name} className="flex items-center gap-2 text-xs">
								<span
									className="size-2 shrink-0 rounded-full"
									style={{ backgroundColor: LANGUAGE_COLORS[repo.language ?? ''] ?? '#737373' }}
									aria-hidden="true"
								/>
								<span className="min-w-0 flex-1 truncate text-neutral-300">{repo.name}</span>
								<span className="shrink-0 text-neutral-500">{ago(repo.pushed_at, activity.now)}</span>
							</li>
						))}
					</ul>
					<p className="text-xs text-neutral-500">
						<span className="text-white">{activity.total}</span> repo publik
					</p>
				</>
			) : (
				<span className="flex items-center gap-1 text-sm text-neutral-300">
					Lihat profil GitHub
					<IconArrowUpRight className="size-4" aria-hidden="true" />
				</span>
			)}
		</a>
	)
}

export { GithubCard }
