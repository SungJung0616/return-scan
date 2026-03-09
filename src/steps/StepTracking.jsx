import { useState } from 'react'
import { useGptImageScan } from '../hooks/useGptImageScan'
import { extractTrackingNoFromImage } from '../lib/openaiVision'

export default function StepTracking({ onNext, showToast, settings, onOpenSettings }) {
  const [scanned, setScanned] = useState('')
  const [input, setInput] = useState('')

  const { processing, openPicker, inputProps } = useGptImageScan({
    settings,
    showToast,
    onOpenSettings,
    scan: async ({ file, apiKey, model }) => {
      try {
        const trackingNo = await extractTrackingNoFromImage({ apiKey, model, file })
        if (!trackingNo) {
          showToast('트래킹 번호를 찾지 못했습니다. 직접 입력해 주세요.', 'error')
          return
        }

        setScanned(trackingNo)
        setInput(trackingNo)
        showToast('트래킹 번호를 읽었습니다.', 'success')
      } catch (error) {
        showToast(`인식 오류: ${error.message}`, 'error')
      }
    },
  })

  const handleNext = () => {
    const val = input.trim() || scanned
    if (!val) {
      showToast('트래킹 번호를 입력해 주세요.', 'error')
      return
    }
    onNext(val)
  }

  return (
    <div className="card">
      <div className="card-label">트래킹 번호</div>

      <input {...inputProps} />

      <div className="result-row">
        <span className="result-tag">NO</span>
        <span className={`result-val ${!scanned ? 'empty' : ''}`}>{scanned || '스캔 또는 직접 입력'}</span>
      </div>

      <button
        className="scan-btn"
        onClick={openPicker}
        disabled={processing}
      >
        {processing ? '사진 분석 중...' : '사진 찍고 GPT로 읽기'}
      </button>

      <hr className="divider" />

      <div className="field">
        <label>직접 입력</label>
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
        <button className="btn-primary" onClick={handleNext}>다음</button>
      </div>
    </div>
  )
}
