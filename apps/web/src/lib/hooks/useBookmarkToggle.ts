'use client'

import { useState } from 'react'
import { useAuth } from './useAuth'
import { addBookmark, removeBookmark } from '../api-client'

export function useBookmarkToggle(venueId: string) {
  const { token, isAuthenticated } = useAuth()
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

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

  return { saved, loading, toggle, isAuthenticated }
}
