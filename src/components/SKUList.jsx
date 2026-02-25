// 현재 트래킹 번호에 추가된 SKU 목록 컴포넌트
const TAG_MAP = {
  good:    { label: '양품',   cls: 'good' },
  damaged: { label: '데미지', cls: 'damaged' },
  discard: { label: '폐기',   cls: 'discard' },
}

export default function SKUList({ items, onRemove, onAddMore, onGoToSummary }) {
  return (
    <div className="card">
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: 10,
          color: 'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          이 트래킹 내 SKU ({items.length})
        </span>
        <button
          onClick={onAddMore}
          style={{
            padding: '6px 12px',
            background: 'var(--s2)',
            border: '1px solid var(--border2)',
            color: 'var(--green)',
            borderRadius: 6,
            fontFamily: 'var(--mono)',
            fontSize: 11,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          + SKU 추가
        </button>
      </div>

      {/* 아이템 목록 */}
      {items.length === 0 ? (
        <div className="empty-state">아직 추가된 항목 없음</div>
      ) : (
        items.map((item, i) => {
          const t = TAG_MAP[item.status]
          return (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '11px 13px',
                background: 'var(--s1)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                marginBottom: 6,
                animation: 'fadeUp 0.2s ease',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--green)', fontWeight: 500 }}>
                  {item.sku}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                  EXP: {item.exp || '—'} · Lot: {item.lot || '—'}
                </div>
              </div>
              <span className={`tag ${t?.cls}`}>{t?.label}</span>
              <button
                onClick={() => onRemove(i)}
                style={{
                  color: 'var(--dim)',
                  fontSize: 16,
                  padding: '4px 6px',
                  cursor: 'pointer',
                  transition: 'color 0.15s',
                  background: 'none',
                  border: 'none',
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>
          )
        })
      )}

      {/* 전송 준비 버튼 */}
      {items.length > 0 && (
        <button
          className="btn-primary"
          style={{ marginTop: 10, width: '100%' }}
          onClick={onGoToSummary}
        >
          전송 준비 →
        </button>
      )}
    </div>
  )
}
