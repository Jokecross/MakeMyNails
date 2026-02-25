const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder'

export const PACKS = [
  {
    id: 'pack_decouverte',
    name: 'Découverte',
    price: 4.99,
    credits: 5,
    pricePerCredit: 1.00,
    type: 'one_time',
  },
  {
    id: 'pack_reguliere',
    name: 'Régulière',
    price: 9.99,
    credits: 15,
    pricePerCredit: 0.67,
    popular: true,
    type: 'one_time',
  },
  {
    id: 'pack_addict',
    name: 'Addict',
    price: 19.99,
    credits: 40,
    pricePerCredit: 0.50,
    type: 'one_time',
  },
]

export const SUBSCRIPTION = {
  id: 'sub_premium',
  name: 'Premium',
  price: 14.99,
  credits: 50,
  pricePerCredit: 0.30,
  period: 'mois',
  features: [
    '50 générations / mois',
    'Emma illimitée',
    'Accès prioritaire',
  ],
}

export async function createCheckoutSession(packId) {
  console.log('Stripe checkout for pack:', packId)
  alert('Intégration Stripe à configurer. Pack sélectionné : ' + packId)
}

export { STRIPE_PUBLIC_KEY }
