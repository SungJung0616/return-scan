import { useState, useRef, useCallback } from 'react'

// 토스트 메시지 커스텀 훅
export function useToast() {
  const [toast, setToast] = useState({ msg: '', type: '' })
  const timerRef = useRef(null)

  const show = useCallback((msg, type = 'success') => {
    clearTimeout(timerRef.current)
    setToast({ msg, type })
    timerRef.current = setTimeout(() => setToast({ msg: '', type: '' }), 2600)
  }, [])

  return [toast, show]
}
