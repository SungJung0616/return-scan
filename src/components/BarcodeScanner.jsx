import { useEffect, useRef } from 'react'
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library'

const SCAN_FORMATS = [
  BarcodeFormat.CODE_128,
  BarcodeFormat.CODE_39,
  BarcodeFormat.CODE_93,
  BarcodeFormat.CODABAR,
  BarcodeFormat.ITF,
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.QR_CODE,
  BarcodeFormat.DATA_MATRIX,
  BarcodeFormat.PDF_417,
  BarcodeFormat.AZTEC,
  BarcodeFormat.RSS_14,
  BarcodeFormat.RSS_EXPANDED,
]

export default function BarcodeScanner({ isOpen, onResult, onError }) {
  const videoRef = useRef(null)
  const readerRef = useRef(null)
  const streamRef = useRef(null)
  const hasReportedRef = useRef(false)
  const onResultRef = useRef(onResult)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onResultRef.current = onResult
  }, [onResult])

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  useEffect(() => {
    if (!isOpen) return

    let isCancelled = false

    const stopScanner = () => {
      try {
        readerRef.current?.reset()
      } catch {
        // ignore reset errors during unmount/cleanup
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }

    const start = async () => {
      try {
        hasReportedRef.current = false

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920, min: 1280 },
            height: { ideal: 1080, min: 720 },
            frameRate: { ideal: 30, min: 24, max: 60 },
          },
          audio: false,
        })

        if (isCancelled || !videoRef.current) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        videoRef.current.setAttribute('autoplay', 'true')
        videoRef.current.setAttribute('playsinline', 'true')

        // Try to keep the image sharp for barcode edges.
        const [videoTrack] = stream.getVideoTracks()
        if (videoTrack) {
          const capabilities = videoTrack.getCapabilities?.() || {}
          const advanced = []
          if (capabilities.focusMode?.includes('continuous')) {
            advanced.push({ focusMode: 'continuous' })
          }
          if (typeof capabilities.zoom?.max === 'number' && capabilities.zoom.max >= 1.5) {
            advanced.push({ zoom: Math.min(2, capabilities.zoom.max) })
          }
          if (advanced.length > 0) {
            try {
              await videoTrack.applyConstraints({ advanced })
            } catch {
              // Ignore unsupported camera controls.
            }
          }
        }

        const hints = new Map()
        hints.set(DecodeHintType.POSSIBLE_FORMATS, SCAN_FORMATS)
        hints.set(DecodeHintType.TRY_HARDER, true)

        // Faster polling improves lock-on speed on mobile cameras.
        const reader = new BrowserMultiFormatReader(hints, 70)
        readerRef.current = reader

        reader.decodeFromVideoElement(videoRef.current, (result) => {
          if (!result || hasReportedRef.current) return

          const text = result.getText()?.trim()
          if (!text) return

          hasReportedRef.current = true
          onResultRef.current?.(text)
          stopScanner()
        })
      } catch (error) {
        console.error(error)
        onErrorRef.current?.('Camera error')
        stopScanner()
      }
    }

    start()

    return () => {
      isCancelled = true
      stopScanner()
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

