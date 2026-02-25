import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, LogOut, Package } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useCredits } from '../contexts/CreditContext'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/common/Button'

export default function Profile() {
  const { credits, purchases } = useCredits()
  const { user, profile, logout, login, signup, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await signup(email, password, name)
      }
      setMode(null)
      setEmail('')
      setPassword('')
      setName('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="pt-20 pb-24 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="font-heading text-3xl font-bold text-brown">Mon espace</h1>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-sm shadow-brown/5"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-nude to-beige rounded-2xl flex items-center justify-center">
              <User className="w-8 h-8 text-brown" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-semibold text-brown">
                {isAuthenticated ? (profile?.name || user.email) : 'Invitée'}
              </h2>
              <p className="text-sm text-brown-light/60">
                {isAuthenticated ? user.email : 'Connecte-toi pour sauvegarder tes créations'}
              </p>
            </div>
          </div>

          {!isAuthenticated && !mode && (
            <div className="mt-4 flex gap-3">
              <Button size="sm" onClick={() => setMode('login')} className="flex-1">
                Se connecter
              </Button>
              <Button variant="outline" size="sm" onClick={() => setMode('signup')} className="flex-1">
                S'inscrire
              </Button>
            </div>
          )}

          {!isAuthenticated && mode && (
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              {mode === 'signup' && (
                <input
                  type="text"
                  placeholder="Votre prénom"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-nude/50 bg-offwhite text-brown text-sm focus:outline-none focus:ring-2 focus:ring-beige/50"
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-nude/50 bg-offwhite text-brown text-sm focus:outline-none focus:ring-2 focus:ring-beige/50"
              />
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-nude/50 bg-offwhite text-brown text-sm focus:outline-none focus:ring-2 focus:ring-beige/50"
              />
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <div className="flex gap-3">
                <Button variant="ghost" size="sm" onClick={() => setMode(null)} className="flex-1" type="button">
                  Annuler
                </Button>
                <Button size="sm" className="flex-1" type="submit" disabled={loading}>
                  {loading ? '...' : mode === 'login' ? 'Connexion' : 'Créer mon compte'}
                </Button>
              </div>
            </form>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 shadow-sm shadow-brown/5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-nude/30 rounded-xl flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="MakeMyNails" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-medium text-brown">Tes looks</p>
                <p className="text-sm text-brown-light/60">{credits} {credits !== 1 ? 'looks à créer' : 'look à créer'}</p>
              </div>
            </div>
            <Link to="/app/purchase" className="text-sm text-beige-dark font-medium hover:text-brown transition-colors">
              Obtenir plus
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 shadow-sm shadow-brown/5"
        >
          <h3 className="font-heading text-lg font-semibold text-brown mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-brown-light/60" />
            Mes achats
          </h3>
          {purchases.length === 0 ? (
            <p className="text-sm text-brown-light/50 text-center py-4">Aucun achat pour l'instant</p>
          ) : (
            <div className="space-y-3">
              {purchases.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-nude/20 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-brown">Pack {p.packs?.name || p.pack_id}</p>
                    <p className="text-xs text-brown-light/50">
                      {new Date(p.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-brown">{Number(p.amount).toFixed(2)}€</p>
                    <p className="text-xs text-brown-light/50">+{p.credits} look{p.credits !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm shadow-brown/5 hover:shadow-md transition-shadow"
            >
              <LogOut className="w-5 h-5 text-red-400" />
              <span className="text-sm font-medium text-red-400">Me déconnecter</span>
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
