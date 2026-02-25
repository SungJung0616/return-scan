// 앱 상단 헤더 컴포넌트
export default function Header({ itemCount, onSettingsOpen }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 18px',
      background: 'rgba(8,8,16,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        fontFamily: 'var(--mono)',
        fontSize: 12,
        letterSpacing: '0.12em',
        color: 'var(--green)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <LogoDot />
        GPS LOGIX · RETURN
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{
          fontFamily: 'var(--mono)', fontSize: 10,
          padding: '4px 10px', borderRadius: 20,
          background: 'var(--s2)', border: '1px solid var(--border2)',
          color: 'var(--muted)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ color: 'var(--green)', fontSize: 12, fontWeight: 600 }}>{itemCount}</span>
          <span>items</span>
        </div>

        <button
          onClick={onSettingsOpen}
          style={{
            width: 32, height: 32,
            background: 'var(--s2)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            color: 'var(--muted)',
            fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}
        >
          ⚙
        </button>
      </div>
    </header>
  )
}

// 깜빡이는 로고 도트
function LogoDot() {
  return (
    <span style={{
      width: 7, height: 7,
      borderRadius: '50%',
      background: 'var(--green)',
      boxShadow: '0 0 10px var(--green)',
      display: 'inline-block',
      animation: 'blink 2s ease-in-out infinite',
    }} />
  )
}
