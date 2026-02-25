import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import Button from '../common/Button'

export default function Welcome({ onNext }) {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-offwhite to-nude-light/30">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: [0, 4, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 3 }}
          className="mx-auto mb-8"
        >
          <img src="/logo.webp" alt="MakeMyNails" className="w-24 h-24 rounded-3xl object-cover shadow-lg shadow-nude-dark/20 mx-auto" />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="font-heading text-4xl md:text-5xl font-bold text-brown mb-4 whitespace-pre-line"
        >
          {t('onboarding.welcome.title')}
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-brown-light/70 text-lg mb-10 max-w-sm"
        >
          {t('onboarding.welcome.subtitle')}
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Button size="lg" onClick={onNext}>
            {t('onboarding.welcome.cta')}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
