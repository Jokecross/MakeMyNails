import { motion } from 'framer-motion'

export default function Card({ children, className = '', glass = false, hover = true, onClick }) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, boxShadow: '0 20px 40px rgba(44, 26, 18, 0.08)' } : {}}
      onClick={onClick}
      className={`
        rounded-3xl p-6 transition-all duration-300
        ${glass ? 'glass' : 'bg-white shadow-sm shadow-brown/5'}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}
