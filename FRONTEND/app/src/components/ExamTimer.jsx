import { useState, useEffect, useRef } from 'react'
import { Clock } from 'lucide-react'

export default function ExamTimer({ durationMinutes, onTimeUp }) {
  const [seconds, setSeconds] = useState(durationMinutes * 60)
  const ref = useRef(null)

  useEffect(() => {
    ref.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) { clearInterval(ref.current); onTimeUp?.(); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(ref.current)
  }, [])

  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const fmt = (n) => String(n).padStart(2, '0')
  const urgent = seconds < 300  // last 5 minutes

  return (
    <div className={`flex items-center gap-2 font-mono text-lg font-bold px-4 py-2 rounded-lg
      ${urgent ? 'bg-red-100 text-red-700 timer-urgent' : 'bg-gray-100 text-gray-700'}`}>
      <Clock size={18} />
      {h > 0 && <span>{fmt(h)}:</span>}
      <span>{fmt(m)}:{fmt(s)}</span>
    </div>
  )
}

