import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pencil, ImagePlus, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Button from '../common/Button'

const styleIds = ['french', 'color', 'nailart', 'gradient', 'minimalist', 'chrome']

export default function StyleSelector({ onNext, onBack, selected, onSelect, customNote, onCustomNote, inspirationPhoto, onInspirationPhoto }) {
  const { t } = useTranslation()
  const [showInput, setShowInput] = useState(!!customNote)
  const inspoInputRef = useRef(null)

  const isNailArt = selected === 'nailart'

  const handleInspoFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    onInspirationPhoto(url)
  }

  const removeInspo = () => {
    onInspirationPhoto(null)
    if (inspoInputRef.current) inspoInputRef.current.value = ''
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-12 bg-gradient-to-b from-offwhite to-nude-light/30">
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="font-heading text-3xl font-bold text-brown mb-3">
            {t('onboarding.style.title')}
          </h2>
          <p className="text-brown-light/70">
            {t('onboarding.style.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 w-full mb-5">
          {styleIds.map((id, i) => (
            <motion.button
              key={id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onSelect(id)}
              className={`p-5 rounded-2xl text-center transition-all duration-200 ${selected === id ? 'bg-brown text-offwhite shadow-lg shadow-brown/20' : 'bg-white shadow-sm shadow-brown/5 hover:shadow-md'}`}
            >
              <span className={`font-heading font-semibold text-base block ${selected === id ? 'text-offwhite' : 'text-brown'}`}>
                {t(`onboarding.style.items.${id}.name`)}
              </span>
              <span className={`text-xs block mt-1 ${selected === id ? 'text-offwhite/60' : 'text-brown-light/50'}`}>
                {t(`onboarding.style.items.${id}.desc`)}
              </span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {isNailArt && (
            <motion.div
              key="inspo"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full mb-4 overflow-hidden"
            >
              <input ref={inspoInputRef} type="file" accept="image/*" className="hidden" onChange={handleInspoFile} />
              {!inspirationPhoto ? (
                <button
                  onClick={() => inspoInputRef.current?.click()}
                  className="w-full flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl shadow-sm shadow-brown/5 hover:shadow-md transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-nude-light/50 flex items-center justify-center flex-shrink-0">
                    <ImagePlus className="w-5 h-5 text-brown-light/60" />
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-medium text-brown block">{t('onboarding.style.addInspo')}</span>
                    <span className="text-[11px] text-brown-light/50">{t('onboarding.style.inspoHint')}</span>
                  </div>
                </button>
              ) : (
                <div className="relative w-full rounded-2xl overflow-hidden shadow-sm shadow-brown/5 bg-white p-2">
                  <div className="flex items-center gap-3">
                    <img src={inspirationPhoto} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-brown block">{t('onboarding.style.inspoLabel')}</span>
                      <span className="text-[11px] text-brown-light/50">{t('onboarding.style.inspoUsed')}</span>
                    </div>
                    <button onClick={removeInspo} className="w-8 h-8 rounded-full bg-brown-light/10 flex items-center justify-center flex-shrink-0 hover:bg-brown-light/20 transition-colors">
                      <X className="w-4 h-4 text-brown-light/60" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!showInput ? (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => setShowInput(true)}
            className="flex items-center gap-2 text-sm text-brown-light/60 hover:text-brown transition-colors mb-6"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>{t('onboarding.style.addNote')}</span>
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="w-full mb-6"
          >
            <div className="relative">
              <input
                type="text"
                maxLength={35}
                placeholder={t('onboarding.style.notePlaceholder')}
                value={customNote || ''}
                onChange={(e) => onCustomNote(e.target.value)}
                className="w-full px-4 py-3 bg-white rounded-2xl text-sm text-brown placeholder:text-brown-light/40 outline-none focus:ring-2 focus:ring-nude-dark/30 shadow-sm shadow-brown/5 pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-brown-light/30">
                {(customNote || '').length}/35
              </span>
            </div>
            <p className="text-[11px] text-brown-light/40 mt-1.5 ml-1">
              {t('onboarding.style.noteHint')}
            </p>
          </motion.div>
        )}

        <div className="flex gap-3 w-full">
          <Button variant="ghost" onClick={onBack} className="flex-1">{t('onboarding.back')}</Button>
          <Button onClick={onNext} disabled={!selected} className="flex-1">{t('onboarding.continue')}</Button>
        </div>
      </div>
    </div>
  )
}
