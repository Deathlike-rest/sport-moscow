'use client'

import { useState } from 'react'
import type { SearchResponse, Review } from '@sport/types'
import { addReview } from '@/lib/api-client'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/Button'

interface Props {
  venueId: string
  initialReviews: SearchResponse<Review>
}

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="text-2xl transition-colors"
          style={{ color: star <= (hover || value) ? '#f59e0b' : '#d1d5db' }}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export function ReviewSection({ venueId, initialReviews }: Props) {
  const { token, user } = useAuth()
  const [reviews, setReviews] = useState(initialReviews.data)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!token || rating === 0) return
    setLoading(true)
    setError('')
    try {
      await addReview(venueId, { rating, comment: comment.trim() || undefined }, token)
      setSuccess(true)
      setRating(0)
      setComment('')
      // Добавляем оптимистично
      setReviews((prev) => [
        {
          id: Date.now().toString(),
          venueId,
          userId: user!.id,
          userDisplayName: user!.displayName,
          rating,
          comment: comment.trim() || null,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2 className="text-lg font-bold text-gray-900 mb-4">
        Отзывы{reviews.length > 0 && ` (${reviews.length})`}
      </h2>

      {/* Форма */}
      {token ? (
        <form onSubmit={submit} className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Оставить отзыв</p>
          <StarInput value={rating} onChange={setRating} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ваш комментарий (необязательно)"
            rows={3}
            className="w-full mt-3 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          {success && <p className="text-green-600 text-xs mt-1">Отзыв добавлен!</p>}
          <Button type="submit" size="sm" className="mt-2" disabled={rating === 0 || loading}>
            Отправить
          </Button>
        </form>
      ) : (
        <p className="text-sm text-gray-500 mb-4">
          <a href="/login" className="text-brand-600 hover:underline">Войдите</a>, чтобы оставить отзыв.
        </p>
      )}

      {/* Список */}
      {reviews.length === 0 ? (
        <p className="text-sm text-gray-400">Отзывов пока нет. Будьте первым!</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  {r.userDisplayName ?? 'Аноним'}
                </span>
                <span className="text-amber-500 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
              </div>
              {r.comment && <p className="text-sm text-gray-600 mt-1">{r.comment}</p>}
              <p className="text-xs text-gray-400 mt-1">
                {new Date(r.createdAt).toLocaleDateString('ru-RU')}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
