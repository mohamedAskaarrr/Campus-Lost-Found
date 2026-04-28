import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Send, Sparkles, FileText, Folder, MapPin, Palette, Clock3 } from 'lucide-react'
import Stepper from '../components/Stepper'
import { createLostReport, classifyItem, runMatchForLostReport } from '../api/client'
import useStore from '../store/useStore'
import CategoryIcon from '../components/CategoryIcon'

const STEPS = ['Category', 'Description', 'Details', 'Review']
const CATEGORIES = [
  { value: 'id_card', label: 'ID Card' },
  { value: 'charger', label: 'Charger' },
  { value: 'bottle', label: 'Bottle' },
  { value: 'notebook', label: 'Notebook' },
  { value: 'headphones', label: 'Headphones' },
  { value: 'keys', label: 'Keys' },
  { value: 'other', label: 'Other' },
]
const COLORS = ['Black','White','Blue','Red','Green','Yellow','Orange','Gray','Brown','Pink','Purple','Silver']
const LOCATIONS = [
  'Main Cafeteria Building A','Engineering Lab Room 301','Library Study Hall Floor 2',
  'Math Department Lecture Hall B','Library Ground Floor','Parking Lot Gate 3',
  'Computer Lab Building C Room 205','Administrative Building','Sports Center',
  'Design Studio Building D','Engineering Building Room 104','Main Building Reception',
  'Lecture Hall A','Student Union Building','Physics Lab Building B',
]

// Default datetime = now (avoids the browser datetime-local quirk)
function nowLocal() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

export default function ReportLost() {
  const navigate = useNavigate()
  const { showToast, addLostReport } = useStore()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [classifying, setClassifying] = useState(false)
  const [form, setForm] = useState({
    category: '', description: '', color: '',
    location_lost: '', time_lost: nowLocal(),   // ← pre-filled
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleClassify = async () => {
    if (form.description.trim().length < 10 || form.category) return
    setClassifying(true)
    try {
      const { data } = await classifyItem(form.description)
      if (data.confidence >= 0.5) {
        set('category', data.category)
        showToast(`AI detected: ${data.category.replace('_', ' ')} (${Math.round(data.confidence * 100)}% confidence)`, 'info')
      }
    } catch (_) {}
    finally { setClassifying(false) }
  }

  const canNext = () => {
    if (step === 0) return !!form.category
    if (step === 1) return form.description.trim().length >= 10
    if (step === 2) return !!form.location_lost  // time has default, so just need location
    return true
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        time_lost: form.time_lost
          ? new Date(form.time_lost).toISOString()
          : new Date().toISOString(),
        student_id: 'current-user',
        status: 'active',
      }
      const { data } = await createLostReport(payload)
      addLostReport(data)
      const matches = await runMatchForLostReport(data)
      useStore.getState().setMatchResults(data.id, matches)
      showToast('Lost report submitted! Running AI matcher…', 'success')
      navigate(`/matches/${data.id}`)
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Failed to submit. Is the AI engine running?'
      showToast(msg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const slideProps = {
    initial: { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0 },
    exit:    { opacity: 0, x: -24 },
    transition: { duration: 0.28, ease: [.4,0,.2,1] },
  }

  return (
    <div className="page-enter report-page">
      <div className="container" style={{ maxWidth: 700 }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div className="report-eyebrow">
            <Sparkles size={12} /> AI-Powered Matching
          </div>
          <h1 style={{ marginBottom: 8 }}>Report a Lost Item</h1>
          <p style={{ color: 'var(--neutral-500)', margin: 0 }}>
            Fill in the details and our AI will search for matching found reports instantly.
          </p>
        </div>

        <Stepper steps={STEPS} current={step} />

        <div className="card-premium" style={{ padding: '36px' }}>
          <AnimatePresence mode="wait">

            {/* ─── Step 0: Category ─── */}
            {step === 0 && (
              <motion.div key="cat" {...slideProps}>
                <h3 style={{ marginBottom: 6 }}>What type of item did you lose?</h3>
                <p style={{ color: 'var(--neutral-500)', fontSize: 14, marginBottom: 24 }}>
                  Select one category. Our AI uses this to filter candidates first.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))', gap: 12 }}>
                  {CATEGORIES.map(({ value, label }) => (
                    <motion.div
                      key={value}
                      whileHover={{ scale: 1.04, y: -3 }}
                      whileTap={{ scale: 0.97 }}
                      className={`category-card${form.category === value ? ' selected' : ''}`}
                      onClick={() => set('category', value)}
                    >
                      <div style={{ marginBottom: 10 }}>
                        <CategoryIcon category={value} />
                      </div>
                      <div style={{
                        fontSize: 13, fontWeight: 700,
                        color: form.category === value ? 'var(--text-primary)' : 'var(--neutral-700)',
                      }}>{label}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ─── Step 1: Description ─── */}
            {step === 1 && (
              <motion.div key="desc" {...slideProps}>
                <h3 style={{ marginBottom: 6 }}>Describe your item</h3>
                <p style={{ color: 'var(--neutral-500)', fontSize: 14, marginBottom: 24 }}>
                  Be specific — brand, model, colour, any distinguishing marks. Our TF-IDF engine uses every word.
                </p>
                <div className="form-group" style={{ marginBottom: 24 }}>
                  <label className="form-label">Description <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <textarea
                    className="form-input"
                    rows={5}
                    placeholder="e.g. Black MacBook Pro charger with USB-C cable, white tape wrapped near the adapter end..."
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    onBlur={handleClassify}
                    style={{ resize: 'vertical' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--neutral-400)' }}>
                    <span>{form.description.length} chars</span>
                    {classifying && <span style={{ color: 'var(--primary)' }}>⚡ AI classifying…</span>}
                    {form.description.length < 10 && <span style={{ color: 'var(--danger)' }}>Minimum 10 characters</span>}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Colour <span style={{ color: 'var(--neutral-400)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {COLORS.map(c => (
                      <motion.button
                        key={c}
                        whileTap={{ scale: 0.95 }}
                        className={`color-chip${form.color === c ? ' selected' : ''}`}
                        onClick={() => set('color', form.color === c ? '' : c)}
                        type="button"
                      >{c}</motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── Step 2: Details ─── */}
            {step === 2 && (
              <motion.div key="details" {...slideProps}>
                <h3 style={{ marginBottom: 6 }}>Where and when?</h3>
                <p style={{ color: 'var(--neutral-500)', fontSize: 14, marginBottom: 24 }}>
                  Location and time help our matching engine apply proximity scoring.
                </p>
                <div className="form-group" style={{ marginBottom: 22 }}>
                  <label className="form-label">Location Lost <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <select
                    className="form-input"
                    value={form.location_lost}
                    onChange={e => set('location_lost', e.target.value)}
                  >
                    <option value="">Select a campus location…</option>
                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date & Time Lost <span style={{ color: 'var(--neutral-400)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(defaults to now)</span></label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={form.time_lost}
                    max={nowLocal()}
                    onChange={e => {
                      if (e.target.value) set('time_lost', e.target.value)
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* ─── Step 3: Review ─── */}
            {step === 3 && (
              <motion.div key="review" {...slideProps}>
                <h3 style={{ marginBottom: 6 }}>Review & Submit</h3>
                <p style={{ color: 'var(--neutral-500)', fontSize: 14, marginBottom: 24 }}>
                  Confirm your details, then submit. The AI engine will rank all matching found reports for you.
                </p>
                <div className="review-panel">
                  {[
                    { label: 'Category', value: form.category.replace('_', ' '), icon: Folder },
                    { label: 'Description', value: form.description, icon: FileText },
                    { label: 'Colour', value: form.color || '-', icon: Palette },
                    { label: 'Location', value: form.location_lost, icon: MapPin },
                    { label: 'Time Lost', value: form.time_lost ? new Date(form.time_lost).toLocaleString() : 'Now', icon: Clock3 },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <Icon size={18} style={{ flexShrink: 0, color: 'var(--neon-cyan)', marginTop: 2 }} />
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--neutral-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</div>
                        <div style={{ fontSize: 14, color: 'var(--text)', textTransform: label === 'Category' || label === 'Colour' ? 'capitalize' : 'none', lineHeight: 1.5 }}>{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 36, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0}
              style={{ opacity: step === 0 ? 0.35 : 1 }}
            >
              <ArrowLeft size={16} /> Back
            </button>

            {step < 3 ? (
              <button
                className="btn btn-primary"
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext()}
                style={{ opacity: canNext() ? 1 : 0.4 }}
              >
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <motion.button
                className="btn btn-accent"
                onClick={handleSubmit}
                disabled={submitting}
                whileTap={{ scale: 0.97 }}
              >
                {submitting
                  ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Submitting…</>
                  : <><Send size={16} /> Submit & Find Matches</>
                }
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
