import React from 'react'

const CONFIGS = {
  active:  { label: 'Active',  cls: 'badge-active'  },
  matched: { label: 'Matched', cls: 'badge-matched' },
  closed:  { label: 'Closed',  cls: 'badge-closed'  },
}

export default function StatusBadge({ status }) {
  const cfg = CONFIGS[status] || CONFIGS.active
  return (
    <span className={`badge ${cfg.cls}`}>
      <span className="badge-dot" />
      {cfg.label}
    </span>
  )
}
