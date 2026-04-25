import React from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

export default function Stepper({ steps, current }) {
  return (
    <div className="stepper">
      {steps.map((label, i) => {
        const done   = i < current
        const active = i === current
        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <div
                className={`step-connector${done ? ' done' : ''}`}
              />
            )}
            <div className={`step-item${active ? ' active' : ''}${done ? ' done' : ''}`}>
              <motion.div
                className="step-circle"
                animate={active ? { scale: 1.1 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                {done ? <Check size={17} strokeWidth={3} /> : i + 1}
              </motion.div>
              <span className="step-label">{label}</span>
            </div>
          </React.Fragment>
        )
      })}
    </div>
  )
}
