import { useState } from 'react'
import { useGptImageScan } from '../hooks/useGptImageScan'
import { extractExpLotFromImage } from '../lib/openaiVision'

export default function StepOCR({ onNext, onBack, showToast, settings, onOpenSettings }) {
  const [exp, setExp] = useState('')
  const [lot, setLot] = useState('')

  const { processing, openPicker, inputProps } = useGptImageScan({
    settings,
    showToast,
    onOpenSettings,
    scan: async ({ file, apiKey, model }) => {
      try {
        const result = await extractExpLotFromImage({ apiKey, model, file })
        if (result.exp) setExp(result.exp)
        if (result.lot) setLot(result.lot)

        if (!result.exp && !result.lot) {
          showToast('EXP 또는 Lot를 찾지 못했습니다. 직접 입력해 주세요.', 'error')
        } else {
          showToast('EXP/Lot 인식 완료', 'success')
        }
      } catch (error) {
        showToast(`인식 오류: ${error.message}`, 'error')
      }
    },
  })

  return (
    <div className="card">
      <div className="card-label">유통기한 / Lot 번호</div>

      <input {...inputProps} />

      <button
        className="scan-btn"
        onClick={openPicker}
        disabled={processing}
      >
        {processing ? '사진 분석 중...' : '사진 찍고 GPT로 읽기'}
      </button>

      <div className="two-col">
        <div className="field" style={{ marginTop: 0 }}>
          <label>EXP (유통기한)</label>
          <input
            type="text"
            placeholder="2025-12"
            value={exp}
            onChange={(e) => setExp(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="field" style={{ marginTop: 0 }}>
          <label>Lot 번호</label>
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
        <button className="btn-back" onClick={onBack}>←</button>
        <button className="btn-primary" onClick={() => onNext({ exp, lot })}>다음</button>
      </div>
    </div>
  )
}
