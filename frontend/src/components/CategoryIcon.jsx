import React from 'react'
import { motion } from 'framer-motion'
import { BottleWine, Cable, Headphones, IdCard, KeyRound, NotebookText, PackageSearch } from 'lucide-react'

const CATEGORY_ICONS = {
  id_card: IdCard,
  charger: Cable,
  bottle: BottleWine,
  notebook: NotebookText,
  headphones: Headphones,
  keys: KeyRound,
  other: PackageSearch,
}

export function getCategoryIcon(category) {
  return CATEGORY_ICONS[category] || PackageSearch
}

export default function CategoryIcon({ category, size = 24, className = '', animated = true }) {
  const Icon = getCategoryIcon(category)
  const Wrapper = animated ? motion.div : 'div'
  const motionProps = animated
    ? {
        whileHover: { y: -3, rotate: -3, scale: 1.06 },
        transition: { type: 'spring', stiffness: 420, damping: 18 },
      }
    : {}

  return (
    <Wrapper className={`item-illustration ${className}`} {...motionProps}>
      <span className="item-illustration-glow" />
      <Icon size={size} strokeWidth={1.9} />
    </Wrapper>
  )
}
