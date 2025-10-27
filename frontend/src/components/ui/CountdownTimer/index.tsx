import React, { useState, useEffect, useCallback } from 'react'

interface CountdownTimerProps {
    initialSeconds: number
    onComplete: () => void
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ initialSeconds, onComplete }) => {
    const [seconds, setSeconds] = useState(initialSeconds)

    const formatTime = useCallback((totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = totalSeconds % 60
        return `${minutes.toString().padStart(1, '0')}:${seconds.toString().padStart(2, '0')}`
    }, [])

    useEffect(() => {
        if (seconds <= 0) {
            onComplete()
            return
        }

        const timer = setInterval(() => {
            setSeconds(prev => prev - 1)
        }, 1000)

        return () => clearInterval(timer)
    }, [seconds, onComplete])

    return (
        <div className="text-sm text-gray-500 mt-2 text-center">
            <span>امکان ارسال مجدد کد تا </span>
            <span className="font-medium text-primary-600">{formatTime(seconds)}</span>
            <span> دیگر</span>
        </div>
    )
}

export default CountdownTimer 