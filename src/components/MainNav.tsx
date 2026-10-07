'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/sports', label: 'Sports tips & previews' },
  { href: '/casino', label: 'Casino guides' },
  { href: '/responsible-gambling', label: 'Responsible gambling' },
  { href: '/search', label: 'Search' },
]

export function MainNav() {
  const pathname = usePathname()
  return (
    <nav className="main-nav" aria-label="Main">
      <ul>
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} aria-current={pathname.startsWith(link.href) ? 'page' : undefined}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
