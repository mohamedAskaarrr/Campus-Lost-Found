import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { Search, Plus, ArrowRight, Zap, Shield, Users, TrendingUp, Clock, CheckCircle, Volume2, VolumeX, GraduationCap } from 'lucide-react'
import heroPoster from '../assets/hero.png'
import CategoryIcon from '../components/CategoryIcon'

// ── Animated counter ──
function Counter({ target, suffix = '', duration = 2000 }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(ease * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, target, duration])

  return <span ref={ref}>{val}{suffix}</span>
}

const STATS = [
  { label: 'Reports Submitted', value: 247,  suffix: '+',  icon: TrendingUp, color: '#60A5FA' },
  { label: 'Matches Made',      value: 187,  suffix: '',   icon: CheckCircle, color: '#34D399' },
  { label: 'Recovery Rate',     value: 73,   suffix: '%',  icon: Zap,        color: '#FB923C' },
  { label: 'Avg Match Time',    value: 4,    suffix: 'hrs',icon: Clock,       color: '#A78BFA' },
]

const CATEGORIES = [
  { category: 'id_card', label: 'ID Cards', desc: '~15 reports/week' },
  { category: 'charger', label: 'Chargers', desc: '~11 reports/week' },
  { category: 'bottle', label: 'Bottles', desc: '~8 reports/week' },
  { category: 'notebook', label: 'Notebooks', desc: '~6 reports/week' },
  { category: 'headphones', label: 'Headphones', desc: '~5 reports/week' },
  { category: 'keys', label: 'Keys', desc: '~7 reports/week' },
]

const FEATURES = [
  {
    icon: Zap,
    gradient: 'linear-gradient(135deg, #1A56DB, #3B82F6)',
    title: 'AI-Powered Matching',
    desc: 'TF-IDF vectorization + cosine similarity ranks every candidate with a precise confidence score.',
    pill: 'NLP Engine',
  },
  {
    icon: Shield,
    gradient: 'linear-gradient(135deg, #F97316, #FB923C)',
    title: 'Transparent Reasoning',
    desc: 'Each match comes with a plain-English explanation and a breakdown of 5 individual feature scores.',
    pill: 'Explainable AI',
  },
  {
    icon: Users,
    gradient: 'linear-gradient(135deg, #10B981, #34D399)',
    title: 'Campus-Wide Coverage',
    desc: 'All El Sewedy University zones, labs, cafeterias, and buildings supported out of the box.',
    pill: 'Real Campus Data',
  },
]

const HOW_IT_WORKS = [
  { n: '01', title: 'Submit a Report', desc: 'Fill in your item details — category, description, color, location, and time.' },
  { n: '02', title: 'AI Runs Matching', desc: 'Our pipeline scores every found-item report against yours using 5 weighted features.' },
  { n: '03', title: 'Review Top Matches', desc: 'Get a ranked list with confidence scores and human-readable explanations.' },
  { n: '04', title: 'Claim Your Item', desc: 'Contact the finder directly and confirm the item is yours.' },
]

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }
const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [.4,0,.2,1] } } }

export default function Home() {
  const videoRef = useRef(null)
  const [videoMuted, setVideoMuted] = useState(true)

  const toggleVideoSound = () => {
    const nextMuted = !videoMuted
    setVideoMuted(nextMuted)
    if (videoRef.current) {
      videoRef.current.muted = nextMuted
      if (!nextMuted) videoRef.current.play().catch(() => {})
    }
  }

  return (
    <div className="page-enter">

      {/* ════════════════ HERO ════════════════ */}
      <section className="hero-bg hero-video-bg">
        <video
          ref={videoRef}
          className="hero-video"
          autoPlay
          muted={videoMuted}
          loop
          playsInline
          poster={heroPoster}
          aria-label="Warm futuristic campus library lost and found intro"
        >
          <source src="/videos/futuristic-library-lost-and-found.mp4" type="video/mp4" />
        </video>
        <div className="hero-video-overlay" />
        <button
          type="button"
          className="hero-sound-toggle"
          onClick={toggleVideoSound}
          aria-pressed={!videoMuted}
          aria-label={videoMuted ? 'Turn hero video sound on' : 'Mute hero video'}
        >
          {videoMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
        </button>
      </section>

      <section className="hero-content-section">
        <div className="container hero-bento" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            className="hero-copy-panel"
            initial={{ opacity: 0, y: 48 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.7, ease: [.4,0,.2,1] }}
          >
            {/* University pill */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: 0.1, duration: 0.5, type: 'spring' }}
              className="system-pill"
            >
              <GraduationCap size={15} />
              El Sewedy University of Technology · CET251 AI Project
            </motion.div>

            <h1 style={{ color: '#fff', marginBottom: 20, maxWidth: 760 }}>
              Find what you lost.{' '}
              <span className="gradient-text-blue">AI handles the rest.</span>
            </h1>

            <p style={{ color: 'rgba(255,255,255,.72)', fontSize: 18, maxWidth: 560, margin: '0 0 28px', lineHeight: 1.75 }}>
              Submit a lost or found report and let our intelligent TF-IDF matching engine
              rank the most likely matches — with confidence scores and explanations.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/report-lost" className="btn btn-accent btn-lg">
                <Search size={20} /> Report Lost Item
              </Link>
              <Link to="/report-found" className="btn btn-ghost btn-lg">
                <Plus size={20} /> I Found Something
              </Link>
            </div>

            {/* Trust line */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="terminal-line"
            >
              <span><CheckCircle size={13} /> No signup required</span>
              <span><CheckCircle size={13} /> Works entirely on campus</span>
              <span><CheckCircle size={13} /> AI-powered in &lt;2 seconds</span>
            </motion.p>
          </motion.div>

          <motion.div
            className="hero-terminal-card"
            initial={{ opacity: 0, y: 30, scale: .96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ delay: .2, duration: .6, ease: [.4,0,.2,1] }}
          >
            <div className="terminal-topline">
              <span className="status-dot online" />
              archive.scan
              <span>live</span>
            </div>
            <div className="terminal-row"><span>engine</span><strong>TF-IDF + cosine</strong></div>
            <div className="terminal-row"><span>latency</span><strong>&lt; 2s</strong></div>
            <div className="terminal-row"><span>coverage</span><strong>campus-wide</strong></div>
            <div className="terminal-grid-mini">
              <span>ID</span><span>charger</span><span>keys</span><span>bottle</span>
            </div>
          </motion.div>
        </div>

        {/* Stats strip inside hero */}
        <div className="container" style={{ position: 'relative', zIndex: 1, marginTop: 64 }}>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}
          >
            {STATS.map(({ label, value, suffix, icon: Icon, color }) => (
              <motion.div key={label} variants={item} className="stat-card">
                <Icon size={20} style={{ color, margin: '0 auto 10px' }} />
                <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                  <Counter target={value} suffix={suffix} />
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.55)', fontWeight: 500, marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════ CATEGORIES ════════════════ */}
      <section className="bento-section" style={{ padding: '64px 0' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center', marginBottom: 48 }}
          >
            <span style={{
              display: 'inline-block',
              background: 'rgba(0,255,136,.08)',
              color: 'var(--neon-green)',
              padding: '6px 16px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 16,
              border: '1px solid rgba(0,255,136,.2)',
            }}>
              6 Item Categories
            </span>
            <h2 style={{ marginBottom: 10 }}>What did you lose?</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
              Our AI understands natural language descriptions across all common campus item types.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}
          >
            {CATEGORIES.map(({ category, label, desc }) => (
              <motion.div
                key={label}
                variants={item}
                whileHover={{ scale: 1.06, y: -4 }}
                whileTap={{ scale: 0.97 }}
                className="category-card"
                onClick={() => window.location.href = '/report-lost'}
                style={{ position: 'relative', overflow: 'hidden' }}
              >
                <div style={{ marginBottom: 12 }}>
                  <CategoryIcon category={category} className="item-illustration-lg" size={30} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 500 }}>{desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════ HOW IT WORKS ════════════════ */}
      <section className="bento-section" style={{ padding: '64px 0' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 56 }}
          >
            <h2>How it works</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: 10 }}>Four steps from report to reunion.</p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            {HOW_IT_WORKS.map(({ n, title, desc }, i) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{ position: 'relative' }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 14, marginBottom: 16,
                  background: 'linear-gradient(135deg, var(--neon-green), var(--neon-cyan))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 900, color: '#fff',
                }}>
                  {n}
                </div>
                <h3 style={{ fontSize: 17, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65 }}>{desc}</p>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    top: 22, right: -12,
                    color: 'var(--text-dim)',
                    display: 'none',
                  }}>→</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ FEATURES ════════════════ */}
      <section className="bento-section" style={{ padding: '64px 0' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 56 }}
          >
            <h2>Built on solid AI foundations</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: 10, maxWidth: 500, margin: '10px auto 0' }}>
              Every part of the pipeline is grounded in CET251 AI concepts — agents, informed search, and NLP.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {FEATURES.map(({ icon: Icon, gradient, title, desc, pill }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="feature-card"
              >
                <div className="feature-icon" style={{ background: gradient }}>
                  <Icon size={24} color="#fff" />
                </div>
                <div style={{
                  display: 'inline-block',
                  background: 'var(--neutral-100)',
                  color: 'var(--text-muted)',
                  fontSize: 11, fontWeight: 700,
                  padding: '3px 10px', borderRadius: 999,
                  marginBottom: 12, letterSpacing: '0.05em',
                }}>
                  {pill}
                </div>
                <h3 style={{ marginBottom: 10, fontSize: 18 }}>{title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ CTA ════════════════ */}
      <section style={{
        padding: '80px 0',
        background: 'linear-gradient(145deg, #050D24 0%, #0D2060 50%, #1A56DB 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div className="orb orb-1" style={{ opacity: 0.5 }} />
        <div className="orb orb-2" style={{ opacity: 0.5 }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 style={{ color: '#fff', marginBottom: 12 }}>Lost something on campus?</h2>
            <p style={{ color: 'rgba(255,255,255,.65)', marginBottom: 36, fontSize: 16 }}>
              Takes under 60 seconds to submit. Our AI does the rest.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/report-lost" className="btn btn-accent btn-lg">
                <Search size={18} /> Report Lost Item <ArrowRight size={16} />
              </Link>
              <Link to="/my-reports" className="btn btn-ghost btn-lg">
                View My Reports
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
