import { QRCodeSVG } from 'qrcode.react'

type StudentNumberQrProps = {
  studentNumber: string
  size?: number
  className?: string
  showLabel?: boolean
}

/** Encodes the student number as a QR mark for each enrolled student. */
export function StudentNumberQr({
  studentNumber,
  size = 112,
  className = '',
  showLabel = true,
}: StudentNumberQrProps) {
  const value = studentNumber.trim().toUpperCase()

  if (!value) {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center ${className}`}
        style={{ width: size + 24, minHeight: size + (showLabel ? 48 : 24) }}
      >
        <p className="px-3 text-[11px] text-slate-400">
          Enter a student number to generate its QR code
        </p>
      </div>
    )
  }

  return (
    <div
      className={`inline-flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm ${className}`}
    >
      <QRCodeSVG
        value={value}
        size={size}
        level="M"
        includeMargin={false}
        bgColor="#ffffff"
        fgColor="#0f172a"
        title={`QR for ${value}`}
      />
      {showLabel ? (
        <p className="max-w-[8rem] truncate text-center text-[11px] font-semibold tracking-wide text-slate-600">
          {value}
        </p>
      ) : null}
    </div>
  )
}
