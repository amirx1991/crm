import React, { useState, useRef, useEffect } from 'react'

interface OtpInputProps {
    value: string
    onChange: (value: string) => void
    onComplete?: (value: string) => void
}

const OtpInput: React.FC<OtpInputProps> = ({ value, onChange, onComplete }) => {
    const [otp, setOtp] = useState<string[]>(new Array(5).fill(''))
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    useEffect(() => {
        // تبدیل رشته ورودی به آرایه
        const otpArray = value.split('')
        setOtp(new Array(5).fill('').map((_, index) => otpArray[index] || ''))
    }, [value])

    const handleChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return

        const newOtp = [...otp]
        newOtp[index] = element.value
        setOtp(newOtp)

        // تبدیل آرایه به رشته و ارسال به کامپوننت والد
        const otpString = newOtp.join('')
        console.log('Current OTP Value:', otpString) // لاگ کردن مقدار فعلی OTP
        onChange(otpString)

        // انتقال فوکوس به فیلد بعدی
        if (element.value !== '') {
            if (index < 4) {
                inputRefs.current[index + 1]?.focus()
            } else if (index === 4) {
                // اگر آخرین فیلد پر شد و همه فیلدها مقدار دارند
                if (newOtp.every(digit => digit !== '')) {
                    console.log('Completed OTP:', otpString) // لاگ کردن مقدار نهایی OTP
                    onComplete?.(otpString)
                }
            }
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        const currentValue = otp[index]
        
        if (e.key === 'Backspace') {
            e.preventDefault() // جلوگیری از رفتار پیش‌فرض
            
            const newOtp = [...otp]
            if (currentValue === '') {
                // اگر فیلد فعلی خالی است، فیلد قبلی را پاک کن
                if (index > 0) {
                    newOtp[index - 1] = ''
                    setOtp(newOtp)
                    onChange(newOtp.join(''))
                    inputRefs.current[index - 1]?.focus()
                }
            } else {
                // پاک کردن فیلد فعلی
                newOtp[index] = ''
                setOtp(newOtp)
                onChange(newOtp.join(''))
            }
        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text')
        const pastedArray = pastedData.slice(0, 5).split('')

        if (pastedArray.every(char => !isNaN(Number(char)))) {
            const newOtp = new Array(5).fill('')
            pastedArray.forEach((value, index) => {
                if (index < 5) newOtp[index] = value
            })
            setOtp(newOtp)
            const otpString = newOtp.join('')
            console.log('Pasted OTP:', otpString) // لاگ کردن مقدار پیست شده
            onChange(otpString)
            
            // اگر همه فیلدها پر شدند
            if (newOtp.every(digit => digit !== '') && onComplete) {
                onComplete(otpString)
            }
        }
    }

    return (
        <div className="flex justify-center gap-2" dir="ltr">
            {[0, 1, 2, 3, 4].map((index) => (
                <input
                    key={index}
                    type="text"
                    ref={el => inputRefs.current[index] = el}
                    value={otp[index]}
                    onChange={e => handleChange(e.target, index)}
                    onKeyDown={e => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    maxLength={1}
                    className="w-12 h-12 text-center border rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-xl"
                    autoComplete="off"
                    inputMode="numeric"
                    pattern="[0-9]*"
                />
            ))}
        </div>
    )
}

export default OtpInput 