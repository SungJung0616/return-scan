import { useState } from 'react'
import Header from './components/Header'
import ProgressBar from './components/ProgressBar'
import Toast from './components/Toast'
import SettingsModal from './components/SettingsModal'
import SKUList from './components/SKUList'
import StepTracking from './steps/StepTracking'
import StepUPC from './steps/StepUPC'
import StepOCR from './steps/StepOCR'
import StepStatus from './steps/StepStatus'
import StepSummary from './steps/StepSummary'
import { useToast } from './hooks/useToast'
import { useSettings } from './hooks/useSettings'

export default function App() {
  // ── 상태 ──
  const [step, setStep] = useState(1)
  const [trackingNo, setTrackingNo] = useState('')
  const [currentItem, setCurrentItem] = useState({}) // 현재 입력 중인 아이템
  const [items, setItems] = useState([])              // 완성된 아이템 목록
  const [showSummary, setShowSummary] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [toast, showToast] = useToast()
  const { settings, save: saveSettings, resolveSKU } = useSettings()

  // ── Step 핸들러 ──

  const handleTrackingNext = (no) => {
    setTrackingNo(no)
    setStep(2)
  }

  const handleUPCNext = ({ upc, sku }) => {
    setCurrentItem(prev => ({ ...prev, upc, sku }))
    setStep(3)
  }

  const handleOCRNext = ({ exp, lot }) => {
    setCurrentItem(prev => ({ ...prev, exp, lot }))
    setStep(4)
  }

  const handleAddItem = (status) => {
    setItems(prev => [...prev, { ...currentItem, status }])
    setCurrentItem({})
    showToast('✅ 항목 추가됨', 'success')
    setStep(2) // 다음 SKU 입력으로 이동
  }

  const handleRemoveItem = (i) => {
    setItems(prev => prev.filter((_, idx) => idx !== i))
  }

  // ── 서머리 & 전송 ──

  const handleGoToSummary = () => {
    if (items.length === 0) { showToast('항목을 먼저 추가하세요', 'error'); return }
    setShowSummary(true)
  }

  const handleSubmit = async () => {
    if (!settings.webhookUrl) {
      showToast('설정에서 웹훅 URL을 먼저 입력하세요', 'error')
      setShowSettings(true)
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        trackingNo,
        timestamp: new Date().toISOString(),
        items: items.map(item => ({
          trackingNo,
          sku: item.sku,
          upc: item.upc,
          lot: item.lot || '',
          exp: item.exp || '',
          status: item.status === 'good'    ? '양품 재포장 가능'
               : item.status === 'damaged' ? '박스 데미지'
               : '폐기',
          timestamp: new Date().toLocaleString('ko-KR'),
        }))
      }

      await fetch(settings.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'no-cors', // Apps Script는 no-cors 필요
      })

      showToast('✅ 구글 시트 전송 완료!', 'success')
      setTimeout(handleReset, 2000)
    } catch (e) {
      showToast('전송 실패: ' + e.message, 'error')
    }
    setSubmitting(false)
  }

  const handleReset = () => {
    setStep(1)
    setTrackingNo('')
    setCurrentItem({})
    setItems([])
    setShowSummary(false)
  }

  // ── 렌더 ──
  return (
    <div className="app">
      <Header
        itemCount={items.length}
        onSettingsOpen={() => setShowSettings(true)}
      />

      {!showSummary && <ProgressBar step={step} />}

      <main style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
        {showSummary ? (
          <>
            <StepSummary
              trackingNo={trackingNo}
              items={items}
              onBack={() => setShowSummary(false)}
              onSubmit={handleSubmit}
              submitting={submitting}
              onReset={handleReset}
            />
          </>
        ) : (
          <>
            {step === 1 && <StepTracking onNext={handleTrackingNext} showToast={showToast} />}
            {step === 2 && <StepUPC onNext={handleUPCNext} onBack={() => setStep(1)} resolveSKU={resolveSKU} showToast={showToast} />}
            {step === 3 && <StepOCR onNext={handleOCRNext} onBack={() => setStep(2)} showToast={showToast} />}
            {step === 4 && <StepStatus currentItem={currentItem} onAdd={handleAddItem} onBack={() => setStep(3)} />}

            {/* SKU 목록은 step 2 이상에서 항상 표시 */}
            {step >= 2 && (
              <SKUList
                items={items}
                onRemove={handleRemoveItem}
                onAddMore={() => setStep(2)}
                onGoToSummary={handleGoToSummary}
              />
            )}
          </>
        )}
      </main>

      {showSettings && (
        <SettingsModal
          settings={settings}
          onClose={() => setShowSettings(false)}
          onSave={(s) => { saveSettings(s); showToast('✅ 설정 저장됨', 'success') }}
        />
      )}

      <Toast msg={toast.msg} type={toast.type} />
    </div>
  )
}
