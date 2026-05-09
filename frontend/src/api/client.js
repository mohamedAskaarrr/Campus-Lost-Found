import axios from 'axios'

// FastAPI service for AI matching and local backend CRUD.
const AI_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const aiApi = axios.create({
  baseURL: AI_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Optional Insforge BaaS for database CRUD. If this Vite env var is absent,
// FastAPI becomes the backend gateway so submit/match work in local demos.
const DB_BASE = import.meta.env.VITE_INSFORGE_DB_BASE_URL
const DB_KEY = import.meta.env.VITE_INSFORGE_DB_KEY
const USE_INSFORGE = Boolean(DB_BASE)

const dbHeaders = {
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
}

if (DB_KEY) {
  dbHeaders.apikey = DB_KEY
  dbHeaders.Authorization = `Bearer ${DB_KEY}`
}

const dbApi = USE_INSFORGE
  ? axios.create({
      baseURL: DB_BASE,
      timeout: 10000,
      headers: dbHeaders,
    })
  : null

const unwrapInsertedRow = (response, fallback) => ({
  data: Array.isArray(response.data) ? (response.data[0] || fallback) : response.data,
})

const STORAGE_KEYS = {
  lost: 'campus_lost_reports',
  found: 'campus_found_reports',
  matches: 'campus_match_results',
}

function readStorage(key, fallback = []) {
  try {
    return JSON.parse(window.localStorage.getItem(key)) || fallback
  } catch (_) {
    return fallback
  }
}

function writeStorage(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function newId(prefix) {
  return `${prefix}-${crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`}`
}

function tokenize(text) {
  return new Set(String(text || '').toLowerCase().match(/[a-z0-9]+/g) || [])
}

function overlapScore(a, b) {
  const left = tokenize(a)
  const right = tokenize(b)
  if (!left.size || !right.size) return 0
  const intersection = [...left].filter((token) => right.has(token)).length
  const union = new Set([...left, ...right]).size
  return intersection / union
}

function exactScore(a, b, missing = 0.5) {
  if (!a || !b) return missing
  return String(a).trim().toLowerCase() === String(b).trim().toLowerCase() ? 1 : 0
}

function timeScore(lostTime, foundTime) {
  const lostMs = new Date(lostTime).getTime()
  const foundMs = new Date(foundTime).getTime()
  if (!Number.isFinite(lostMs) || !Number.isFinite(foundMs)) return 0.5
  const hours = Math.abs(foundMs - lostMs) / 36e5
  return Math.max(0, Math.min(1, Math.exp(-hours / 56)))
}

function makeExplanation(featureScores, found) {
  const parts = []
  if (featureScores.category_match === 1) parts.push(`Both reports are categorized as ${found.category.replace('_', ' ')}.`)
  if (featureScores.text_similarity >= 0.25) parts.push('Descriptions share matching keywords.')
  if (featureScores.color_match >= 0.9) parts.push(`Item colors match: ${found.color}.`)
  if (featureScores.location_match >= 0.25) parts.push('Locations have campus-area overlap.')
  if (featureScores.time_proximity >= 0.6) parts.push('Report times are reasonably close.')
  return parts.join(' ') || 'Low similarity overall; verify manually before contacting.'
}

function localRankMatches(lostReport) {
  const lostId = lostReport.id || lostReport.lost_report_id
  const foundReports = readStorage(STORAGE_KEYS.found)
    .filter((report) => report.status !== 'closed')

  const matches = foundReports.map((found) => {
    const feature_scores = {
      text_similarity: overlapScore(lostReport.description, found.description),
      category_match: exactScore(lostReport.category, found.category, 0.5),
      color_match: exactScore(lostReport.color, found.color, 0.5),
      location_match: overlapScore(lostReport.location_lost, found.location_found),
      time_proximity: timeScore(lostReport.time_lost, found.time_found),
    }
    const confidence_score = (
      feature_scores.text_similarity * 0.4 +
      feature_scores.category_match * 0.25 +
      feature_scores.color_match * 0.15 +
      feature_scores.location_match * 0.12 +
      feature_scores.time_proximity * 0.08
    )

    return {
      found_report_id: found.id,
      confidence_score: Number(confidence_score.toFixed(4)),
      explanation: makeExplanation(feature_scores, found),
      feature_scores,
      location_found: found.location_found,
      finder_contact: found.finder_contact,
      category: found.category,
    }
  })
    .filter((match) => match.confidence_score >= 0.05)
    .sort((a, b) => b.confidence_score - a.confidence_score)
    .slice(0, 5)

  const allMatches = readStorage(STORAGE_KEYS.matches, {})
  allMatches[lostId] = matches
  writeStorage(STORAGE_KEYS.matches, allMatches)
  return matches
}

function createLocalReport(key, prefix, data) {
  const record = {
    id: newId(prefix),
    created_at: new Date().toISOString(),
    ...data,
  }
  const rows = readStorage(key)
  writeStorage(key, [record, ...rows])
  return { data: record }
}

const isNetworkError = (error) => !error?.response

/* Lost Reports */
export const createLostReport = (data) =>
  USE_INSFORGE
    ? dbApi.post('/lost_reports', data).then((r) => unwrapInsertedRow(r, data))
    : aiApi.post('/lost-reports', data).catch((error) => {
        if (!isNetworkError(error)) throw error
        return createLocalReport(STORAGE_KEYS.lost, 'lost', data)
      })

export const getLostReports = () =>
  USE_INSFORGE
    ? dbApi.get('/lost_reports?order=created_at.desc')
    : aiApi.get('/lost-reports').catch((error) => {
        if (!isNetworkError(error)) throw error
        return { data: readStorage(STORAGE_KEYS.lost) }
      })

export const getLostReport = (id) =>
  USE_INSFORGE
    ? dbApi.get(`/lost_reports?id=eq.${id}`).then((r) => ({ data: r.data[0] }))
    : aiApi.get(`/lost-reports/${id}`).catch((error) => {
        if (!isNetworkError(error)) throw error
        return { data: readStorage(STORAGE_KEYS.lost).find((report) => report.id === id) }
      })

/* Found Reports */
export const createFoundReport = (data) =>
  USE_INSFORGE
    ? dbApi.post('/found_reports', data).then((r) => unwrapInsertedRow(r, data))
    : aiApi.post('/found-reports', data).catch((error) => {
        if (!isNetworkError(error)) throw error
        return createLocalReport(STORAGE_KEYS.found, 'found', data)
      })

export const getFoundReports = () =>
  USE_INSFORGE
    ? dbApi.get('/found_reports?order=created_at.desc')
    : aiApi.get('/found-reports').catch((error) => {
        if (!isNetworkError(error)) throw error
        return { data: readStorage(STORAGE_KEYS.found) }
      })

/* Matching */
export const findMatches = (payload) =>
  aiApi.post('/match', payload).catch((error) => {
    if (!isNetworkError(error)) throw error
    const matches = localRankMatches(payload)
    return { data: { lost_report_id: payload.lost_report_id, matches, count: matches.length } }
  })

export const getMatches = (lostId) =>
  USE_INSFORGE
    ? dbApi.get(`/match_results?lost_report_id=eq.${lostId}&order=confidence_score.desc`)
    : aiApi.get(`/match-results/${lostId}`).catch((error) => {
        if (!isNetworkError(error)) throw error
        const allMatches = readStorage(STORAGE_KEYS.matches, {})
        return { data: allMatches[lostId] || [] }
      })

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

/* Classify */
export const classifyItem = (description) => aiApi.post('/classify', { description })

export default aiApi
