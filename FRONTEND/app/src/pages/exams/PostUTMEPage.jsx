import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import Spinner from '../../components/Spinner'
import QuestionCard from '../../components/QuestionCard'
import ExamTimer from '../../components/ExamTimer'
import ProgressBar from '../../components/ProgressBar'
import { examService, universityService } from '../../services/examService'
import { advisorService } from '../../services/examService'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import {
  Trophy, ChevronLeft, ChevronRight, Send,
  Brain, Building2, CheckCircle, AlertCircle
} from 'lucide-react'

const PHASES = { SETUP: 'setup', EXAM: 'exam', RESULT: 'result' }

function PostUTMESetup({ onStart }) {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const [uniInfo,     setUniInfo]     = useState(null)
  const [unis,        setUnis]        = useState([])
  const [courses,     setCourses]     = useState([])
  const [selUni,      setSelUni]      = useState(null)
  const [selCourse,   setSelCourse]   = useState(null)
  const [loadCourses, setLoadCourses] = useState(false)
  const [starting,    setStarting]    = useState(false)
  const [loading,     setLoading]     = useState(true)
  const [showPicker,  setShowPicker]  = useState(false)

  useEffect(() => {
    const init = async () => {
      // Always load uni list for fallback picker
      universityService.list()
        .then(r => setUnis(r.data || []))
        .catch(() => {})

      if (user?.selected_university_id && user?.selected_course_id) {
        try {
          const [uniRes, courseRes] = await Promise.all([
            universityService.getById(user.selected_university_id),
            universityService.getCourse(user.selected_course_id),
          ])
          setUniInfo({ university: uniRes.data, course: courseRes.data })
          setSelUni(uniRes.data)
          setSelCourse(courseRes.data)
        } catch (_) {
          setShowPicker(true)
        }
      } else {
        setShowPicker(true)
      }
      setLoading(false)
    }
    init()
  }, [user])

  const pickUni = async (uni) => {
    setSelUni(uni); setSelCourse(null); setLoadCourses(true)
    try {
      const { data } = await universityService.getCourses(uni.id)
      setCourses(data)
    } catch (_) {} finally { setLoadCourses(false) }
  }

  const handleStart = async () => {
    const uniId    = selUni?.id    ?? user?.selected_university_id
    const courseId = selCourse?.id ?? user?.selected_course_id
    if (!uniId || !courseId) {
      toast.error('Please select a university and course')
      return
    }
    setStarting(true)
    try {
      const { data } = await examService.startPostUTME(uniId, courseId)
      onStart(data)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not start POST-UTME')
    } finally { setStarting(false) }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="max-w-xl mx-auto">
      {/* Header card */}
      <div className="card mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Trophy size={20} className="text-purple-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">POST-UTME Screening</h2>
            <p className="text-sm text-gray-500">50 questions · 60 minutes</p>
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-sm text-purple-800">
          Practice your university's screening exam. You need ≥40% to gain admission.
          Questions are tailored to your course requirements.
        </div>
      </div>

      {/* University info or picker */}
      {uniInfo && !showPicker ? (
        <div className="card mb-6 bg-green-50 border border-green-200">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-green-800 flex items-center gap-2 mb-2">
                <CheckCircle size={16} /> Your Target University
              </h3>
              <p className="font-semibold text-gray-800">{uniInfo.university.name}</p>
              <p className="text-sm text-gray-600">{uniInfo.course.name} · {uniInfo.course.faculty || ''}</p>
              {uniInfo.course.post_utme_cutoff && (
                <p className="text-xs text-orange-600 mt-1 font-medium">
                  Pass mark: {uniInfo.course.post_utme_cutoff}%
                </p>
              )}
            </div>
            <button onClick={() => { setShowPicker(true); setUniInfo(null) }}
              className="text-xs text-blue-600 underline hover:text-blue-800">
              Change
            </button>
          </div>
        </div>
      ) : (
        <div className="card mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Select Your Target University</h3>

          {/* University list */}
          <div className="max-h-52 overflow-y-auto space-y-1.5 mb-4">
            {unis.length === 0
              ? <p className="text-sm text-gray-400 text-center py-4">No universities found</p>
              : unis.map(u => (
                <button key={u.id} onClick={() => pickUni(u)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all text-sm
                    ${selUni?.id === u.id ? 'border-purple-500 bg-purple-50' : 'border-gray-100 hover:border-gray-300'}`}>
                  <p className="font-semibold text-gray-800">{u.short_name ? `${u.short_name} — ` : ''}{u.name}</p>
                  <p className="text-xs text-gray-500">{u.state}</p>
                </button>
              ))}
          </div>

          {/* Course list */}
          {selUni && (
            <>
              <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Choose Course</p>
              {loadCourses ? <Spinner size="sm" /> : (
                <div className="max-h-40 overflow-y-auto space-y-1.5">
                  {courses.map(c => (
                    <button key={c.id} onClick={() => setSelCourse(c)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all text-sm
                        ${selCourse?.id === c.id ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-gray-300'}`}>
                      <p className="font-semibold text-gray-800">{c.name}</p>
                      <p className="text-xs text-gray-500">{c.faculty}</p>
                      {c.post_utme_cutoff && (
                        <p className="text-xs text-orange-600">Pass mark: {c.post_utme_cutoff}%</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      <button onClick={handleStart}
        disabled={(!uniInfo && (!selUni || !selCourse)) || starting}
        className="btn-primary w-full flex items-center justify-center gap-2">
        {starting ? <Spinner size="sm" color="white" /> : <Trophy size={18} />}
        Start POST-UTME Exam
      </button>
    </div>
  )
}

function PostUTMEExamRoom({ session, onSubmit }) {
  const [answers,    setAnswers]    = useState({})
  const [current,    setCurrent]    = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const questions = session.questions || []
  const answered  = Object.keys(answers).length

  const handleSubmit = async (force = false) => {
    if (!force && answered < questions.length) {
      if (!window.confirm(`${answered}/${questions.length} answered. Submit anyway?`)) return
    }
    setSubmitting(true)
    try {
      const payload = questions.map(q => ({
        question_id: q.id, selected_answer: answers[q.id] || null
      }))
      await examService.submitPostUTME(session.attempt_id, payload)
      const { data } = await examService.getPostUTMEResult(session.attempt_id)
      onSubmit(data)
    } catch (_) {
      toast.error('Submission failed. Please try again.')
    } finally { setSubmitting(false) }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 mb-1">POST-UTME · Q{current + 1}/{questions.length}</p>
          <ProgressBar answered={answered} total={questions.length} />
        </div>
        <ExamTimer durationMinutes={session.duration_minutes || 60}
          onTimeUp={() => handleSubmit(true)} />
      </div>

      {questions[current] && (
        <QuestionCard question={questions[current]} index={current} total={questions.length}
          selected={answers[questions[current].id]}
          onSelect={(qid, ans) => setAnswers(prev => ({ ...prev, [qid]: ans }))} />
      )}

      <div className="flex items-center justify-between mt-4">
        <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40">
          <ChevronLeft size={16} /> Prev
        </button>

        <div className="flex gap-1 flex-wrap max-w-xs justify-center">
          {questions.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`w-7 h-7 rounded text-xs font-medium transition-all
                ${i === current ? 'bg-purple-600 text-white'
                : answers[questions[i]?.id] ? 'bg-green-200 text-green-800'
                : 'bg-gray-100 text-gray-500'}`}>
              {i + 1}
            </button>
          ))}
        </div>

        {current < questions.length - 1
          ? <button onClick={() => setCurrent(c => c + 1)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">
              Next <ChevronRight size={16} />
            </button>
          : <button onClick={() => handleSubmit()} disabled={submitting}
              className="btn-primary flex items-center gap-2">
              {submitting ? <Spinner size="sm" color="white" /> : <Send size={16} />}
              Submit
            </button>
        }
      </div>
    </div>
  )
}

function PostUTMEResult({ result }) {
  const navigate = useNavigate()
  const [advice, setAdvice]   = useState('')
  const [loading, setLoading] = useState(false)

  const pct      = result.percentage || 0
  const admitted = result.admitted
  const matric   = result.matric_number

  const getAdvice = async () => {
    setLoading(true)
    try {
      const { data } = await advisorService.analyzePerformance(result.attempt_id)
      setAdvice(data.response)
    } catch (_) {} finally { setLoading(false) }
  }

  if (admitted) {
    return (
      <div className="max-w-xl mx-auto text-center">
        <div className="card border-2 border-green-400 bg-green-50 mb-6">
          <div className="text-6xl mb-4">🎓</div>
          <h2 className="text-3xl font-extrabold text-green-700 mb-2">CONGRATULATIONS!</h2>
          <p className="text-xl font-bold text-green-800 mb-1">YOU ARE ADMITTED!</p>
          <p className="text-5xl font-extrabold text-gray-900 mt-4">{pct.toFixed(1)}%</p>
          <p className="text-sm text-gray-500 mt-1">POST-UTME Score</p>

          {matric && (
            <div className="mt-6 bg-white rounded-xl p-4 border border-green-300">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Matriculation Number</p>
              <p className="text-2xl font-mono font-extrabold text-green-700">{matric}</p>
              <p className="text-xs text-gray-500 mt-1">Keep this safe — it's your university ID</p>
            </div>
          )}

          <div className="mt-6 text-left bg-white rounded-xl p-4 border border-green-200">
            <p className="font-bold text-gray-800 mb-2">📋 Next Steps:</p>
            <ol className="text-sm text-gray-700 space-y-1.5 list-decimal list-inside">
              <li>Visit JAMB portal to accept admission</li>
              <li>Pay acceptance fee at your university</li>
              <li>Collect admission letter from school</li>
              <li>Complete faculty registration</li>
            </ol>
          </div>
        </div>

        <button onClick={() => navigate('/admitted')} className="btn-primary w-full text-lg py-3 mb-3">
          View Admission Details 
        </button>
        <button onClick={() => navigate('/advisor')} className="btn-outline w-full">
          Chat with AI About Your Career Path
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="card text-center mb-4 border-2 border-red-300 bg-red-50">
        <div className="text-4xl mb-3"></div>
        <p className="text-4xl font-extrabold text-gray-900">{pct.toFixed(1)}%</p>
        <p className="text-red-700 font-bold mt-2">Not Admitted — Below Pass Mark</p>
        <p className="text-sm text-gray-600 mt-2">{result.message}</p>
      </div>

      {result.alternative_universities?.length > 0 && (
        <div className="card mb-4">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Building2 size={16} className="text-blue-600" />
            Alternative Universities
          </h3>
          <div className="space-y-2">
            {result.alternative_universities.map((u, i) => (
              <div key={i} className="p-3 bg-blue-50 rounded-lg text-sm">
                <p className="font-semibold text-gray-800">{u.university_name}</p>
                <p className="text-gray-500 text-xs">{u.course_name} · Cutoff: {u.post_utme_cutoff}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card mb-4">
        {advice ? (
          <div>
            <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
              <Brain size={16} /> AI Advisor
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{advice}</p>
          </div>
        ) : (
          <button onClick={getAdvice} disabled={loading}
            className="btn-secondary w-full flex items-center justify-center gap-2">
            {loading ? <Spinner size="sm" color="white" /> : <Brain size={16} />}
            Get AI Guidance
          </button>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={() => navigate('/practice')} className="btn-outline flex-1">Practice More</button>
        <button onClick={() => window.location.reload()} className="btn-primary flex-1">Retake POST-UTME</button>
      </div>
    </div>
  )
}

export default function PostUTMEPage() {
  const [phase,   setPhase]   = useState(PHASES.SETUP)
  const [session, setSession] = useState(null)
  const [result,  setResult]  = useState(null)

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Trophy size={16} /> POST-UTME Screening
          {phase !== PHASES.SETUP && <><span>›</span><span className="text-gray-700 capitalize">{phase}</span></>}
        </div>
        {phase === PHASES.SETUP  && <PostUTMESetup  onStart={s => { setSession(s); setPhase(PHASES.EXAM) }} />}
        {phase === PHASES.EXAM   && session && <PostUTMEExamRoom session={session} onSubmit={r => { setResult(r); setPhase(PHASES.RESULT) }} />}
        {phase === PHASES.RESULT && result  && <PostUTMEResult result={result} />}
      </div>
    </Layout>
  )
}

