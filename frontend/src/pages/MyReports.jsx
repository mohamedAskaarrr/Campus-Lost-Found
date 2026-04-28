import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Search, FileText, ArrowRight, MapPin, Palette } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import useStore from '../store/useStore'
import { getLostReports } from '../api/client'
import CategoryIcon from '../components/CategoryIcon'

export default function MyReports() {
  const { lostReports, setLostReports } = useStore()
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    getLostReports()
      .then(({ data }) => setLostReports(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all'
    ? lostReports
    : lostReports.filter(r => r.status === filter)

  return (
    <div className="page-enter" style={{ padding: '48px 0', minHeight: 'calc(100vh - 64px)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ marginBottom: 6 }}>My Reports</h1>
            <p style={{ color: 'var(--neutral-mid)', margin: 0 }}>Track your lost item reports and their match status.</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/report-lost" className="btn btn-primary" style={{ fontSize: 14 }}>
              <Search size={15} /> Report Lost
            </Link>
            <Link to="/report-found" className="btn btn-secondary" style={{ fontSize: 14 }}>
              <Plus size={15} /> Report Found
            </Link>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
          {['all', 'active', 'matched', 'closed'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: filter === f ? 600 : 400,
              color: filter === f ? 'var(--text-primary)' : 'var(--neutral-mid)',
              borderBottom: `2px solid ${filter === f ? 'var(--text-primary)' : 'transparent'}`,
              marginBottom: -1, textTransform: 'capitalize',
            }}>{f}</button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--neutral-mid)' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto 16px' }} />
            Loading your reports…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <FileText size={48} style={{ color: 'var(--neutral-light)', marginBottom: 16 }} />
            <h3 style={{ color: 'var(--neutral-mid)', marginBottom: 8 }}>No reports yet</h3>
            <p style={{ color: 'var(--neutral-light)', marginBottom: 24 }}>Submit a lost item report to get started.</p>
            <Link to="/report-lost" className="btn btn-primary">Report Lost Item</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {filtered.map((report, i) => (
              <motion.div key={report.id} className="card"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                style={{ padding: 20, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <CategoryIcon category={report.category} className="item-illustration-sm" size={21} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontWeight: 700, fontSize: 15, textTransform: 'capitalize' }}>
                        {report.category?.replace('_', ' ')}
                      </span>
                      <StatusBadge status={report.status} />
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--neutral-light)' }}>
                      {report.created_at ? new Date(report.created_at).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--neutral-mid)', margin: '0 0 8px', lineHeight: 1.5,
                    overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {report.description}
                  </p>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--neutral-light)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><MapPin size={12} /> {report.location_lost}</span>
                    {report.color && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Palette size={12} /> {report.color}</span>}
                  </div>
                </div>
                <Link to={`/matches/${report.id}`} style={{
                  display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600,
                  color: 'var(--primary)', whiteSpace: 'nowrap', flexShrink: 0,
                }}>
                  View Matches <ArrowRight size={14} />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
