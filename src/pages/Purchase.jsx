import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, ArrowLeft, Crown, Check, Sparkles, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PACKS, SUBSCRIPTION } from '../lib/stripe'
import { useCredits } from '../contexts/CreditContext'
import { useAuth } from '../contexts/AuthContext'

export default function Purchase() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { addCredits, subscription } = useCredits()
  const { isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(null)
  const [tab, setTab] = useState('packs')

  const handlePurchase = async (pack) => {
    if (!isAuthenticated) {
      navigate('/app/profile')
      return
    }

    setLoading(pack.id)
    try {
      await addCredits(pack.id)
      navigate('/app')
    } catch (err) {
      console.error(err)
      alert(t('purchasePage.purchaseError'))
    } finally {
      setLoading(null)
    }
  }

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      navigate('/app/profile')
      return
    }

    setLoading('sub_premium')
    try {
      await addCredits('sub_premium')
      navigate('/app')
    } catch (err) {
      console.error(err)
      alert(t('purchasePage.subscribeError'))
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="pt-20 pb-24 px-4">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-brown-light/60 hover:text-brown transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">{t('purchasePage.back')}</span>
        </button>

        <h1 className="font-heading text-3xl font-bold text-brown mb-2">{t('purchasePage.title')}</h1>
        <p className="text-brown-light/60 mb-6">{t('purchasePage.subtitle')}</p>

        {/* Tabs */}
        <div className="flex gap-1 bg-nude/30 rounded-2xl p-1 mb-6">
          <button
            onClick={() => setTab('packs')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === 'packs'
                ? 'bg-white text-brown shadow-sm'
                : 'text-brown-light/60 hover:text-brown'
            }`}
          >
            {t('purchasePage.tabPacks')}
          </button>
          <button
            onClick={() => setTab('subscription')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
              tab === 'subscription'
                ? 'bg-white text-brown shadow-sm'
                : 'text-brown-light/60 hover:text-brown'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            {t('purchasePage.tabSubscription')}
          </button>
        </div>

        {tab === 'packs' ? (
          <div className="space-y-3">
            {PACKS.map((pack, i) => (
              <motion.div
                key={pack.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="relative"
              >
                {pack.popular && (
                  <div className="absolute -top-2.5 left-6 z-10">
                    <div className="bg-brown text-offwhite px-3 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-beige text-beige" />
                      {t('purchasePage.popular')}
                    </div>
                  </div>
                )}

                <button
                  disabled={loading === pack.id}
                  onClick={() => handlePurchase(pack)}
                  className={`
                    w-full rounded-3xl p-5 transition-all duration-300 text-left
                    ${pack.popular
                      ? 'bg-brown text-offwhite shadow-lg shadow-brown/20 ring-2 ring-beige/30'
                      : 'bg-white shadow-sm shadow-brown/5 hover:shadow-md'}
                    ${loading === pack.id ? 'opacity-70' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`font-heading text-lg font-semibold ${pack.popular ? 'text-offwhite' : 'text-brown'}`}>
                        {pack.name}
                      </h3>
                      <p className={`text-sm mt-0.5 ${pack.popular ? 'text-offwhite/60' : 'text-brown-light/60'}`}>
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
                </button>
              </motion.div>
            ))}

            {/* Teaser abonnement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <button
                onClick={() => setTab('subscription')}
                className="w-full mt-2 bg-gradient-to-r from-nude-light to-beige/20 border border-nude-dark/20 rounded-3xl p-5 text-left hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-beige-dark to-brown rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-brown/20">
                    <Crown className="w-5 h-5 text-offwhite" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-heading text-base font-semibold text-brown">{t('purchasePage.premiumTeaser')}</h3>
                    </div>
                    <p className="text-xs text-brown-light/60">{t('purchasePage.premiumTeaserDesc')}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-brown bg-nude px-2 py-0.5 rounded-full">
                      -40%
                    </span>
                  </div>
                </div>
              </button>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Subscription card */}
            <div className="relative bg-gradient-to-br from-brown via-brown to-brown-light rounded-3xl p-6 text-offwhite shadow-xl shadow-brown/20 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-beige to-beige-dark rounded-2xl flex items-center justify-center shadow-lg shadow-beige-dark/30">
                    <Crown className="w-6 h-6 text-brown" />
                  </div>
                  <div>
                    <h2 className="font-heading text-2xl font-bold">Premium</h2>
                    <p className="text-offwhite/50 text-xs">{t('purchasePage.premiumSubtitle')}</p>
                  </div>
                </div>

                <div className="flex items-baseline gap-1 mb-5">
                  <span className="font-heading text-4xl font-bold">14,99€</span>
                  <span className="text-offwhite/50 text-sm">{t('purchasePage.perMonth')}</span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Zap className="w-4 h-4 text-beige" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t('purchasePage.genPerMonth')}</p>
                      <p className="text-[11px] text-offwhite/40">{t('purchasePage.genPerMonthDetail')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-beige" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t('purchasePage.emmaUnlimited')}</p>
                      <p className="text-[11px] text-offwhite/40">{t('purchasePage.emmaUnlimitedDetail')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-beige" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t('purchasePage.priorityAccess')}</p>
                      <p className="text-[11px] text-offwhite/40">{t('purchasePage.priorityAccessDetail')}</p>
                    </div>
                  </div>
                </div>

                {/* Comparison */}
                <div className="bg-white/10 rounded-2xl p-4 mb-5">
                  <p className="text-[11px] text-offwhite/50 mb-2 font-medium uppercase tracking-wider">{t('purchasePage.comparedTo')}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-offwhite/40">{t('purchasePage.packAddict')}</p>
                      <p className="text-sm font-semibold line-through text-offwhite/50">{t('purchasePage.packAddictPrice')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-beige">Premium</p>
                      <p className="text-sm font-bold text-offwhite">{t('purchasePage.premiumPrice')}</p>
                    </div>
                  </div>
                </div>

                <button
                  disabled={loading === 'sub_premium'}
                  onClick={handleSubscribe}
                  className="w-full bg-gradient-to-r from-beige to-beige-dark text-brown py-4 rounded-2xl font-bold text-base hover:from-beige/90 hover:to-beige-dark/90 transition-all shadow-lg shadow-beige-dark/30 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {loading === 'sub_premium' ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-brown/30 border-t-brown rounded-full"
                    />
                  ) : (
                    <>
                      <Crown className="w-5 h-5" />
                      {t('purchasePage.subscribeCta')}
                    </>
                  )}
                </button>

                <p className="text-center text-[10px] text-offwhite/30 mt-3">
                  {t('purchasePage.cancelAnytime')}
                </p>
              </div>
            </div>

            {/* Or go back to packs */}
            <button
              onClick={() => setTab('packs')}
              className="w-full text-center text-sm text-brown-light/50 hover:text-brown transition-colors mt-5"
            >
              {t('purchasePage.orBuyPack')}
            </button>
          </motion.div>
        )}

        {!isAuthenticated && (
          <p className="text-center text-sm text-brown-light/60 mt-6">
            {t('purchasePage.loginRequired')}
          </p>
        )}

        <p className="text-center text-xs text-brown-light/40 mt-8">
          {t('purchasePage.securePayment')}
        </p>
      </div>
    </div>
  )
}
