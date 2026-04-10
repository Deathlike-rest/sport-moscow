'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { addBookmark, removeBookmark } from '@/lib/api-client'
import { Button } from '@/components/ui/Button'

export function BookmarkButton({ venueId }: { venueId: string }) {
  const { token, isAuthenticated } = useAuth()
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!isAuthenticated) return null

  async function toggle() {
    if (!token) return
    setLoading(true)
    try {
      if (saved) {
        await removeBookmark(venueId, token)
        setSaved(false)
      } else {
        await addBookmark(venueId, token)
        setSaved(true)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={toggle} disabled={loading} className="flex-shrink-0">
      {saved ? '❤️ В избранном' : '🤍 В избранное'}
    </Button>
  )
}
