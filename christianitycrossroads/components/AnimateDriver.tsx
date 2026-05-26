'use client'

import { motion } from 'framer-motion'

export default function AnimatedDivider({
  variant = 'shimmer',   // 'shimmer' | 'glow' | 'draw' | 'pulse'
  color = 'rose',      // 'rose' | 'indigo' | 'emerald' | 'amber' | 'violet' | 'custom'
  customFrom = '#e11d48',
  customTo = '#6366f1',
  height = '2px',
  width = '100%',
  center = false,      // true adds a center diamond
  className = '',
}) {
  const colorMap = {
    rose: { from: '#e11d48', to: '#fb7185', via: '#f43f5e' },
    indigo: { from: '#4f46e5', to: '#818cf8', via: '#6366f1' },
    emerald: { from: '#059669', to: '#34d399', via: '#10b981' },
    amber: { from: '#d97706', to: '#fbbf24', via: '#f59e0b' },
    violet: { from: '#7c3aed', to: '#c4b5fd', via: '#8b5cf6' },
    custom: { from: customFrom, to: customTo, via: customFrom },
  }

  const c = colorMap[color] || colorMap.rose

  const variants = {
    shimmer: (
      <div className={`relative overflow-hidden rounded-full ${className}`} style={{ height, width }}>
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: `linear-gradient(90deg, ${c.from}, ${c.via}, ${c.to}, ${c.via}, ${c.from})`, backgroundSize: '200% 100%' }}
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)` }}
          animate={{ x: ['-100%', '100%'] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
        />
      </div>
    ),

    glow: (
      <div className={`relative ${className}`} style={{ height, width }}>
        <motion.div
          className="absolute inset-0 rounded-full blur-sm"
          style={{ background: `linear-gradient(90deg, ${c.from}, ${c.to})` }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        />
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: `linear-gradient(90deg, ${c.from}, ${c.to})` }}
        />
      </div>
    ),

    draw: (
      <div className={`relative ${className}`} style={{ height, width }}>
        <div className="absolute inset-0 bg-gray-200 dark:bg-zinc-800 rounded-full" />
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: `linear-gradient(90deg, ${c.from}, ${c.to})` }}
          initial={{ width: '0%' }}
          whileInView={{ width: '100%' }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </div>
    ),

    pulse: (
      <div className={`relative ${className}`} style={{ height, width }}>
        <div className="absolute inset-0 bg-gray-200 dark:bg-zinc-800 rounded-full" />
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: `linear-gradient(90deg, ${c.from}, ${c.to})`, height, minWidth: '80px' }}
          animate={{ scaleX: [1, 1.5, 1], opacity: [1, 0.6, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        />
      </div>
    ),
  }

  if (!center) return variants[variant] || variants.shimmer

  return (
    <div className={`flex items-center gap-3 ${className}`} style={{ width }}>
      <div className="flex-1">{variants[variant]}</div>
      
      <motion.div
        initial={{ scale: 0, rotate: -45 }}
        whileInView={{ scale: 1, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.3 }}
        className="relative flex-shrink-0"
      >
        <div
          className="w-2.5 h-2.5 rotate-45 rounded-sm"
          style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
        />
        <motion.div
          className="absolute inset-0 rotate-45 rounded-sm"
          style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
        />
      </motion.div>
      
      <div className="flex-1">{variants[variant]}</div>
    </div>
  )
}