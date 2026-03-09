import { useRef, useState } from 'react'

export function useGptImageScan({
  settings,
  showToast,
  onOpenSettings,
  scan,
  missingKeyMessage = 'Open Settings and add an OpenAI API key first.',
}) {
  const fileInputRef = useRef(null)
  const [processing, setProcessing] = useState(false)

  const openPicker = () => {
    if (processing) return
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const apiKey = settings?.openaiApiKey?.trim()
    const model = settings?.openaiModel?.trim() || 'gpt-4.1-mini'
    if (!apiKey) {
      showToast(missingKeyMessage, 'error')
      onOpenSettings?.()
      return
    }

    setProcessing(true)
    try {
      await scan({ file, apiKey, model })
    } finally {
      setProcessing(false)
    }
  }

  return {
    processing,
    openPicker,
    inputProps: {
      ref: fileInputRef,
      type: 'file',
      accept: 'image/*',
      capture: 'environment',
      style: { display: 'none' },
      onChange: handleFileChange,
    },
  }
}
