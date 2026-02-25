import { motion } from 'framer-motion'
import { Check, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Button from '../common/Button'
import { PACKS } from '../../lib/stripe'

export default function Pricing() {
  const { t } = useTranslation()

  return (
    <section id="pricing" className="py-24 px-4 bg-gradient-to-b from-transparent to-nude/10">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-brown mb-4">
            {t('pricing.title')}
          </h2>
          <p className="text-brown-light/70 text-lg max-w-md mx-auto">
            {t('pricing.subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {PACKS.map((pack, i) => (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              {pack.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-brown text-offwhite px-4 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-beige text-beige" />
                    {t('pricing.popular')}
                  </div>
                </div>
              )}
              <div className={`rounded-3xl p-8 h-full flex flex-col transition-all duration-300 ${pack.popular ? 'bg-brown text-offwhite shadow-xl shadow-brown/20 scale-[1.03]' : 'bg-white shadow-sm shadow-brown/5 hover:shadow-md'}`}>
                <div className="mb-6">
                  <h3 className={`font-heading text-2xl font-semibold mb-1 ${pack.popular ? 'text-offwhite' : 'text-brown'}`}>{pack.name}</h3>
                  <p className={`text-sm ${pack.popular ? 'text-offwhite/60' : 'text-brown-light/60'}`}>{pack.description}</p>
                </div>
                <div className="mb-6">
                  <span className={`font-heading text-5xl font-bold ${pack.popular ? 'text-offwhite' : 'text-brown'}`}>{pack.price.toFixed(2)}€</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="flex items-center gap-2">
                    <Check className={`w-4 h-4 ${pack.popular ? 'text-beige' : 'text-beige-dark'}`} />
                    <span className={`text-sm ${pack.popular ? 'text-offwhite/80' : 'text-brown-light/70'}`}>
                      {t('pricing.features.aiVisualizations', { count: pack.credits })}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className={`w-4 h-4 ${pack.popular ? 'text-beige' : 'text-beige-dark'}`} />
                    <span className={`text-sm ${pack.popular ? 'text-offwhite/80' : 'text-brown-light/70'}`}>{t('pricing.features.unlimitedShare')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className={`w-4 h-4 ${pack.popular ? 'text-beige' : 'text-beige-dark'}`} />
                    <span className={`text-sm ${pack.popular ? 'text-offwhite/80' : 'text-brown-light/70'}`}>{t('pricing.features.history')}</span>
                  </li>
                  {pack.popular && (
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-beige" />
                      <span className="text-sm text-offwhite/80">{t('pricing.features.exclusiveStyles')}</span>
                    </li>
                  )}
                </ul>
                <Link to="/onboarding">
                  <Button variant={pack.popular ? 'secondary' : 'outline'} className="w-full justify-center">
                    {t('pricing.choose')}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
