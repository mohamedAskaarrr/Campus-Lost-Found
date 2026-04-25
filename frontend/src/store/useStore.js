import { create } from 'zustand'

const useStore = create((set, get) => ({
  /* Auth (stub — Insforge handles real auth) */
  user: null,
  setUser: (user) => set({ user }),

  /* Lost Reports */
  lostReports: [],
  setLostReports: (lostReports) => set({ lostReports }),
  addLostReport: (report) =>
    set((s) => ({ lostReports: [report, ...s.lostReports] })),

  /* Found Reports */
  foundReports: [],
  setFoundReports: (foundReports) => set({ foundReports }),
  addFoundReport: (report) =>
    set((s) => ({ foundReports: [report, ...s.foundReports] })),

  /* Match Results */
  matchResults: {},          // keyed by lost_report_id
  setMatchResults: (id, results) =>
    set((s) => ({ matchResults: { ...s.matchResults, [id]: results } })),

  /* UI State */
  loading: false,
  setLoading: (loading) => set({ loading }),

  toast: null,
  showToast: (message, type = 'info') => {
    set({ toast: { message, type, id: Date.now() } })
    setTimeout(() => set({ toast: null }), 3500)
  },
}))

export default useStore
