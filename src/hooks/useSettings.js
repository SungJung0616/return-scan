import { useState } from 'react'

const STORAGE_KEY = 'gpslogix_v2'

// 로컬스토리지에서 설정 불러오기
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { webhookUrl: '', upcMapping: {} }
  } catch {
    return { webhookUrl: '', upcMapping: {} }
  }
}

// 설정 관리 커스텀 훅
export function useSettings() {
  const [settings, setSettings] = useState(load)

  const save = (next) => {
    setSettings(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  // UPC → SKU 매핑 조회
  const resolveSKU = (upc) => {
    return settings.upcMapping?.[upc] || upc
  }

  return { settings, save, resolveSKU }
}
