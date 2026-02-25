import { motion } from 'framer-motion'
import { Sparkles, AlertCircle } from 'lucide-react'
import { useCredits } from '../../contexts/CreditContext'
import Button from '../common/Button'

export default function CreditCheck({ onNext, onBack, onPurchase }) {
  const { credits } = useCredits()
  const hasCredits = credits > 0

  return (
    <div className="min-h-screen flex flex-col px-6 py-12 bg-gradient-to-b from-offwhite to-nude-light/30">
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-8 ${
            hasCredits ? 'bg-gradient-to-br from-nude to-beige' : 'bg-nude/30'
          }`}
        >
          {hasCredits ? (
            <Sparkles className="w-12 h-12 text-brown" />
          ) : (
            <AlertCircle className="w-12 h-12 text-brown-light/40" />
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          {hasCredits ? (
            <>
              <h2 className="font-heading text-3xl font-bold text-brown mb-3">
                Tout est prêt !
              </h2>
              <p className="text-brown-light/70 mb-4">
                Vous avez <span className="font-semibold text-brown">{credits} crédit{credits > 1 ? 's' : ''}</span> disponible{credits > 1 ? 's' : ''}.
              </p>
              <p className="text-brown-light/60 text-sm">
                Cette visualisation utilisera 1 crédit.
              </p>
            </>
          ) : (
            <>
              <h2 className="font-heading text-3xl font-bold text-brown mb-3">
                Plus de crédits
              </h2>
              <p className="text-brown-light/70 mb-4">
                Rechargez votre compte pour continuer à créer des visualisations.
              </p>
            </>
          )}
        </motion.div>

        <div className="flex flex-col gap-3 w-full">
          {hasCredits ? (
            <>
              <Button onClick={onNext} className="w-full">
                Lancer la visualisation
              </Button>
              <Button variant="ghost" onClick={onBack} className="w-full">
                Retour
              </Button>
            </>
          ) : (
            <>
              <Button onClick={onPurchase} className="w-full">
                Acheter des crédits
              </Button>
              <Button variant="ghost" onClick={onBack} className="w-full">
                Retour
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
