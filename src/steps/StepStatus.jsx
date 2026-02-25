import { useState } from 'react'

const STATUSES = [
  { key: 'good',    icon: '✅', title: '양품 재포장 가능', desc: '상품 및 포장 상태 양호' },
  { key: 'damaged', icon: '📦', title: '박스 데미지',       desc: '내용물 이상 없으나 포장 손상' },
  { key: 'discard', icon: '🗑️', title: '폐기',             desc: '사용 불가 / 오염 / 파손' },
]

// Step 4: 상태 선택 후 항목 추가
export default function StepStatus({ currentItem, onAdd, onBack }) {
  const [status, setStatus] = useState('')

  const handleAdd = () => {
    if (!status) return
    onAdd(status)
    setStatus('')
  }

  return (
    <div className="card">
      <div className="card-label">상품 상태 선택</div>

      {/* 상태 선택 버튼 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {STATUSES.map(s => (
          <button
            key={s.key}
            data-s={s.key}
            className={`status-btn ${status === s.key ? 'selected' : ''}`}
            onClick={() => setStatus(s.key)}
          >
            <span style={{ fontSize: 22, flexShrink: 0 }}>{s.icon}</span>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{s.title}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, fontWeight: 400 }}>{s.desc}</div>
            </div>
            <div style={{
              width: 20, height: 20,
              borderRadius: '50%',
              border: `1.5px solid ${status === s.key ? 'transparent' : 'var(--border)'}`,
              flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11,
              background: status === s.key
                ? s.key === 'good' ? 'var(--green)' : s.key === 'damaged' ? 'var(--orange)' : 'var(--red)'
                : 'transparent',
              color: status === s.key ? '#000' : 'transparent',
              transition: 'all 0.2s',
            }}>
              ✓
            </div>
          </button>
        ))}
      </div>

      {/* 현재 입력 미리보기 */}
      <div style={{
        marginTop: 12,
        background: 'var(--s2)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '13px 14px',
      }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          PREVIEW
        </div>
        {[
          ['SKU', currentItem.sku, 'var(--green)'],
          ['EXP', currentItem.exp, 'var(--text)'],
          ['Lot', currentItem.lot, 'var(--text)'],
        ].map(([key, val, color]) => (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 12, padding: '3px 0' }}>
            <span style={{ color: 'var(--muted)' }}>{key}</span>
            <span style={{ color }}>{val || '—'}</span>
          </div>
        ))}
      </div>

      <div className="action-row">
        <button className="btn-back" onClick={onBack}>←</button>
        <button
          className="btn-primary"
          disabled={!status}
          onClick={handleAdd}
        >
          항목 추가 +
        </button>
      </div>

      <style>{`
        .status-btn {
          width: 100%; padding: 15px 16px;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          background: var(--s2);
          color: var(--text);
          display: flex; align-items: center; gap: 14px;
          transition: all 0.15s;
          cursor: pointer;
          font-family: var(--sans);
        }
        .status-btn:active { transform: scale(0.98); }
        .status-btn[data-s="good"].selected    { border-color: var(--green);  background: rgba(13,255,170,0.06); }
        .status-btn[data-s="damaged"].selected { border-color: var(--orange); background: rgba(255,115,64,0.06); }
        .status-btn[data-s="discard"].selected { border-color: var(--red);    background: rgba(255,61,61,0.06); }
      `}</style>
    </div>
  )
}
