import React, { useRef, useState, useEffect } from 'react'
import classNames from 'classnames'
import { HiOutlineLockClosed } from 'react-icons/hi'

interface OtpInputProps {
    value: string
    onChange: (value: string) => void
    numInputs?: number
    onComplete?: (value: string) => void
}

const OtpInput = ({ 
    value = '', 
    onChange, 
    numInputs = 5,
    onComplete 
}: OtpInputProps) => {
    const [activeInput, setActiveInput] = useState(0)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    useEffect(() => {
        // اگر مقدار اولیه وجود داشت، آن را در باکس‌ها پر کن
        if (value) {
            const values = value.split('')
            values.forEach((val, idx) => {
                if (inputRefs.current[idx]) {
                    inputRefs.current[idx]!.value = val
                }
            })
        }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const target = e.target
        let targetValue = target.value

        // فقط اعداد را قبول کن
        const isTargetValueDigit = targetValue.match(/^[0-9]$/)

        if (!isTargetValueDigit && targetValue !== '') {
            return
        }

        targetValue = isTargetValueDigit ? targetValue : ''

        const newValue =
            value.substring(0, index) + targetValue + value.substring(index + 1)

        onChange(newValue)

        if (!isTargetValueDigit) {
            return
        }

        const nextElementIndex = index + 1
        if (nextElementIndex < numInputs) {
            inputRefs.current[nextElementIndex]?.focus()
            setActiveInput(nextElementIndex)
        } else {
            target.blur()
            setActiveInput(-1)
            onComplete?.(newValue)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        const target = e.target as HTMLInputElement

        if (e.key === 'Backspace') {
            e.preventDefault()
            if (target.value) {
                const newValue =
                    value.substring(0, index) + '' + value.substring(index + 1)
                onChange(newValue)
                target.value = ''
            }

            const prevElementIndex = index - 1
            if (prevElementIndex >= 0) {
                inputRefs.current[prevElementIndex]?.focus()
                setActiveInput(prevElementIndex)
            }
        }
    }

    const handleClick = (index: number) => {
        setActiveInput(index)
        inputRefs.current[index]?.focus()
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text/plain').slice(0, numInputs)
        
        if (!pastedData.match(/^[0-9]+$/)) {
            return
        }

        const newValue = value.slice(0, activeInput) + 
                        pastedData + 
                        value.slice(activeInput + pastedData.length)

        onChange(newValue.slice(0, numInputs))

        const nextElementIndex = Math.min(activeInput + pastedData.length, numInputs - 1)
        inputRefs.current[nextElementIndex]?.focus()
        setActiveInput(nextElementIndex)
    }

    return (
        <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center justify-center mb-2">
                <HiOutlineLockClosed className="text-2xl text-gray-400 mr-2" />
                <span className="text-gray-600">کد تایید را وارد کنید</span>
            </div>
            <div className="flex justify-center gap-3">
                {Array(numInputs)
                    .fill('')
                    .map((_, index) => (
                        <div
                            key={index}
                            className="relative"
                        >
                            <input
                                ref={el => inputRefs.current[index] = el}
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                pattern="\d{1}"
                                maxLength={1}
                                className={classNames(
                                    "w-12 h-12 text-center text-2xl font-bold rounded-lg border-2",
                                    "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
                                    "transition-all duration-200",
                                    "bg-white dark:bg-gray-800",
                                    "text-gray-800 dark:text-white",
                                    {
                                        'border-gray-300 dark:border-gray-600': index !== activeInput,
                                        'border-primary-500 dark:border-primary-500': index === activeInput,
                                        'animate-bounce': index === activeInput && !value[index]
                                    }
                                )}
                                value={value[index] || ''}
                                onChange={e => handleChange(e, index)}
                                onKeyDown={e => handleKeyDown(e, index)}
                                onPaste={handlePaste}
                                onClick={() => handleClick(index)}
                            />
                            {index < numInputs - 1 && (
                                <div className="absolute top-1/2 -right-2 w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 transform -translate-y-1/2" />
                            )}
                        </div>
                    ))}
            </div>
        </div>
    )
}

export default OtpInput 