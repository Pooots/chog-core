import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface OTPInputProps {
  value: string
  onChange: (value: string) => void
  length?: number
  className?: string
  disabled?: boolean
}

export function OTPInput({ 
  value, 
  onChange, 
  length = 6, 
  className,
  disabled = false 
}: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Sync external value with internal state
    const otpArray = value.split('').slice(0, length)
    const newOtp = [...Array(length).fill('')]
    otpArray.forEach((char, index) => {
      newOtp[index] = char
    })
    setOtp(newOtp)
  }, [value, length])

  const handleChange = (index: number, inputValue: string) => {
    // Only allow single character
    const newValue = inputValue.slice(-1)

    // Digits only (email / SMS verification codes)
    if (newValue && !/^\d$/.test(newValue)) {
      return
    }

    const newOtp = [...otp]
    newOtp[index] = newValue
    setOtp(newOtp)

    // Call onChange with the full OTP string
    const otpString = newOtp.join('')
    onChange(otpString)

    // Auto-focus next input
    if (newValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (otp[index]) {
        // If current input has value, clear it
        const newOtp = [...otp]
        newOtp[index] = ''
        setOtp(newOtp)
        onChange(newOtp.join(''))
      } else if (index > 0) {
        // If current input is empty, move to previous and clear it
        inputRefs.current[index - 1]?.focus()
        const newOtp = [...otp]
        newOtp[index - 1] = ''
        setOtp(newOtp)
        onChange(newOtp.join(''))
      }
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
    
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      navigator.clipboard.readText().then((text) => {
        const pasteValue = text.slice(0, length).replace(/\D/g, '')
        const newOtp = [...Array(length).fill('')]
        pasteValue.split('').forEach((char, i) => {
          if (i < length) {
            newOtp[i] = char
          }
        })
        setOtp(newOtp)
        onChange(newOtp.join(''))
        // Focus the last filled input or the last input
        const lastFilledIndex = Math.min(pasteValue.length - 1, length - 1)
        inputRefs.current[lastFilledIndex]?.focus()
      })
    }
  }

  const handleFocus = (index: number) => {
    inputRefs.current[index]?.select()
  }

  return (
    <div className={cn('flex gap-2 justify-center', className)}>
      {Array.from({ length }).map((_, index) => (
        <Input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="one-time-code"
          maxLength={1}
          value={otp[index]}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          className={cn(
            'w-12 h-12 text-center text-xl font-semibold bg-neutral-800 border-neutral-700 text-white',
            'focus-visible:ring-yellow-500 focus-visible:border-yellow-500',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        />
      ))}
    </div>
  )
}

