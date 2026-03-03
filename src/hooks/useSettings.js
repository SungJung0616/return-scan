import { useState } from 'react'

const STORAGE_KEY = 'gpslogix_v2'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return {
      webhookUrl: parsed.webhookUrl || '',
      upcMapping: parsed.upcMapping || {},
      openaiApiKey: parsed.openaiApiKey || '',
      openaiModel: parsed.openaiModel || 'gpt-4.1-mini',
    }
  } catch {
    return {
      webhookUrl: '',
      upcMapping: {},
      openaiApiKey: '',
      openaiModel: 'gpt-4.1-mini',
    }
  }
}

export function useSettings() {
  const [settings, setSettings] = useState(load)

  const save = (next) => {
    setSettings(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const resolveSKU = (upc) => {
    return settings.upcMapping?.[upc] || upc
  }

  return { settings, save, resolveSKU }
}
