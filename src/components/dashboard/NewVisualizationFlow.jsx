import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Camera, Upload, Image, Pencil, ImagePlus, ArrowLeft } from 'lucide-react'
import Button from '../common/Button'
import { generateNailVisualization } from '../../lib/api'
import { useCredits } from '../../contexts/CreditContext'

const shapes = [
  { id: 'almond', name: 'Amande', desc: 'Féminin et doux' },
  { id: 'square', name: 'Carré', desc: 'Classique et net' },
  { id: 'stiletto', name: 'Stiletto', desc: 'Audacieux et pointu' },
  { id: 'coffin', name: 'Coffin', desc: 'Tendance et chic' },
  { id: 'oval', name: 'Ovale', desc: 'Naturel et élégant' },
  { id: 'ballerina', name: 'Ballerine', desc: 'Long et raffiné' },
]

const styles = [
  { id: 'french', name: 'French', desc: 'Intemporel' },
  { id: 'color', name: 'Couleur unie', desc: 'Simple et chic' },
  { id: 'nailart', name: 'Nail Art', desc: 'Créatif et unique' },
  { id: 'gradient', name: 'Dégradé', desc: 'Doux et tendance' },
  { id: 'minimalist', name: 'Minimaliste', desc: 'Épuré et moderne' },
  { id: 'chrome', name: 'Chrome', desc: 'Brillant et futuriste' },
]

const lengths = [
  { id: 'short', name: 'Court', desc: 'Pratique au quotidien' },
  { id: 'medium', name: 'Moyen', desc: 'Polyvalent et élégant' },
  { id: 'long', name: 'Long', desc: 'Glamour et audacieux' },
]

const processingMessages = [
  'Analyse de ta photo…',
  'Application du style choisi…',
  'Création de ton look…',
  'Ajustements finaux…',
  'Presque terminé…',
]

export default function NewVisualizationFlow({ open, onClose }) {
  const navigate = useNavigate()
  const { canGenerate, createVisualization, completeVisualization, uploadBlobUrl } = useCredits()
  const [step, setStep] = useState(0)
  const [data, setData] = useState({
    photo: null,
    shape: null,
    style: null,
    length: null,
    customNote: '',
    inspirationPhoto: null,
  })
  const [showCustomNote, setShowCustomNote] = useState(false)
  const [msgIndex, setMsgIndex] = useState(0)

  const fileRef = useRef(null)
  const cameraRef = useRef(null)
  const inspoRef = useRef(null)

  const next = () => setStep((s) => s + 1)
  const back = () => setStep((s) => Math.max(0, s - 1))

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setData((d) => ({ ...d, photo: url }))
  }

  const handleInspoFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setData((d) => ({ ...d, inspirationPhoto: URL.createObjectURL(file) }))
  }

  const handleGenerate = useCallback(async () => {
    if (!canGenerate()) {
      navigate('/app/purchase')
      return
    }

    setStep(4)

    const msgInterval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % processingMessages.length)
    }, 1500)

    try {
      const originalImageUrl = await uploadBlobUrl(data.photo)
      const vizResult = await createVisualization({
        shape: data.shape,
        style: data.style,
        length: data.length,
        originalImageUrl,
      })
      const vizId = vizResult?.visualization_id

      const result = await generateNailVisualization(data)

      if (vizId && result.resultImage) {
        await completeVisualization(vizId, result.resultImage)
      }

      clearInterval(msgInterval)
      onClose()
      navigate('/result', { state: { result, locked: false } })
    } catch (err) {
      clearInterval(msgInterval)
      console.error(err)
      onClose()
    }
  }, [data, navigate, canGenerate, onClose])

  const handleClose = () => {
    setStep(0)
    setData({ photo: null, shape: null, style: null, length: null, customNote: '', inspirationPhoto: null })
    setShowCustomNote(false)
    setMsgIndex(0)
    onClose()
  }

  if (!open) return null

  const stepTitles = ['Ta photo', 'Forme', 'Style', 'Longueur', 'Création…']
  const progressPercent = step < 4 ? ((step + 1) / 4) * 100 : 100

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-offwhite flex flex-col"
    >
      {/* Header */}
      {step < 4 && (
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <button
            onClick={step === 0 ? handleClose : back}
            className="flex items-center gap-1.5 text-brown-light/60 hover:text-brown transition-colors"
          >
            {step === 0 ? <X className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
            <span className="text-sm">{step === 0 ? 'Fermer' : 'Retour'}</span>
          </button>
          <span className="text-xs text-brown-light/40 font-medium">{stepTitles[step]}</span>
          <div className="w-16" />
        </div>
      )}

      {/* Progress bar */}
      {step < 4 && (
        <div className="px-4 pb-2">
          <div className="h-1 bg-nude/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-nude-dark to-beige-dark rounded-full"
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* STEP 0 — Photo */}
          {step === 0 && (
            <motion.div key="photo" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="px-6 py-8 flex flex-col items-center max-w-md mx-auto w-full">
              <h2 className="font-heading text-2xl font-bold text-brown mb-2 text-center">Importe ta photo</h2>
              <p className="text-brown-light/60 text-sm mb-6 text-center">Photographie tes mains pour commencer</p>

              {data.photo ? (
                <div className="w-full rounded-3xl mb-6 shadow-lg overflow-hidden">
                  <img src={data.photo} style={{ display: 'block', width: '100%', height: 'auto' }} />
                </div>
              ) : (
                <div className="w-full aspect-square rounded-3xl border-2 border-dashed border-nude-dark/30 flex flex-col items-center justify-center gap-5 mb-6 bg-white/50">
                  <div className="w-16 h-16 bg-nude/30 rounded-full flex items-center justify-center">
                    <Image className="w-8 h-8 text-brown-light/40" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => cameraRef.current?.click()} className="flex items-center gap-2 bg-brown text-offwhite px-5 py-3 rounded-2xl font-medium text-sm">
                      <Camera className="w-4 h-4" /> Photo
                    </button>
                    <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 bg-nude text-brown px-5 py-3 rounded-2xl font-medium text-sm">
                      <Upload className="w-4 h-4" /> Galerie
                    </button>
                  </div>
                </div>
              )}

              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
              <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />

              <Button onClick={next} disabled={!data.photo} className="w-full">Continuer</Button>
            </motion.div>
          )}

          {/* STEP 1 — Shape */}
          {step === 1 && (
            <motion.div key="shape" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="px-6 py-8 max-w-md mx-auto w-full">
              <h2 className="font-heading text-2xl font-bold text-brown mb-2 text-center">Forme des ongles</h2>
              <p className="text-brown-light/60 text-sm mb-6 text-center">Quelle forme te fait envie ?</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {shapes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setData((d) => ({ ...d, shape: s.id }))}
                    className={`p-4 rounded-2xl text-center transition-all ${data.shape === s.id ? 'bg-brown text-offwhite shadow-lg shadow-brown/20' : 'bg-white shadow-sm shadow-brown/5'}`}
                  >
                    <span className={`font-heading font-semibold text-sm block ${data.shape === s.id ? 'text-offwhite' : 'text-brown'}`}>{s.name}</span>
                    <span className={`text-xs block mt-0.5 ${data.shape === s.id ? 'text-offwhite/60' : 'text-brown-light/50'}`}>{s.desc}</span>
                  </button>
                ))}
              </div>

              <Button onClick={next} disabled={!data.shape} className="w-full">Continuer</Button>
            </motion.div>
          )}

          {/* STEP 2 — Style */}
          {step === 2 && (
            <motion.div key="style" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="px-6 py-8 max-w-md mx-auto w-full">
              <h2 className="font-heading text-2xl font-bold text-brown mb-2 text-center">Style des ongles</h2>
              <p className="text-brown-light/60 text-sm mb-6 text-center">Quel look souhaites-tu ?</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {styles.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setData((d) => ({ ...d, style: s.id, inspirationPhoto: s.id !== 'nailart' ? null : d.inspirationPhoto }))}
                    className={`p-4 rounded-2xl text-center transition-all ${data.style === s.id ? 'bg-brown text-offwhite shadow-lg shadow-brown/20' : 'bg-white shadow-sm shadow-brown/5'}`}
                  >
                    <span className={`font-heading font-semibold text-sm block ${data.style === s.id ? 'text-offwhite' : 'text-brown'}`}>{s.name}</span>
                    <span className={`text-xs block mt-0.5 ${data.style === s.id ? 'text-offwhite/60' : 'text-brown-light/50'}`}>{s.desc}</span>
                  </button>
                ))}
              </div>

              {/* Inspiration photo for Nail Art */}
              {data.style === 'nailart' && (
                <div className="mb-4">
                  <input ref={inspoRef} type="file" accept="image/*" className="hidden" onChange={handleInspoFile} />
                  {!data.inspirationPhoto ? (
                    <button onClick={() => inspoRef.current?.click()} className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-2xl shadow-sm shadow-brown/5">
                      <div className="w-9 h-9 rounded-xl bg-nude-light/50 flex items-center justify-center flex-shrink-0">
                        <ImagePlus className="w-4 h-4 text-brown-light/60" />
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-medium text-brown block">Photo d'inspiration</span>
                        <span className="text-[11px] text-brown-light/50">L'IA reproduira le design</span>
                      </div>
                    </button>
                  ) : (
                    <div className="w-full rounded-2xl bg-white p-2 shadow-sm shadow-brown/5 flex items-center gap-3">
                      <img src={data.inspirationPhoto} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-brown block">Inspiration ajoutée</span>
                        <span className="text-[11px] text-brown-light/50">L'IA s'en inspirera</span>
                      </div>
                      <button onClick={() => { setData((d) => ({ ...d, inspirationPhoto: null })); if (inspoRef.current) inspoRef.current.value = '' }} className="w-7 h-7 rounded-full bg-brown-light/10 flex items-center justify-center flex-shrink-0">
                        <X className="w-3.5 h-3.5 text-brown-light/60" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Custom note */}
              {!showCustomNote ? (
                <button onClick={() => setShowCustomNote(true)} className="flex items-center gap-2 text-sm text-brown-light/60 hover:text-brown transition-colors mb-5 mx-auto">
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Préciser une couleur ou un détail</span>
                </button>
              ) : (
                <div className="mb-5">
                  <div className="relative">
                    <input type="text" maxLength={35} placeholder="Ex : rouge bordeaux, paillettes…" value={data.customNote} onChange={(e) => setData((d) => ({ ...d, customNote: e.target.value }))} className="w-full px-4 py-3 bg-white rounded-2xl text-sm text-brown placeholder:text-brown-light/40 outline-none focus:ring-2 focus:ring-nude-dark/30 shadow-sm shadow-brown/5 pr-12" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-brown-light/30">{data.customNote.length}/35</span>
                  </div>
                  <p className="text-[11px] text-brown-light/40 mt-1 ml-1">Optionnel — aide l'IA à personnaliser</p>
                </div>
              )}

              <Button onClick={next} disabled={!data.style} className="w-full">Continuer</Button>
            </motion.div>
          )}

          {/* STEP 3 — Length */}
          {step === 3 && (
            <motion.div key="length" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="px-6 py-8 max-w-md mx-auto w-full">
              <h2 className="font-heading text-2xl font-bold text-brown mb-2 text-center">Longueur</h2>
              <p className="text-brown-light/60 text-sm mb-6 text-center">Quelle longueur préfères-tu ?</p>

              <div className="space-y-3 mb-6">
                {lengths.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setData((d) => ({ ...d, length: l.id }))}
                    className={`w-full p-5 rounded-2xl text-left transition-all ${data.length === l.id ? 'bg-brown text-offwhite shadow-lg shadow-brown/20' : 'bg-white shadow-sm shadow-brown/5'}`}
                  >
                    <span className={`font-heading font-semibold text-base block ${data.length === l.id ? 'text-offwhite' : 'text-brown'}`}>{l.name}</span>
                    <span className={`text-xs block mt-0.5 ${data.length === l.id ? 'text-offwhite/60' : 'text-brown-light/50'}`}>{l.desc}</span>
                  </button>
                ))}
              </div>

              <Button onClick={handleGenerate} disabled={!data.length} className="w-full">Générer mon look</Button>
            </motion.div>
          )}

          {/* STEP 4 — Processing */}
          {step === 4 && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center px-6 min-h-[70vh]">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} className="w-16 h-16 mb-6">
                <img src="/logo.png" alt="MakeMyNails" className="w-full h-full rounded-2xl object-cover shadow-lg shadow-nude-dark/20" />
              </motion.div>
              <h2 className="font-heading text-2xl font-bold text-brown mb-4">Création en cours…</h2>
              <AnimatePresence mode="wait">
                <motion.p key={msgIndex} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="text-brown-light/60 text-sm">
                  {processingMessages[msgIndex]}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
