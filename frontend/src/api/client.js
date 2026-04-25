import axios from 'axios'

// FastAPI backend for AI matching
const AI_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const aiApi = axios.create({
  baseURL: AI_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Insforge BaaS for Database CRUD
const DB_BASE = import.meta.env.VITE_INSFORGE_DB_BASE_URL || 'https://nj978ng4.us-east.insforge.app/api/db'
const DB_KEY = import.meta.env.VITE_INSFORGE_DB_KEY

const dbHeaders = {
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
}

if (DB_KEY) {
  dbHeaders.apikey = DB_KEY
  dbHeaders.Authorization = `Bearer ${DB_KEY}`
}

const dbApi = axios.create({
  baseURL: DB_BASE,
  timeout: 10000,
  headers: dbHeaders,
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

export function toMatchPayload(lostReport) {
  if (!lostReport?.id) throw new Error('Lost report is missing an id.')

  return {
    lost_report_id: lostReport.id,
    description: lostReport.description,
    category: lostReport.category,
    color: lostReport.color,
    location_lost: lostReport.location_lost,
    time_lost: lostReport.time_lost,
  }
}

export async function runMatchForLostReport(lostReport) {
  const { data } = await findMatches(toMatchPayload(lostReport))
  return data.matches || []
}

export async function refreshMatchesForActiveLostReports(lostReports = []) {
  const activeReports = lostReports.filter((report) => report?.id && report.status !== 'closed')
  const results = {}

  for (const report of activeReports) {
    try {
      results[report.id] = await runMatchForLostReport(report)
    } catch (error) {
      results[report.id] = { error }
    }
  }

  return results
}

/* ── Classify (AI Engine) ── */
export const classifyItem = (description) => aiApi.post('/classify', { description })

export default aiApi
