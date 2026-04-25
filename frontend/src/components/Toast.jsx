import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import useStore from '../store/useStore'

const ICONS = { success: CheckCircle, error: AlertCircle, info: Info }
const COLORS = {
  success: { bg: '#ECFDF5', border: '#10B981', color: '#065F46' },
  error:   { bg: '#FEF2F2', border: '#EF4444', color: '#7F1D1D' },
  info:    { bg: '#EFF6FF', border: '#1A56DB', color: '#1E3A8A' },
}

export default function Toast() {
  const toast = useStore((s) => s.toast)

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{   opacity: 0, y: 20,  scale: 0.95 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '14px 18px',
              background: COLORS[toast.type]?.bg || COLORS.info.bg,
              border: `1px solid ${COLORS[toast.type]?.border || COLORS.info.border}`,
              color: COLORS[toast.type]?.color || COLORS.info.color,
              borderRadius: 12,
              boxShadow: 'var(--shadow-md)',
              fontSize: 14,
              fontWeight: 500,
              maxWidth: 360,
            }}
          >
            {React.createElement(ICONS[toast.type] || Info, { size: 18 })}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
