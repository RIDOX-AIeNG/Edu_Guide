// import { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import Layout from '../components/Layout'
// import Spinner from '../components/Spinner'
// import { useAuth } from '../context/AuthContext'
// import { dashboardService } from '../services/examService'
// import {
//   CheckCircle, Lock, ChevronRight, BookOpen,
//   GraduationCap, Trophy, Award, Star, Brain, TrendingUp
// } from 'lucide-react'

// const STAGE_ORDER = ['onboarding', 'waec', 'jamb', 'post_utme', 'admitted', 'completed']

// const STAGES = [
//   {
//     key:    'waec',
//     label:  'WAEC / O-Levels',
//     icon:   BookOpen,
//     color:  { ring: 'ring-yellow-400', bg: 'bg-yellow-100', text: 'text-yellow-600', pill: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
//     desc:   'Pass 5 subjects at credit level (C6+), including English Language and Mathematics.',
//     tip:    'Focus on your weakest subjects first. Each mock gives instant feedback.',
//     action: { label: 'Take WAEC Mock', route: '/exams/waec' },
//   },
//   {
//     key:    'jamb',
//     label:  'JAMB / UTME',
//     icon:   GraduationCap,
//     color:  { ring: 'ring-blue-400', bg: 'bg-blue-100', text: 'text-blue-600', pill: 'bg-blue-50 text-blue-700 border-blue-200' },
//     desc:   'Score above your target university cutoff across 4 subjects (180 questions).',
//     tip:    'Practice JAMB mocks repeatedly — the questions repeat patterns year to year.',
//     action: { label: 'Take JAMB Mock', route: '/exams/jamb' },
//   },
//   {
//     key:    'post_utme',
//     label:  'Post-UTME Screening',
//     icon:   Trophy,
//     color:  { ring: 'ring-purple-400', bg: 'bg-purple-100', text: 'text-purple-600', pill: 'bg-purple-50 text-purple-700 border-purple-200' },
//     desc:   'Clear your target university\'s Post-UTME screening to secure your place.',
//     tip:    'Each university has its own format. Check past questions for your target school.',
//     action: { label: 'Take Post-UTME Mock', route: '/exams/post-utme' },
//   },
//   {
//     key:    'admitted',
//     label:  'University Admission',
//     icon:   Award,
//     color:  { ring: 'ring-green-400', bg: 'bg-green-100', text: 'text-green-600', pill: 'bg-green-50 text-green-700 border-green-200' },
//     desc:   'You have met all requirements. Congratulations on your admission!',
//     tip:    'Check your institution\'s portal for acceptance and clearance procedures.',
//     action: null,
//   },
// ]

// function stageStatus(stageKey, userStage) {
//   const userIdx  = STAGE_ORDER.indexOf(userStage || 'onboarding')
//   const stageIdx = STAGE_ORDER.indexOf(stageKey)
//   if (userIdx > stageIdx)   return 'done'
//   if (userIdx === stageIdx) return 'active'
//   return 'locked'
// }

// export default function JourneyPage() {
//   const { user }  = useAuth()
//   const navigate  = useNavigate()
//   const [dash,    setDash]    = useState(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     dashboardService.getDashboard()
//       .then(r => setDash(r.data))
//       .catch(() => {})
//       .finally(() => setLoading(false))
//   }, [])

//   const userStage  = user?.journey_stage || 'onboarding'
//   const stageLabel = userStage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())

//   const waecCredits   = dash?.waec_card?.credits_earned  ?? null
//   const jambBest      = dash?.jamb_card?.best_score      ?? null
//   const practiceCount = dash?.total_practice_sessions    ?? null

//   return (
//     <Layout>
//       <div className="max-w-2xl mx-auto px-4 py-8">

//         {/* Header */}
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold text-gray-900">My Journey</h1>
//           <p className="text-sm text-gray-500 mt-1">
//             Your step-by-step path from O-Levels to university admission.
//           </p>
//         </div>

//         {/* Current stage banner */}
//         <div className="rounded-2xl bg-gradient-to-br from-green-600 to-green-700 text-white p-5 mb-6 shadow-lg">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-green-200 text-xs font-semibold uppercase tracking-widest mb-1">
//                 Current Stage
//               </p>
//               <p className="text-2xl font-black">{stageLabel}</p>
//               <p className="text-green-100 text-sm mt-1.5">
//                 {userStage === 'onboarding' && 'Begin with WAEC — 5 credits unlock everything.'}
//                 {userStage === 'waec'       && 'Keep practising — every credit gets you closer.'}
//                 {userStage === 'jamb'       && 'WAEC done ✓ — now hit your JAMB target score.'}
//                 {userStage === 'post_utme'  && 'JAMB done ✓ — one more exam to your admission!'}
//                 {(userStage === 'admitted' || userStage === 'completed') && '🎉 You made it! Welcome to university!'}
//               </p>
//             </div>
//             <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 ml-4">
//               <Star size={26} className="text-white" />
//             </div>
//           </div>

//           {/* Quick stats */}
//           {!loading && (
//             <div className="flex gap-4 mt-4 pt-4 border-t border-green-500/40">
//               {waecCredits !== null && (
//                 <div className="text-center">
//                   <p className="text-2xl font-black">{waecCredits}</p>
//                   <p className="text-green-200 text-xs">WAEC Credits</p>
//                 </div>
//               )}
//               {jambBest !== null && (
//                 <div className="text-center">
//                   <p className="text-2xl font-black">{jambBest}</p>
//                   <p className="text-green-200 text-xs">Best JAMB</p>
//                 </div>
//               )}
//               {practiceCount !== null && (
//                 <div className="text-center">
//                   <p className="text-2xl font-black">{practiceCount}</p>
//                   <p className="text-green-200 text-xs">Practice Sessions</p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Stage timeline */}
//         {loading ? (
//           <div className="flex justify-center py-12"><Spinner size="lg" /></div>
//         ) : (
//           <div className="space-y-3 mb-6">
//             {STAGES.map((stage) => {
//               const status   = stageStatus(stage.key, userStage)
//               const c        = stage.color
//               const Icon     = stage.icon
//               const isDone   = status === 'done'
//               const isActive = status === 'active'
//               const isLocked = status === 'locked'

//               return (
//                 <div key={stage.key}
//                   className={`rounded-2xl border-2 p-4 transition-all ${
//                     isDone     ? 'border-green-200 bg-green-50'
//                     : isActive ? `${c.ring.replace('ring','border')} bg-white shadow-md`
//                     : 'border-gray-100 bg-gray-50'
//                   } ${isLocked ? 'opacity-50' : ''}`}>

//                   <div className="flex items-start gap-4">
//                     {/* Icon */}
//                     <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
//                       isDone ? 'bg-green-100' : isLocked ? 'bg-gray-100' : c.bg
//                     }`}>
//                       {isDone   ? <CheckCircle size={22} className="text-green-600" />
//                       : isLocked ? <Lock size={18} className="text-gray-400" />
//                       : <Icon size={20} className={c.text} />}
//                     </div>

//                     {/* Text */}
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-center gap-2 flex-wrap">
//                         <p className={`font-bold text-sm ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>
//                           {stage.label}
//                         </p>
//                         {isDone   && <span className="text-xs px-2 py-0.5 rounded-full font-semibold border bg-green-50 text-green-700 border-green-200">✓ Done</span>}
//                         {isActive && <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${c.pill}`}>In Progress</span>}
//                         {isLocked && <span className="text-xs px-2 py-0.5 rounded-full font-medium border bg-gray-50 text-gray-400 border-gray-200">Locked</span>}
//                       </div>
//                       <p className={`text-xs mt-0.5 ${isLocked ? 'text-gray-400' : 'text-gray-500'}`}>
//                         {stage.desc}
//                       </p>
//                       {isActive && (
//                         <p className="text-xs text-blue-600 mt-1 font-medium">
//                           💡 {stage.tip}
//                         </p>
//                       )}
//                       {stage.key === 'waec' && waecCredits !== null && !isLocked && (
//                         <p className={`text-xs font-semibold mt-1 ${waecCredits >= 5 ? 'text-green-600' : 'text-amber-600'}`}>
//                           {waecCredits}/5 credits earned {waecCredits >= 5 ? '✓' : `— need ${5 - waecCredits} more`}
//                         </p>
//                       )}
//                       {stage.key === 'jamb' && jambBest !== null && !isLocked && (
//                         <p className="text-xs font-semibold mt-1 text-blue-600">
//                           Best JAMB score: {jambBest}/400
//                         </p>
//                       )}
//                     </div>

//                     {/* Action button */}
//                     {isActive && stage.action && (
//                       <button
//                         onClick={() => navigate(stage.action.route)}
//                         className="flex items-center gap-1.5 px-3 py-2 bg-gray-900 hover:bg-gray-700
//                           text-white text-xs font-semibold rounded-lg transition-all flex-shrink-0 whitespace-nowrap">
//                         {stage.action.label}
//                         <ChevronRight size={12} />
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               )
//             })}
//           </div>
//         )}

//         {/* Bottom quick links */}
//         <div className="grid grid-cols-2 gap-3">
//           <button onClick={() => navigate('/practice')}
//             className="rounded-2xl border-2 border-gray-100 hover:border-purple-300 bg-white p-4
//               text-center hover:shadow-md transition-all">
//             <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
//               <Brain size={18} className="text-purple-600" />
//             </div>
//             <p className="text-sm font-bold text-gray-800">Practice</p>
//             <p className="text-xs text-gray-500">Improve weak areas</p>
//           </button>

//           {/* FIXED: was navigate('/info-guide'), now correctly routes to /admission-guide */}
//           <button onClick={() => navigate('/admission-guide')}
//             className="rounded-2xl border-2 border-gray-100 hover:border-blue-300 bg-white p-4
//               text-center hover:shadow-md transition-all">
//             <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
//               <TrendingUp size={18} className="text-blue-600" />
//             </div>
//             <p className="text-sm font-bold text-gray-800">Admission Guide</p>
//             <p className="text-xs text-gray-500">Check your chances</p>
//           </button>
//         </div>

//       </div>
//     </Layout>
//   )
// }


import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import { useAuth } from '../context/AuthContext'
import { dashboardService } from '../services/examService'
import {
  CheckCircle,
  Lock,
  ChevronRight,
  BookOpen,
  GraduationCap,
  Trophy,
  Award,
  Star,
  Brain,
  TrendingUp,
  Map,
} from 'lucide-react'

const STAGE_ORDER = ['onboarding', 'waec', 'jamb', 'post_utme', 'admitted', 'completed']

// Theme-consistent stage colors (navy + amber + soft accents)
const STAGES = [
  {
    key: 'waec',
    label: 'WAEC / O-Levels',
    icon: BookOpen,
    color: {
      ring: 'ring-amber-300/70',
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      pill: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    desc: 'Pass 5 subjects at credit level (C6+), including English Language and Mathematics.',
    tip: 'Focus on your weakest subjects first. Each mock gives instant feedback.',
    action: { label: 'Take WAEC Mock', route: '/exams/waec' },
  },
  {
    key: 'jamb',
    label: 'JAMB / UTME',
    icon: GraduationCap,
    color: {
      ring: 'ring-sky-300/70',
      bg: 'bg-sky-100',
      text: 'text-sky-800',
      pill: 'bg-sky-50 text-sky-800 border-sky-200',
    },
    desc: 'Score above your target university cutoff across 4 subjects (180 questions).',
    tip: 'Practice JAMB mocks repeatedly — the questions repeat patterns year to year.',
    action: { label: 'Take JAMB Mock', route: '/exams/jamb' },
  },
  {
    key: 'post_utme',
    label: 'Post-UTME Screening',
    icon: Trophy,
    color: {
      ring: 'ring-indigo-300/70',
      bg: 'bg-indigo-100',
      text: 'text-indigo-800',
      pill: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    },
    desc: "Clear your target university's Post-UTME screening to secure your place.",
    tip: 'Each university has its own format. Check past questions for your target school.',
    action: { label: 'Take Post-UTME Mock', route: '/exams/post-utme' },
  },
  {
    key: 'admitted',
    label: 'University Admission',
    icon: Award,
    color: {
      ring: 'ring-emerald-300/70',
      bg: 'bg-emerald-100',
      text: 'text-emerald-800',
      pill: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    desc: 'You have met all requirements. Congratulations on your admission!',
    tip: "Check your institution's portal for acceptance and clearance procedures.",
    action: null,
  },
]

function stageStatus(stageKey, userStage) {
  const userIdx = STAGE_ORDER.indexOf(userStage || 'onboarding')
  const stageIdx = STAGE_ORDER.indexOf(stageKey)
  if (userIdx > stageIdx) return 'done'
  if (userIdx === stageIdx) return 'active'
  return 'locked'
}

export default function JourneyPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [dash, setDash] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardService
      .getDashboard()
      .then((r) => setDash(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const userStage = user?.journey_stage || 'onboarding'
  const stageLabel = userStage.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())

  const waecCredits = dash?.waec_card?.credits_earned ?? null
  const jambBest = dash?.jamb_card?.best_score ?? null
  const practiceCount = dash?.total_practice_sessions ?? null

  return (
    <Layout>
      <div className="min-h-screen bg-[#F7FAFF] text-slate-900">
        {/* Background accents (theme-consistent) */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-amber-200/35 blur-3xl" />
          <div className="absolute top-40 -left-40 h-[520px] w-[520px] rounded-full bg-sky-200/40 blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="mb-7">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0B1B3A]/10 flex items-center justify-center">
                <Map size={20} className="text-[#0B1B3A]" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  My Journey
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Your step-by-step path from O-Levels to university admission.
                </p>
              </div>
            </div>
          </div>

          {/* Current stage banner */}
          <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-xl mb-6 bg-gradient-to-r from-[#0B1B3A] to-[#102B63]">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">
                    Current stage
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-white">{stageLabel}</p>
                  <p className="text-white/85 text-sm mt-2 leading-relaxed max-w-xl">
                    {userStage === 'onboarding' && 'Begin with WAEC — 5 credits unlock everything.'}
                    {userStage === 'waec' && 'Keep practising — every credit gets you closer.'}
                    {userStage === 'jamb' && 'WAEC done ✓ — now hit your JAMB target score.'}
                    {userStage === 'post_utme' && 'JAMB done ✓ — one more exam to your admission!'}
                    {(userStage === 'admitted' || userStage === 'completed') &&
                      '🎉 You made it! Welcome to university!'}
                  </p>
                </div>

                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Star size={26} className="text-amber-300" />
                </div>
              </div>

              {/* Quick stats */}
              {!loading && (
                <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-white/10">
                  <div className="rounded-2xl bg-white/10 border border-white/10 p-3 text-center">
                    <p className="text-2xl font-extrabold text-white">{waecCredits ?? '—'}</p>
                    <p className="text-xs text-white/70">WAEC Credits</p>
                  </div>

                  <div className="rounded-2xl bg-white/10 border border-white/10 p-3 text-center">
                    <p className="text-2xl font-extrabold text-white">{jambBest ?? '—'}</p>
                    <p className="text-xs text-white/70">Best JAMB</p>
                  </div>

                  <div className="rounded-2xl bg-white/10 border border-white/10 p-3 text-center">
                    <p className="text-2xl font-extrabold text-white">{practiceCount ?? '—'}</p>
                    <p className="text-xs text-white/70">Practice Sessions</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stage timeline */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              {STAGES.map((stage) => {
                const status = stageStatus(stage.key, userStage)
                const c = stage.color
                const Icon = stage.icon
                const isDone = status === 'done'
                const isActive = status === 'active'
                const isLocked = status === 'locked'

                return (
                  <div
                    key={stage.key}
                    className={[
                      'rounded-3xl border bg-white/80 backdrop-blur-xl p-5 shadow-sm transition',
                      isDone
                        ? 'border-emerald-200 bg-emerald-50/60'
                        : isActive
                          ? `border-slate-200 ring-2 ${c.ring}`
                          : 'border-slate-200',
                      isLocked ? 'opacity-55' : 'hover:shadow-md hover:-translate-y-[1px]',
                    ].join(' ')}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={[
                          'w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border',
                          isDone
                            ? 'bg-emerald-100 border-emerald-200'
                            : isLocked
                              ? 'bg-slate-100 border-slate-200'
                              : `${c.bg} border-slate-200`,
                        ].join(' ')}
                      >
                        {isDone ? (
                          <CheckCircle size={22} className="text-emerald-700" />
                        ) : isLocked ? (
                          <Lock size={18} className="text-slate-400" />
                        ) : (
                          <Icon size={20} className={c.text} />
                        )}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`font-extrabold text-sm ${isLocked ? 'text-slate-500' : 'text-slate-900'}`}>
                            {stage.label}
                          </p>

                          {isDone && (
                            <span className="text-[11px] px-2.5 py-1 rounded-full font-extrabold border bg-emerald-50 text-emerald-800 border-emerald-200">
                              ✓ Done
                            </span>
                          )}

                          {isActive && (
                            <span className={`text-[11px] px-2.5 py-1 rounded-full font-extrabold border ${c.pill}`}>
                              In progress
                            </span>
                          )}

                          {isLocked && (
                            <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold border bg-slate-50 text-slate-500 border-slate-200">
                              Locked
                            </span>
                          )}
                        </div>

                        <p className={`text-xs mt-1 leading-relaxed ${isLocked ? 'text-slate-500' : 'text-slate-600'}`}>
                          {stage.desc}
                        </p>

                        {isActive && (
                          <p className="text-xs text-amber-800 mt-2 font-semibold">
                            💡 {stage.tip}
                          </p>
                        )}

                        {stage.key === 'waec' && waecCredits !== null && !isLocked && (
                          <p
                            className={[
                              'text-xs font-semibold mt-2',
                              waecCredits >= 5 ? 'text-emerald-700' : 'text-amber-700',
                            ].join(' ')}
                          >
                            {waecCredits}/5 credits earned {waecCredits >= 5 ? '✓' : `— need ${5 - waecCredits} more`}
                          </p>
                        )}

                        {stage.key === 'jamb' && jambBest !== null && !isLocked && (
                          <p className="text-xs font-semibold mt-2 text-sky-800">
                            Best JAMB score: {jambBest}/400
                          </p>
                        )}
                      </div>

                      {/* Action button */}
                      {isActive && stage.action && (
                        <button
                          onClick={() => navigate(stage.action.route)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0B1B3A] hover:bg-[#0A1630]
                                     text-white text-xs font-extrabold transition shadow-sm flex-shrink-0 whitespace-nowrap"
                        >
                          {stage.action.label}
                          <ChevronRight size={12} className="text-amber-300" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Bottom quick links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/practice')}
              className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl p-5 text-center shadow-sm
                         hover:shadow-md hover:-translate-y-[1px] transition"
            >
              <div className="w-11 h-11 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-sky-200">
                <Brain size={18} className="text-sky-800" />
              </div>
              <p className="text-sm font-extrabold text-slate-900">Practice</p>
              <p className="text-xs text-slate-600 mt-1">Improve weak areas</p>
            </button>

            <button
              onClick={() => navigate('/admission-guide')}
              className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl p-5 text-center shadow-sm
                         hover:shadow-md hover:-translate-y-[1px] transition"
            >
              <div className="w-11 h-11 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-amber-200">
                <TrendingUp size={18} className="text-amber-800" />
              </div>
              <p className="text-sm font-extrabold text-slate-900">Admission Guide</p>
              <p className="text-xs text-slate-600 mt-1">Check your chances</p>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}