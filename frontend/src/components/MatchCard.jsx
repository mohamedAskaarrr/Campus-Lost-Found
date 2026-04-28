import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, MapPin } from 'lucide-react'
import CategoryIcon from './CategoryIcon'

function ScoreBar({ value, color }) {
  const pct = Math.round(value * 100)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div className="score-bar-track">
        <motion.div
          className="score-bar-fill"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [.4,0,.2,1] }}
        />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color, minWidth: 34, textAlign: 'right' }}>{pct}%</span>
    </div>
  )
}

export default function MatchCard({ match, lostId, index }) {
  const navigate = useNavigate()
  const pct = Math.round(match.confidence_score * 100)

  const confColor = pct >= 70 ? 'var(--accent)' : pct >= 40 ? 'var(--text-primary)' : 'var(--text-secondary)'
  const fs = match.feature_scores || {}

  return (
    <motion.div
      className="match-card"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [.4,0,.2,1] }}
      whileHover={{ y: -3 }}
      onClick={() => navigate(`/match/${lostId}/${match.found_report_id}`)}
      role="button"
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <CategoryIcon category={match.category} className="item-illustration-sm" size={21} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)' }}>
              Match #{index + 1}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 500 }}>
              Found report · {match.found_report_id?.slice(0, 8)}…
            </div>
          </div>
        </div>

        {/* Score badge */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          background: 'rgba(0,0,0,.04)',
          border: '1px solid rgba(0,0,0,.08)',
          padding: '8px 14px', borderRadius: 10,
        }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: confColor, lineHeight: 1 }}>{pct}%</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: confColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>match</span>
        </div>
      </div>

      {/* Composite score bar */}
      <div style={{ marginBottom: 14 }}>
        <ScoreBar value={match.confidence_score} color={`linear-gradient(90deg, var(--primary), var(--accent))`} />
      </div>

      {/* Explanation */}
      <p style={{
        fontSize: 13, color: 'var(--neutral-500)', lineHeight: 1.65,
        margin: '0 0 14px',
        background: 'rgba(255,255,255,.04)',
        padding: '10px 14px', borderRadius: 10,
        borderLeft: '3px solid rgba(0,212,255,.28)',
      }}>
        {match.explanation}
      </p>

      {/* Mini feature scores */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', marginBottom: 14 }}>
        {[
          { key: 'text_similarity', label: 'Text',     color: 'var(--primary)' },
          { key: 'category_match',  label: 'Category', color: 'var(--success)' },
          { key: 'color_match',     label: 'Color',    color: 'var(--accent)'  },
          { key: 'location_match',  label: 'Location', color: 'var(--warning)' },
        ].map(({ key, label, color }) => (
          <div key={key} style={{ fontSize: 11, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
            <span style={{ fontWeight: 800, color }}>{Math.round((fs[key] || 0) * 100)}%</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
        {match.location_found ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-dim)' }}>
            <MapPin size={12} />
            <span>{match.location_found}</span>
          </div>
        ) : <span />}
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-primary)', fontSize: 13, fontWeight: 700 }}>
          View detail <ArrowRight size={14} />
        </span>
      </div>
    </motion.div>
  )
}
