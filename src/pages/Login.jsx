import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { t } = useTranslation()
  const { login, signup, loginWithGoogle, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const handledByForm = useRef(false)

  const defaultMode = new URLSearchParams(location.search).get('mode') || 'login'
  const [mode, setMode] = useState(defaultMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated && !handledByForm.current) {
      navigate('/app', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      handledByForm.current = true
      if (mode === 'login') {
        await login(email, password)
        navigate('/app', { replace: true })
      } else {
        await signup(email, password, name)
        navigate('/onboarding', { replace: true })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-offwhite to-nude-light/30 flex flex-col">
      {/* Header */}
      <div className="px-4 pt-6 pb-2">
        <Link to="/" className="inline-flex items-center gap-2 text-brown-light/60 hover:text-brown transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">{t('auth.back')}</span>
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/">
              <img src="/logo.webp" alt="MakeMyNails" className="w-16 h-16 rounded-2xl object-cover mx-auto mb-4 shadow-lg shadow-nude-dark/20" />
            </Link>
            <h1 className="font-heading text-3xl font-bold text-brown mb-1">
              {mode === 'login' ? t('auth.loginTitle') : t('auth.signupTitle')}
            </h1>
            <p className="text-brown-light/60 text-sm">
              {mode === 'login'
                ? t('auth.loginSubtitle')
                : t('auth.signupSubtitle')}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-nude/30 rounded-2xl p-1 mb-6">
            <button
              onClick={() => { setMode('login'); setError('') }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                mode === 'login' ? 'bg-white text-brown shadow-sm' : 'text-brown-light/60 hover:text-brown'
              }`}
            >
              {t('auth.tabLogin')}
            </button>
            <button
              onClick={() => { setMode('signup'); setError('') }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                mode === 'signup' ? 'bg-white text-brown shadow-sm' : 'text-brown-light/60 hover:text-brown'
              }`}
            >
              {t('auth.tabSignup')}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <input
                  type="text"
                  placeholder={t('auth.namePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl border border-nude/50 bg-white text-brown text-sm focus:outline-none focus:ring-2 focus:ring-beige/50 placeholder:text-brown-light/40"
                />
              </motion.div>
            )}

            <input
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-3.5 rounded-2xl border border-nude/50 bg-white text-brown text-sm focus:outline-none focus:ring-2 focus:ring-beige/50 placeholder:text-brown-light/40"
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full px-4 py-3.5 rounded-2xl border border-nude/50 bg-white text-brown text-sm focus:outline-none focus:ring-2 focus:ring-beige/50 placeholder:text-brown-light/40 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-brown-light/40 hover:text-brown transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-xs px-1"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brown text-offwhite py-4 rounded-2xl font-semibold text-base hover:bg-brown-light transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-offwhite/30 border-t-offwhite rounded-full"
                  />
                  {t('auth.loading')}
                </span>
              ) : mode === 'login' ? t('auth.loginCta') : t('auth.signupCta')}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-nude/50" />
            <span className="text-xs text-brown-light/40">{t('auth.orWith')}</span>
            <div className="flex-1 h-px bg-nude/50" />
          </div>

          {/* Google button */}
          <button
            type="button"
            onClick={async () => {
              setGoogleLoading(true)
              try { await loginWithGoogle() } catch (err) { setError(err.message); setGoogleLoading(false) }
            }}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-nude/60 text-brown py-3.5 rounded-2xl text-sm font-medium hover:bg-nude/10 transition-colors disabled:opacity-60"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleLoading ? t('auth.loading') : t('auth.googleCta')}
          </button>

          {/* Footer note */}
          {mode === 'signup' && (
            <p className="text-center text-xs text-brown-light/40 mt-4">
              {t('auth.terms')}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}
