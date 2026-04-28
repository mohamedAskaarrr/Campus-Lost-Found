import { ArrowRight } from 'lucide-react'

const navItems = [
  { label: 'Lost', href: '/report-lost' },
  { label: 'Found', href: '/report-found' },
  { label: 'Reports', href: '/my-reports' },
]

export function PrismaHero() {
  return (
    <section className="prisma-hero">
      <div className="prisma-hero-frame">
        <div className="prisma-hero-media" />

        <nav className="prisma-hero-nav" aria-label="Landing shortcuts">
          <div>
            {navItems.map((item) => (
              <a key={item.label} href={item.href}>
                {item.label}
              </a>
            ))}
          </div>
        </nav>

        <div className="prisma-hero-content">
          <div className="prisma-title-col">
            <p className="prisma-kicker">El Sewedy University Lost + Found</p>
            <h1>Campus Lost + Found</h1>
          </div>

          <div className="prisma-copy-col">
            <p>Report lost and found items, then review ranked campus matches.</p>

            <a href="/report-lost" className="prisma-cta">
              Start a search
              <span>
                <ArrowRight size={17} />
              </span>
            </a>

            <div className="prisma-mini-row">
              <span>TF-IDF</span>
              <span>Cosine score</span>
              <span>Campus zones</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
