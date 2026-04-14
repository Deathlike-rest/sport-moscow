'use client'

import { useBookmarkToggle } from '@/lib/hooks/useBookmarkToggle'
import { Button } from '@/components/ui/Button'

export function BookmarkButton({ venueId }: { venueId: string }) {
  const { saved, loading, toggle, isAuthenticated } = useBookmarkToggle(venueId)

  if (!isAuthenticated) return null

  return (
    <Button variant="ghost" size="sm" onClick={toggle} disabled={loading} className="flex-shrink-0">
      {saved ? '❤️ В избранном' : '🤍 В избранное'}
    </Button>
  )
}
