import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Star, Crown, Lock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import CreditCounter from '../components/dashboard/CreditCounter'
import UploadZone from '../components/dashboard/UploadZone'
import RecommendationCard from '../components/dashboard/RecommendationCard'
import RecommendationChat from '../components/dashboard/RecommendationChat'
import NewVisualizationFlow from '../components/dashboard/NewVisualizationFlow'
import HistoryList from '../components/dashboard/HistoryList'
import { useCredits } from '../contexts/CreditContext'
import { PACKS } from '../lib/stripe'

function NoCreditsConversion() {
  const { t } = useTranslation()
  const { addCredits } = useCredits()
  const [loading, setLoading] = useState(null)

  const handleBuy = async (packId) => {
    setLoading(packId)
    try { await addCredits(packId) } catch { setLoading(null) }
  }

  return (
    <div className="pt-20 pb-24 px-5">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 pt-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-nude/50 flex items-center justify-center mx-auto mb-5">
            <Lock className="w-8 h-8 text-brown-light/50" />
          </div>
          <h2 className="font-heading text-3xl font-bold text-brown mb-3">
            {t('creditCheck.noCreditsTitle')}
          </h2>
          <p className="text-brown-light/60 text-base leading-relaxed">
            {t('creditCheck.noCreditsDesc')}
          </p>
        </motion.div>

        <div className="space-y-3 mb-4">
          {PACKS.map((pack, i) => (
            <motion.button
              key={pack.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              disabled={!!loading}
              onClick={() => handleBuy(pack.id)}
              className={`w-full rounded-3xl p-5 text-left transition-all duration-200 relative ${
                pack.popular
                  ? 'bg-brown text-offwhite shadow-lg shadow-brown/25 ring-2 ring-beige/30'
                  : 'bg-white shadow-sm shadow-brown/5 hover:shadow-md'
              } ${loading === pack.id ? 'opacity-70' : ''}`}
            >
              {pack.popular && (
                <div className="absolute -top-2.5 left-5">
                  <div className="bg-beige-dark text-brown px-3 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-brown" />
                    {t('purchasePage.popular')}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-heading text-lg font-semibold ${pack.popular ? 'text-offwhite' : 'text-brown'}`}>
                    {pack.name}
                  </h3>
                  <p className={`text-sm mt-0.5 ${pack.popular ? 'text-offwhite/60' : 'text-brown-light/50'}`}>
                    {pack.credits} {t('purchasePage.generations')}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`font-heading text-2xl font-bold ${pack.popular ? 'text-offwhite' : 'text-brown'}`}>
                    {loading === pack.id ? '...' : `${pack.price.toFixed(2)}€`}
                  </span>
                  <p className={`text-[11px] ${pack.popular ? 'text-offwhite/40' : 'text-brown-light/40'}`}>
                    {pack.pricePerCredit.toFixed(2)}€ {t('purchasePage.perGeneration')}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          disabled={!!loading}
          onClick={() => handleBuy('sub_premium')}
          className="w-full bg-gradient-to-r from-nude-light to-beige/20 border border-nude-dark/20 rounded-3xl p-4 text-left hover:shadow-md transition-all mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-beige-dark to-brown rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-brown/20">
              <Crown className="w-5 h-5 text-offwhite" />
            </div>
            <div className="flex-1">
              <p className="font-heading text-sm font-semibold text-brown">{t('purchasePage.premiumTeaser')}</p>
              <p className="text-xs text-brown-light/50">{t('purchasePage.premiumTeaserDesc')}</p>
            </div>
            <span className="text-xs font-semibold text-brown bg-nude px-2 py-0.5 rounded-full whitespace-nowrap">-40%</span>
          </div>
        </motion.button>

        <p className="text-center text-xs text-brown-light/30">{t('purchasePage.securePayment')}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [chatOpen, setChatOpen] = useState(false)
  const [flowOpen, setFlowOpen] = useState(false)
  const { credits, isSubscribed } = useCredits()

  if (credits === 0 && !isSubscribed) {
    return <NoCreditsConversion />
  }

  return (
    <>
      <div className="pt-20 pb-24 px-4">
        <div className="max-w-lg mx-auto space-y-6">
          <CreditCounter />
          <UploadZone onStart={() => setFlowOpen(true)} />
          <RecommendationCard onClick={() => setChatOpen(true)} />
          <HistoryList limit={3} />
        </div>
      </div>

      <AnimatePresence>
        {chatOpen && <RecommendationChat open={chatOpen} onClose={() => setChatOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {flowOpen && <NewVisualizationFlow open={flowOpen} onClose={() => setFlowOpen(false)} />}
      </AnimatePresence>
    </>
  )
}
