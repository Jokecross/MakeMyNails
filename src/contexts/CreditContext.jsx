import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const CreditContext = createContext(null)

const FREE_CREDITS = 3

export function CreditProvider({ children }) {
  const { user, profile, refreshProfile } = useAuth()
  const [history, setHistory] = useState([])
  const [purchases, setPurchases] = useState([])
  const [subscription, setSubscription] = useState(null)
  const [localCredits, setLocalCredits] = useState(FREE_CREDITS)

  const credits = profile?.credits ?? localCredits
  const isSubscribed = subscription?.status === 'active'

  const fetchHistory = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('visualizations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (data) setHistory(data)
  }, [user])

  const fetchPurchases = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('purchases')
      .select('*, packs(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (data) setPurchases(data)
  }, [user])

  const fetchSubscription = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()
    setSubscription(data || null)
  }, [user])

  useEffect(() => {
    fetchHistory()
    fetchPurchases()
    fetchSubscription()
  }, [fetchHistory, fetchPurchases, fetchSubscription])

  const canGenerate = useCallback(() => {
    if (isSubscribed) return true
    return credits > 0
  }, [isSubscribed, credits])

  const useCredit = useCallback(async () => {
    if (isSubscribed) return true

    if (user) {
      if (credits <= 0) return false
      await refreshProfile()
      return credits > 0
    }
    if (localCredits <= 0) return false
    setLocalCredits((c) => c - 1)
    return true
  }, [user, credits, localCredits, refreshProfile, isSubscribed])

  const addCredits = useCallback(async (packId) => {
    if (user) {
      if (packId === 'sub_premium') {
        const { data, error } = await supabase.rpc('activate_subscription')
        if (error) throw error
        await refreshProfile()
        await fetchSubscription()
        return data
      }

      const { data, error } = await supabase.rpc('purchase_pack', { p_pack_id: packId })
      if (error) throw error
      await refreshProfile()
      await fetchPurchases()
      return data
    }
    const packCredits = { pack_decouverte: 5, pack_reguliere: 15, pack_addict: 40 }
    setLocalCredits((c) => c + (packCredits[packId] || 0))
  }, [user, refreshProfile, fetchPurchases, fetchSubscription])

  const createVisualization = useCallback(async ({ shape, style, length, originalImageUrl }) => {
    if (user) {
      const { data, error } = await supabase.rpc('use_credit', {
        p_shape: shape,
        p_style: style,
        p_length: length,
        p_original_image_url: originalImageUrl || null,
      })
      if (error) throw error
      await refreshProfile()
      return data
    }
    setLocalCredits((c) => Math.max(0, c - 1))
    return { visualization_id: crypto.randomUUID(), credits_remaining: localCredits - 1 }
  }, [user, localCredits, refreshProfile])

  const completeVisualization = useCallback(async (vizId, resultImageUrl) => {
    if (user) {
      await supabase.rpc('complete_visualization', {
        p_viz_id: vizId,
        p_result_image_url: resultImageUrl,
      })
      await fetchHistory()
    }
  }, [user, fetchHistory])

  const addToHistory = useCallback((result) => {
    setHistory((h) => [result, ...h])
  }, [])

  const uploadImage = useCallback(async (file) => {
    if (!user) return URL.createObjectURL(file)

    const fileExt = file.name?.split('.').pop() || 'jpg'
    const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`

    const { error } = await supabase.storage
      .from('nail-images')
      .upload(filePath, file)

    if (error) throw error

    const { data } = supabase.storage
      .from('nail-images')
      .getPublicUrl(filePath)

    return data.publicUrl
  }, [user])

  const uploadBlobUrl = useCallback(async (blobUrl) => {
    if (!user || !blobUrl) return null

    try {
      const res = await fetch(blobUrl)
      const blob = await res.blob()
      const filePath = `${user.id}/before-${crypto.randomUUID()}.jpg`

      const { error } = await supabase.storage
        .from('nail-images')
        .upload(filePath, blob, { contentType: 'image/jpeg', upsert: true })

      if (error) return null

      const { data } = supabase.storage.from('nail-images').getPublicUrl(filePath)
      return data.publicUrl
    } catch {
      return null
    }
  }, [user])

  return (
    <CreditContext.Provider value={{
      credits,
      canGenerate,
      useCredit,
      addCredits,
      history,
      addToHistory,
      purchases,
      subscription,
      isSubscribed,
      createVisualization,
      completeVisualization,
      uploadImage,
      uploadBlobUrl,
      fetchHistory,
    }}>
      {children}
    </CreditContext.Provider>
  )
}

export function useCredits() {
  const ctx = useContext(CreditContext)
  if (!ctx) throw new Error('useCredits must be used within CreditProvider')
  return ctx
}
