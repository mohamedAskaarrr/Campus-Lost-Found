import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Phone, Mail } from 'lucide-react'
import useStore from '../store/useStore'

const FEATURE_LABELS = {
  text_similarity: { label: 'Description Match', color: 'var(--primary)' },
  category_match:  { label: 'Category Match',    color: 'var(--success)' },
  color_match:     { label: 'Color Match',        color: 'var(--accent)'  },
  location_match:  { label: 'Location Match',     color: 'var(--warning)' },
  time_proximity:  { label: 'Time Proximity',     color: '#8B5CF6'        },
}

function FeatureRow({ featureKey, value }) {
  const cfg = FEATURE_LABELS[featureKey] || { label: featureKey, color: 'var(--primary)' }
  const pct = Math.round(value * 100)
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14 }}>
        <span style={{ fontWeight: 500 }}>{cfg.label}</span>
        <span style={{ fontWeight: 700, color: cfg.color }}>{pct}%</span>
      </div>
      <div className="score-bar-wrap">
        <motion.div
          className="score-bar"
          style={{ background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}99)` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export default function MatchDetail() {
  const { lostId, foundId } = useParams()
  const navigate = useNavigate()
  const matchResults = useStore(s => s.matchResults)
  const matches = matchResults[lostId] || []
  const match = matches.find(m => m.found_report_id === foundId)

  if (!match) {
    return (
      <div className="page-enter" style={{ padding: '80px 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--neutral-mid)' }}>Match not found. Go back and try again.</p>
        <button className="btn btn-primary" onClick={() => navigate(-1)} style={{ marginTop: 16 }}>Go Back</button>
      </div>
    )
  }

  const pct = Math.round(match.confidence_score * 100)
  const color = pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : '#EF4444'
  const fs = match.feature_scores || {}

  return (
    <div className="page-enter" style={{ padding: '48px 0', minHeight: 'calc(100vh - 64px)' }}>
      <div className="container" style={{ maxWidth: 720 }}>
        <button onClick={() => navigate(-1)} style={{
          display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
          cursor: 'pointer', color: 'var(--neutral-mid)', fontSize: 14, marginBottom: 24, padding: 0,
        }}>
          <ArrowLeft size={16} /> Back to Match Results
        </button>

        <h1 style={{ marginBottom: 6 }}>Match Detail</h1>
        <p style={{ color: 'var(--neutral-mid)', marginBottom: 32 }}>Full feature breakdown for this match suggestion.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          {/* Confidence Score */}
          <motion.div className="card" style={{ padding: 28, textAlign: 'center', gridColumn: '1 / -1' }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--neutral-mid)', marginBottom: 8 }}>OVERALL CONFIDENCE</div>
            <div style={{ fontSize: 64, fontWeight: 800, color, lineHeight: 1 }}>{pct}%</div>
            <div style={{ fontSize: 13, color: 'var(--neutral-mid)', marginTop: 8 }}>
              {pct >= 70 ? '🟢 High confidence match' : pct >= 40 ? '🟡 Moderate — verify manually' : '🔴 Low confidence — unlikely match'}
            </div>
          </motion.div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Feature Breakdown */}
          <motion.div className="card" style={{ padding: 28 }}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <h3 style={{ marginBottom: 20 }}>Feature Scores</h3>
            {Object.entries(fs).map(([k, v]) => (
              <FeatureRow key={k} featureKey={k} value={v} />
            ))}
          </motion.div>

          {/* Explanation + Contact */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <motion.div className="card" style={{ padding: 28 }}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
              <h3 style={{ marginBottom: 12 }}>Why this match?</h3>
              <p style={{ fontSize: 14, color: 'var(--neutral-mid)', lineHeight: 1.7, margin: 0 }}>
                {match.explanation}
              </p>
            </motion.div>

            <motion.div className="card" style={{ padding: 28 }}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <h3 style={{ marginBottom: 16 }}>Contact the Finder</h3>
              <p style={{ fontSize: 13, color: 'var(--neutral-mid)', marginBottom: 16, lineHeight: 1.6 }}>
                If this looks like your item, reach out to confirm before claiming it.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {match.finder_contact?.includes('@') ? (
                  <a href={`mailto:${match.finder_contact}`} className="btn btn-primary" style={{ justifyContent: 'center' }}>
                    <Mail size={16} /> Send Email
                  </a>
                ) : (
                  <a href={`tel:${match.finder_contact}`} className="btn btn-primary" style={{ justifyContent: 'center' }}>
                    <Phone size={16} /> Call Finder
                  </a>
                )}
              </div>
              {match.finder_contact && (
                <div style={{ marginTop: 12, fontSize: 12, color: 'var(--neutral-light)', textAlign: 'center' }}>
                  {match.finder_contact}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
