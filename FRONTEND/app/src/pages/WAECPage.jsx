// import { useState, useEffect, useRef } from 'react'
// import { useNavigate } from 'react-router-dom'
// import Layout from '../../components/Layout'
// import Spinner from '../../components/Spinner'
// import QuestionCard from '../../components/QuestionCard'
// import ExamTimer from '../../components/ExamTimer'
// import ProgressBar from '../../components/ProgressBar'
// import GradeTag from '../../components/GradeTag'
// import { examService, practiceService } from '../../services/examService'
// import { advisorService } from '../../services/examService'
// import toast from 'react-hot-toast'
// import { BookOpen, CheckCircle, XCircle, ChevronLeft, ChevronRight, Send, RefreshCw, Brain } from 'lucide-react'

// const WAEC_PHASES = { SELECT: 'select', EXAM: 'exam', RESULT: 'result', OVERALL: 'overall' }

// // ── Subject Selection ────────────────────────────────────────────────────────
// function SubjectSelect({ onStart }) {
//   const [subjects,  setSubjects]  = useState([])
//   const [selected,  setSelected]  = useState([])
//   const [loading,   setLoading]   = useState(true)
//   const [starting,  setStarting]  = useState(false)

//   useEffect(() => {
//     practiceService.getSubjects()
//       .then(r => setSubjects(r.data))
//       .catch(() => toast.error('Failed to load subjects'))
//       .finally(() => setLoading(false))
//   }, [])

//   const MANDATORY = ['English Language', 'Mathematics']
//   const mandatory = subjects.filter(s => MANDATORY.some(m => s.name.includes(m)))
//   const optional  = subjects.filter(s => !MANDATORY.some(m => s.name.includes(m)))

//   const mandatoryIds = mandatory.map(s => s.id)
//   const toggle = (id) => {
//     if (mandatoryIds.includes(id)) return
//     setSelected(prev =>
//       prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev
//     )
//   }

//   const allSelected = [...mandatoryIds, ...selected]

//   const handleStart = async (subjectId) => {
//     setStarting(true)
//     try {
//       const { data } = await examService.startWAEC(subjectId)
//       onStart(data)
//     } catch (err) {
//       toast.error(err.response?.data?.detail || 'Could not start exam')
//     } finally {
//       setStarting(false)
//     }
//   }

//   if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

//   return (
//     <div className="max-w-2xl mx-auto">
//       <div className="card mb-6">
//         <div className="flex items-center gap-3 mb-4">
//           <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
//             <BookOpen size={20} className="text-yellow-600" />
//           </div>
//           <div>
//             <h2 className="font-bold text-gray-900">WAEC Examination</h2>
//             <p className="text-sm text-gray-500">50 questions · 90 minutes per subject</p>
//           </div>
//         </div>
//         <div className="bg-yellow-50 rounded-lg p-4 text-sm text-yellow-800">
//           <strong>Rules:</strong> Select and take each subject separately. You need at least 5 credits
//           (including English & Maths) to unlock JAMB. Minimum credit = C6 (50%).
//         </div>
//       </div>

//       {/* Mandatory subjects */}
//       <div className="card mb-4">
//         <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Mandatory Subjects</h3>
//         <div className="space-y-2">
//           {mandatory.map(s => (
//             <div key={s.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
//               <div className="flex items-center gap-3">
//                 <CheckCircle size={18} className="text-green-600" />
//                 <span className="font-medium text-gray-800">{s.name}</span>
//               </div>
//               <button onClick={() => handleStart(s.id)} disabled={starting}
//                 className="btn-primary text-xs py-1.5 px-4">
//                 {starting ? <Spinner size="sm" color="white" /> : 'Start'}
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Optional subjects */}
//       <div className="card">
//         <h3 className="font-semibold text-gray-700 mb-1 text-sm uppercase tracking-wide">Optional Subjects</h3>
//         <p className="text-xs text-gray-500 mb-3">Select up to 3 additional subjects, then start each one</p>
//         <div className="space-y-2 mb-4">
//           {optional.map(s => {
//             const sel = selected.includes(s.id)
//             return (
//               <div key={s.id}
//                 className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all
//                   ${sel ? 'border-green-400 bg-green-50' : 'border-gray-100 hover:border-gray-300'}`}>
//                 <div className="flex items-center gap-3">
//                   <button onClick={() => toggle(s.id)}
//                     className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all
//                       ${sel ? 'bg-green-600 border-green-600' : 'border-gray-400'}`}>
//                     {sel && <CheckCircle size={12} className="text-white" />}
//                   </button>
//                   <span className="text-sm font-medium text-gray-800">{s.name}</span>
//                   {s.category && <span className="badge-gray text-xs">{s.category}</span>}
//                 </div>
//                 {sel && (
//                   <button onClick={() => handleStart(s.id)} disabled={starting}
//                     className="btn-primary text-xs py-1.5 px-4">
//                     Start
//                   </button>
//                 )}
//               </div>
//             )
//           })}
//         </div>
//         <p className="text-xs text-gray-400">{selected.length}/3 optional subjects selected</p>
//       </div>
//     </div>
//   )
// }

// // ── Exam Room ────────────────────────────────────────────────────────────────
// function ExamRoom({ session, onSubmit }) {
//   const [answers,  setAnswers]  = useState({})
//   const [current,  setCurrent]  = useState(0)
//   const [submitting, setSubmitting] = useState(false)
//   const [timeUp,   setTimeUp]   = useState(false)
//   const questions = session.questions || []

//   const select = (qid, ans) => setAnswers(prev => ({ ...prev, [qid]: ans }))
//   const answered = Object.keys(answers).length

//   const handleSubmit = async () => {
//     if (!timeUp && answered < questions.length) {
//       const ok = window.confirm(`You've answered ${answered}/${questions.length} questions. Submit anyway?`)
//       if (!ok) return
//     }
//     setSubmitting(true)
//     try {
//       const payload = questions.map(q => ({
//         question_id:     q.id,
//         selected_answer: answers[q.id] || null,
//       }))
//       const { data } = await examService.submitWAEC(session.attempt_id, payload)
//       onSubmit(data)
//     } catch (err) {
//       toast.error('Submission failed. Please try again.')
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   useEffect(() => { if (timeUp) handleSubmit() }, [timeUp])

//   const q = questions[current]

//   return (
//     <div className="max-w-3xl mx-auto">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-4">
//         <div>
//           <h2 className="font-bold text-gray-900">WAEC Examination</h2>
//           <ProgressBar answered={answered} total={questions.length} label={`${answered} answered`} />
//         </div>
//         <ExamTimer durationMinutes={session.duration_minutes} onTimeUp={() => setTimeUp(true)} />
//       </div>

//       {/* Question */}
//       {q && (
//         <QuestionCard
//           question={q}
//           index={current}
//           total={questions.length}
//           selected={answers[q.id]}
//           onSelect={select}
//         />
//       )}

//       {/* Navigation */}
//       <div className="flex items-center justify-between mt-4">
//         <button onClick={() => setCurrent(c => Math.max(0, c - 1))}
//           disabled={current === 0}
//           className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40">
//           <ChevronLeft size={16} /> Previous
//         </button>

//         {/* Question dots */}
//         <div className="flex gap-1 flex-wrap max-w-xs justify-center">
//           {questions.map((_, i) => (
//             <button key={i} onClick={() => setCurrent(i)}
//               className={`w-7 h-7 rounded-md text-xs font-medium transition-all
//                 ${i === current ? 'bg-green-600 text-white' : answers[questions[i]?.id] ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
//               {i + 1}
//             </button>
//           ))}
//         </div>

//         {current < questions.length - 1
//           ? <button onClick={() => setCurrent(c => c + 1)}
//               className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50">
//               Next <ChevronRight size={16} />
//             </button>
//           : <button onClick={handleSubmit} disabled={submitting}
//               className="btn-primary flex items-center gap-2">
//               {submitting ? <Spinner size="sm" color="white" /> : <Send size={16} />}
//               Submit
//             </button>
//         }
//       </div>
//     </div>
//   )
// }

// // ── Single Subject Result ────────────────────────────────────────────────────
// function SubjectResult({ result, onNext, onRetake }) {
//   const [advice,  setAdvice]  = useState('')
//   const [loading, setLoading] = useState(false)

//   const getAdvice = async () => {
//     setLoading(true)
//     try {
//       const { data } = await advisorService.analyzePerformance(result.id)
//       setAdvice(data.response)
//     } catch (_) {} finally { setLoading(false) }
//   }

//   const pct   = result.percentage || 0
//   const grade = result.grade || 'F9'
//   const pass  = ['A1','B2','B3','C4','C5','C6'].includes(grade)

//   const topicBreakdown = result.topic_scores || {}
//   const weakTopics     = result.weak_topics  || []

//   return (
//     <div className="max-w-2xl mx-auto">
//       {/* Result header */}
//       <div className={`card text-center mb-4 border-2 ${pass ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
//         <div className="text-5xl mb-2">{pass ? '🎉' : '📚'}</div>
//         <GradeTag grade={grade} />
//         <p className="text-3xl font-extrabold text-gray-900 mt-2">{pct.toFixed(1)}%</p>
//         <p className={`font-semibold mt-1 ${pass ? 'text-green-700' : 'text-red-600'}`}>
//           {pass ? 'Credit Earned! ✓' : 'Below Credit — Needs Improvement'}
//         </p>
//         <div className="flex justify-center gap-4 mt-3 text-sm text-gray-600">
//           <span>✓ {result.correct_answers} correct</span>
//           <span>✗ {(result.total_questions - result.correct_answers)} wrong</span>
//           <span>Total: {result.total_questions}</span>
//         </div>
//       </div>

//       {/* Topic breakdown */}
//       {Object.keys(topicBreakdown).length > 0 && (
//         <div className="card mb-4">
//           <h3 className="font-bold text-gray-900 mb-3">Topic Breakdown</h3>
//           <div className="space-y-2">
//             {Object.entries(topicBreakdown).map(([topic, data]) => {
//               const p = typeof data === 'object' ? data.percentage : data
//               const weak = weakTopics.includes(topic)
//               return (
//                 <div key={topic}>
//                   <div className="flex justify-between text-sm mb-1">
//                     <span className={`font-medium ${weak ? 'text-red-600' : 'text-gray-700'}`}>
//                       {topic} {weak && '⚠'}
//                     </span>
//                     <span className="font-bold">{p?.toFixed(0)}%</span>
//                   </div>
//                   <div className="w-full bg-gray-100 rounded-full h-1.5">
//                     <div className={`h-1.5 rounded-full ${p >= 60 ? 'bg-green-500' : p >= 40 ? 'bg-yellow-400' : 'bg-red-400'}`}
//                       style={{ width: `${p}%` }} />
//                   </div>
//                 </div>
//               )
//             })}
//           </div>
//         </div>
//       )}

//       {/* AI advice */}
//       <div className="card mb-4">
//         {advice ? (
//           <div>
//             <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
//               <Brain size={16} /> AI Advisor Feedback
//             </h3>
//             <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{advice}</p>
//           </div>
//         ) : (
//           <button onClick={getAdvice} disabled={loading}
//             className="btn-secondary w-full flex items-center justify-center gap-2">
//             {loading ? <Spinner size="sm" color="white" /> : <Brain size={16} />}
//             Get AI Performance Analysis
//           </button>
//         )}
//       </div>

//       {/* Actions */}
//       <div className="flex gap-3">
//         <button onClick={onRetake} className="btn-outline flex items-center gap-2 flex-1">
//           <RefreshCw size={16} /> Retake Another Subject
//         </button>
//         <button onClick={onNext} className="btn-primary flex items-center gap-2 flex-1">
//           Check Overall WAEC <ChevronRight size={16} />
//         </button>
//       </div>
//     </div>
//   )
// }

// // ── Overall WAEC Result ──────────────────────────────────────────────────────
// function OverallResult({ onGoJAMB, onRetake }) {
//   const [data,    setData]    = useState(null)
//   const [loading, setLoading] = useState(true)
//   const navigate = useNavigate()

//   useEffect(() => {
//     examService.getWAECOverall()
//       .then(r => setData(r.data))
//       .catch(() => toast.error('Failed to load overall WAEC results'))
//       .finally(() => setLoading(false))
//   }, [])

//   if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
//   if (!data)   return null

//   return (
//     <div className="max-w-2xl mx-auto">
//       <div className={`card text-center mb-6 border-2 ${data.passed ? 'border-green-400 bg-green-50' : 'border-red-300 bg-red-50'}`}>
//         <div className="text-5xl mb-3">{data.passed ? '🏆' : '📖'}</div>
//         <h2 className={`text-2xl font-extrabold ${data.passed ? 'text-green-700' : 'text-red-700'}`}>
//           {data.passed ? 'WAEC PASSED!' : 'Not Yet Qualified'}
//         </h2>
//         <p className="text-gray-600 mt-2 text-sm">{data.message}</p>
//         <div className="flex justify-center gap-6 mt-4">
//           <div className="text-center">
//             <p className="text-3xl font-extrabold text-gray-900">{data.total_credits}</p>
//             <p className="text-xs text-gray-500">Credits Earned</p>
//           </div>
//           <div className="text-center">
//             <p className="text-3xl font-extrabold text-gray-900">5</p>
//             <p className="text-xs text-gray-500">Credits Needed</p>
//           </div>
//         </div>
//         <div className="flex justify-center gap-4 mt-3">
//           <span className={`badge-${data.has_english ? 'green' : 'red'}`}>
//             English {data.has_english ? '✓' : '✗'}
//           </span>
//           <span className={`badge-${data.has_mathematics ? 'green' : 'red'}`}>
//             Mathematics {data.has_mathematics ? '✓' : '✗'}
//           </span>
//         </div>
//       </div>

//       {/* Subject results table */}
//       <div className="card mb-4">
//         <h3 className="font-bold text-gray-900 mb-3">Subject Grades</h3>
//         <div className="space-y-2">
//           {data.subject_results.map(r => (
//             <div key={r.subject_id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
//               <span className="text-sm font-medium text-gray-700">{r.subject_name}</span>
//               <div className="flex items-center gap-3">
//                 <span className="text-sm text-gray-500">{r.percentage?.toFixed(0)}%</span>
//                 <GradeTag grade={r.grade} />
//                 {r.is_credit ? <CheckCircle size={14} className="text-green-600" /> : <XCircle size={14} className="text-red-400" />}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="flex gap-3">
//         <button onClick={onRetake} className="btn-outline flex items-center gap-2 flex-1">
//           <RefreshCw size={16} /> Take Another Subject
//         </button>
//         {data.passed && (
//           <button onClick={() => navigate('/exams/jamb-entry')} className="btn-primary flex items-center gap-2 flex-1">
//             Proceed to JAMB 
//           </button>
//         )}
//       </div>
//     </div>
//   )
// }

// // ── Main WAEC Page ───────────────────────────────────────────────────────────
// export default function WAECPage() {
//   const [phase,   setPhase]   = useState(WAEC_PHASES.SELECT)
//   const [session, setSession] = useState(null)
//   const [result,  setResult]  = useState(null)

//   return (
//     <Layout>
//       <div className="max-w-4xl mx-auto px-6 py-8">
//         {/* Breadcrumb */}
//         <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
//           <BookOpen size={16} /> WAEC Examination
//           {phase !== WAEC_PHASES.SELECT && <><span>›</span><span className="text-gray-700 capitalize">{phase}</span></>}
//         </div>

//         {phase === WAEC_PHASES.SELECT  && <SubjectSelect onStart={s => { setSession(s); setPhase(WAEC_PHASES.EXAM) }} />}
//         {phase === WAEC_PHASES.EXAM    && session && (
//           <ExamRoom session={session} onSubmit={r => { setResult(r); setPhase(WAEC_PHASES.RESULT) }} />
//         )}
//         {phase === WAEC_PHASES.RESULT  && result && (
//           <SubjectResult result={result}
//             onNext={() => setPhase(WAEC_PHASES.OVERALL)}
//             onRetake={() => { setSession(null); setResult(null); setPhase(WAEC_PHASES.SELECT) }}
//           />
//         )}
//         {phase === WAEC_PHASES.OVERALL && (
//           <OverallResult
//             onGoJAMB={() => {}}
//             onRetake={() => { setSession(null); setResult(null); setPhase(WAEC_PHASES.SELECT) }}
//           />
//         )}
//       </div>
//     </Layout>
//   )
// }


import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import Spinner from '../../components/Spinner'
import QuestionCard from '../../components/QuestionCard'
import ExamTimer from '../../components/ExamTimer'
import ProgressBar from '../../components/ProgressBar'
import GradeTag from '../../components/GradeTag'
import { examService, practiceService, advisorService } from '../../services/examService'
import toast from 'react-hot-toast'
import { BookOpen, CheckCircle, XCircle, ChevronLeft, ChevronRight, Send, RefreshCw, Brain } from 'lucide-react'

const WAEC_PHASES = { SELECT: 'select', EXAM: 'exam', RESULT: 'result', OVERALL: 'overall' }

// ── Subject Selection ────────────────────────────────────────────────────────
function SubjectSelect({ onStart }) {
  const [subjects, setSubjects] = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(true)
  const [startingId, setStartingId] = useState(null)

  useEffect(() => {
    practiceService
      .getSubjects()
      .then((r) => setSubjects(r.data))
      .catch(() => toast.error('Failed to load subjects'))
      .finally(() => setLoading(false))
  }, [])

  const MANDATORY = ['English Language', 'Mathematics']
  const mandatory = subjects.filter((s) => MANDATORY.some((m) => s.name.includes(m)))
  const optional = subjects.filter((s) => !MANDATORY.some((m) => s.name.includes(m)))

  const mandatoryIds = mandatory.map((s) => s.id)
  const toggle = (id) => {
    if (mandatoryIds.includes(id)) return
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    )
  }

  const handleStart = async (subjectId) => {
    setStartingId(subjectId)
    try {
      const { data } = await examService.startWAEC(subjectId)
      onStart(data)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not start exam')
    } finally {
      setStartingId(null)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 bg-amber-100 rounded-2xl flex items-center justify-center border border-amber-200">
            <BookOpen size={20} className="text-amber-800" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900">WAEC Examination</h2>
            <p className="text-sm text-slate-600">50 questions · 90 minutes per subject</p>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-slate-800 leading-relaxed">
          <strong className="text-[#0B1B3A]">Rules:</strong> Take each subject separately. You need at least{' '}
          <span className="font-extrabold">5 credits</span> (including English &amp; Maths) to unlock JAMB.
          Minimum credit = <span className="font-extrabold">C6 (50%)</span>.
        </div>
      </div>

      {/* Mandatory subjects */}
      <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-sm p-6 mb-4">
        <h3 className="font-extrabold text-slate-900 mb-3 text-sm uppercase tracking-wide">
          Mandatory subjects
        </h3>

        <div className="space-y-2">
          {mandatory.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-emerald-200 bg-emerald-50/60"
            >
              <div className="flex items-center gap-3 min-w-0">
                <CheckCircle size={18} className="text-emerald-700 flex-shrink-0" />
                <span className="font-extrabold text-slate-900 truncate">{s.name}</span>
              </div>

              <button
                onClick={() => handleStart(s.id)}
                disabled={!!startingId}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0B1B3A] hover:bg-[#0A1630]
                           text-white text-xs font-extrabold transition disabled:opacity-60 shadow-sm"
              >
                {startingId === s.id ? <Spinner size="sm" color="white" /> : 'Start'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Optional subjects */}
      <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-sm p-6">
        <h3 className="font-extrabold text-slate-900 mb-1 text-sm uppercase tracking-wide">
          Optional subjects
        </h3>
        <p className="text-xs text-slate-600 mb-3">
          Select up to 3 additional subjects, then start each one.
        </p>

        <div className="space-y-2 mb-4">
          {optional.map((s) => {
            const sel = selected.includes(s.id)
            return (
              <div
                key={s.id}
                className={[
                  'flex items-center justify-between gap-3 p-4 rounded-2xl border transition',
                  sel
                    ? 'border-amber-200 bg-amber-50/70 ring-2 ring-amber-300/50'
                    : 'border-slate-200 bg-white hover:border-slate-300',
                ].join(' ')}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => toggle(s.id)}
                    className={[
                      'w-6 h-6 rounded-xl border flex items-center justify-center transition flex-shrink-0',
                      sel ? 'bg-[#0B1B3A] border-[#0B1B3A]' : 'border-slate-300 bg-white',
                    ].join(' ')}
                    aria-label={sel ? 'Unselect subject' : 'Select subject'}
                  >
                    {sel && <CheckCircle size={14} className="text-amber-300" />}
                  </button>

                  <div className="min-w-0">
                    <span className="text-sm font-extrabold text-slate-900 truncate">{s.name}</span>
                    {s.category && (
                      <div className="mt-1">
                        <span className="text-[11px] px-2.5 py-1 rounded-full border bg-slate-50 text-slate-700 border-slate-200 font-semibold">
                          {s.category}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {sel && (
                  <button
                    onClick={() => handleStart(s.id)}
                    disabled={!!startingId}
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-2xl bg-[#0B1B3A] hover:bg-[#0A1630]
                               text-white text-xs font-extrabold transition disabled:opacity-60 shadow-sm"
                  >
                    {startingId === s.id ? <Spinner size="sm" color="white" /> : 'Start'}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <p className="text-xs text-slate-500 font-semibold">{selected.length}/3 optional subjects selected</p>
      </div>
    </div>
  )
}

// ── Exam Room ────────────────────────────────────────────────────────────────
function ExamRoom({ session, onSubmit }) {
  const [answers, setAnswers] = useState({})
  const [current, setCurrent] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [timeUp, setTimeUp] = useState(false)
  const questions = session.questions || []

  const select = (qid, ans) => setAnswers((prev) => ({ ...prev, [qid]: ans }))
  const answered = Object.keys(answers).length

  const handleSubmit = async () => {
    if (!timeUp && answered < questions.length) {
      const ok = window.confirm(`You've answered ${answered}/${questions.length} questions. Submit anyway?`)
      if (!ok) return
    }
    setSubmitting(true)
    try {
      const payload = questions.map((q) => ({
        question_id: q.id,
        selected_answer: answers[q.id] || null,
      }))
      const { data } = await examService.submitWAEC(session.attempt_id, payload)
      onSubmit(data)
    } catch (err) {
      toast.error('Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (timeUp) handleSubmit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeUp])

  const q = questions[current]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="min-w-0">
          <h2 className="font-extrabold text-slate-900">WAEC Examination</h2>
          <div className="mt-2">
            <ProgressBar answered={answered} total={questions.length} label={`${answered} answered`} />
          </div>
        </div>
        <ExamTimer durationMinutes={session.duration_minutes} onTimeUp={() => setTimeUp(true)} />
      </div>

      {/* Question */}
      {q && (
        <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-sm p-2">
          <QuestionCard
            question={q}
            index={current}
            total={questions.length}
            selected={answers[q.id]}
            onSelect={select}
          />
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4 mt-4">
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white/70
                     text-sm font-semibold text-slate-700 hover:bg-white transition disabled:opacity-40"
        >
          <ChevronLeft size={16} /> Previous
        </button>

        {/* Question dots */}
        <div className="flex gap-1 flex-wrap max-w-xs justify-center">
          {questions.map((_, i) => {
            const isCurrent = i === current
            const isAnswered = !!answers[questions[i]?.id]
            return (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={[
                  'w-8 h-8 rounded-xl text-xs font-extrabold transition border',
                  isCurrent
                    ? 'bg-[#0B1B3A] text-amber-300 border-[#0B1B3A]'
                    : isAnswered
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200',
                ].join(' ')}
              >
                {i + 1}
              </button>
            )
          })}
        </div>

        {current < questions.length - 1 ? (
          <button
            onClick={() => setCurrent((c) => c + 1)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white/70
                       text-sm font-semibold text-slate-700 hover:bg-white transition"
          >
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0B1B3A] hover:bg-[#0A1630]
                       text-white font-extrabold transition disabled:opacity-60 shadow-sm"
          >
            {submitting ? <Spinner size="sm" color="white" /> : <Send size={16} className="text-amber-300" />}
            Submit
          </button>
        )}
      </div>
    </div>
  )
}

// ── Single Subject Result ────────────────────────────────────────────────────
function SubjectResult({ result, onNext, onRetake }) {
  const [advice, setAdvice] = useState('')
  const [loading, setLoading] = useState(false)

  const getAdvice = async () => {
    setLoading(true)
    try {
      const { data } = await advisorService.analyzePerformance(result.id)
      setAdvice(data.response)
    } catch (_) {
    } finally {
      setLoading(false)
    }
  }

  const pct = result.percentage || 0
  const grade = result.grade || 'F9'
  const pass = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6'].includes(grade)

  const topicBreakdown = result.topic_scores || {}
  const weakTopics = result.weak_topics || []

  return (
    <div className="max-w-3xl mx-auto">
      {/* Result header */}
      <div
        className={[
          'rounded-3xl border shadow-sm p-6 text-center mb-4',
          pass ? 'border-emerald-200 bg-emerald-50/60' : 'border-rose-200 bg-rose-50/60',
        ].join(' ')}
      >
        <div className="text-5xl mb-2">{pass ? '🎉' : '📚'}</div>
        <GradeTag grade={grade} />
        <p className="text-3xl font-extrabold text-slate-900 mt-2">{pct.toFixed(1)}%</p>

        <p className={`font-extrabold mt-1 ${pass ? 'text-emerald-800' : 'text-rose-700'}`}>
          {pass ? 'Credit earned ✓' : 'Below credit — needs improvement'}
        </p>

        <div className="flex justify-center gap-4 mt-3 text-sm text-slate-600 flex-wrap">
          <span>✓ {result.correct_answers} correct</span>
          <span>✗ {result.total_questions - result.correct_answers} wrong</span>
          <span>Total: {result.total_questions}</span>
        </div>
      </div>

      {/* Topic breakdown */}
      {Object.keys(topicBreakdown).length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-sm p-6 mb-4">
          <h3 className="font-extrabold text-slate-900 mb-3">Topic breakdown</h3>
          <div className="space-y-2">
            {Object.entries(topicBreakdown).map(([topic, data]) => {
              const p = typeof data === 'object' ? data.percentage : data
              const weak = weakTopics.includes(topic)
              const bar =
                p >= 60 ? 'bg-emerald-500' : p >= 40 ? 'bg-amber-400' : 'bg-rose-400'

              return (
                <div key={topic}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={`font-semibold ${weak ? 'text-rose-700' : 'text-slate-700'}`}>
                      {topic} {weak && '⚠'}
                    </span>
                    <span className="font-extrabold text-slate-900">{p?.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 border border-slate-200">
                    <div className={`h-2 rounded-full ${bar}`} style={{ width: `${p}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* AI advice */}
      <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-sm p-6 mb-4">
        {advice ? (
          <div>
            <h3 className="font-extrabold text-slate-900 mb-2 flex items-center gap-2">
              <Brain size={16} className="text-amber-700" /> AI advisor feedback
            </h3>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{advice}</p>
          </div>
        ) : (
          <button
            onClick={getAdvice}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl
                       bg-[#0B1B3A] hover:bg-[#0A1630] text-white font-extrabold transition disabled:opacity-60 shadow-sm"
          >
            {loading ? <Spinner size="sm" color="white" /> : <Brain size={16} className="text-amber-300" />}
            Get AI performance analysis
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onRetake}
          className="flex items-center justify-center gap-2 flex-1 px-5 py-3 rounded-2xl
                     bg-white/80 backdrop-blur border border-slate-200 text-slate-800 font-extrabold
                     hover:bg-white transition shadow-sm"
        >
          <RefreshCw size={16} className="text-amber-700" /> Retake another subject
        </button>

        <button
          onClick={onNext}
          className="flex items-center justify-center gap-2 flex-1 px-5 py-3 rounded-2xl
                     bg-[#0B1B3A] hover:bg-[#0A1630] text-white font-extrabold transition shadow-sm"
        >
          Check overall WAEC <ChevronRight size={16} className="text-amber-300" />
        </button>
      </div>
    </div>
  )
}

// ── Overall WAEC Result ──────────────────────────────────────────────────────
function OverallResult({ onGoJAMB, onRetake }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    examService
      .getWAECOverall()
      .then((r) => setData(r.data))
      .catch(() => toast.error('Failed to load overall WAEC results'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!data) return null

  return (
    <div className="max-w-3xl mx-auto">
      <div
        className={[
          'rounded-3xl border shadow-sm p-6 text-center mb-6',
          data.passed ? 'border-emerald-200 bg-emerald-50/60' : 'border-rose-200 bg-rose-50/60',
        ].join(' ')}
      >
        <div className="text-5xl mb-3">{data.passed ? '🏆' : '📖'}</div>

        <h2 className="text-2xl font-extrabold text-slate-900">
          {data.passed ? 'WAEC passed!' : 'Not yet qualified'}
        </h2>

        <p className="text-slate-600 mt-2 text-sm">{data.message}</p>

        <div className="grid grid-cols-2 gap-4 mt-5">
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-3">
            <p className="text-3xl font-extrabold text-slate-900">{data.total_credits}</p>
            <p className="text-xs text-slate-600">Credits earned</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-3">
            <p className="text-3xl font-extrabold text-slate-900">5</p>
            <p className="text-xs text-slate-600">Credits needed</p>
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-4 flex-wrap">
          <span
            className={[
              'text-[11px] font-extrabold px-2.5 py-1 rounded-full border',
              data.has_english ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200',
            ].join(' ')}
          >
            English {data.has_english ? '✓' : '✗'}
          </span>
          <span
            className={[
              'text-[11px] font-extrabold px-2.5 py-1 rounded-full border',
              data.has_mathematics ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200',
            ].join(' ')}
          >
            Mathematics {data.has_mathematics ? '✓' : '✗'}
          </span>
        </div>
      </div>

      {/* Subject results table */}
      <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-sm p-6 mb-4">
        <h3 className="font-extrabold text-slate-900 mb-3">Subject grades</h3>

        <div className="space-y-2">
          {data.subject_results.map((r) => (
            <div
              key={r.subject_id}
              className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200"
            >
              <span className="text-sm font-semibold text-slate-800">{r.subject_name}</span>

              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600">{r.percentage?.toFixed(0)}%</span>
                <GradeTag grade={r.grade} />
                {r.is_credit ? (
                  <CheckCircle size={14} className="text-emerald-700" />
                ) : (
                  <XCircle size={14} className="text-rose-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onRetake}
          className="flex items-center justify-center gap-2 flex-1 px-5 py-3 rounded-2xl
                     bg-white/80 backdrop-blur border border-slate-200 text-slate-800 font-extrabold
                     hover:bg-white transition shadow-sm"
        >
          <RefreshCw size={16} className="text-amber-700" /> Take another subject
        </button>

        {data.passed && (
          <button
            onClick={() => navigate('/exams/jamb-entry')}
            className="flex-1 px-5 py-3 rounded-2xl bg-[#0B1B3A] hover:bg-[#0A1630]
                       text-white font-extrabold transition shadow-sm"
          >
            Proceed to JAMB
          </button>
        )}
      </div>
    </div>
  )
}

// ── Main WAEC Page ───────────────────────────────────────────────────────────
export default function WAECPage() {
  const [phase, setPhase] = useState(WAEC_PHASES.SELECT)
  const [session, setSession] = useState(null)
  const [result, setResult] = useState(null)

  return (
    <Layout>
      <div className="min-h-screen bg-[#F7FAFF] text-slate-900">
        {/* Background accents */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-amber-200/35 blur-3xl" />
          <div className="absolute top-40 -left-40 h-[520px] w-[520px] rounded-full bg-sky-200/40 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-6">
            <BookOpen size={16} className="text-amber-700" />
            <span className="font-extrabold text-slate-900">WAEC Examination</span>
            {phase !== WAEC_PHASES.SELECT && (
              <>
                <span className="text-slate-400">›</span>
                <span className="text-slate-600 capitalize">{phase}</span>
              </>
            )}
          </div>

          {phase === WAEC_PHASES.SELECT && (
            <SubjectSelect
              onStart={(s) => {
                setSession(s)
                setPhase(WAEC_PHASES.EXAM)
              }}
            />
          )}

          {phase === WAEC_PHASES.EXAM && session && (
            <ExamRoom
              session={session}
              onSubmit={(r) => {
                setResult(r)
                setPhase(WAEC_PHASES.RESULT)
              }}
            />
          )}

          {phase === WAEC_PHASES.RESULT && result && (
            <SubjectResult
              result={result}
              onNext={() => setPhase(WAEC_PHASES.OVERALL)}
              onRetake={() => {
                setSession(null)
                setResult(null)
                setPhase(WAEC_PHASES.SELECT)
              }}
            />
          )}

          {phase === WAEC_PHASES.OVERALL && (
            <OverallResult
              onGoJAMB={() => {}}
              onRetake={() => {
                setSession(null)
                setResult(null)
                setPhase(WAEC_PHASES.SELECT)
              }}
            />
          )}
        </div>
      </div>
    </Layout>
  )
}