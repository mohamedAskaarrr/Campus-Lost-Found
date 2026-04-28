import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import CampusSplinePanel from '../components/CampusSplinePanel'
import { PrismaHero } from '../components/ui/prisma-hero'

export default function Home() {
  return (
    <div className="page-enter landing-editorial">
      <PrismaHero />

      <section className="landing-section landing-feature-section">
        <div className="container landing-feature-grid">
          <div className="landing-copy-block">
            <span className="landing-pill">AI matching</span>
            <h2>Turn a missing item into a clear report.</h2>
            <p>
              Submit a lost or found item and the system compares category, description, color,
              location, and time to surface the most likely match.
            </p>
            <div className="landing-actions">
              <Link to="/report-lost" className="landing-button landing-button-primary">
                <Search size={18} /> Report lost item
              </Link>
              <Link to="/report-found" className="landing-button landing-button-secondary">
                I found something
              </Link>
            </div>
          </div>

          <CampusSplinePanel />
        </div>
      </section>
    </div>
  )
}
