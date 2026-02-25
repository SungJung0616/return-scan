// 최종 서머리 + 구글 시트 전송 화면
const TAG_MAP = {
  good:    { label: '양품',   cls: 'good' },
  damaged: { label: '데미지', cls: 'damaged' },
  discard: { label: '폐기',   cls: 'discard' },
}

export default function StepSummary({ trackingNo, items, onBack, onSubmit, submitting, onReset }) {
  const counts = {
    good:    items.filter(i => i.status === 'good').length,
    damaged: items.filter(i => i.status === 'damaged').length,
    discard: items.filter(i => i.status === 'discard').length,
  }

  return (
    <div className="card">
      <div className="card-label">최종 확인 & 전송</div>

      {/* 트래킹 번호 */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 14px',
        background: 'var(--s2)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        marginBottom: 12,
      }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>
            트래킹 번호
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--green)', fontWeight: 500 }}>
            {trackingNo}
          </div>
        </div>
      </div>

      {/* 통계 */}
      <div style={{
        display: 'flex',
        border: '1px solid var(--border)',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 14,
      }}>
        {[
          { label: '전체',   num: items.length,   color: 'var(--text)' },
          { label: '양품',   num: counts.good,    color: 'var(--green)' },
          { label: '데미지', num: counts.damaged,  color: 'var(--orange)' },
          { label: '폐기',   num: counts.discard,  color: 'var(--red)' },
        ].map((s, i, arr) => (
          <div key={s.label} style={{
            flex: 1,
            padding: '12px 8px',
            textAlign: 'center',
            borderRight: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 24, fontWeight: 600, color: s.color, lineHeight: 1 }}>
              {s.num}
            </div>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* 아이템 목록 */}
      {items.map((item, i) => {
        const t = TAG_MAP[item.status]
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '11px 13px',
            background: 'var(--s1)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            marginBottom: 6,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--green)', fontWeight: 500 }}>
                {item.sku}
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                UPC: {item.upc} · EXP: {item.exp || '—'} · Lot: {item.lot || '—'}
              </div>
            </div>
            <span className={`tag ${t?.cls}`}>{t?.label}</span>
          </div>
        )
      })}

      {/* 버튼 */}
      <div className="action-row" style={{ marginTop: 14 }}>
        <button className="btn-back" onClick={onBack}>←</button>
        <button className="btn-primary" onClick={onSubmit} disabled={submitting}>
          {submitting ? <><span className="spinner" /> 전송 중...</> : '📊 구글 시트 전송'}
        </button>
      </div>

      <button
        className="btn-ghost"
        style={{ marginTop: 10, width: '100%', color: 'var(--red)', borderColor: 'var(--red)' }}
        onClick={onReset}
      >
        🔄 새 트래킹 시작
      </button>
    </div>
  )
}
