// 화면 하단 토스트 알림 컴포넌트
export default function Toast({ msg, type }) {
  if (!msg) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 28,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 200,
      pointerEvents: 'none',
    }}>
      <div style={{
        background: 'var(--s2)',
        border: `1px solid ${type === 'success' ? 'var(--green)' : type === 'error' ? 'var(--red)' : 'var(--border2)'}`,
        color: type === 'success' ? 'var(--green)' : type === 'error' ? 'var(--red)' : 'var(--text)',
        borderRadius: 22,
        padding: '10px 18px',
        fontFamily: 'var(--mono)',
        fontSize: 12,
        whiteSpace: 'nowrap',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        animation: 'toastIn 0.25s ease',
      }}>
        {msg}
      </div>

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
