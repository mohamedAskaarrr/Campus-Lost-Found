import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Download, Search } from 'lucide-react'
import MatchCard from '../components/MatchCard'
import { findMatches, getLostReport } from '../api/client'
import useStore from '../store/useStore'
import CategoryIcon from '../components/CategoryIcon'

function csvEscape(value) {
  const s = String(value ?? '')
  if (/[",\n]/.test(s)) return `"${s.replaceAll('"', '""')}"`
  return s
}

function downloadCsv(filename, rows) {
  const header = Object.keys(rows[0] || {})
  const lines = [header.join(',')]
  for (const row of rows) {
    lines.push(header.map((k) => csvEscape(row[k])).join(','))
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function MatchResults() {
  const { lostId } = useParams()
  const navigate = useNavigate()
  const { matchResults, setMatchResults } = useStore()
  const [lost, setLost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cached = matchResults[lostId]

  useEffect(() => {
    async function load() {
      try {
        // Fetch the lost report details
        const { data: lostData } = await getLostReport(lostId)
        setLost(lostData)

        if (!cached) {
          // Run matching pipeline
          const payload = {
            lost_report_id: lostId,
            description: lostData.description,
            category: lostData.category,
            color: lostData.color,
            location_lost: lostData.location_lost,
            time_lost: lostData.time_lost,
          }
          const { data } = await findMatches(payload)
          setMatchResults(lostId, data.matches || [])
        }
      } catch (err) {
        setError('Could not load match results. Make sure the AI engine is running.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [lostId])

  const matches = cached || []

  const handleDownload = () => {
    if (!lost || matches.length === 0) return
    const rows = matches.map((m) => ({
      lost_report_id: lostId,
      lost_category: lost.category,
      lost_location: lost.location_lost,
      lost_time: lost.time_lost,
      found_report_id: m.found_report_id,
      found_category: m.category,
      found_location: m.location_found,
      finder_contact: m.finder_contact,
      confidence_score: m.confidence_score,
      explanation: m.explanation,
    }))
    downloadCsv(`match_results_${lostId}.csv`, rows)
  }

  return (
    <div className="page-enter" style={{ padding: '48px 0', minHeight: 'calc(100vh - 64px)' }}>
      <div className="container" style={{ maxWidth: 760 }}>
        {/* Back */}
        <button onClick={() => navigate(-1)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--neutral-mid)', fontSize: 14, marginBottom: 24, padding: 0,
        }}>
          <ArrowLeft size={16} /> Back to My Reports
        </button>

        {/* Lost item summary */}
        {lost && (
          <div className="card" style={{ padding: 20, marginBottom: 32, display: 'flex', gap: 14, alignItems: 'center' }}>
            <CategoryIcon category={lost.category} className="item-illustration-sm" size={22} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, textTransform: 'capitalize', marginBottom: 4 }}>
                Lost: {lost.category?.replace('_', ' ')}
              </div>
              <div style={{ fontSize: 13, color: 'var(--neutral-mid)', lineHeight: 1.5 }}>{lost.description}</div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0 }}>Match Results</h2>
          {!loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--neutral-mid)' }}>
                {matches.length} {matches.length === 1 ? 'result' : 'results'} found
              </span>
              {matches.length > 0 && (
                <button className="btn btn-secondary" onClick={handleDownload} style={{ fontSize: 13 }}>
                  <Download size={14} /> Download CSV
                </button>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--primary)',
                borderRadius: '50%', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--neutral-mid)' }}>Running AI matching pipeline…</p>
          </div>
        ) : error ? (
          <div className="card" style={{ padding: 32, textAlign: 'center', borderColor: '#FECACA' }}>
            <p style={{ color: '#EF4444', marginBottom: 16 }}>{error}</p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : matches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Search size={48} style={{ color: 'var(--neutral-light)', marginBottom: 16 }} />
            <h3 style={{ marginBottom: 8, color: 'var(--neutral-mid)' }}>No matches found yet</h3>
            <p style={{ color: 'var(--neutral-light)', maxWidth: 380, margin: '0 auto' }}>
              No found-item reports match yours right now. We'll keep checking as new reports come in.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {matches.map((match, i) => (
              <MatchCard key={match.found_report_id} match={match} lostId={lostId} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
