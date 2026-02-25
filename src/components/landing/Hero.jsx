import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Button from '../common/Button'

export default function Hero() {
  const { t } = useTranslation()
  const [current, setCurrent] = useState(0)

  const afterImages = [
    '/after 1.png',
    '/after 2.png',
    '/After 3.png',
    '/after 4.jpg',
    '/after 5.png',
    '/after 6.jpg',
    '/after 7.jpg',
    '/after 8.jpg',
    '/after 9.jpg',
    '/after 10.jpg',
    '/after 11.jpg',
    '/after 12.jpg',
    '/after 13.jpg',
    '/after 14.jpg',
  ]

  const examples = afterImages.map((src, i) => ({
    after: src,
    badge: t(`hero.examples.${i}.badge`),
  }))

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % examples.length)
    }, 3500)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-nude/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-beige/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-nude-light/50 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center md:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-nude/50 px-4 py-2 rounded-full mb-6"
            >
              <span className="text-sm font-medium text-brown-light">{t('hero.badge')}</span>
            </motion.div>

            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-brown leading-[1.1] mb-6">
              {t('hero.title')}{' '}
              <span className="italic text-brown-medium">{t('hero.titleItalic')}</span>{' '}
              {t('hero.titleSuffix')}
            </h1>

            <p className="text-lg text-brown-light/80 leading-relaxed mb-8 max-w-md mx-auto md:mx-0">
              {t('hero.subtitle')}
            </p>

            <div className="flex justify-center md:justify-start">
              <Link to="/onboarding">
                <Button size="lg" className="flex items-center gap-2">
                  {t('hero.cta')}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="relative aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 rounded-[2rem] overflow-hidden">
                <div className="grid grid-cols-2 h-full gap-1">
                  <div className="relative">
                    <img src="/before.png" alt={t('hero.before')} className="w-full h-full object-cover" />
                    <span className="absolute bottom-3 left-0 right-0 text-center text-xs font-medium text-white/80 uppercase tracking-wider drop-shadow">{t('hero.before')}</span>
                  </div>
                  <div className="relative overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={current}
                        src={examples[current].after}
                        alt={t('hero.after')}
                        className="w-full h-full object-cover"
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5 }}
                      />
                    </AnimatePresence>
                    <span className="absolute bottom-3 left-0 right-0 text-center text-xs font-medium text-white/80 uppercase tracking-wider drop-shadow z-10">{t('hero.after')}</span>
                  </div>
                </div>
              </div>


            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
