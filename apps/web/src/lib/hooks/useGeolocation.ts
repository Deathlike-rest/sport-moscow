'use client'

import { useState } from 'react'

interface GeoState {
  lat: number | null
  lng: number | null
  error: string | null
  loading: boolean
}

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({
    lat: null,
    lng: null,
    error: null,
    loading: false,
  })

  function request() {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: 'Геолокация не поддерживается браузером' }))
      return
    }
    setState((s) => ({ ...s, loading: true, error: null }))
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          error: null,
          loading: false,
        })
      },
      (err) => {
        setState({ lat: null, lng: null, error: err.message, loading: false })
      },
      { timeout: 10000 }
    )
  }

  return { ...state, request }
}
