import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, FileText, Plus, BookOpen, Menu, X } from 'lucide-react'

const LINKS = [
  { to: '/',             label: 'Home',         icon: Search },
  { to: '/report-lost',  label: 'Lost Item',    icon: FileText },
  { to: '/report-found', label: 'Found Item',   icon: Plus },
  { to: '/my-reports',   label: 'My Reports',   icon: BookOpen },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  return (
    <nav style={{
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Search size={18} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--neutral-dark)' }}>
            Campus<span style={{ color: 'var(--primary)' }}>L&F</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div style={{ display: 'flex', gap: 4 }} className="nav-desktop">
          {LINKS.map(({ to, label, icon: Icon }) => {
            const active = pathname === to
            return (
              <Link key={to} to={to} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: active ? 600 : 500,
                color: active ? 'var(--primary)' : 'var(--neutral-mid)',
                background: active ? '#EFF6FF' : 'transparent',
                transition: 'all .2s',
              }}>
                <Icon size={15} />
                {label}
              </Link>
            )
          })}
        </div>

        {/* Mobile burger */}
        <button onClick={() => setOpen(!open)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer' }} className="nav-burger">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', borderTop: '1px solid var(--border)', background: '#fff' }}
          >
            {LINKS.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setOpen(false)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '14px 24px',
                fontSize: 15,
                fontWeight: 500,
                color: pathname === to ? 'var(--primary)' : 'var(--neutral-dark)',
                background: pathname === to ? '#EFF6FF' : 'transparent',
                borderBottom: '1px solid var(--border)',
              }}>
                <Icon size={17} />
                {label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 640px) {
          .nav-desktop { display: none !important; }
          .nav-burger  { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}
