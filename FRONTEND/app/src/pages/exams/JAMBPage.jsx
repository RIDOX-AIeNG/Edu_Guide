import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import Spinner from '../../components/Spinner'
import QuestionCard from '../../components/QuestionCard'
import ExamTimer from '../../components/ExamTimer'
import ProgressBar from '../../components/ProgressBar'
import { examService, universityService, advisorService, dashboardService } from '../../services/examService'

import toast from 'react-hot-toast'
import {
  GraduationCap, Search, ChevronLeft, ChevronRight,
  Send, Brain, Building2, AlertCircle, CheckCircle
} from 'lucide-react'

const PHASES = { SETUP: 'setup', EXAM: 'exam', RESULT: 'result' }

// ── University + Course Setup ────────────────────────────────────────────────
function JAMBSetup({ onStart }) {
  const [unis,       setUnis]       = useState([])
  const [courses,    setCourses]    = useState([])
  const [selUni,     setSelUni]     = useState(null)
  const [selCourse,  setSelCourse]  = useState(null)
  const [search,     setSearch]     = useState('')
  const [loading,    setLoading]    = useState(true)
  const [loadCourses,setLoadCourses]= useState(false)
  const [starting,   setStarting]   = useState(false)
  const [selUni2,    setSelUni2]    = useState(null)
  const [selCourse2, setSelCourse2] = useState(null)
  const [courses2,   setCourses2]   = useState([])
  const [loadCrs2,   setLoadCrs2]   = useState(false)




  useEffect(() => {
    universityService.list()
      .then(r => setUnis(r.data))
      .catch(() => toast.error('Failed to load universities'))
      .finally(() => setLoading(false))
  }, [])

  const selectUni = async (uni) => {
    setSelUni(uni)
    setSelCourse(null)
    setLoadCourses(true)
    try {
      const { data } = await universityService.getCourses(uni.id)
      setCourses(data)
    } catch (_) { toast.error('Failed to load courses') }
    finally { setLoadCourses(false) }
  }

  const selectUni2 = async (uni) => {
    setSelUni2(uni); 
    setSelCourse2(null); 
    setLoadCrs2(true)
    try {
      const { data } = await universityService.getCourses(uni.id)
      setCourses2(data)
    } catch (_) { } 
      finally { setLoadCrs2(false) }
  }

  const handleStart = async () => {
    if (!selUni || !selCourse) { toast.error('Please select a university and course'); return }
    setStarting(true)
    try {
      const { data } = await examService.startJAMB(selUni.id, selCourse.id)
      onStart(data)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not start JAMB')
    } finally { setStarting(false) }
  }

  const filtered = unis.filter(u => u.name.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <GraduationCap size={20} className="text-blue-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">JAMB Examination</h2>
            <p className="text-sm text-gray-500">180 questions · 3 hours · Score out of 400</p>
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
          Select your target university and course. Questions will be drawn from your
          course's required JAMB subjects (English + 3 others).
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* University list */}
        <div className="card">
          <h3 className="font-semibold text-gray-700 mb-3">Step 1: Choose University</h3>
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9 text-sm" placeholder="Search universities..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {filtered.map(u => (
              <button key={u.id} onClick={() => selectUni(u)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all text-sm
                  ${selUni?.id === u.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-300'}`}>
                <p className="font-semibold text-gray-800">{u.short_name || u.name}</p>
                <p className="text-xs text-gray-500 truncate">{u.name} · {u.state}</p>
                {u.jamb_cutoff && (
                  <p className="text-xs text-blue-600 mt-0.5">Min. JAMB: {u.jamb_cutoff}</p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Course list */}
        <div className="card">
          <h3 className="font-semibold text-gray-700 mb-3">Step 2: Choose Course</h3>
          {!selUni ? (
            <p className="text-sm text-gray-400 text-center py-8">Select a university first</p>
          ) : loadCourses ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : (
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {courses.map(c => (
                <button key={c.id} onClick={() => setSelCourse(c)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all text-sm
                    ${selCourse?.id === c.id ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-gray-300'}`}>
                  <p className="font-semibold text-gray-800">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.faculty}</p>
                  {c.jamb_cutoff && (
                    <p className="text-xs text-orange-600 mt-0.5">Cutoff: {c.jamb_cutoff}/400</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selection summary */}
      {selUni && selCourse && (
        <div className="space-y-3 mb-4">
          {/* 1st choice confirmed */}
          <div className="card bg-green-50 border border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</div>
              <div>
                <p className="text-xs text-green-600 font-semibold uppercase">1st Choice</p>
                <p className="font-semibold text-green-800">{selUni.name}</p>
                <p className="text-sm text-green-700">{selCourse.name} · Cutoff: {selCourse.jamb_cutoff || 'N/A'}/400</p>
                {selCourse.jamb_subjects?.length > 0 && (
                  <p className="text-xs text-green-600 mt-0.5">Subjects: {selCourse.jamb_subjects.join(', ')}</p>
                )}
              </div>
            </div>
          </div>

          {/* 2nd choice */}
          <div className="card border border-blue-200 bg-blue-50">
            <p className="text-xs font-semibold text-blue-700 mb-2">2nd Choice (Optional — backup university)</p>
            {selUni2 && selCourse2 ? (
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</div>
                <div className="flex-1">
                  <p className="font-semibold text-blue-800 text-sm">{selUni2.name}</p>
                  <p className="text-xs text-blue-700">{selCourse2.name} · Cutoff: {selCourse2.jamb_cutoff || 'N/A'}/400</p>
                </div>
                <button onClick={() => { setSelUni2(null); setSelCourse2(null) }}
                  className="text-xs text-red-500 underline">Clear</button>
              </div>
            ) : (
              <div className="space-y-2">
                <select className="input text-sm"
                  onChange={e => {
                    const u = filtered.find(u => String(u.id) === e.target.value)
                    if (u) selectUni2(u)
                  }}
                  value={selUni2?.id || ''}>
                  <option value="">Select backup university (optional)...</option>
                  {filtered.filter(u => u.id !== selUni?.id).map(u => (
                    <option key={u.id} value={u.id}>{u.short_name || u.name} — {u.state}</option>
                  ))}
                </select>
                {selUni2 && (
                  loadCrs2 ? <Spinner size="sm" /> : (
                    <select className="input text-sm"
                      onChange={e => setSelCourse2(courses2.find(c => String(c.id) === e.target.value) || null)}
                      value={selCourse2?.id || ''}>
                      <option value="">Select course...</option>
                      {courses2.map(c => (
                        <option key={c.id} value={c.id}>{c.name} — {c.jamb_cutoff || 'N/A'}/400</option>
                      ))}
                    </select>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      <button onClick={handleStart} disabled={!selUni || !selCourse || starting}
        className="btn-primary w-full flex items-center justify-center gap-2">
        {starting ? <Spinner size="sm" color="white" /> : <GraduationCap size={18} />}
        Start JAMB Exam
      </button>
    </div>
  )
}

// ── JAMB Exam Room ───────────────────────────────────────────────────────────
function JAMBExamRoom({ session, onSubmit }) {
  const [answers,   setAnswers]   = useState({})
  const [current,   setCurrent]   = useState(0)
  const [submitting,setSubmitting]= useState(false)
  const questions = session.questions || []
  const answered  = Object.keys(answers).length

  const handleSubmit = async (force = false) => {
    if (!force && answered < questions.length) {
      const ok = window.confirm(`${answered}/${questions.length} answered. Submit?`)
      if (!ok) return
    }
    setSubmitting(true)
    try {
      const payload = questions.map(q => ({
        question_id: q.id, selected_answer: answers[q.id] || null
      }))
      await examService.submitJAMB(session.attempt_id, payload)
      const { data } = await examService.getJAMBResult(session.attempt_id)
      onSubmit(data)
    } catch (_) {
      toast.error('Submission failed. Please try again.')
    } finally { setSubmitting(false) }
  }

  // Live score estimation
  const liveScore = questions.length > 0
    ? Math.round((answered / questions.length) * 400)
    : 0

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-sm text-gray-500">Question {current + 1}/{questions.length}</span>
            <span className="badge-blue">Live est. ~{liveScore}/400</span>
          </div>
          <ProgressBar answered={answered} total={questions.length} />
        </div>
        <ExamTimer durationMinutes={session.duration_minutes} onTimeUp={() => handleSubmit(true)} />
      </div>

      {questions[current] && (
        <QuestionCard question={questions[current]} index={current} total={questions.length}
          selected={answers[questions[current].id]}
          onSelect={(qid, ans) => setAnswers(prev => ({ ...prev, [qid]: ans }))}
        />
      )}

      <div className="flex items-center justify-between mt-4">
        <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40">
          <ChevronLeft size={16} /> Prev
        </button>

        <div className="flex gap-0.5 flex-wrap max-w-sm justify-center">
          {questions.slice(0, 30).map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`w-6 h-6 rounded text-xs font-medium
                ${i === current ? 'bg-blue-600 text-white' : answers[questions[i]?.id] ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
              {i + 1}
            </button>
          ))}
          {questions.length > 30 && <span className="text-xs text-gray-400 self-center ml-1">+{questions.length - 30} more</span>}
        </div>

        {current < questions.length - 1
          ? <button onClick={() => setCurrent(c => c + 1)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">
              Next <ChevronRight size={16} />
            </button>
          : <button onClick={() => handleSubmit()} disabled={submitting}
              className="btn-primary flex items-center gap-2">
              {submitting ? <Spinner size="sm" color="white" /> : <Send size={16} />}
              Submit JAMB
            </button>
        }
      </div>
    </div>
  )
}

// ── JAMB Result ──────────────────────────────────────────────────────────────
function JAMBResult({ result }) {
  const navigate = useNavigate()
  const [advice, setAdvice]   = useState('')
  const [loading, setLoading] = useState(false)

  const getAdvice = async () => {
    setLoading(true)
    try {
      const { data } = await advisorService.analyzePerformance(result.attempt_id)
      setAdvice(data.response)
    } catch (_) {} finally { setLoading(false) }
  }

  const score  = result.jamb_score || 0
  const cutoff = result.university_cutoff
  const pass   = result.passed
  const meets  = result.meets_cutoff

  return (
    <div className="max-w-2xl mx-auto">
      {/* Score card */}
      <div className={`card text-center mb-4 border-2 ${
        meets ? 'border-green-400 bg-green-50' : pass ? 'border-yellow-400 bg-yellow-50' : 'border-red-300 bg-red-50'
      }`}>
        <div className="text-4xl mb-2">{meets ? '' : pass ? '📊' : '📚'}</div>
        <p className="text-5xl font-extrabold text-gray-900">{score}<span className="text-2xl text-gray-400">/400</span></p>
        <p className={`font-bold mt-2 ${meets ? 'text-green-700' : pass ? 'text-yellow-700' : 'text-red-700'}`}>
          {meets ? '✓ Meets University Cutoff' : pass ? '⚠ Below University Cutoff' : '✗ Below National Minimum (200)'}
        </p>
        {cutoff && (
          <p className="text-sm text-gray-600 mt-1">
            University cutoff: {cutoff}/400 · Gap: {score - cutoff > 0 ? '+' : ''}{score - cutoff}
          </p>
        )}
        <p className="text-sm text-gray-500 mt-2">{result.message}</p>
      </div>

      {/* Topic breakdown */}
      {result.topic_breakdown && Object.keys(result.topic_breakdown).length > 0 && (
        <div className="card mb-4">
          <h3 className="font-bold text-gray-900 mb-3">Topic Performance</h3>
          {Object.entries(result.topic_breakdown).map(([topic, data]) => {
            const p = typeof data === 'object' ? data.percentage : data
            return (
              <div key={topic} className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{topic}</span>
                  <span className="font-bold">{p?.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${p >= 60 ? 'bg-green-500' : p >= 40 ? 'bg-yellow-400' : 'bg-red-400'}`}
                    style={{ width: `${p}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Alternative universities */}
      {result.alternative_universities?.length > 0 && (
        <div className="card mb-4">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Building2 size={16} className="text-blue-600" />
            Universities You Qualify For ({result.alternative_universities.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {result.alternative_universities.map((u, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{u.university_name}</p>
                  <p className="text-xs text-gray-500">{u.course_name} · {u.state}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-blue-700">Cutoff: {u.jamb_cutoff}</p>
                  <p className="text-xs text-green-600">+{u.score_above_cutoff} above</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Advice */}
      <div className="card mb-4">
        {advice ? (
          <div>
            <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
              <Brain size={16} /> AI Analysis
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{advice}</p>
          </div>
        ) : (
          <button onClick={getAdvice} disabled={loading}
            className="btn-secondary w-full flex items-center justify-center gap-2">
            {loading ? <Spinner size="sm" color="white" /> : <Brain size={16} />}
            Get AI Analysis
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={() => navigate('/practice')} className="btn-outline flex-1">
          Practice Weak Topics
        </button>
        {meets ? (
          <button onClick={() => navigate('/exams/post-utme')} className="btn-primary flex-1">
            Proceed to POST-UTME 🎯
          </button>
        ) : (
          <button onClick={() => window.location.reload()} className="btn-secondary flex-1">
            Retake JAMB
          </button>
        )}
      </div>
    </div>
  )
}

// ── Main JAMB Page ───────────────────────────────────────────────────────────
export default function JAMBPage() {
  const [phase,     setPhase]     = useState(PHASES.SETUP)
  const [session,   setSession]   = useState(null)
  const [result,    setResult]    = useState(null)
  const [autoStarting, setAutoStarting] = useState(true)

  // Auto-start JAMB with default subjects (no uni/course required)
  useEffect(() => {
    const quickStart = async () => {
      try {
        // Try to get first available university and course to start with
        const { data: unis } = await api.get('/universities/')
        const firstUni = unis?.[0]
        if (!firstUni) throw new Error('No universities found')

        const { data: courses } = await api.get(`/universities/${firstUni.id}/courses`)
        const firstCourse = courses?.[0]
        if (!firstCourse) throw new Error('No courses found')

        const { data } = await examService.startJAMB(firstUni.id, firstCourse.id)
        setSession(data)
        setPhase(PHASES.EXAM)
      } catch (err) {
        // If auto-start fails (e.g. not enough questions), fall back to setup
        setPhase(PHASES.SETUP)
      } finally {
        setAutoStarting(false)
      }
    }
    quickStart()
  }, [])

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <GraduationCap size={16} /> JAMB Examination
          {phase !== PHASES.SETUP && <><span>›</span><span className="text-gray-700 capitalize">{phase}</span></>}
        </div>

        {/* Loading / auto-starting */}
        {autoStarting && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Spinner size="lg" />
            <p className="text-gray-500 text-sm">Loading JAMB exam questions...</p>
          </div>
        )}

        {/* Fallback setup if auto-start failed */}
        {!autoStarting && phase === PHASES.SETUP && (
          <JAMBSetup onStart={s => { setSession(s); setPhase(PHASES.EXAM) }} />
        )}

        {phase === PHASES.EXAM   && session && (
          <JAMBExamRoom session={session} onSubmit={r => { setResult(r); setPhase(PHASES.RESULT) }} />
        )}
        {phase === PHASES.RESULT && result  && (
          <JAMBResult result={result} />
        )}
      </div>
    </Layout>
  )
}