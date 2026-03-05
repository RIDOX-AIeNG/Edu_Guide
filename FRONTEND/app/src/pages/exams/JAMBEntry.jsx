import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import Spinner from '../../components/Spinner'

// Simple eligibility check page before starting JAMB
// The user can indicate whether they have WAEC results and, if so,
// enter their number of credits. If the credit count meets a hard-
// coded threshold (5), the user is forwarded to the real JAMB page.
// Otherwise they are directed to the WAEC exam route.

export default function JAMBEntry() {
  const navigate = useNavigate()
  const [hasWaec, setHasWaec] = useState(null)
  const [credits, setCredits] = useState('')
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')

  const handleContinue = () => {
    if (hasWaec === null) return
    if (!hasWaec) {
      // user does not have WAEC, send them to the WAEC exam flow
      navigate('/exams/waec')
      return
    }
    // has WAEC - validate credits
    const num = parseInt(credits, 10)
    if (isNaN(num) || num < 0) {
      setError('Please enter a valid number of credits')
      return
    }
    setChecking(true)
    setError('')
    // requirement is 5 credits (this could eventually come from the backend)
    setTimeout(() => {
      setChecking(false)
      if (num >= 5) {
        navigate('/exams/jamb')
      } else {
        setError('You need at least 5 WAEC credits to attempt JAMB. Complete or update WAEC results first.')
        // optionally redirect after a pause
      }
    }, 500)
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold mb-6">JAMB Eligibility Check</h1>
        <p className="mb-4">
          Before you begin the JAMB examination flow we need to know whether
          you already have WAEC results. If you do, enter the number of credits
          (A1–C6) you obtained. You must have at least five credits to proceed.
        </p>
        <div className="space-y-4">
          <div>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="waec"
                className="mr-2"
                checked={hasWaec === true}
                onChange={() => setHasWaec(true)}
              />
              <span>Yes, I have WAEC results</span>
            </label>
          </div>
          <div>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="waec"
                className="mr-2"
                checked={hasWaec === false}
                onChange={() => setHasWaec(false)}
              />
              <span>No, I haven't taken WAEC / awaiting result</span>
            </label>
          </div>
          {hasWaec && (
            <div>
              <label className="block text-sm font-medium mb-1">Number of WAEC credits</label>
              <input
                type="number"
                min={0}
                max={9}
                value={credits}
                onChange={e => setCredits(e.target.value)}
                className="input w-full"
                placeholder="e.g. 5"
              />
            </div>
          )}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            disabled={hasWaec === null || checking}
            onClick={handleContinue}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
          >
            {checking ? <Spinner size="sm" color="white" /> : 'Continue'}
          </button>
        </div>
      </div>
    </Layout>
  )
}
