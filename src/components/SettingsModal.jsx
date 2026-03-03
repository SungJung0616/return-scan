import { useState } from 'react'

export default function SettingsModal({ settings, onClose, onSave }) {
  const [url, setUrl] = useState(settings.webhookUrl || '')
  const [openaiApiKey, setOpenaiApiKey] = useState(settings.openaiApiKey || '')
  const [openaiModel, setOpenaiModel] = useState(settings.openaiModel || 'gpt-4.1-mini')
  const [mapping, setMapping] = useState(
    settings.upcMapping ? JSON.stringify(settings.upcMapping, null, 2) : ''
  )
  const [err, setErr] = useState('')

  const handleSave = () => {
    try {
      const parsed = mapping.trim() ? JSON.parse(mapping) : {}
      onSave({
        webhookUrl: url.trim(),
        upcMapping: parsed,
        openaiApiKey: openaiApiKey.trim(),
        openaiModel: openaiModel.trim() || 'gpt-4.1-mini',
      })
    } catch {
      setErr('JSON ?? ??? ?????')
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-end',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width: '100%',
        maxWidth: 480,
        margin: '0 auto',
        background: 'var(--s1)',
        border: '1px solid var(--border)',
        borderRadius: '16px 16px 0 0',
        padding: 20,
        maxHeight: '85dvh',
        overflowY: 'auto',
        animation: 'slideUp 0.3s ease',
      }}>
        <div style={{
          width: 36, height: 4,
          background: 'var(--border2)',
          borderRadius: 2,
          margin: '0 auto 16px',
        }} />

        <div style={{
          fontFamily: 'var(--mono)',
          fontSize: 12,
          color: 'var(--green)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: 16,
        }}>
          ? Settings
        </div>

        <div className="field">
          <label>Apps Script Webhook URL</label>
          <input
            type="text"
            placeholder="https://script.google.com/macros/s/..."
            value={url}
            onChange={e => setUrl(e.target.value)}
          />
        </div>

        <div className="field" style={{ marginTop: 12 }}>
          <label>OpenAI API Key (Vision)</label>
          <input
            type="password"
            placeholder="sk-..."
            value={openaiApiKey}
            onChange={e => setOpenaiApiKey(e.target.value)}
          />
        </div>

        <div className="field" style={{ marginTop: 12 }}>
          <label>OpenAI Model</label>
          <input
            type="text"
            placeholder="gpt-4.1-mini"
            value={openaiModel}
            onChange={e => setOpenaiModel(e.target.value)}
          />
        </div>

        <p style={{
          fontSize: 11,
          color: 'var(--muted)',
          marginTop: 8,
          lineHeight: 1.6,
          fontFamily: 'var(--mono)',
        }}>
          API key is stored in localStorage for this browser only.
        </p>

        <div className="field" style={{ marginTop: 14 }}>
          <label>UPC ? SKU Mapping (JSON)</label>
          <textarea
            style={{ height: 110, resize: 'vertical', fontFamily: 'var(--mono)', fontSize: 12 }}
            placeholder={'{\n  "012345678901": "SKU-001",\n  "098765432109": "SKU-002"\n}'}
            value={mapping}
            onChange={e => { setMapping(e.target.value); setErr('') }}
          />
          {err && (
            <span style={{ fontSize: 11, color: 'var(--red)', fontFamily: 'var(--mono)' }}>
              {err}
            </span>
          )}
        </div>

        <div className="action-row" style={{ marginTop: 16 }}>
          <button className="btn-ghost" onClick={onClose}>??</button>
          <button className="btn-primary" onClick={handleSave}>??</button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  )
}
