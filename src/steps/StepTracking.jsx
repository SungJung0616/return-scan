import { useRef, useState } from 'react'
import { extractTrackingNoFromImage } from '../lib/openaiVision'

export default function StepTracking({ onNext, showToast, settings }) {
  const [scanned, setScanned] = useState('')
  const [input, setInput] = useState('')
  const [processing, setProcessing] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const apiKey = settings?.openaiApiKey?.trim()
    const model = settings?.openaiModel?.trim() || 'gpt-4.1-mini'
    if (!apiKey) {
      showToast('Settings?? OpenAI API Key? ?? ?????', 'error')
      return
    }

    setProcessing(true)
    try {
      const trackingNo = await extractTrackingNoFromImage({ apiKey, model, file })
      if (!trackingNo) {
        showToast('??? ??? ?? ?????. ?? ?????', 'error')
        return
      }

      setScanned(trackingNo)
      setInput(trackingNo)
      showToast('??? ?? ?? ??', 'success')
    } catch (error) {
      showToast(`?? ??: ${error.message}`, 'error')
    } finally {
      setProcessing(false)
    }
  }

  const handleNext = () => {
    const val = input.trim() || scanned
    if (!val) {
      showToast('??? ??? ?????', 'error')
      return
    }
    onNext(val)
  }

  return (
    <div className="card">
      <div className="card-label">??? ??</div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <div className="result-row">
        <span className="result-tag">NO</span>
        <span className={`result-val ${!scanned ? 'empty' : ''}`}>{scanned || '?? ?? ?? ??'}</span>
      </div>

      <button
        className="scan-btn"
        onClick={() => fileInputRef.current?.click()}
        disabled={processing}
      >
        {processing ? '?? ?...' : '?? ?? ? GPT ??'}
      </button>

      <hr className="divider" />

      <div className="field">
        <label>?? ??</label>
        <input
          type="text"
          placeholder="1Z999AA10123456784"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleNext()}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
        />
      </div>

      <div className="action-row">
        <button className="btn-primary" onClick={handleNext}>?? ?</button>
      </div>
    </div>
  )
}
