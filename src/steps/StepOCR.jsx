import { useState, useRef, useEffect } from 'react'

// Tesseract.js 동적 로드
function loadTesseract() {
  return new Promise((resolve, reject) => {
    if (typeof Tesseract !== 'undefined') { resolve(); return }
    const s = document.createElement('script')
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/4.1.1/tesseract.min.js'
    s.onload = resolve
    s.onerror = reject
    document.head.appendChild(s)
  })
}

// EXP 날짜 패턴 추출
function extractEXP(text) {
  const patterns = [
    /(\d{4})[\/\-\.](\d{2})/,
    /(\d{2})[\/\-\.](\d{4})/,
    /EXP[:\s]*(\S+)/i,
    /BB[:\s]*(\S+)/i,
    /BEST[:\s]*(\S+)/i,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m) return m[1] + (m[2] ? '-' + m[2] : '')
  }
  return ''
}

// Lot 번호 패턴 추출
function extractLot(text) {
  const m = text.match(/(?:LOT|Lot|lot)[:\s#]*([A-Z0-9\-]{4,15})/)
  return m ? m[1] : ''
}

// Step 3: EXP / Lot OCR 입력
export default function StepOCR({ onNext, onBack, showToast }) {
  const [exp, setExp] = useState('')
  const [lot, setLot] = useState('')
  const [cameraOn, setCameraOn] = useState(false)
  const [processing, setProcessing] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 } }
      })
      streamRef.current = stream
      videoRef.current.srcObject = stream
      setCameraOn(true)
    } catch (e) {
      showToast('카메라 권한이 필요합니다', 'error')
    }
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setCameraOn(false)
  }

  const toggleCamera = () => cameraOn ? stopCamera() : startCamera()

  const captureOCR = async () => {
    if (!cameraOn) {
      await startCamera()
      showToast('카메라 켜졌습니다 — 다시 촬영 버튼을 누르세요', 'success')
      return
    }

    setProcessing(true)
    try {
      const canvas = canvasRef.current
      const video = videoRef.current
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480
      canvas.getContext('2d').drawImage(video, 0, 0)

      await loadTesseract()
      const result = await Tesseract.recognize(canvas, 'eng', { logger: () => {} })
      const text = result.data.text

      const foundEXP = extractEXP(text)
      const foundLot = extractLot(text)

      if (foundEXP) setExp(foundEXP)
      if (foundLot) setLot(foundLot)

      showToast(
        foundEXP || foundLot ? 'OCR 완료 — 결과 확인 후 수정하세요' : 'OCR 인식 실패 — 직접 입력하세요',
        foundEXP || foundLot ? 'success' : 'error'
      )
      stopCamera()
    } catch (e) {
      showToast('OCR 실패 — 직접 입력하세요', 'error')
    }
    setProcessing(false)
  }

  // 언마운트 시 카메라 정리
  useEffect(() => () => stopCamera(), [])

  return (
    <div className="card">
      <div className="card-label">유통기한 / Lot 번호</div>

      {/* OCR 카메라 뷰 */}
      {cameraOn && (
        <div className="scanner-box" style={{ marginBottom: 10, aspectRatio: '4/3' }}>
          <video ref={videoRef} playsInline autoPlay muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div className="scan-overlay">
            <div className="scan-frame" style={{ height: '38%', width: '80%' }}>
              <div className="scan-line" />
              <div className="corner tl" /><div className="corner tr" />
              <div className="corner bl" /><div className="corner br" />
            </div>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* 버튼 row */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className={`scan-btn ${cameraOn ? 'active-scan' : ''}`}
          style={{ flex: 1 }}
          onClick={captureOCR}
          disabled={processing}
        >
          {processing
            ? <><span className="spinner" /> OCR 처리 중...</>
            : '📸 촬영 후 OCR 읽기'
          }
        </button>
        <button
          className={`scan-btn ${cameraOn ? 'active-scan' : ''}`}
          style={{ flex: '0 0 46px', marginTop: 0 }}
          onClick={toggleCamera}
        >
          {cameraOn ? '⏹' : '📷'}
        </button>
      </div>

      {/* EXP / Lot 입력 */}
      <div className="two-col">
        <div className="field" style={{ marginTop: 0 }}>
          <label>EXP (유통기한)</label>
          <input
            type="text"
            placeholder="2025-12"
            value={exp}
            onChange={e => setExp(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="field" style={{ marginTop: 0 }}>
          <label>Lot 번호</label>
          <input
            type="text"
            placeholder="L240115A"
            value={lot}
            onChange={e => setLot(e.target.value)}
            autoComplete="off"
          />
        </div>
      </div>

      <div className="action-row">
        <button className="btn-back" onClick={onBack}>←</button>
        <button className="btn-primary" onClick={() => onNext({ exp, lot })}>
          다음 →
        </button>
      </div>
    </div>
  )
}
