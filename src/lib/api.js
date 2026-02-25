const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

async function blobUrlToBase64(blobUrl) {
  const res = await fetch(blobUrl)
  const blob = await res.blob()
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })
}

export async function generateNailVisualization({ photo, shape, style, length, customNote, inspirationPhoto, outfitPhoto }) {
  if (!photo) throw new Error('Aucune photo fournie. Veuillez reprendre depuis le début.')
  const photoBase64 = photo.startsWith('data:') ? photo : await blobUrlToBase64(photo)

  let inspirationBase64 = null
  if (inspirationPhoto) {
    inspirationBase64 = inspirationPhoto.startsWith('data:')
      ? inspirationPhoto
      : await blobUrlToBase64(inspirationPhoto)
  }

  let outfitBase64 = null
  if (outfitPhoto) {
    outfitBase64 = outfitPhoto.startsWith('data:')
      ? outfitPhoto
      : await blobUrlToBase64(outfitPhoto)
  }

  const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-nails`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ photoBase64, shape, style, length, customNote, inspirationBase64, outfitBase64 }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Generation failed')

  return {
    id: crypto.randomUUID(),
    originalImage: photo,
    resultImage: data.resultImageUrl,
    shape,
    style,
    length,
    createdAt: new Date().toISOString(),
  }
}
