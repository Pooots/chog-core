import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
  type CameraDevice,
} from 'html5-qrcode'
import { Camera, CameraOff, LoaderCircle, SwitchCamera } from 'lucide-react'

type Facing = 'environment' | 'user'

type QrCameraScannerProps = {
  active: boolean
  onScan: (value: string) => void
  onError?: (message: string) => void
  /** Ignore duplicate scans within this window (ms). */
  cooldownMs?: number
}

const READER_ID = 'gate-qr-reader'

function isBackCamera(device: CameraDevice) {
  return /back|rear|environment|arrière|trasera/i.test(device.label)
}

function isFrontCamera(device: CameraDevice) {
  return /front|user|face|selfie/i.test(device.label)
}

/**
 * Labels are empty until camera permission is granted; in that case phones
 * list the back camera last and the front camera first.
 */
function pickCamera(devices: CameraDevice[], facing: Facing) {
  if (devices.length === 0) return null

  const matches = devices.filter((device) =>
    facing === 'environment' ? isBackCamera(device) : isFrontCamera(device),
  )

  if (matches.length > 0) return matches[0]
  return facing === 'environment' ? devices[devices.length - 1] : devices[0]
}

export default function QrCameraScanner({
  active,
  onScan,
  onError,
  cooldownMs = 2500,
}: QrCameraScannerProps) {
  const [starting, setStarting] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [facing, setFacing] = useState<Facing>('environment')
  const [canSwitch, setCanSwitch] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const lastScanRef = useRef<{ value: string; at: number }>({
    value: '',
    at: 0,
  })
  const onScanRef = useRef(onScan)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onScanRef.current = onScan
  }, [onScan])

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current
    scannerRef.current = null
    if (!scanner) return

    try {
      if (scanner.isScanning) {
        await scanner.stop()
      }
      scanner.clear()
    } catch {
      // Camera may already be stopped.
    }
  }, [])

  useEffect(() => {
    if (!active) {
      void stopScanner()
      setCameraError('')
      setStarting(false)
      return
    }

    let cancelled = false

    const start = async () => {
      setStarting(true)
      setCameraError('')

      if (!window.isSecureContext) {
        const message =
          'Camera needs a secure connection. Open this page over HTTPS or on localhost.'
        setCameraError(message)
        onErrorRef.current?.(message)
        setStarting(false)
        return
      }

      // Wait a tick so the reader element is mounted.
      await new Promise((resolve) => window.setTimeout(resolve, 50))
      if (cancelled) return

      if (!document.getElementById(READER_ID)) {
        setCameraError('Camera view is not ready. Try again.')
        setStarting(false)
        return
      }

      await stopScanner()

      const handleDecoded = (decodedText: string) => {
        const value = decodedText.trim().toUpperCase()
        if (!value) return

        const now = Date.now()
        if (
          lastScanRef.current.value === value &&
          now - lastScanRef.current.at < cooldownMs
        ) {
          return
        }

        lastScanRef.current = { value, at: now }
        onScanRef.current(value)
      }

      try {
        let cameras: CameraDevice[] = []
        try {
          cameras = await Html5Qrcode.getCameras()
        } catch {
          // Label enumeration can fail before permission is granted; fall back
          // to a plain facingMode constraint below.
        }
        if (cancelled) return

        setCanSwitch(cameras.length > 1)

        const selected = pickCamera(cameras, facing)
        const sources: Array<string | MediaTrackConstraints> = selected
          ? [selected.id, { facingMode: facing }]
          : [{ facingMode: { exact: facing } }, { facingMode: facing }]

        const scanner = new Html5Qrcode(READER_ID, {
          verbose: false,
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          // Native detector is far faster than the JS fallback on phones.
          useBarCodeDetectorIfSupported: true,
          experimentalFeatures: { useBarCodeDetectorIfSupported: true },
        })
        scannerRef.current = scanner

        let lastError: unknown = null
        let started = false

        for (const source of sources) {
          try {
            await scanner.start(
              source,
              {
                fps: 10,
                // Sizing the box off the live viewfinder keeps it inside the
                // video on narrow screens, where a fixed box breaks decoding.
                qrbox: (viewfinderWidth, viewfinderHeight) => {
                  const edge = Math.floor(
                    Math.min(viewfinderWidth, viewfinderHeight) * 0.75,
                  )
                  return { width: edge, height: edge }
                },
                disableFlip: false,
              },
              handleDecoded,
              () => {
                // Ignore frame-level "not found" noise.
              },
            )
            started = true
            break
          } catch (error) {
            lastError = error
          }
        }

        if (!started) throw lastError

        if (cancelled) {
          await stopScanner()
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Unable to open the camera. Check browser permissions.'
        setCameraError(message)
        onErrorRef.current?.(message)
      } finally {
        if (!cancelled) setStarting(false)
      }
    }

    void start()

    return () => {
      cancelled = true
      void stopScanner()
    }
  }, [active, cooldownMs, facing, stopScanner])

  if (!active) return null

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
        <div
          id={READER_ID}
          className="min-h-64 w-full overflow-hidden [&_video]:mx-auto [&_video]:max-w-full"
        />
        {starting ? (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-950/80 text-sm text-white">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Starting camera…
          </div>
        ) : null}
        {canSwitch && !starting ? (
          <button
            type="button"
            onClick={() =>
              setFacing((value) =>
                value === 'environment' ? 'user' : 'environment',
              )
            }
            className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-xl bg-slate-950/70 px-3 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-slate-950/85"
          >
            <SwitchCamera className="h-3.5 w-3.5" />
            {facing === 'environment' ? 'Front' : 'Back'}
          </button>
        ) : null}
      </div>

      {cameraError ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
        >
          {cameraError}
        </p>
      ) : (
        <p className="flex items-center gap-1.5 text-xs text-slate-500">
          <Camera className="h-3.5 w-3.5 text-blue-600" />
          Point the camera at the student QR code. Scans record automatically.
        </p>
      )}
    </div>
  )
}

export function CameraToggleButton({
  active,
  onToggle,
  disabled,
}: {
  active: boolean
  onToggle: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:opacity-60 ${
        active
          ? 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
      }`}
    >
      {active ? (
        <>
          <CameraOff className="h-4 w-4" />
          Stop camera
        </>
      ) : (
        <>
          <Camera className="h-4 w-4" />
          Open camera
        </>
      )}
    </button>
  )
}
