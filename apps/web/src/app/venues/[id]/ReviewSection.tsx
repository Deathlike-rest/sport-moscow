'use client'

import { useState } from 'react'
import type { SearchResponse, Review } from '@sport/types'
import { addReview } from '@/lib/api-client'
import { useAuth } from '@/lib/hooks/useAuth'

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
          className="text-2xl transition-colors focus:outline-none"
          style={{ color: star <= (hover || value) ? '#F59E0B' : '#E2E8F0' }}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          aria-label={`Оценка ${star}`}
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
      <h2 className="text-lg font-semibold text-[#0A2540] mb-4">
        Отзывы{reviews.length > 0 && <span className="text-[#64748B] font-normal ml-1">({reviews.length})</span>}
      </h2>

      {/* Review form */}
      {token ? (
        <form onSubmit={submit} className="mb-6 p-5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
          <p className="text-sm font-medium text-[#0F172A] mb-3">Оставить отзыв</p>
          <StarInput value={rating} onChange={setRating} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ваш комментарий (необязательно)"
            rows={3}
            className="w-full mt-3 px-4 py-3 text-sm bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent resize-none transition-colors"
          />
          {error && <p className="text-[#EF4444] text-xs mt-2">{error}</p>}
          {success && <p className="text-[#10B981] text-xs mt-2">Отзыв добавлен!</p>}
          <button
            type="submit"
            className="mt-3 px-5 py-2 bg-[#10B981] text-white text-sm font-semibold rounded-lg hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={rating === 0 || loading}
          >
            {loading ? 'Отправляем...' : 'Отправить'}
          </button>
        </form>
      ) : (
        <p className="text-sm text-[#64748B] mb-4">
          <a href="/login" className="text-[#10B981] hover:text-[#059669] font-medium transition-colors">Войдите</a>, чтобы оставить отзыв.
        </p>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <p className="text-sm text-[#94A3B8] py-4">Отзывов пока нет. Будьте первым!</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#10B981] flex items-center justify-center text-white text-sm font-semibold">
                    {(r.userDisplayName ?? 'А').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#0F172A]">{r.userDisplayName ?? 'Аноним'}</div>
                    <div className="text-xs text-[#94A3B8]">
                      {new Date(r.createdAt).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} style={{ color: i < r.rating ? '#F59E0B' : '#E2E8F0' }}>★</span>
                  ))}
                </div>
              </div>
              {r.comment && <p className="text-sm text-[#64748B] leading-relaxed">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
