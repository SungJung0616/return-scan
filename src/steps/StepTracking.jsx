import { useState } from 'react'
import BarcodeScanner from '../components/BarcodeScanner'

// Step 1: 트래킹 번호 스캔
export default function StepTracking({ onNext, showToast }) {
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState('')
  const [input, setInput] = useState('')

  const handleScanResult = (text) => {
    setScanned(text)
    setInput(text)
    setScanning(false)
    showToast('✅ 트래킹 번호 스캔 완료', 'success')
  }

  const handleNext = () => {
    const val = input.trim() || scanned
    if (!val) { showToast('트래킹 번호를 입력하세요', 'error'); return }
    onNext(val)
  }

  return (
    <div className="card">
      <div className="card-label">트래킹 번호</div>

      {/* 바코드 스캐너 */}
      <BarcodeScanner
        isOpen={scanning}
        onResult={handleScanResult}
        onError={(msg) => { showToast('카메라 오류: ' + msg, 'error'); setScanning(false) }}
      />

      {/* 스캔 결과 표시 */}
      <div className="result-row">
        <span className="result-tag">NO</span>
        <span className={`result-val ${!scanned ? 'empty' : ''}`}>
          {scanned || '스캔 또는 직접 입력'}
        </span>
      </div>

      {/* 스캔 토글 버튼 */}
      <button
        className={`scan-btn ${scanning ? 'active-scan' : ''}`}
        onClick={() => setScanning(s => !s)}
      >
        {scanning ? '⏹ 스캔 중지' : '📷 바코드 스캔'}
      </button>

      <hr className="divider" />

      {/* 수동 입력 */}
      <div className="field">
        <label>직접 입력</label>
        <input
          type="text"
          placeholder="1Z999AA10123456784"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleNext()}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
        />
      </div>

      <div className="action-row">
        <button className="btn-primary" onClick={handleNext}>다음 →</button>
      </div>
    </div>
  )
}
