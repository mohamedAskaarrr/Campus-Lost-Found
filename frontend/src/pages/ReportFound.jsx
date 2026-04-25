import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Send, Heart } from 'lucide-react'
import Stepper from '../components/Stepper'
import { createFoundReport } from '../api/client'
import useStore from '../store/useStore'

function nowLocal() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

const STEPS = ['Category', 'Description', 'Details', 'Contact']
const CATEGORIES = [
  { value: 'id_card', emoji: '🪪', label: 'ID Card' },
  { value: 'charger', emoji: '🔌', label: 'Charger' },
  { value: 'bottle', emoji: '🍶', label: 'Bottle' },
  { value: 'notebook', emoji: '📒', label: 'Notebook' },
  { value: 'headphones', emoji: '🎧', label: 'Headphones' },
  { value: 'keys', emoji: '🔑', label: 'Keys' },
  { value: 'other', emoji: '📦', label: 'Other' },
]
const COLORS = ['Black','White','Blue','Red','Green','Yellow','Orange','Gray','Brown','Pink','Purple','Silver']
const LOCATIONS = [
  'Main Cafeteria Building A','Engineering Lab Room 301','Library Study Hall Floor 2',
  'Math Department Lecture Hall B','Library Ground Floor','Parking Lot Gate 3',
  'Computer Lab Building C Room 205','Administrative Building','Sports Center',
  'Design Studio Building D','Engineering Building Room 104','Main Building Reception',
]

export default function ReportFound() {
  const navigate = useNavigate()
  const { showToast, addFoundReport } = useStore()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    category: '', description: '', color: '',
    location_found: '', time_found: nowLocal(), finder_contact: '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const canNext = () => {
    if (step === 0) return !!form.category
    if (step === 1) return form.description.trim().length >= 10
    if (step === 2) return !!form.location_found
    if (step === 3) return form.finder_contact.trim().length >= 5
    return true
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        time_found: form.time_found ? new Date(form.time_found).toISOString() : new Date().toISOString(),
        student_id: 'current-user',
        status: 'active',
      }
      const { data } = await createFoundReport(payload)
      addFoundReport(data)
      showToast('Found report submitted! You\'re awesome 🙌', 'success')
      navigate('/my-reports')
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Failed to submit. Is the AI engine running?'
      showToast(msg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-enter" style={{ padding: '48px 0', minHeight: 'calc(100vh - 64px)', background: 'var(--neutral-50)' }}>
      <div className="container" style={{ maxWidth: 680 }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#ECFDF5', color: 'var(--success)',
            padding: '5px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700,
            marginBottom: 14, border: '1px solid #A7F3D0', textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            <Heart size={12} /> Good Samaritan
          </div>
          <h1 style={{ marginBottom: 8 }}>Report a Found Item</h1>
          <p style={{ color: 'var(--neutral-500)', margin: 0 }}>
            Found something on campus? Your report will be matched to the person who lost it.
          </p>
        </div>
        <Stepper steps={STEPS} current={step} />
        <div className="card-premium" style={{ padding: '36px' }}>
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="cat" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.28, ease: [.4,0,.2,1] }}>
                <h3 style={{ marginBottom: 6 }}>What did you find?</h3>
                <p style={{ color: 'var(--neutral-500)', fontSize: 14, marginBottom: 24 }}>Select the category that best describes the item you found.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))', gap: 12 }}>
                  {CATEGORIES.map(({ value, emoji, label }) => (
                    <motion.div key={value} whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.97 }}
                      className={`category-card${form.category === value ? ' selected' : ''}`}
                      onClick={() => set('category', value)}
                      style={{
                        borderColor: form.category === value ? 'var(--success)' : undefined,
                        background: form.category === value ? 'linear-gradient(135deg,#ECFDF5,#D1FAE5)' : undefined,
                      }}>
                      <div style={{ fontSize: 36, marginBottom: 8, lineHeight: 1 }}>{emoji}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: form.category === value ? 'var(--success)' : 'var(--neutral-700)' }}>{label}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
            {step === 1 && (
              <motion.div key="desc" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.28, ease: [.4,0,.2,1] }}>
                <h3 style={{ marginBottom: 6 }}>Describe what you found</h3>
                <p style={{ color: 'var(--neutral-500)', fontSize: 14, marginBottom: 24 }}>The more detail you give, the better the AI can match it to the owner.</p>
                <div className="form-group" style={{ marginBottom: 22 }}>
                  <label className="form-label">Description <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <textarea className="form-input" rows={5}
                    placeholder="e.g. Found a black Sony headphones with a small red sticker on the left ear cup..."
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    style={{ resize: 'vertical' }} />
                  {form.description.length < 10 && form.description.length > 0 && <span style={{ fontSize: 12, color: 'var(--danger)' }}>Minimum 10 characters</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Colour <span style={{ color: 'var(--neutral-400)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {COLORS.map(c => (
                      <motion.button key={c} whileTap={{ scale: 0.95 }}
                        className={`color-chip${form.color === c ? ' selected' : ''}`}
                        onClick={() => set('color', form.color === c ? '' : c)} type="button"
                        style={{ borderColor: form.color === c ? 'var(--success)' : undefined, background: form.color === c ? '#ECFDF5' : undefined, color: form.color === c ? 'var(--success)' : undefined }}>
                        {c}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="details" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.28, ease: [.4,0,.2,1] }}>
                <h3 style={{ marginBottom: 6 }}>Where and when did you find it?</h3>
                <p style={{ color: 'var(--neutral-500)', fontSize: 14, marginBottom: 24 }}>This helps us apply location and time scoring in the matching pipeline.</p>
                <div className="form-group" style={{ marginBottom: 22 }}>
                  <label className="form-label">Location Found <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <select className="form-input" value={form.location_found} onChange={e => set('location_found', e.target.value)}>
                    <option value="">Select a campus location…</option>
                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date & Time Found <span style={{ color: 'var(--neutral-400)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(defaults to now)</span></label>
                  <input type="datetime-local" className="form-input" value={form.time_found} max={nowLocal()}
                    onChange={e => { if (e.target.value) set('time_found', e.target.value) }} />
                </div>
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="contact" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.28, ease: [.4,0,.2,1] }}>
                <h3 style={{ marginBottom: 6 }}>How can the owner reach you?</h3>
                <p style={{ color: 'var(--neutral-500)', fontSize: 14, marginBottom: 24 }}>This is only shared with the verified owner after the match is confirmed.</p>
                <div className="form-group">
                  <label className="form-label">Contact Email or Phone <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input className="form-input" type="text" placeholder="your.email@sewedy.edu.eg or 010xxxxxxxx"
                    value={form.finder_contact} onChange={e => set('finder_contact', e.target.value)} />
                  <span style={{ fontSize: 12, color: 'var(--neutral-400)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    🔒 Private — only revealed to the confirmed owner.
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 36, paddingTop: 24, borderTop: '1px solid var(--neutral-100)' }}>
            <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)} disabled={step === 0} style={{ opacity: step === 0 ? 0.35 : 1 }}>
              <ArrowLeft size={16} /> Back
            </button>
            {step < 3 ? (
              <button className="btn btn-primary" onClick={() => setStep(s => s + 1)} disabled={!canNext()} style={{ opacity: canNext() ? 1 : 0.4 }}>
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <motion.button className="btn btn-success" onClick={handleSubmit} disabled={submitting || !canNext()}
                style={{ opacity: canNext() ? 1 : 0.4 }} whileTap={{ scale: 0.97 }}>
                {submitting
                  ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2, borderTopColor: '#fff' }} /> Submitting…</>
                  : <><Send size={16} /> Submit Found Report</>
                }
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
