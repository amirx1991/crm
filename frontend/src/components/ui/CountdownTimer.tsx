import { useState, useEffect } from 'react'

interface CountdownTimerProps {
    initialSeconds: number
    onComplete: () => void
    className?: string
}

const CountdownTimer = ({ initialSeconds, onComplete, className = '' }: CountdownTimerProps) => {
    const [seconds, setSeconds] = useState(initialSeconds)

    useEffect(() => {
        if (seconds > 0) {
            const timer = setTimeout(() => {
                setSeconds(seconds - 1)
            }, 1000)
            return () => clearTimeout(timer)
        } else {
            onComplete()
        }
    }, [seconds, onComplete])

    const formatTime = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60)
        const remainingSeconds = totalSeconds % 60
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }

    return (
        <div className={`text-center ${className}`}>
            <p className="text-sm text-gray-600">
                ارسال مجدد کد در {formatTime(seconds)}
            </p>
        </div>
    )
}

export default CountdownTimer


