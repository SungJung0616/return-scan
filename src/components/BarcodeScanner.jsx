import { useEffect, useRef } from 'react'
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library'

export default function BarcodeScanner({ isOpen, onResult, onError }) {
  const videoRef = useRef(null)
  const readerRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    const start = async () => {
      try {
        const hints = new Map()
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.CODE_128,
          BarcodeFormat.CODE_39,
          BarcodeFormat.EAN_13,
          BarcodeFormat.EAN_8,
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
          BarcodeFormat.QR_CODE,
        ])
        hints.set(DecodeHintType.TRY_HARDER, true)

        const reader = new BrowserMultiFormatReader(hints)
        readerRef.current = reader

        await reader.decodeFromVideoDevice(null, videoRef.current, (result) => {
          if (result) onResult(result.getText())
        })
      } catch (e) {
        console.error('스캐너 오류:', e)
        onError?.(e.message || '카메라 오류')
      }
    }

    start()

    return () => {
      try { readerRef.current?.reset() } catch {}
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="scanner-box" style={{ marginBottom: 0 }}>
      <video ref={videoRef} playsInline autoPlay muted />
      <div className="scan-overlay">
        <div className="scan-frame">
          <div className="scan-line" />
          <div className="corner tl" />
          <div className="corner tr" />
          <div className="corner bl" />
          <div className="corner br" />
        </div>
      </div>
    </div>
  )
}