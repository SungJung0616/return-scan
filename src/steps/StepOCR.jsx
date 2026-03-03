import { useRef, useState } from 'react'
import { extractExpLotFromImage } from '../lib/openaiVision'

export default function StepOCR({ onNext, onBack, showToast, settings }) {
  const [exp, setExp] = useState('')
  const [lot, setLot] = useState('')
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
      const result = await extractExpLotFromImage({ apiKey, model, file })
      if (result.exp) setExp(result.exp)
      if (result.lot) setLot(result.lot)

      if (!result.exp && !result.lot) {
        showToast('EXP/Lot? ?? ?????. ?? ?????', 'error')
      } else {
        showToast('EXP/Lot ?? ??', 'success')
      }
    } catch (error) {
      showToast(`?? ??: ${error.message}`, 'error')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="card">
      <div className="card-label">???? / Lot ??</div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <button
        className="scan-btn"
        onClick={() => fileInputRef.current?.click()}
        disabled={processing}
      >
        {processing ? '?? ?...' : '?? ?? ? GPT ??'}
      </button>

      <div className="two-col">
        <div className="field" style={{ marginTop: 0 }}>
          <label>EXP (????)</label>
          <input
            type="text"
            placeholder="2025-12"
            value={exp}
            onChange={(e) => setExp(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="field" style={{ marginTop: 0 }}>
          <label>Lot ??</label>
          <input
            type="text"
            placeholder="L240115A"
            value={lot}
            onChange={(e) => setLot(e.target.value)}
            autoComplete="off"
          />
        </div>
      </div>

      <div className="action-row">
        <button className="btn-back" onClick={onBack}>?</button>
        <button className="btn-primary" onClick={() => onNext({ exp, lot })}>?? ?</button>
      </div>
    </div>
  )
}
