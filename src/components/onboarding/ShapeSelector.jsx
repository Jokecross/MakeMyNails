import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import Button from '../common/Button'

const shapeIds = ['almond', 'square', 'stiletto', 'coffin', 'oval', 'ballerina']

export default function ShapeSelector({ onNext, onBack, selected, onSelect }) {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex flex-col px-6 py-12 bg-gradient-to-b from-offwhite to-nude-light/30">
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="font-heading text-3xl font-bold text-brown mb-3">
            {t('onboarding.shape.title')}
          </h2>
          <p className="text-brown-light/70">
            {t('onboarding.shape.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 w-full mb-8">
          {shapeIds.map((id, i) => (
            <motion.button
              key={id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onSelect(id)}
              className={`p-5 rounded-2xl text-center transition-all duration-200 ${selected === id ? 'bg-brown text-offwhite shadow-lg shadow-brown/20' : 'bg-white shadow-sm shadow-brown/5 hover:shadow-md'}`}
            >
              <span className={`font-heading font-semibold text-base block ${selected === id ? 'text-offwhite' : 'text-brown'}`}>
                {t(`onboarding.shape.items.${id}.name`)}
              </span>
              <span className={`text-xs block mt-1 ${selected === id ? 'text-offwhite/60' : 'text-brown-light/50'}`}>
                {t(`onboarding.shape.items.${id}.desc`)}
              </span>
            </motion.button>
          ))}
        </div>

        <div className="flex gap-3 w-full">
          <Button variant="ghost" onClick={onBack} className="flex-1">{t('onboarding.back')}</Button>
          <Button onClick={onNext} disabled={!selected} className="flex-1">{t('onboarding.continue')}</Button>
        </div>
      </div>
    </div>
  )
}
