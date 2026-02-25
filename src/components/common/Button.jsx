import { motion } from 'framer-motion'

const variants = {
  primary: 'bg-brown text-offwhite hover:bg-brown-light',
  secondary: 'bg-nude text-brown hover:bg-nude-dark',
  outline: 'border-2 border-brown text-brown hover:bg-brown hover:text-offwhite',
  ghost: 'text-brown hover:bg-nude/30',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

export default function Button({ children, variant = 'primary', size = 'md', className = '', onClick, disabled, type = 'button', ...props }) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        font-body font-medium rounded-2xl transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  )
}
