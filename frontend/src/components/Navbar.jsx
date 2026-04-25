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

export default function Navbar({ cinematic = false, visible = true }) {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  return (
    <nav className={`app-nav ${cinematic ? 'nav-cinematic' : ''} ${visible ? 'nav-visible' : 'nav-hidden'}`}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        {/* Logo */}
        <Link to="/" className="nav-brand">
          <div className="nav-logo">
            <Search size={18} />
          </div>
          <span className="nav-wordmark">
            Campus<span>L&F</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div style={{ display: 'flex', gap: 4 }} className="nav-desktop">
          {LINKS.map(({ to, label, icon: Icon }) => {
            const active = pathname === to
            return (
              <Link key={to} to={to} className={`nav-link ${active ? 'active' : ''}`}>
                <Icon size={15} />
                {label}
              </Link>
            )
          })}
        </div>

        {/* Mobile burger */}
        <button onClick={() => setOpen(!open)} className="nav-burger">
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
            className="nav-mobile-panel"
          >
            {LINKS.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setOpen(false)} className={`nav-mobile-link ${pathname === to ? 'active' : ''}`}>
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
