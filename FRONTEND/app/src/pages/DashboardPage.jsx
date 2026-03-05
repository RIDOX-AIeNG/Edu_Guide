// import { useState, useEffect } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { useAuth } from '../context/AuthContext'
// import Layout from '../components/Layout'
// import Spinner from '../components/Spinner'
// import { dashboardService } from '../services/examService'
// import { Map, CheckCircle,MessageCircle, ExternalLink, Bell, ChevronRight, Target, BookOpen, ArrowRight } from 'lucide-react'

// // ── Admission Readiness Card ─────────────────────────────────────────────────
// function ReadinessCard({ label, display, status, color, route }) {
//   const navigate = useNavigate()

//   const colorMap = {
//     green: {
//       border: 'border-green-200',
//       bg:     'bg-green-50',
//       label:  'text-green-600',
//       value:  'text-green-700',
//     },
//     amber: {
//       border: 'border-yellow-200',
//       bg:     'bg-yellow-50',
//       label:  'text-yellow-600',
//       value:  'text-yellow-600',
//     },
//     red: {
//       border: 'border-red-200',
//       bg:     'bg-red-50',
//       label:  'text-red-500',
//       value:  'text-red-600',
//     },
//     gray: {
//       border: 'border-gray-200',
//       bg:     'bg-gray-50',
//       label:  'text-gray-400',
//       value:  'text-gray-500',
//     },
//   }

//   const c       = colorMap[color] || colorMap.gray
//   const locked  = status === 'locked'
//   const clickable = !locked

//   return (
//     <div
//       onClick={() => clickable && navigate(route)}
//       className={`flex-1 rounded-xl border-2 px-5 py-4 transition-all
//         ${c.border} ${c.bg}
//         ${clickable ? 'cursor-pointer hover:shadow-md hover:scale-[1.01]' : 'opacity-80'}`}
//     >
//       <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${c.label}`}>{label}</p>
//       <p className={`text-2xl font-extrabold ${c.value}`}>{display}</p>
//     </div>
//   )
// }

// // ── WAEC Subject Breakdown ───────────────────────────────────────────────────
// function WAECBreakdown({ subjects, credits }) {
//   const [open, setOpen] = useState(false)
//   if (!subjects || subjects.length === 0) return null

//   return (
//     <div className="mt-3">
//       <button onClick={() => setOpen(!open)}
//         className="flex items-center gap-1.5 text-xs text-green-700 font-medium hover:underline">
//         {open ? 'Hide' : 'View'} WAEC subject breakdown ({credits}/5 credits)
//         <ChevronRight size={12} className={`transition-transform ${open ? 'rotate-90' : ''}`} />
//       </button>
//       {open && (
//         <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
//           {subjects.map((s, i) => (
//             <div key={i}
//               className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm border
//                 ${s.is_credit
//                   ? 'bg-green-50  border-green-200'
//                   : s.is_taken
//                     ? 'bg-red-50 border-red-200'
//                     : 'bg-gray-50 border-gray-200'}`}>
//               <span className={`font-medium ${s.is_credit ? 'text-green-800' : s.is_taken ? 'text-red-700' : 'text-gray-500'}`}>
//                 {s.subject_name}
//               </span>
//               <div className="flex items-center gap-2">
//                 {s.is_taken ? (
//                   <>
//                     <span className="font-bold text-xs">{s.grade}</span>
//                     {s.is_credit
//                       ? <CheckCircle size={14} className="text-green-600" />
//                       : <span className="text-red-400 text-xs">✗</span>}
//                   </>
//                 ) : (
//                   <span className="text-xs text-gray-400">Not taken</span>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

// // ── Live Updates Panel ───────────────────────────────────────────────────────
// function LiveUpdates({ updates }) {
//   const statusColor = {
//     live:          'bg-green-500',
//     closed:        'bg-gray-400',
//     opening_soon:  'bg-yellow-400',
//   }
//   const labelColor = {
//     live:         'text-green-700 bg-green-100',
//     closed:       'text-gray-600 bg-gray-100',
//     opening_soon: 'text-yellow-700 bg-yellow-100',
//   }

//   return (
//     <div className="bg-gray-900 rounded-2xl overflow-hidden h-full flex flex-col">
//       {/* Header */}
//       <div className="flex items-center gap-2 px-5 py-4 bg-gray-900 border-b border-gray-700">
//         <Bell size={16} className="text-yellow-400" />
//         <h3 className="font-bold text-white text-sm">Live Updates</h3>
//         <span className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
//       </div>

//       {/* Updates list */}
//       <div className="flex-1 divide-y divide-gray-800 overflow-y-auto">
//         {updates.map((u, i) => (
//           <div key={i} className="px-5 py-4">
//             <div className="flex items-start justify-between gap-2">
//               <div className="flex-1 min-w-0">
//                 <p className="font-bold text-white text-sm">{u.short_name}</p>
//                 <p className="text-gray-400 text-xs mt-0.5">{u.message}</p>
//                 <p className="text-gray-500 text-xs mt-0.5">{u.deadline}</p>
//               </div>
//               <span className={`text-xs font-bold px-2 py-0.5 rounded flex-shrink-0 ${labelColor[u.status] || labelColor.closed}`}>
//                 {u.status_label}
//               </span>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Footer */}
//       <div className="border-t border-gray-800">
//         {/* Universities link */}
//         <div className="px-5 py-3 border-b border-gray-800">
//           <Link to="/universities"
//             className="flex items-center gap-1.5 text-sm text-blue-400 font-semibold hover:text-blue-300">
//             View All Universities
//             <ExternalLink size={13} />
//           </Link>
//         </div>

        
//       </div>
//     </div>
//   )
// }

// // ── Main Dashboard ───────────────────────────────────────────────────────────
// export default function DashboardPage() {
//   const { user } = useAuth()
//   const navigate  = useNavigate()
//   const [data,    setData]    = useState(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     dashboardService.getDashboard()
//       .then(r => setData(r.data))
//       .catch(console.error)
//       .finally(() => setLoading(false))
//   }, [])

//   if (loading) return (
//     <Layout>
//       <div className="flex items-center justify-center min-h-screen">
//         <Spinner size="lg" />
//       </div>
//     </Layout>
//   )

//   const r = data?.admission_readiness

//   return (
//     <Layout>
//       {/* ── Two-column layout matching screenshot ─────────────────────── */}
//       <div className="flex min-h-screen">

//         {/* ── Left / Center content ──────────────────────────────────── */}
//         <div className="flex-1 min-w-0 px-6 py-8 max-w-3xl">

//           {/* ── Current Admission Readiness ─────────────────────────── */}
//           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
//             {/* Section header */}
//             <div className="flex items-center gap-2 mb-5">
//               <Map size={18} className="text-green-600" />
//               <h2 className="text-base font-bold text-gray-800">Current Admission Readiness</h2>
//             </div>

//             {/* 3 status cards */}
//             <div className="flex gap-3 mb-5">
//               <ReadinessCard
//                 label="WAEC"
//                 display={r?.waec_display || 'Not Started'}
//                 status={r?.waec_status  || 'not_started'}
//                 color={r?.waec_color    || 'gray'}
//                 route="/exams/waec"
//               />
//               <ReadinessCard
//                 label="JAMB"
//                 display={r?.jamb_display || 'Locked'}
//                 status={r?.jamb_status   || 'locked'}
//                 color={r?.jamb_color     || 'gray'}
//                 route="/exams/jamb"
//               />
//               <ReadinessCard
//                 label="POST-UTME"
//                 display={r?.post_utme_display || 'Locked'}
//                 status={r?.post_utme_status   || 'locked'}
//                 color={r?.post_utme_color     || 'gray'}
//                 route="/exams/post-utme"
//               />
//             </div>

//             {/* WAEC subject breakdown (collapsible) */}
//             {r?.waec_subjects?.length > 0 && (
//               <WAECBreakdown
//                 subjects={r.waec_subjects}
//                 credits={r.waec_credits}
//               />
//             )}

//             {/* CTA button */}
//             <button
//               onClick={() => navigate(r?.cta_route || '/exams/waec')}
//               className="mt-5 w-full sm:w-auto px-8 py-3 bg-gray-900 hover:bg-gray-800
//                 text-white font-bold rounded-xl transition-all flex items-center gap-2">
//               {r?.cta_label || 'Continue Mock Journey'}
//               <ArrowRight size={16} />
//             </button>
//           </div>

//           {/* ── Bottom two cards: Admission Guide + Quick Practice ───── */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

//             {/* Admission Guide card */}
//             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6
//               flex flex-col justify-between min-h-[200px]">
//               <div>
//                 <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-4">
//                   <Target size={20} className="text-green-600" />
//                 </div>
//                 <h3 className="font-bold text-gray-900 text-lg mb-2">Admission Guide</h3>
//                 <p className="text-gray-500 text-sm leading-relaxed">
//                   Input your official scores to predict your admission likelihood.
//                 </p>
//               </div>
//               <button
//                 onClick={() => navigate('/admission-guide')}
//                 className="mt-6 w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white
//                   font-bold rounded-xl transition-all text-sm">
//                 Start Wizard
//               </button>
//             </div>

//             {/* Quick Practice card */}
//             <div className="bg-purple-50 rounded-2xl border border-purple-100 shadow-sm p-6
//               flex flex-col justify-between min-h-[200px]">
//               <div>
//                 <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
//                   <BookOpen size={20} className="text-purple-600" />
//                 </div>
//                 <h3 className="font-bold text-gray-900 text-lg mb-2">Quick Practice</h3>
//                 <p className="text-gray-500 text-sm leading-relaxed">
//                   Got 10 minutes? Take short subject quizzes to stay sharp.
//                 </p>
//               </div>
//               <button
//                 onClick={() => navigate('/practice')}
//                 className="mt-6 w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white
//                   font-bold rounded-xl transition-all text-sm">
//                 Practice Now
//               </button>
//             </div>

//           </div>
//         </div>

//         {/* ── Right panel: Live Updates + AI Advisor below ───────────── */}
//         <div className="hidden xl:flex flex-col w-72 flex-shrink-0 p-6 pl-0 gap-3">

//           {/* Live Updates panel */}
//           <LiveUpdates updates={data?.live_updates || []} />

//           {/* AI Advisor CTA — sits BELOW the live updates panel, outside it */}
//           <Link to="/advisor"
//             className="flex items-center gap-3 p-4 rounded-2xl border-2 border-gray-800
//               bg-gray-900 hover:bg-gray-800 hover:border-green-700 group transition-all">
//             <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
//               bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-900/40
//               group-hover:scale-105 transition-transform">
//               <MessageCircle size={20} className="text-white" />
//             </div>
//             <div className="flex-1 min-w-0">
//               <p className="text-white text-sm font-bold leading-tight">AI Advisor</p>
//               <p className="text-gray-400 text-xs mt-0.5">
//                 Ask about admissions &amp; courses
//               </p>
//             </div>
//             <ChevronRight size={14} className="text-gray-500 group-hover:text-green-400
//               transition-colors flex-shrink-0" />
//           </Link>

//         </div>

//       </div>
//     </Layout>
//   )
// }



import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import { dashboardService } from '../services/examService'
import {
  Map,
  CheckCircle,
  MessageCircle,
  ExternalLink,
  Bell,
  ChevronRight,
  Target,
  BookOpen,
  ArrowRight,
} from 'lucide-react'

// Theme tokens (match Landing/Login/Register)
const THEME = {
  navy: '#0B1B3A',
  navyHover: '#0A1630',
  amber: 'text-amber-700',
  amberBg: 'bg-amber-50',
  amberRing: 'ring-amber-300/70',
}

// ── Admission Readiness Card ─────────────────────────────────────────────────
function ReadinessCard({ label, display, status, color, route }) {
  const navigate = useNavigate()

  // Map your backend colors into the new theme palette
  const colorMap = {
    green: {
      border: 'border-emerald-200',
      bg: 'bg-emerald-50',
      label: 'text-emerald-700',
      value: 'text-emerald-800',
    },
    amber: {
      border: 'border-amber-200',
      bg: 'bg-amber-50',
      label: 'text-amber-700',
      value: 'text-amber-800',
    },
    red: {
      border: 'border-rose-200',
      bg: 'bg-rose-50',
      label: 'text-rose-700',
      value: 'text-rose-800',
    },
    gray: {
      border: 'border-slate-200',
      bg: 'bg-slate-50',
      label: 'text-slate-500',
      value: 'text-slate-700',
    },
  }

  const c = colorMap[color] || colorMap.gray
  const locked = status === 'locked'
  const clickable = !locked

  return (
    <div
      onClick={() => clickable && navigate(route)}
      className={[
        'flex-1 rounded-2xl border px-5 py-4 transition',
        c.border,
        c.bg,
        clickable ? 'cursor-pointer hover:shadow-md hover:-translate-y-[1px]' : 'opacity-80',
      ].join(' ')}
    >
      <p className={`text-[11px] font-extrabold uppercase tracking-widest mb-2 ${c.label}`}>
        {label}
      </p>
      <p className={`text-2xl font-extrabold ${c.value}`}>{display}</p>
      {locked && <p className="mt-2 text-xs text-slate-500">Complete WAEC to unlock</p>}
    </div>
  )
}

// ── WAEC Subject Breakdown ───────────────────────────────────────────────────
function WAECBreakdown({ subjects, credits }) {
  const [open, setOpen] = useState(false)
  if (!subjects || subjects.length === 0) return null

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs font-semibold text-[#0B1B3A] hover:underline underline-offset-4"
      >
        {open ? 'Hide' : 'View'} WAEC subject breakdown ({credits}/5 credits)
        <ChevronRight size={12} className={`transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>

      {open && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {subjects.map((s, i) => (
            <div
              key={i}
              className={[
                'flex items-center justify-between px-3 py-2 rounded-xl text-sm border',
                s.is_credit
                  ? 'bg-emerald-50 border-emerald-200'
                  : s.is_taken
                    ? 'bg-rose-50 border-rose-200'
                    : 'bg-slate-50 border-slate-200',
              ].join(' ')}
            >
              <span
                className={[
                  'font-semibold',
                  s.is_credit ? 'text-emerald-800' : s.is_taken ? 'text-rose-800' : 'text-slate-600',
                ].join(' ')}
              >
                {s.subject_name}
              </span>

              <div className="flex items-center gap-2">
                {s.is_taken ? (
                  <>
                    <span className="font-extrabold text-xs text-slate-700">{s.grade}</span>
                    {s.is_credit ? (
                      <CheckCircle size={14} className="text-emerald-600" />
                    ) : (
                      <span className="text-rose-500 text-xs font-bold">✗</span>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-slate-400">Not taken</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Live Updates Panel ───────────────────────────────────────────────────────
function LiveUpdates({ updates }) {
  const labelColor = {
    live: 'text-emerald-800 bg-emerald-100 border-emerald-200',
    closed: 'text-slate-700 bg-slate-100 border-slate-200',
    opening_soon: 'text-amber-800 bg-amber-100 border-amber-200',
  }

  return (
    <div className="rounded-3xl overflow-hidden h-full flex flex-col border border-slate-200 bg-white/80 backdrop-blur-xl shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-200">
        <div className="w-9 h-9 rounded-2xl bg-amber-100 flex items-center justify-center">
          <Bell size={16} className="text-amber-700" />
        </div>
        <div>
          <h3 className="font-extrabold text-slate-900 text-sm leading-tight">Live Updates</h3>
          <p className="text-xs text-slate-500">Admission & school news</p>
        </div>
        <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </div>

      {/* Updates list */}
      <div className="flex-1 divide-y divide-slate-200 overflow-y-auto">
        {(updates || []).map((u, i) => (
          <div key={i} className="px-5 py-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-sm truncate">{u.short_name}</p>
                <p className="text-slate-600 text-xs mt-1 leading-relaxed">{u.message}</p>
                <p className="text-slate-500 text-xs mt-1">{u.deadline}</p>
              </div>

              <span
                className={[
                  'text-[11px] font-extrabold px-2 py-0.5 rounded-full border flex-shrink-0',
                  labelColor[u.status] || labelColor.closed,
                ].join(' ')}
              >
                {u.status_label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 px-5 py-3">
        <Link
          to="/universities"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0B1B3A] hover:underline underline-offset-4"
        >
          View all universities <ExternalLink size={13} />
        </Link>
      </div>
    </div>
  )
}

// ── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardService
      .getDashboard()
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading)
    return (
      <Layout>
        <div className="min-h-screen bg-[#F7FAFF] flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </Layout>
    )

  const r = data?.admission_readiness

  return (
    <Layout>
      <div className="min-h-screen bg-[#F7FAFF] text-slate-900">
        {/* Background accents */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-amber-200/35 blur-3xl" />
          <div className="absolute top-40 -left-40 h-[520px] w-[520px] rounded-full bg-sky-200/40 blur-3xl" />
        </div>

        {/* Page layout */}
        <div className="relative flex">
          {/* Left / main */}
          <div className="flex-1 min-w-0 px-6 py-8 max-w-3xl">
            {/* Header */}
            <div className="mb-6">
              <p className="text-sm text-slate-600">
                Welcome back{user?.full_name ? `, ${user.full_name}` : ''}.
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
                Your dashboard
              </h1>
            </div>

            {/* Readiness */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#0B1B3A]/10 flex items-center justify-center">
                    <Map size={18} className="text-[#0B1B3A]" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      Current admission readiness
                    </h2>
                    <p className="text-xs text-slate-500">WAEC → JAMB → POST-UTME</p>
                  </div>
                </div>

                <span className="hidden sm:inline-flex text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800">
                  Stay consistent
                </span>
              </div>

              <div className="flex gap-3 mb-4">
                <ReadinessCard
                  label="WAEC"
                  display={r?.waec_display || 'Not Started'}
                  status={r?.waec_status || 'not_started'}
                  color={r?.waec_color || 'gray'}
                  route="/exams/waec"
                />
                <ReadinessCard
                  label="JAMB"
                  display={r?.jamb_display || 'Locked'}
                  status={r?.jamb_status || 'locked'}
                  color={r?.jamb_color || 'gray'}
                  route="/exams/jamb"
                />
                <ReadinessCard
                  label="POST-UTME"
                  display={r?.post_utme_display || 'Locked'}
                  status={r?.post_utme_status || 'locked'}
                  color={r?.post_utme_color || 'gray'}
                  route="/exams/post-utme"
                />
              </div>

              {r?.waec_subjects?.length > 0 && (
                <WAECBreakdown subjects={r.waec_subjects} credits={r.waec_credits} />
              )}

              <button
                onClick={() => navigate(r?.cta_route || '/exams/waec')}
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0B1B3A] text-white font-extrabold
                           hover:bg-[#0A1630] transition shadow-sm"
              >
                {r?.cta_label || 'Continue mock journey'}
                <ArrowRight size={16} className="text-amber-300" />
              </button>
            </div>

            {/* Bottom cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Admission Guide */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between min-h-[210px]">
                <div>
                  <div className="w-11 h-11 bg-amber-100 rounded-2xl flex items-center justify-center mb-4">
                    <Target size={20} className="text-amber-800" />
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-lg mb-2">Admission guide</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Input your official scores to predict your admission likelihood.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/admission-guide')}
                  className="mt-6 w-full py-2.5 rounded-xl bg-[#0B1B3A] hover:bg-[#0A1630] text-white font-bold transition text-sm shadow-sm"
                >
                  Start wizard
                </button>
              </div>

              {/* Quick Practice */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between min-h-[210px]">
                <div>
                  <div className="w-11 h-11 bg-sky-100 rounded-2xl flex items-center justify-center mb-4">
                    <BookOpen size={20} className="text-sky-800" />
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-lg mb-2">Quick practice</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Got 10 minutes? Take short subject quizzes to stay sharp.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/practice')}
                  className="mt-6 w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#0B1B3A] font-extrabold transition text-sm shadow-sm"
                >
                  Practice now
                </button>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="hidden xl:flex flex-col w-80 flex-shrink-0 p-6 pl-0 gap-3">
            <LiveUpdates updates={data?.live_updates || []} />

            <Link
              to="/advisor"
              className="flex items-center gap-3 p-4 rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-sm
                         hover:shadow-md hover:-translate-y-[1px] transition"
            >
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 bg-[#0B1B3A] shadow-sm">
                <MessageCircle size={20} className="text-amber-300" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-slate-900 text-sm font-extrabold leading-tight">AI advisor</p>
                <p className="text-slate-600 text-xs mt-0.5">Ask about admissions &amp; courses</p>
              </div>

              <ChevronRight size={14} className="text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}