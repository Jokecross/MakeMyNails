import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Welcome from '../components/onboarding/Welcome'
import PhotoCapture from '../components/onboarding/PhotoCapture'
import ShapeSelector from '../components/onboarding/ShapeSelector'
import StyleSelector from '../components/onboarding/StyleSelector'
import LengthSelector from '../components/onboarding/LengthSelector'
import Processing from '../components/onboarding/Processing'
import { generateNailVisualization } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { useCredits } from '../contexts/CreditContext'

export default function Onboarding() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const { canGenerate, createVisualization, completeVisualization, uploadBlobUrl } = useCredits()
  const generationStarted = useRef(false)

  const preselected = location.state || {}
  const hasPreselection = preselected.preselectedShape || preselected.preselectedStyle || preselected.preselectedLength

  const [step, setStep] = useState(hasPreselection ? 5 : 0)
  const [data, setData] = useState({
    photo: preselected.photo || null,
    shape: preselected.preselectedShape || null,
    style: preselected.preselectedStyle || null,
    length: preselected.preselectedLength || null,
    customNote: '',
    inspirationPhoto: null,
    outfitPhoto: preselected.outfitPhoto || null,
  })

  const next = () => setStep((s) => s + 1)
  const back = () => setStep((s) => Math.max(0, s - 1))

  useEffect(() => {
    if (hasPreselection && step === 5 && !generationStarted.current) {
      if (isAuthenticated && !canGenerate()) {
        navigate('/app/purchase')
        return
      }

      if (!preselected.photo) {
        generationStarted.current = false
        setStep(1)
        return
      }

      generationStarted.current = true
      ;(async () => {
        try {
          const genData = {
            photo: preselected.photo,
            shape: preselected.preselectedShape,
            style: preselected.preselectedStyle,
            length: preselected.preselectedLength,
            customNote: '',
            inspirationPhoto: null,
            outfitPhoto: preselected.outfitPhoto || null,
          }

          let vizId = null
          if (isAuthenticated) {
            const originalImageUrl = await uploadBlobUrl(genData.photo)
            const vizResult = await createVisualization({
              shape: genData.shape,
              style: genData.style,
              length: genData.length,
              originalImageUrl,
            })
            vizId = vizResult?.visualization_id
          }

          const result = await generateNailVisualization(genData)

          if (isAuthenticated && vizId && result.resultImage) {
            await completeVisualization(vizId, result.resultImage)
          }

          navigate('/result', {
            state: { result, locked: !isAuthenticated },
          })
        } catch (err) {
          console.error(err)
          navigate(isAuthenticated ? '/app' : '/')
        }
      })()
    }
  }, [hasPreselection, step])

  const handleGenerate = useCallback(async () => {
    if (!data.photo) {
      setStep(1)
      return
    }

    if (isAuthenticated && !canGenerate()) {
      navigate('/app/purchase')
      return
    }

    next()

    try {
      let vizId = null
      if (isAuthenticated) {
        const originalImageUrl = await uploadBlobUrl(data.photo)
        const vizResult = await createVisualization({
          shape: data.shape,
          style: data.style,
          length: data.length,
          originalImageUrl,
        })
        vizId = vizResult?.visualization_id
      }

      const result = await generateNailVisualization(data)

      if (isAuthenticated && vizId && result.resultImage) {
        await completeVisualization(vizId, result.resultImage)
      }

      navigate('/result', {
        state: {
          result,
          locked: !isAuthenticated,
        },
      })
    } catch (err) {
      console.error(err)
      navigate(isAuthenticated ? '/app' : '/')
    }
  }, [data, navigate, isAuthenticated, canGenerate, createVisualization, completeVisualization, uploadBlobUrl])

  const steps = [
    <Welcome key="welcome" onNext={next} />,
    <PhotoCapture
      key="photo"
      onNext={next}
      onBack={back}
      onPhotoSelect={(photo) => setData((d) => ({ ...d, photo }))}
    />,
    <ShapeSelector
      key="shape"
      onNext={next}
      onBack={back}
      selected={data.shape}
      onSelect={(shape) => setData((d) => ({ ...d, shape }))}
    />,
    <StyleSelector
      key="style"
      onNext={next}
      onBack={back}
      selected={data.style}
      onSelect={(style) => setData((d) => ({ ...d, style, inspirationPhoto: style !== 'nailart' ? null : d.inspirationPhoto }))}
      customNote={data.customNote}
      onCustomNote={(customNote) => setData((d) => ({ ...d, customNote }))}
      inspirationPhoto={data.inspirationPhoto}
      onInspirationPhoto={(inspirationPhoto) => setData((d) => ({ ...d, inspirationPhoto }))}
    />,
    <LengthSelector
      key="length"
      onNext={handleGenerate}
      onBack={back}
      selected={data.length}
      onSelect={(length) => setData((d) => ({ ...d, length }))}
    />,
    <Processing key="processing" onComplete={() => {}} />,
  ]

  const progressPercent = ((step) / (steps.length - 1)) * 100

  return (
    <div className="relative">
      {step > 0 && step < steps.length - 1 && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-nude/30">
          <motion.div
            className="h-full bg-gradient-to-r from-nude-dark to-beige-dark"
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
        >
          {steps[step]}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
