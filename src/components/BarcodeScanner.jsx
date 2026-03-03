import { useEffect, useRef } from 'react'
import {
  BrowserMultiFormatReader,
  DecodeHintType,
  BarcodeFormat,
  MultiFormatReader,
  RGBLuminanceSource,
  BinaryBitmap,
  HybridBinarizer,
  GlobalHistogramBinarizer,
} from '@zxing/library'

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
  const coreReaderRef = useRef(null)
  const fallbackTimerRef = useRef(null)
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
      coreReaderRef.current = null

      if (fallbackTimerRef.current) {
        clearInterval(fallbackTimerRef.current)
        fallbackTimerRef.current = null
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

        const coreReader = new MultiFormatReader()
        coreReader.setHints(hints)
        coreReaderRef.current = coreReader

        // Faster polling improves lock-on speed on mobile cameras.
        const reader = new BrowserMultiFormatReader(hints, 70)
        readerRef.current = reader

        const handleResult = (result) => {
          if (!result || hasReportedRef.current) return

          const text = result.getText()?.trim()
          if (!text) return

          hasReportedRef.current = true
          onResultRef.current?.(text)
          stopScanner()
        }

        reader.decodeFromVideoElement(videoRef.current, (result) => {
          handleResult(result)
        })

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        fallbackTimerRef.current = setInterval(() => {
          if (!videoRef.current || !ctx || hasReportedRef.current) return
          const video = videoRef.current
          if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) return

          // Focus decoding on the center scan band where users align barcodes.
          const srcW = video.videoWidth
          const srcH = video.videoHeight
          const roiW = Math.max(240, Math.floor(srcW * 0.82))
          const roiH = Math.max(100, Math.floor(srcH * 0.28))
          const roiX = Math.floor((srcW - roiW) / 2)
          const roiY = Math.floor((srcH - roiH) / 2)

          canvas.width = roiW
          canvas.height = roiH
          ctx.drawImage(video, roiX, roiY, roiW, roiH, 0, 0, roiW, roiH)
          const imageData = ctx.getImageData(0, 0, roiW, roiH)
          const rgba = imageData.data
          const pixels = new Int32Array(roiW * roiH)

          // Simple contrast boost on ROI to separate bars from background.
          for (let i = 0, p = 0; i < pixels.length; i += 1, p += 4) {
            const r = rgba[p]
            const g = rgba[p + 1]
            const b = rgba[p + 2]
            let lum = (r * 30 + g * 59 + b * 11) / 100
            lum = lum < 128 ? lum * 0.6 : 255 - (255 - lum) * 0.6
            const v = Math.max(0, Math.min(255, lum | 0))
            pixels[i] = (v << 16) | (v << 8) | v
          }

          const tryDecode = (source) => {
            try {
              const hybridResult = coreReader.decode(new BinaryBitmap(new HybridBinarizer(source)), hints)
              handleResult(hybridResult)
              return true
            } catch {
              // continue to fallback binarizer
            }
            try {
              const histogramResult = coreReader.decode(
                new BinaryBitmap(new GlobalHistogramBinarizer(source)),
                hints
              )
              handleResult(histogramResult)
              return true
            } catch {
              return false
            }
          }

          const source = new RGBLuminanceSource(pixels, roiW, roiH)
          if (tryDecode(source)) return
          tryDecode(source.invert())
        }, 120)
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

