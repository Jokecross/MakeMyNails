import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

export default function Processing({ onComplete }) {
  const { t } = useTranslation()
  const messages = t('onboarding.processing.messages', { returnObjects: true })
  const [messageIndex, setMessageIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length)
    }, 1500)

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          clearInterval(msgInterval)
          setTimeout(onComplete, 500)
          return 100
        }
        return prev + 2
      })
    }, 80)

    return () => {
      clearInterval(msgInterval)
      clearInterval(progressInterval)
    }
  }, [onComplete])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-offwhite to-nude-light/30">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        className="w-20 h-20 mb-8"
      >
        <img src="/logo.png" alt="MakeMyNails" className="w-full h-full rounded-3xl object-cover shadow-lg shadow-nude-dark/20" />
      </motion.div>

      <h2 className="font-heading text-3xl font-bold text-brown mb-6">
        {t('onboarding.processing.title')}
      </h2>

      <div className="w-full max-w-xs mb-6">
        <div className="h-2 bg-nude/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-nude-dark to-beige-dark rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="text-right mt-1">
          <span className="text-xs text-brown-light/50">{Math.round(progress)}%</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={messageIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-brown-light/60 text-sm"
        >
          {messages[messageIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
