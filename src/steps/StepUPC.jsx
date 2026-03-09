import { useState } from 'react'
import BarcodeScanner from '../components/BarcodeScanner'

// Step 2: UPC 스캔 및 SKU 자동 매핑
export default function StepUPC({ onNext, onBack, resolveSKU, showToast }) {
  const [scanning, setScanning] = useState(false)
  const [upc, setUpc] = useState('')
  const [input, setInput] = useState('')

  const sku = input ? resolveSKU(input) : upc ? resolveSKU(upc) : ''
  const isMapped = sku && sku !== input && sku !== upc

  const handleScanResult = (text) => {
    setUpc(text)
    setInput(text)
    setScanning(false)
    showToast('UPC 스캔 완료', 'success')
  }

  const handleNext = () => {
    const val = input.trim() || upc
    if (!val) {
      showToast('UPC를 스캔하거나 입력해 주세요.', 'error')
      return
    }
    onNext({ upc: val, sku: resolveSKU(val) })
  }

  return (
    <div className="card">
      <div className="card-label">UPC / SKU 스캔</div>

      <BarcodeScanner
        isOpen={scanning}
        onResult={handleScanResult}
        onError={(msg) => {
          showToast('카메라 오류: ' + msg, 'error')
          setScanning(false)
        }}
      />

      <div className="result-row">
        <span className="result-tag">UPC</span>
        <span className={`result-val ${!upc ? 'empty' : ''}`}>
          {upc || '스캔 대기 중...'}
        </span>
      </div>

      <button
        className={`scan-btn ${scanning ? 'active-scan' : ''}`}
        onClick={() => setScanning(s => !s)}
      >
        {scanning ? '스캔 중지' : 'UPC 스캔'}
      </button>

      <hr className="divider" />

      <div className="field">
        <label>직접 입력 (UPC or SKU)</label>
        <input
          type="text"
          placeholder="012345678901"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleNext()}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
        />
      </div>

      {sku && (
        <div className="result-row" style={{ marginTop: 8 }}>
          <span className="result-tag">SKU</span>
          <span className="result-val">
            {sku}
            {isMapped && (
              <span style={{ fontSize: 9, color: 'var(--muted)', marginLeft: 8 }}>
                (매핑됨)
              </span>
            )}
          </span>
        </div>
      )}

      <div className="action-row">
        <button className="btn-back" onClick={onBack}>←</button>
        <button className="btn-primary" onClick={handleNext}>다음 →</button>
      </div>
    </div>
  )
}
