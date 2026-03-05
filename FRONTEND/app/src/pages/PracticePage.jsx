// FILE: src/pages/PracticePage.jsx
// COMPLETE REPLACEMENT
// Changes:
//  1. PracticeResult now extracts weak topics from answer_feedback (topic_name field)
//  2. "Practise Weak Topics" button directly auto-starts a new session on the weakest topic
//  3. PracticePage default export manages a startWeakSession flow that skips setup entirely
//  4. PracticeSetup still works normally for manual selection

// import { useState, useEffect } from 'react'
// import { useSearchParams } from 'react-router-dom'
// import Layout from '../components/Layout'
// import Spinner from '../components/Spinner'
// import ProgressBar from '../components/ProgressBar'
// import ExamTimer from '../components/ExamTimer'
// import { practiceService } from '../services/examService'
// import toast from 'react-hot-toast'
// import {
//   Brain, ChevronLeft, ChevronRight, Send,
//   CheckCircle, XCircle, Lightbulb, RefreshCw,
//   Star, AlertCircle, BookOpen, Target
// } from 'lucide-react'

// const PHASES = { SETUP: 'setup', EXAM: 'exam', RESULT: 'result' }

// // ─────────────────────────────────────────────────────────────────────────────
// function PracticeSetup({ onStart, preselect }) {
//   const [searchParams]                  = useSearchParams()
//   const [subjects,    setSubjects]      = useState([])
//   const [topics,      setTopics]        = useState([])
//   const [recommended, setRecommended]   = useState([])
//   const [selSubject,  setSelSubject]    = useState(null)
//   const [selTopic,    setSelTopic]      = useState(null)
//   const [numQ,        setNumQ]          = useState(10)
//   const [loading,     setLoading]       = useState(true)
//   const [loadTopics,  setLoadTopics]    = useState(false)
//   const [starting,    setStarting]      = useState(false)

//   useEffect(() => {
//     practiceService.getSubjects()
//       .then(r => {
//         const subs = r.data || []
//         setSubjects(subs)
//         // Auto-select if preselect passed from weak topics
//         if (preselect?.subject_id) {
//           const match = subs.find(s => s.id === preselect.subject_id)
//           if (match) selectSubject(match, preselect.topic_id)
//         }
//       })
//       .catch(() => toast.error('Failed to load subjects'))
//       .finally(() => setLoading(false))

//     practiceService.getRecommended()
//       .then(r => setRecommended(r.data || []))
//       .catch(() => setRecommended([]))
//   }, [])

//   const selectSubject = async (s, autoTopicId = null) => {
//     setSelSubject(s)
//     setSelTopic(null)
//     setLoadTopics(true)
//     try {
//       const { data } = await practiceService.getTopics(s.id)
//       setTopics(data)
//       // Auto-select topic from URL param or preselect
//       const urlTopicId = autoTopicId || parseInt(searchParams.get('topic_id'))
//       if (urlTopicId) {
//         const match = data.find(t => t.id === urlTopicId)
//         if (match) setSelTopic(match)
//       }
//     } catch (_) {}
//     finally { setLoadTopics(false) }
//   }

//   const handleStart = async () => {
//     if (!selSubject) { toast.error('Please select a subject'); return }
//     setStarting(true)
//     try {
//       const { data } = await practiceService.start(selSubject.id, selTopic?.id || null, numQ)
//       onStart(data)
//     } catch (err) {
//       toast.error(err.response?.data?.detail || 'Could not start session')
//     } finally { setStarting(false) }
//   }

//   if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

//   return (
//     <div className="max-w-2xl mx-auto space-y-5">
//       {/* Recommended section */}
//       {recommended.length > 0 && (
//         <div className="card bg-purple-50 border border-purple-200">
//           <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2 text-sm">
//             <Target size={15} /> AI Recommends Practising
//           </h3>
//           <div className="space-y-2">
//             {recommended.slice(0, 3).map((r, i) => (
//               <button key={i}
//                 onClick={() => {
//                   const sub = subjects.find(s => s.id === r.subject_id)
//                   if (sub) selectSubject(sub, r.topic_id)
//                 }}
//                 className="w-full text-left p-3 rounded-lg bg-white border border-purple-200
//                   hover:border-purple-400 transition-all text-sm">
//                 <p className="font-semibold text-gray-800">{r.subject_name}</p>
//                 {r.topic_name && <p className="text-xs text-purple-600">{r.topic_name}</p>}
//                 <p className="text-xs text-gray-400 mt-0.5">{r.reason}</p>
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Subject picker */}
//       <div className="card">
//         <h3 className="font-semibold text-gray-800 mb-3">Choose Subject</h3>
//         <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
//           {subjects.map(s => (
//             <button key={s.id} onClick={() => selectSubject(s)}
//               className={`p-3 rounded-xl border-2 text-sm font-medium transition-all text-left
//                 ${selSubject?.id === s.id
//                   ? 'border-purple-500 bg-purple-50 text-purple-700'
//                   : 'border-gray-200 hover:border-purple-300 text-gray-700'}`}>
//               {s.name}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Topic picker */}
//       {selSubject && (
//         <div className="card">
//           <h3 className="font-semibold text-gray-800 mb-3">
//             Choose Topic <span className="text-xs text-gray-400 font-normal">(optional — leave blank for mixed)</span>
//           </h3>
//           {loadTopics ? <Spinner size="sm" /> : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto">
//               <button
//                 onClick={() => setSelTopic(null)}
//                 className={`p-3 rounded-xl border-2 text-sm font-medium transition-all text-left
//                   ${!selTopic ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-purple-300 text-gray-700'}`}>
//                 🎲 All Topics (Mixed)
//               </button>
//               {topics.map(t => (
//                 <button key={t.id} onClick={() => setSelTopic(t)}
//                   className={`p-3 rounded-xl border-2 text-sm font-medium transition-all text-left
//                     ${selTopic?.id === t.id
//                       ? 'border-purple-500 bg-purple-50 text-purple-700'
//                       : 'border-gray-200 hover:border-purple-300 text-gray-700'}`}>
//                   {t.name}
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>
//       )}

//       {/* Questions count */}
//       <div className="card">
//         <h3 className="font-semibold text-gray-800 mb-3">Number of Questions</h3>
//         <div className="flex gap-2">
//           {[5, 10, 15, 20, 30].map(n => (
//             <button key={n} onClick={() => setNumQ(n)}
//               className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all
//                 ${numQ === n ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-purple-300'}`}>
//               {n}
//             </button>
//           ))}
//         </div>
//       </div>

//       <button onClick={handleStart} disabled={!selSubject || starting}
//         className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold
//           flex items-center justify-center gap-2 transition-all disabled:opacity-50">
//         {starting ? <Spinner size="sm" color="white" /> : <Brain size={18} />}
//         Start Practice ({numQ} questions)
//       </button>
//     </div>
//   )
// }

// // ─────────────────────────────────────────────────────────────────────────────
// function PracticeExam({ session, onSubmit }) {
//   const [answers,    setAnswers]    = useState({})
//   const [current,    setCurrent]    = useState(0)
//   const [submitting, setSubmitting] = useState(false)
//   const questions = session.questions || []
//   const answered  = Object.keys(answers).length

//   const handleSubmit = async () => {
//     if (answered < questions.length) {
//       if (!window.confirm(`${answered}/${questions.length} answered. Submit anyway?`)) return
//     }
//     setSubmitting(true)
//     try {
//       const payload = questions.map(q => ({
//         question_id: q.id, selected_answer: answers[q.id] || null
//       }))
//       const { data } = await practiceService.submit(session.session_id, payload)
//       onSubmit(data)
//     } catch (_) {
//       toast.error('Submission failed.')
//     } finally { setSubmitting(false) }
//   }

//   const q = questions[current]
//   const opts = q ? [
//     { key: 'A', text: q.option_a },
//     { key: 'B', text: q.option_b },
//     { key: 'C', text: q.option_c },
//     { key: 'D', text: q.option_d },
//   ] : []

//   return (
//     <div className="max-w-2xl mx-auto">
//       {/* Progress */}
//       <div className="flex items-center justify-between mb-4">
//         <div className="flex-1">
//           <p className="text-sm text-gray-500 mb-1">Practice · Q{current + 1}/{questions.length}</p>
//           <ProgressBar answered={answered} total={questions.length} />
//         </div>
//         <ExamTimer durationMinutes={30} onTimeUp={handleSubmit} />
//       </div>

//       {/* Question */}
//       {q && (
//         <div className="card mb-4">
//           <p className="font-semibold text-gray-900 leading-relaxed mb-4">{q.question_text}</p>
//           <div className="space-y-2">
//             {opts.map(({ key, text }) => (
//               <button key={key} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: key }))}
//                 className={`w-full text-left p-3.5 rounded-xl border-2 transition-all text-sm
//                   ${answers[q.id] === key
//                     ? 'border-purple-500 bg-purple-50 text-purple-800 font-semibold'
//                     : 'border-gray-200 hover:border-purple-300 text-gray-700'}`}>
//                 <span className={`inline-block w-6 h-6 rounded-full text-xs font-bold mr-2
//                   flex-shrink-0 text-center leading-6
//                   ${answers[q.id] === key ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
//                   {key}
//                 </span>
//                 {text}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Nav */}
//       <div className="flex items-center justify-between">
//         <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
//           className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300
//             text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40">
//           <ChevronLeft size={16} /> Prev
//         </button>

//         <div className="flex gap-1 flex-wrap max-w-xs justify-center">
//           {questions.map((_, i) => (
//             <button key={i} onClick={() => setCurrent(i)}
//               className={`w-7 h-7 rounded text-xs font-medium transition-all
//                 ${i === current ? 'bg-purple-600 text-white'
//                 : answers[questions[i]?.id] ? 'bg-green-200 text-green-800'
//                 : 'bg-gray-100 text-gray-500'}`}>
//               {i + 1}
//             </button>
//           ))}
//         </div>

//         {current < questions.length - 1
//           ? <button onClick={() => setCurrent(c => c + 1)}
//               className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300
//                 text-sm text-gray-600 hover:bg-gray-50">
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

// // ─────────────────────────────────────────────────────────────────────────────
// function PracticeResult({ result, onRetry, onPractiseWeak }) {
//   const pct      = result.percentage || 0
//   const feedback = result.answer_feedback || []

//   // ── Compute weak topics from answer feedback ──────────────────────────────
//   // Backend now returns topic_name on each AnswerFeedback item.
//   // Group wrong answers by topic, find the worst one.
//   const wrongByTopic = {}
//   feedback
//     .filter(f => !f.is_correct && f.topic_name)
//     .forEach(f => {
//       if (!wrongByTopic[f.topic_name]) {
//         wrongByTopic[f.topic_name] = { count: 0, topic_id: f.topic_id }
//       }
//       wrongByTopic[f.topic_name].count++
//     })

//   const weakTopics = Object.entries(wrongByTopic)
//     .sort((a, b) => b[1].count - a[1].count)   // most-wrong first

//   const hasWeak = weakTopics.length > 0

//   return (
//     <div className="max-w-2xl mx-auto">
//       {/* Score */}
//       <div className={`card text-center mb-5 border-2 ${
//         pct >= 60 ? 'border-green-300 bg-green-50'
//         : pct >= 40 ? 'border-yellow-300 bg-yellow-50'
//         : 'border-red-200 bg-red-50'
//       }`}>
//         <div className="text-4xl mb-2">{pct >= 60 ? '🌟' : pct >= 40 ? '👍' : '📚'}</div>
//         <p className="text-4xl font-extrabold text-gray-900">{pct.toFixed(1)}%</p>
//         <p className="text-gray-500 mt-1">
//           {result.correct ?? result.correct_count ?? 0}/{result.total} correct
//         </p>
//         <p className={`font-semibold mt-2 ${
//           pct >= 60 ? 'text-green-700' : pct >= 40 ? 'text-yellow-700' : 'text-red-600'
//         }`}>
//           {pct >= 60 ? 'Excellent! Keep it up.'
//            : pct >= 40 ? 'Good effort — review your mistakes.'
//            : 'Needs more practice — focus on weak topics.'}
//         </p>
//       </div>

//       {/* Weak topics summary card — shown when there are wrong answers with topics */}
//       {hasWeak && (
//         <div className="card mb-5 border border-orange-200 bg-orange-50">
//           <h3 className="font-bold text-orange-800 mb-3 flex items-center gap-2 text-sm">
//             <AlertCircle size={15} /> Topics to Focus On
//           </h3>
//           <div className="space-y-2 mb-4">
//             {weakTopics.map(([topic, { count }]) => (
//               <div key={topic} className="flex items-center justify-between text-sm">
//                 <div className="flex items-center gap-2">
//                   <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
//                   <span className="font-medium text-gray-800">{topic}</span>
//                 </div>
//                 <span className="text-xs text-orange-700 font-semibold bg-orange-100 px-2 py-0.5 rounded-full">
//                   {count} wrong
//                 </span>
//               </div>
//             ))}
//           </div>

//           {/* THE PRACTISE WEAK TOPICS BUTTON — directly starts session */}
//           <button
//             onClick={() => onPractiseWeak(
//               result.subject_id,
//               weakTopics[0][1].topic_id,
//               weakTopics[0][0]
//             )}
//             className="btn-weak w-full"
//           >
//             <Brain size={18} />
//             Practise Weak Topics — {weakTopics[0][0]}
//           </button>
//         </div>
//       )}

//       {/* Per-question answer review */}
//       <div className="card mb-5">
//         <h3 className="font-bold text-gray-900 mb-4">Answer Review</h3>
//         <div className="space-y-4">
//           {feedback.map((f, i) => (
//             <div key={i} className={`p-4 rounded-xl border-2 ${
//               f.is_correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
//             }`}>
//               <div className="flex items-start gap-2 mb-2">
//                 {f.is_correct
//                   ? <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
//                   : <XCircle    size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
//                 }
//                 <p className="text-sm font-medium text-gray-800">{f.question_text}</p>
//               </div>
//               <div className="ml-6 space-y-1 text-xs">
//                 {f.topic_name && (
//                   <p className="text-gray-400 mb-1">
//                     Topic: <span className="font-medium text-gray-600">{f.topic_name}</span>
//                   </p>
//                 )}
//                 <p className="text-gray-500">
//                   Your answer:{' '}
//                   <span className={`font-bold ${f.is_correct ? 'text-green-700' : 'text-red-600'}`}>
//                     {f.your_answer || f.selected_answer || 'Skipped'}
//                   </span>
//                 </p>
//                 {!f.is_correct && (
//                   <p className="text-gray-500">
//                     Correct: <span className="font-bold text-green-700">{f.correct_answer}</span>
//                   </p>
//                 )}
//                 {f.explanation && (
//                   <div className="flex items-start gap-1 mt-2 bg-white rounded-lg p-2 border border-yellow-200">
//                     <Lightbulb size={12} className="text-yellow-500 flex-shrink-0 mt-0.5" />
//                     <p className="text-gray-600 leading-relaxed">{f.explanation}</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Bottom actions */}
//       <button onClick={onRetry} className="btn-outline w-full flex items-center justify-center gap-2">
//         <RefreshCw size={16} /> New Session
//       </button>
//     </div>
//   )
// }

// // ─────────────────────────────────────────────────────────────────────────────
// export default function PracticePage() {
//   const [phase,     setPhase]     = useState(PHASES.SETUP)
//   const [session,   setSession]   = useState(null)
//   const [result,    setResult]    = useState(null)
//   const [preselect, setPreselect] = useState(null)   // { subject_id, topic_id } for auto-select
//   const [autoStarting, setAutoStarting] = useState(false)

//   // Called when "Practise Weak Topics" button is clicked on result screen
//   // Directly POSTs to start a new practice session without going through setup UI
//   const handlePractiseWeak = async (subjectId, topicId, topicName) => {
//     if (!subjectId) {
//       // Subject ID missing — fall back to setup with preselected topic
//       setPreselect({ subject_id: null, topic_id: topicId })
//       setSession(null)
//       setResult(null)
//       setPhase(PHASES.SETUP)
//       return
//     }

//     setAutoStarting(true)
//     try {
//       const { data } = await practiceService.start(subjectId, topicId, 10)
//       setSession(data)
//       setResult(null)
//       setPhase(PHASES.EXAM)
//       toast.success(`Practising: ${topicName}`, { icon: '🎯' })
//     } catch (err) {
//       toast.error(err.response?.data?.detail || 'Could not start weak topic session')
//       // Fall back to setup with topic preselected
//       setPreselect({ subject_id: subjectId, topic_id: topicId })
//       setSession(null)
//       setResult(null)
//       setPhase(PHASES.SETUP)
//     } finally {
//       setAutoStarting(false)
//     }
//   }

//   const resetToSetup = () => {
//     setSession(null)
//     setResult(null)
//     setPreselect(null)
//     setPhase(PHASES.SETUP)
//   }

//   return (
//     <Layout>
//       <div className="max-w-4xl mx-auto px-6 py-8">
//         {/* Breadcrumb */}
//         <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
//           <Brain size={16} className="text-purple-600" />
//           <span className="font-medium text-gray-700">Practice Mode</span>
//           {phase !== PHASES.SETUP && (
//             <>
//               <span>›</span>
//               <span className="text-gray-600 capitalize">{phase}</span>
//             </>
//           )}
//         </div>

//         {/* Auto-starting overlay */}
//         {autoStarting && (
//           <div className="flex flex-col items-center justify-center py-24 gap-4">
//             <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center">
//               <Brain size={32} className="text-purple-600 animate-pulse" />
//             </div>
//             <p className="text-gray-700 font-semibold">Loading weak topic questions...</p>
//             <p className="text-sm text-gray-400">Targeting your weakest area</p>
//           </div>
//         )}

//         {/* Normal phases */}
//         {!autoStarting && phase === PHASES.SETUP && (
//           <PracticeSetup
//             preselect={preselect}
//             onStart={s => { setSession(s); setPhase(PHASES.EXAM) }}
//           />
//         )}
//         {!autoStarting && phase === PHASES.EXAM && session && (
//           <PracticeExam
//             session={session}
//             onSubmit={r => { setResult(r); setPhase(PHASES.RESULT) }}
//           />
//         )}
//         {!autoStarting && phase === PHASES.RESULT && result && (
//           <PracticeResult
//             result={result}
//             onRetry={resetToSetup}
//             onPractiseWeak={handlePractiseWeak}
//           />
//         )}
//       </div>
//     </Layout>
//   )
// }


import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import ProgressBar from '../components/ProgressBar'
import ExamTimer from '../components/ExamTimer'
import { practiceService } from '../services/examService'
import toast from 'react-hot-toast'
import {
  Brain,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle,
  XCircle,
  Lightbulb,
  RefreshCw,
  AlertCircle,
  Target,
} from 'lucide-react'

const PHASES = { SETUP: 'setup', EXAM: 'exam', RESULT: 'result' }

// ─────────────────────────────────────────────────────────────────────────────
function PracticeSetup({ onStart, preselect }) {
  const [searchParams] = useSearchParams()
  const [subjects, setSubjects] = useState([])
  const [topics, setTopics] = useState([])
  const [recommended, setRecommended] = useState([])
  const [selSubject, setSelSubject] = useState(null)
  const [selTopic, setSelTopic] = useState(null)
  const [numQ, setNumQ] = useState(10)
  const [loading, setLoading] = useState(true)
  const [loadTopics, setLoadTopics] = useState(false)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    practiceService
      .getSubjects()
      .then((r) => {
        const subs = r.data || []
        setSubjects(subs)
        // Auto-select if preselect passed from weak topics
        if (preselect?.subject_id) {
          const match = subs.find((s) => s.id === preselect.subject_id)
          if (match) selectSubject(match, preselect.topic_id)
        }
      })
      .catch(() => toast.error('Failed to load subjects'))
      .finally(() => setLoading(false))

    practiceService
      .getRecommended()
      .then((r) => setRecommended(r.data || []))
      .catch(() => setRecommended([]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectSubject = async (s, autoTopicId = null) => {
    setSelSubject(s)
    setSelTopic(null)
    setLoadTopics(true)
    try {
      const { data } = await practiceService.getTopics(s.id)
      setTopics(data)
      // Auto-select topic from URL param or preselect
      const urlTopicId = autoTopicId || parseInt(searchParams.get('topic_id'))
      if (urlTopicId) {
        const match = data.find((t) => t.id === urlTopicId)
        if (match) setSelTopic(match)
      }
    } catch (_) {
    } finally {
      setLoadTopics(false)
    }
  }

  const handleStart = async () => {
    if (!selSubject) {
      toast.error('Please select a subject')
      return
    }
    setStarting(true)
    try {
      const { data } = await practiceService.start(selSubject.id, selTopic?.id || null, numQ)
      onStart(data)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not start session')
    } finally {
      setStarting(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Recommended section */}
      {recommended.length > 0 && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50/60 shadow-sm p-6">
          <h3 className="font-extrabold text-slate-900 mb-3 flex items-center gap-2 text-sm">
            <Target size={15} className="text-amber-700" /> AI recommends practising
          </h3>
          <div className="space-y-2">
            {recommended.slice(0, 3).map((r, i) => (
              <button
                key={i}
                onClick={() => {
                  const sub = subjects.find((s) => s.id === r.subject_id)
                  if (sub) selectSubject(sub, r.topic_id)
                }}
                className="w-full text-left p-4 rounded-2xl bg-white/80 backdrop-blur border border-slate-200
                           hover:border-amber-200 hover:bg-white transition text-sm"
              >
                <p className="font-extrabold text-slate-900">{r.subject_name}</p>
                {r.topic_name && <p className="text-xs text-amber-800 font-semibold mt-0.5">{r.topic_name}</p>}
                <p className="text-xs text-slate-500 mt-1">{r.reason}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Subject picker */}
      <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur shadow-sm p-6">
        <h3 className="font-extrabold text-slate-900 mb-3">Choose subject</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {subjects.map((s) => {
            const active = selSubject?.id === s.id
            return (
              <button
                key={s.id}
                onClick={() => selectSubject(s)}
                className={[
                  'p-3 rounded-2xl border text-sm font-semibold transition text-left',
                  active
                    ? 'border-amber-200 bg-amber-50 text-[#0B1B3A] ring-2 ring-amber-300/60'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700',
                ].join(' ')}
              >
                {s.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Topic picker */}
      {selSubject && (
        <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur shadow-sm p-6">
          <h3 className="font-extrabold text-slate-900 mb-3">
            Choose topic{' '}
            <span className="text-xs text-slate-500 font-normal">(optional — leave blank for mixed)</span>
          </h3>

          {loadTopics ? (
            <Spinner size="sm" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              <button
                onClick={() => setSelTopic(null)}
                className={[
                  'p-3 rounded-2xl border text-sm font-semibold transition text-left',
                  !selTopic
                    ? 'border-amber-200 bg-amber-50 text-[#0B1B3A] ring-2 ring-amber-300/60'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700',
                ].join(' ')}
              >
                🎲 All Topics (Mixed)
              </button>

              {topics.map((t) => {
                const active = selTopic?.id === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelTopic(t)}
                    className={[
                      'p-3 rounded-2xl border text-sm font-semibold transition text-left',
                      active
                        ? 'border-amber-200 bg-amber-50 text-[#0B1B3A] ring-2 ring-amber-300/60'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700',
                    ].join(' ')}
                  >
                    {t.name}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Questions count */}
      <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur shadow-sm p-6">
        <h3 className="font-extrabold text-slate-900 mb-3">Number of questions</h3>
        <div className="flex gap-2">
          {[5, 10, 15, 20, 30].map((n) => {
            const active = numQ === n
            return (
              <button
                key={n}
                onClick={() => setNumQ(n)}
                className={[
                  'flex-1 py-2.5 rounded-2xl border text-sm font-extrabold transition',
                  active
                    ? 'border-amber-200 bg-amber-50 text-[#0B1B3A] ring-2 ring-amber-300/60'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
                ].join(' ')}
              >
                {n}
              </button>
            )
          })}
        </div>
      </div>

      <button
        onClick={handleStart}
        disabled={!selSubject || starting}
        className="w-full py-3.5 rounded-2xl bg-[#0B1B3A] hover:bg-[#0A1630] text-white font-extrabold
                   inline-flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-sm"
      >
        {starting ? <Spinner size="sm" color="white" /> : <Brain size={18} className="text-amber-300" />}
        Start practice ({numQ} questions)
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
function PracticeExam({ session, onSubmit }) {
  const [answers, setAnswers] = useState({})
  const [current, setCurrent] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const questions = session.questions || []
  const answered = Object.keys(answers).length

  const handleSubmit = async () => {
    if (answered < questions.length) {
      if (!window.confirm(`${answered}/${questions.length} answered. Submit anyway?`)) return
    }
    setSubmitting(true)
    try {
      const payload = questions.map((q) => ({
        question_id: q.id,
        selected_answer: answers[q.id] || null,
      }))
      const { data } = await practiceService.submit(session.session_id, payload)
      onSubmit(data)
    } catch (_) {
      toast.error('Submission failed.')
    } finally {
      setSubmitting(false)
    }
  }

  const q = questions[current]
  const opts = q
    ? [
        { key: 'A', text: q.option_a },
        { key: 'B', text: q.option_b },
        { key: 'C', text: q.option_c },
        { key: 'D', text: q.option_d },
      ]
    : []

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex-1">
          <p className="text-sm text-slate-600 mb-2">
            Practice · Q{current + 1}/{questions.length}
          </p>
          <ProgressBar answered={answered} total={questions.length} />
        </div>
        <ExamTimer durationMinutes={30} onTimeUp={handleSubmit} />
      </div>

      {/* Question */}
      {q && (
        <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur shadow-sm p-6 mb-4">
          <p className="font-extrabold text-slate-900 leading-relaxed mb-4">{q.question_text}</p>
          <div className="space-y-2">
            {opts.map(({ key, text }) => {
              const picked = answers[q.id] === key
              return (
                <button
                  key={key}
                  onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: key }))}
                  className={[
                    'w-full text-left p-4 rounded-2xl border transition text-sm',
                    picked
                      ? 'border-amber-200 bg-amber-50 text-[#0B1B3A] ring-2 ring-amber-300/60'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'inline-flex w-7 h-7 rounded-full text-xs font-extrabold mr-2 items-center justify-center',
                      picked ? 'bg-[#0B1B3A] text-amber-300' : 'bg-slate-100 text-slate-600',
                    ].join(' ')}
                  >
                    {key}
                  </span>
                  {text}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Nav */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white/70
                     text-sm font-semibold text-slate-700 hover:bg-white transition disabled:opacity-40"
        >
          <ChevronLeft size={16} /> Prev
        </button>

        <div className="flex gap-1 flex-wrap max-w-xs justify-center">
          {questions.map((_, i) => {
            const isCurrent = i === current
            const isAnswered = !!answers[questions[i]?.id]
            return (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={[
                  'w-8 h-8 rounded-xl text-xs font-extrabold transition',
                  isCurrent
                    ? 'bg-[#0B1B3A] text-amber-300'
                    : isAnswered
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200',
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
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white/70
                       text-sm font-semibold text-slate-700 hover:bg-white transition"
          >
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B1B3A] hover:bg-[#0A1630]
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

// ─────────────────────────────────────────────────────────────────────────────
function PracticeResult({ result, onRetry, onPractiseWeak }) {
  const pct = result.percentage || 0
  const feedback = result.answer_feedback || []

  const wrongByTopic = {}
  feedback
    .filter((f) => !f.is_correct && f.topic_name)
    .forEach((f) => {
      if (!wrongByTopic[f.topic_name]) {
        wrongByTopic[f.topic_name] = { count: 0, topic_id: f.topic_id }
      }
      wrongByTopic[f.topic_name].count++
    })

  const weakTopics = Object.entries(wrongByTopic).sort((a, b) => b[1].count - a[1].count)
  const hasWeak = weakTopics.length > 0

  const scoreBox =
    pct >= 60
      ? 'border-emerald-200 bg-emerald-50/70'
      : pct >= 40
        ? 'border-amber-200 bg-amber-50/70'
        : 'border-rose-200 bg-rose-50/70'

  const scoreText =
    pct >= 60 ? 'text-emerald-800' : pct >= 40 ? 'text-amber-800' : 'text-rose-800'

  return (
    <div className="max-w-3xl mx-auto">
      {/* Score */}
      <div className={`rounded-3xl border shadow-sm p-6 text-center mb-5 ${scoreBox}`}>
        <div className="text-4xl mb-2">{pct >= 60 ? '🌟' : pct >= 40 ? '👍' : '📚'}</div>
        <p className={`text-4xl font-extrabold ${scoreText}`}>{pct.toFixed(1)}%</p>
        <p className="text-slate-600 mt-1">
          {result.correct ?? result.correct_count ?? 0}/{result.total} correct
        </p>
        <p className={`font-extrabold mt-2 ${scoreText}`}>
          {pct >= 60
            ? 'Excellent! Keep it up.'
            : pct >= 40
              ? 'Good effort — review your mistakes.'
              : 'Needs more practice — focus on weak topics.'}
        </p>
      </div>

      {/* Weak topics */}
      {hasWeak && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50/60 shadow-sm p-6 mb-5">
          <h3 className="font-extrabold text-slate-900 mb-3 flex items-center gap-2 text-sm">
            <AlertCircle size={15} className="text-amber-700" /> Topics to focus on
          </h3>

          <div className="space-y-2 mb-4">
            {weakTopics.map(([topic, { count }]) => (
              <div key={topic} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                  <span className="font-semibold text-slate-800 truncate">{topic}</span>
                </div>
                <span className="text-xs text-amber-800 font-extrabold bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                  {count} wrong
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() =>
              onPractiseWeak(result.subject_id, weakTopics[0][1].topic_id, weakTopics[0][0])
            }
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl
                       bg-[#0B1B3A] hover:bg-[#0A1630] text-white font-extrabold transition shadow-sm"
          >
            <Brain size={18} className="text-amber-300" />
            Practise weak topic — {weakTopics[0][0]}
          </button>
        </div>
      )}

      {/* Answer Review */}
      <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur shadow-sm p-6 mb-5">
        <h3 className="font-extrabold text-slate-900 mb-4">Answer review</h3>
        <div className="space-y-4">
          {feedback.map((f, i) => (
            <div
              key={i}
              className={[
                'p-4 rounded-2xl border',
                f.is_correct ? 'border-emerald-200 bg-emerald-50/60' : 'border-rose-200 bg-rose-50/60',
              ].join(' ')}
            >
              <div className="flex items-start gap-2 mb-2">
                {f.is_correct ? (
                  <CheckCircle size={18} className="text-emerald-700 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle size={18} className="text-rose-600 flex-shrink-0 mt-0.5" />
                )}
                <p className="text-sm font-semibold text-slate-800">{f.question_text}</p>
              </div>

              <div className="ml-6 space-y-1 text-xs">
                {f.topic_name && (
                  <p className="text-slate-500 mb-1">
                    Topic: <span className="font-semibold text-slate-700">{f.topic_name}</span>
                  </p>
                )}

                <p className="text-slate-600">
                  Your answer:{' '}
                  <span className={`font-extrabold ${f.is_correct ? 'text-emerald-800' : 'text-rose-700'}`}>
                    {f.your_answer || f.selected_answer || 'Skipped'}
                  </span>
                </p>

                {!f.is_correct && (
                  <p className="text-slate-600">
                    Correct: <span className="font-extrabold text-emerald-800">{f.correct_answer}</span>
                  </p>
                )}

                {f.explanation && (
                  <div className="flex items-start gap-2 mt-3 bg-white rounded-xl p-3 border border-amber-200">
                    <Lightbulb size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-slate-700 leading-relaxed">{f.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom actions */}
      <button
        onClick={onRetry}
        className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl
                   bg-white/80 backdrop-blur border border-slate-200 text-slate-800 font-extrabold
                   hover:bg-white transition shadow-sm"
      >
        <RefreshCw size={16} className="text-amber-700" /> New session
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function PracticePage() {
  const [phase, setPhase] = useState(PHASES.SETUP)
  const [session, setSession] = useState(null)
  const [result, setResult] = useState(null)
  const [preselect, setPreselect] = useState(null) // { subject_id, topic_id } for auto-select
  const [autoStarting, setAutoStarting] = useState(false)

  const handlePractiseWeak = async (subjectId, topicId, topicName) => {
    if (!subjectId) {
      setPreselect({ subject_id: null, topic_id: topicId })
      setSession(null)
      setResult(null)
      setPhase(PHASES.SETUP)
      return
    }

    setAutoStarting(true)
    try {
      const { data } = await practiceService.start(subjectId, topicId, 10)
      setSession(data)
      setResult(null)
      setPhase(PHASES.EXAM)
      toast.success(`Practising: ${topicName}`, { icon: '🎯' })
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not start weak topic session')
      setPreselect({ subject_id: subjectId, topic_id: topicId })
      setSession(null)
      setResult(null)
      setPhase(PHASES.SETUP)
    } finally {
      setAutoStarting(false)
    }
  }

  const resetToSetup = () => {
    setSession(null)
    setResult(null)
    setPreselect(null)
    setPhase(PHASES.SETUP)
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#F7FAFF] text-slate-900">
        {/* Background accents */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-amber-200/35 blur-3xl" />
          <div className="absolute top-40 -left-40 h-[520px] w-[520px] rounded-full bg-sky-200/40 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 py-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-6">
            <Brain size={16} className="text-amber-700" />
            <span className="font-extrabold text-slate-900">Practice Mode</span>
            {phase !== PHASES.SETUP && (
              <>
                <span className="text-slate-400">›</span>
                <span className="text-slate-600 capitalize">{phase}</span>
              </>
            )}
          </div>

          {/* Auto-starting overlay */}
          {autoStarting && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-16 h-16 bg-[#0B1B3A] rounded-3xl flex items-center justify-center shadow-sm">
                <Brain size={32} className="text-amber-300 animate-pulse" />
              </div>
              <p className="text-slate-900 font-extrabold">Loading weak topic questions...</p>
              <p className="text-sm text-slate-600">Targeting your weakest area</p>
            </div>
          )}

          {/* Normal phases */}
          {!autoStarting && phase === PHASES.SETUP && (
            <PracticeSetup
              preselect={preselect}
              onStart={(s) => {
                setSession(s)
                setPhase(PHASES.EXAM)
              }}
            />
          )}

          {!autoStarting && phase === PHASES.EXAM && session && (
            <PracticeExam
              session={session}
              onSubmit={(r) => {
                setResult(r)
                setPhase(PHASES.RESULT)
              }}
            />
          )}

          {!autoStarting && phase === PHASES.RESULT && result && (
            <PracticeResult result={result} onRetry={resetToSetup} onPractiseWeak={handlePractiseWeak} />
          )}
        </div>
      </div>
    </Layout>
  )
}