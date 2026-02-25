// 상단 진행 바 컴포넌트
const STEP_LABELS = {
  1: '트래킹 번호 스캔',
  2: 'UPC / SKU',
  3: 'EXP / Lot',
  4: '상태 선택',
}

export default function ProgressBar({ step }) {
  return (
    <div style={{
      padding: '12px 18px 0',
      background: 'var(--s1)',
      borderBottom: '1px solid var(--border)',
    }}>
      {/* 세그먼트 바 */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
        {[1, 2, 3, 4].map(n => (
          <div
            key={n}
            style={{
              flex: 1, height: 2, borderRadius: 2,
              background: n < step ? 'var(--green-dim)'
                        : n === step ? 'var(--green)'
                        : 'var(--dim)',
              transition: 'background 0.4s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* 활성 세그먼트 shimmer 효과 */}
            {n === step && (
              <span style={{
                position: 'absolute', top: 0, left: '-100%',
                width: '60%', height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                animation: 'shimmer 1.4s infinite',
              }} />
            )}
          </div>
        ))}
      </div>

      {/* 단계 라벨 */}
      <div style={{
        fontFamily: 'var(--mono)',
        fontSize: 10,
        color: 'var(--muted)',
        letterSpacing: '0.08em',
        paddingBottom: 10,
      }}>
        STEP {step} — <span style={{ color: 'var(--green)' }}>{STEP_LABELS[step]}</span>
      </div>

      <style>{`
        @keyframes shimmer { to { left: 200%; } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  )
}
