import axios from 'axios'

// FastAPI backend for AI matching
const AI_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const aiApi = axios.create({
  baseURL: AI_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Insforge BaaS for Database CRUD
const DB_BASE = 'https://nj978ng4.us-east.insforge.app/api/db'
const DB_KEY = 'ik_dc3cf20c68b55a18a35e8644d81f8a3d'

const dbApi = axios.create({
  baseURL: DB_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'apikey': DB_KEY,
    'Authorization': `Bearer ${DB_KEY}`, // For Insforge public access
    'Prefer': 'return=representation'
  },
})

/* ── Lost Reports (Insforge DB) ── */
export const createLostReport = (data) => dbApi.post('/lost_reports', data).then(r => ({ data: r.data[0] || data }))
export const getLostReports   = ()     => dbApi.get('/lost_reports?order=created_at.desc')
export const getLostReport    = (id)   => dbApi.get(`/lost_reports?id=eq.${id}`).then(r => ({ data: r.data[0] }))

/* ── Found Reports (Insforge DB) ── */
export const createFoundReport = (data) => dbApi.post('/found_reports', data).then(r => ({ data: r.data[0] || data }))
export const getFoundReports   = ()     => dbApi.get('/found_reports?order=created_at.desc')

/* ── Matching (AI Engine) ── */
export const findMatches = (payload) => aiApi.post('/match', payload)
export const getMatches  = (lostId)  => dbApi.get(`/match_results?lost_report_id=eq.${lostId}&order=confidence_score.desc`)

/* ── Classify (AI Engine) ── */
export const classifyItem = (description) => aiApi.post('/classify', { description })

export default aiApi
