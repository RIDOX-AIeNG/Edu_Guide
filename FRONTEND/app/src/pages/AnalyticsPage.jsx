// import { useState, useEffect } from 'react'
// import { Link } from 'react-router-dom'
// import Layout from '../components/Layout'
// import Spinner from '../components/Spinner'
// import api from '../services/api'
// import {
//   BarChart2, TrendingUp, TrendingDown, BookOpen,
//   GraduationCap, Brain, Trophy, Target,
//   CheckCircle, XCircle, Minus, AlertTriangle,
//   ChevronRight, RefreshCw
// } from 'lucide-react'
// import {
//   LineChart, Line, BarChart, Bar,
//   XAxis, YAxis, Tooltip, ResponsiveContainer,
//   CartesianGrid, Cell, RadarChart, Radar,
//   PolarGrid, PolarAngleAxis
// } from 'recharts'

// // ── Colour helpers ────────────────────────────────────────────────────────────
// const GRADE_COLOR = {
//   A1: '#16a34a', B2: '#22c55e', B3: '#84cc16',
//   C4: '#eab308', C5: '#f97316', C6: '#f97316',
//   D7: '#ef4444', E8: '#dc2626', F9: '#b91c1c',
// }
// const EXAM_COLOR = {
//   waec:      '#16a34a',
//   jamb:      '#2563eb',
//   post_utme: '#7c3aed',
//   practice:  '#0891b2',
// }

// // ── Summary stat card ────────────────────────────────────────────────────────
// function StatCard({ icon: Icon, label, value, sub, color = 'green' }) {
//   const colors = {
//     green:  'bg-green-50  border-green-100  text-green-600',
//     blue:   'bg-blue-50   border-blue-100   text-blue-600',
//     purple: 'bg-purple-50 border-purple-100 text-purple-600',
//     amber:  'bg-amber-50  border-amber-100  text-amber-600',
//     gray:   'bg-gray-50   border-gray-100   text-gray-500',
//   }
//   const c = colors[color] || colors.green
//   return (
//     <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
//       <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 border ${c}`}>
//         <Icon size={18} />
//       </div>
//       <p className="text-2xl font-extrabold text-gray-900">{value}</p>
//       <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
//       {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
//     </div>
//   )
// }

// // ── Grade badge ───────────────────────────────────────────────────────────────
// function GradeBadge({ grade }) {
//   const CREDITS = ['A1','B2','B3','C4','C5','C6']
//   const bg = grade && CREDITS.includes(grade) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'
//   return (
//     <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${bg}`}>
//       {grade || '—'}
//     </span>
//   )
// }

// // ── Custom tooltip for charts ─────────────────────────────────────────────────
// function CustomTooltip({ active, payload, label }) {
//   if (!active || !payload?.length) return null
//   return (
//     <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg">
//       <p className="font-bold mb-1">{label}</p>
//       {payload.map((p, i) => (
//         <p key={i} style={{ color: p.color }}>{p.name}: {p.value}%</p>
//       ))}
//     </div>
//   )
// }

// // ── Empty state ───────────────────────────────────────────────────────────────
// function EmptyAnalytics() {
//   return (
//     <div className="flex flex-col items-center justify-center py-24 text-center">
//       <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
//         <BarChart2 size={36} className="text-gray-300" />
//       </div>
//       <h2 className="text-xl font-bold text-gray-700 mb-2">No data yet</h2>
//       <p className="text-gray-400 text-sm max-w-xs mb-6">
//         Complete at least one exam or practice session to see your performance analytics.
//       </p>
//       <Link to="/exams/waec"
//         className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm transition-all">
//         Start WAEC Mock Exam
//       </Link>
//     </div>
//   )
// }

// // ── Main Analytics Page ───────────────────────────────────────────────────────
// export default function AnalyticsPage() {
//   const [data,    setData]    = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [error,   setError]   = useState(null)

//   const load = () => {
//     setLoading(true)
//     setError(null)
//     api.get('/student/analytics')
//       .then(r => setData(r.data))
//       .catch(e => setError(e.response?.data?.detail || 'Failed to load analytics'))
//       .finally(() => setLoading(false))
//   }

//   useEffect(() => { load() }, [])

//   if (loading) return (
//     <Layout>
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <Spinner size="lg" />
//           <p className="text-gray-400 text-sm mt-4">Loading your analytics...</p>
//         </div>
//       </div>
//     </Layout>
//   )

//   if (error) return (
//     <Layout>
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <AlertTriangle size={40} className="text-red-400 mx-auto mb-3" />
//           <p className="text-gray-600 mb-4">{error}</p>
//           <button onClick={load} className="btn-primary flex items-center gap-2 mx-auto">
//             <RefreshCw size={16} /> Retry
//           </button>
//         </div>
//       </div>
//     </Layout>
//   )

//   if (!data || (data.total_exams === 0 && data.total_practice === 0)) return (
//     <Layout><EmptyAnalytics /></Layout>
//   )

//   // Prepare chart data
//   const trendData = data.score_trend || []
//   const waecData  = data.waec_subject_chart || []
//   const radarData = (data.subject_stats || [])
//     .filter(s => s.exam_type === 'waec' || s.exam_type === 'jamb')
//     .slice(0, 6)
//     .map(s => ({ subject: s.subject_name.split(' ')[0], score: s.best_score }))

//   return (
//     <Layout>
//       <div className="max-w-6xl mx-auto px-6 py-8">

//         {/* ── Page header ─────────────────────────────────────────────── */}
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
//               <BarChart2 size={24} className="text-green-600" />
//               Analytics
//             </h1>
//             <p className="text-gray-500 text-sm mt-1">Your complete performance overview</p>
//           </div>
//           <button onClick={load}
//             className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all">
//             <RefreshCw size={14} /> Refresh
//           </button>
//         </div>

//         {/* ── Summary cards row ────────────────────────────────────────── */}
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
//           <StatCard icon={BookOpen}      label="Exams Taken"     value={data.total_exams}        color="blue"   />
//           <StatCard icon={Brain}         label="Practice Sessions" value={data.total_practice}   color="purple" />
//           <StatCard icon={CheckCircle}   label="WAEC Credits"    value={`${data.waec_credits}/5`}
//             sub={data.waec_credits >= 5 ? 'Qualified ✓' : 'Need more'}
//             color={data.waec_credits >= 5 ? 'green' : 'amber'} />
//           <StatCard icon={GraduationCap} label="Best JAMB"       value={data.best_jamb_score ? `${data.best_jamb_score}/400` : '—'}
//             color="blue" />
//           <StatCard icon={Target}        label="Pass Rate"        value={`${data.overall_pass_rate}%`}
//             color={data.overall_pass_rate >= 60 ? 'green' : 'amber'} />
//           <StatCard icon={Trophy}        label="Study Streak"    value={`${data.study_streak} days`} color="green" />
//         </div>

//         {/* ── Charts row ──────────────────────────────────────────────── */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

//           {/* Score trend line chart */}
//           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
//             <h2 className="font-bold text-gray-900 mb-1">Score Trend</h2>
//             <p className="text-xs text-gray-400 mb-4">All exam scores over time (%)</p>
//             {trendData.length > 1 ? (
//               <ResponsiveContainer width="100%" height={200}>
//                 <LineChart data={trendData}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                   <XAxis dataKey="date" tick={{ fontSize: 10 }} />
//                   <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
//                   <Tooltip content={<CustomTooltip />} />
//                   <Line type="monotone" dataKey="score" stroke="#16a34a"
//                     strokeWidth={2.5} dot={{ r: 4, fill: '#16a34a' }}
//                     activeDot={{ r: 6 }} name="Score" />
//                 </LineChart>
//               </ResponsiveContainer>
//             ) : (
//               <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
//                 Complete more exams to see your trend
//               </div>
//             )}
//           </div>

//           {/* WAEC subject bar chart */}
//           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
//             <h2 className="font-bold text-gray-900 mb-1">WAEC by Subject</h2>
//             <p className="text-xs text-gray-400 mb-4">Best score per subject (%)</p>
//             {waecData.length > 0 ? (
//               <ResponsiveContainer width="100%" height={200}>
//                 <BarChart data={waecData} barSize={28}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
//                   <XAxis dataKey="subject" tick={{ fontSize: 9 }} />
//                   <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
//                   <Tooltip
//                     formatter={(v, n, p) => [`${v}% (${p.payload.grade})`, 'Score']}
//                     contentStyle={{ fontSize: 12 }}
//                   />
//                   <Bar dataKey="percentage" radius={[4,4,0,0]} name="Score">
//                     {waecData.map((d, i) => (
//                       <Cell key={i}
//                         fill={GRADE_COLOR[d.grade] || '#94a3b8'} />
//                     ))}
//                   </Bar>
//                 </BarChart>
//               </ResponsiveContainer>
//             ) : (
//               <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
//                 No WAEC data yet
//               </div>
//             )}
//           </div>
//         </div>

//         {/* ── Bottom row: Subject table + Weak Topics ──────────────────── */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

//           {/* Subject performance table */}
//           <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
//             <h2 className="font-bold text-gray-900 mb-4">Subject Performance</h2>
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="border-b border-gray-100">
//                     <th className="text-left text-xs text-gray-400 font-medium pb-3 pr-4">Subject</th>
//                     <th className="text-left text-xs text-gray-400 font-medium pb-3 pr-4">Type</th>
//                     <th className="text-center text-xs text-gray-400 font-medium pb-3 pr-4">Attempts</th>
//                     <th className="text-center text-xs text-gray-400 font-medium pb-3 pr-4">Best</th>
//                     <th className="text-center text-xs text-gray-400 font-medium pb-3 pr-4">Avg</th>
//                     <th className="text-center text-xs text-gray-400 font-medium pb-3 pr-4">Grade</th>
//                     <th className="text-center text-xs text-gray-400 font-medium pb-3">Trend</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-50">
//                   {(data.subject_stats || []).map((s, i) => (
//                     <tr key={i} className="hover:bg-gray-50 transition-colors">
//                       <td className="py-3 pr-4 font-medium text-gray-800">{s.subject_name}</td>
//                       <td className="py-3 pr-4">
//                         <span className={`text-xs px-2 py-0.5 rounded-full font-medium
//                           ${s.exam_type === 'waec'      ? 'bg-green-100 text-green-700'
//                           : s.exam_type === 'jamb'      ? 'bg-blue-100 text-blue-700'
//                           : s.exam_type === 'post_utme' ? 'bg-purple-100 text-purple-700'
//                           :                               'bg-gray-100 text-gray-600'}`}>
//                           {s.exam_type.toUpperCase().replace('_','-')}
//                         </span>
//                       </td>
//                       <td className="py-3 pr-4 text-center text-gray-600">{s.attempts}</td>
//                       <td className="py-3 pr-4 text-center">
//                         <span className={`font-bold ${
//                           s.best_score >= 60 ? 'text-green-600'
//                           : s.best_score >= 40 ? 'text-amber-600'
//                           : 'text-red-500'}`}>
//                           {s.best_score}%
//                         </span>
//                       </td>
//                       <td className="py-3 pr-4 text-center text-gray-500">{s.avg_score}%</td>
//                       <td className="py-3 pr-4 text-center">
//                         {s.latest_grade ? <GradeBadge grade={s.latest_grade} /> : <span className="text-gray-300">—</span>}
//                       </td>
//                       <td className="py-3 text-center">
//                         {s.attempts < 2
//                           ? <Minus size={14} className="text-gray-300 mx-auto" />
//                           : s.is_improving
//                             ? <TrendingUp size={14} className="text-green-500 mx-auto" />
//                             : <TrendingDown size={14} className="text-red-400 mx-auto" />
//                         }
//                       </td>
//                     </tr>
//                   ))}
//                   {(data.subject_stats || []).length === 0 && (
//                     <tr>
//                       <td colSpan={7} className="py-8 text-center text-gray-400 text-sm">
//                         No subject data yet
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* Weak topics */}
//           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
//             <h2 className="font-bold text-gray-900 mb-1">Weak Topics</h2>
//             <p className="text-xs text-gray-400 mb-4">Areas that need the most work</p>
//             {(data.weak_topics || []).length > 0 ? (
//               <div className="space-y-3">
//                 {data.weak_topics.map((t, i) => {
//                   const maxFreq = data.weak_topics[0]?.frequency || 1
//                   const pct     = Math.round((t.frequency / maxFreq) * 100)
//                   return (
//                     <div key={i}>
//                       <div className="flex justify-between text-xs mb-1">
//                         <span className="font-medium text-gray-700 truncate max-w-[160px]">{t.topic_name}</span>
//                         <span className="text-gray-400 flex-shrink-0 ml-2">×{t.frequency}</span>
//                       </div>
//                       {t.subject && (
//                         <p className="text-xs text-gray-400 mb-1">{t.subject}</p>
//                       )}
//                       <div className="w-full bg-gray-100 rounded-full h-1.5">
//                         <div className="bg-red-400 h-1.5 rounded-full transition-all"
//                           style={{ width: `${pct}%` }} />
//                       </div>
//                     </div>
//                   )
//                 })}
//                 <Link to="/practice"
//                   className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl
//                     bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold transition-all">
//                   <Brain size={13} /> Practice Weak Topics
//                 </Link>
//               </div>
//             ) : (
//               <div className="flex flex-col items-center justify-center py-8 text-gray-400 text-sm">
//                 <CheckCircle size={28} className="text-green-300 mb-2" />
//                 No weak topics identified yet
//               </div>
//             )}
//           </div>
//         </div>

//         {/* ── Recent Exam History table ─────────────────────────────────── */}
//         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
//           <h2 className="font-bold text-gray-900 mb-4">Recent Exam History</h2>
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="border-b border-gray-100">
//                   <th className="text-left text-xs text-gray-400 font-medium pb-3 pr-6">Exam</th>
//                   <th className="text-left text-xs text-gray-400 font-medium pb-3 pr-6">Subject</th>
//                   <th className="text-center text-xs text-gray-400 font-medium pb-3 pr-6">Score</th>
//                   <th className="text-center text-xs text-gray-400 font-medium pb-3 pr-6">Grade</th>
//                   <th className="text-center text-xs text-gray-400 font-medium pb-3 pr-6">Result</th>
//                   <th className="text-right text-xs text-gray-400 font-medium pb-3">Date</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-50">
//                 {(data.recent_exams || []).map((e, i) => (
//                   <tr key={i} className="hover:bg-gray-50 transition-colors">
//                     <td className="py-3 pr-6">
//                       <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
//                         ${e.exam_type === 'waec'      ? 'bg-green-100 text-green-700'
//                         : e.exam_type === 'jamb'      ? 'bg-blue-100 text-blue-700'
//                         : e.exam_type === 'post_utme' ? 'bg-purple-100 text-purple-700'
//                         :                               'bg-gray-100 text-gray-600'}`}>
//                         {e.exam_type.toUpperCase().replace('_','-')}
//                       </span>
//                     </td>
//                     <td className="py-3 pr-6 text-gray-600 text-xs">{e.subject || '—'}</td>
//                     <td className="py-3 pr-6 text-center font-bold text-gray-800">
//                       {e.exam_type === 'jamb'
//                         ? `${e.score || 0}/400`
//                         : `${e.percentage || 0}%`}
//                     </td>
//                     <td className="py-3 pr-6 text-center">
//                       {e.grade ? <GradeBadge grade={e.grade} /> : <span className="text-gray-300">—</span>}
//                     </td>
//                     <td className="py-3 pr-6 text-center">
//                       {e.passed === true  && <span className="badge-green text-xs">Passed</span>}
//                       {e.passed === false && <span className="badge-red   text-xs">Failed</span>}
//                       {e.passed === null  && <span className="badge-gray  text-xs">—</span>}
//                     </td>
//                     <td className="py-3 text-right text-xs text-gray-400">
//                       {new Date(e.attempted_at).toLocaleDateString('en-NG', {
//                         day: '2-digit', month: 'short', year: 'numeric'
//                       })}
//                     </td>
//                   </tr>
//                 ))}
//                 {(data.recent_exams || []).length === 0 && (
//                   <tr>
//                     <td colSpan={6} className="py-8 text-center text-gray-400 text-sm">
//                       No exam history yet
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//       </div>
//     </Layout>
//   )
// }



import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import api from '../services/api'
import {
  BarChart2,
  TrendingUp,
  TrendingDown,
  BookOpen,
  GraduationCap,
  Brain,
  Trophy,
  Target,
  CheckCircle,
  Minus,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts'

// ── Colour helpers ────────────────────────────────────────────────────────────
const GRADE_COLOR = {
  A1: '#16a34a',
  B2: '#22c55e',
  B3: '#84cc16',
  C4: '#eab308',
  C5: '#f97316',
  C6: '#f97316',
  D7: '#ef4444',
  E8: '#dc2626',
  F9: '#b91c1c',
}

// ── Summary stat card ────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, tone = 'navy' }) {
  const tones = {
    navy: {
      wrap: 'border-slate-200 bg-white/80 backdrop-blur-xl',
      icon: 'bg-[#0B1B3A]/10 text-[#0B1B3A] border-[#0B1B3A]/15',
    },
    amber: {
      wrap: 'border-amber-200 bg-amber-50/60',
      icon: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    sky: {
      wrap: 'border-sky-200 bg-sky-50/60',
      icon: 'bg-sky-100 text-sky-800 border-sky-200',
    },
    emerald: {
      wrap: 'border-emerald-200 bg-emerald-50/60',
      icon: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    slate: {
      wrap: 'border-slate-200 bg-slate-50/60',
      icon: 'bg-slate-100 text-slate-700 border-slate-200',
    },
  }
  const t = tones[tone] || tones.navy

  return (
    <div className={`rounded-3xl border shadow-sm p-5 ${t.wrap}`}>
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-3 border ${t.icon}`}>
        <Icon size={18} />
      </div>
      <p className="text-2xl font-extrabold text-slate-900">{value}</p>
      <p className="text-sm font-semibold text-slate-700 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  )
}

// ── Grade badge ───────────────────────────────────────────────────────────────
function GradeBadge({ grade }) {
  const CREDITS = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6']
  const ok = grade && CREDITS.includes(grade)
  return (
    <span
      className={[
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold border',
        ok
          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
          : 'bg-rose-100 text-rose-800 border-rose-200',
      ].join(' ')}
    >
      {grade || '—'}
    </span>
  )
}

// ── Custom tooltip for charts ─────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0B1B3A] text-white text-xs px-3 py-2 rounded-xl shadow-lg border border-white/10">
      <p className="font-extrabold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {p.value}%
        </p>
      ))}
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyAnalytics() {
  return (
    <div className="min-h-screen bg-[#F7FAFF] flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-[#0B1B3A]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <BarChart2 size={36} className="text-[#0B1B3A]" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 mb-2">No data yet</h2>
        <p className="text-slate-600 text-sm mb-6">
          Complete at least one exam or practice session to see your performance analytics.
        </p>
        <Link
          to="/exams/waec"
          className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-[#0B1B3A] hover:bg-[#0A1630]
                     text-white font-extrabold text-sm transition shadow-sm"
        >
          Start WAEC mock exam
        </Link>
      </div>
    </div>
  )
}

// ── Main Analytics Page ───────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = () => {
    setLoading(true)
    setError(null)
    api
      .get('/student/analytics')
      .then((r) => setData(r.data))
      .catch((e) => setError(e.response?.data?.detail || 'Failed to load analytics'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  if (loading)
    return (
      <Layout>
        <div className="min-h-screen bg-[#F7FAFF] flex items-center justify-center">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="text-slate-600 text-sm mt-4">Loading your analytics…</p>
          </div>
        </div>
      </Layout>
    )

  if (error)
    return (
      <Layout>
        <div className="min-h-screen bg-[#F7FAFF] flex items-center justify-center px-6">
          <div className="text-center max-w-sm">
            <AlertTriangle size={40} className="text-rose-400 mx-auto mb-3" />
            <p className="text-slate-700 mb-4">{error}</p>
            <button
              onClick={load}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#0B1B3A] hover:bg-[#0A1630]
                         text-white font-extrabold transition shadow-sm mx-auto"
            >
              <RefreshCw size={16} className="text-amber-300" /> Retry
            </button>
          </div>
        </div>
      </Layout>
    )

  if (!data || (data.total_exams === 0 && data.total_practice === 0))
    return (
      <Layout>
        <EmptyAnalytics />
      </Layout>
    )

  // Prepare chart data
  const trendData = data.score_trend || []
  const waecData = data.waec_subject_chart || []

  return (
    <Layout>
      <div className="min-h-screen bg-[#F7FAFF] text-slate-900">
        {/* Background accents */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-amber-200/35 blur-3xl" />
          <div className="absolute top-40 -left-40 h-[520px] w-[520px] rounded-full bg-sky-200/40 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                <BarChart2 size={24} className="text-amber-700" />
                Analytics
              </h1>
              <p className="text-slate-600 text-sm mt-1">Your complete performance overview</p>
            </div>

            <button
              onClick={load}
              className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-700
                         border border-slate-200 bg-white/70 backdrop-blur px-4 py-2.5 rounded-2xl
                         hover:bg-white transition shadow-sm"
            >
              <RefreshCw size={14} className="text-amber-700" /> Refresh
            </button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <StatCard icon={BookOpen} label="Exams Taken" value={data.total_exams} tone="sky" />
            <StatCard icon={Brain} label="Practice Sessions" value={data.total_practice} tone="amber" />
            <StatCard
              icon={CheckCircle}
              label="WAEC Credits"
              value={`${data.waec_credits}/5`}
              sub={data.waec_credits >= 5 ? 'Qualified ✓' : 'Need more'}
              tone={data.waec_credits >= 5 ? 'emerald' : 'amber'}
            />
            <StatCard
              icon={GraduationCap}
              label="Best JAMB"
              value={data.best_jamb_score ? `${data.best_jamb_score}/400` : '—'}
              tone="sky"
            />
            <StatCard
              icon={Target}
              label="Pass Rate"
              value={`${data.overall_pass_rate}%`}
              tone={data.overall_pass_rate >= 60 ? 'emerald' : 'amber'}
            />
            <StatCard icon={Trophy} label="Study Streak" value={`${data.study_streak} days`} tone="navy" />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Trend */}
            <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-sm p-6">
              <h2 className="font-extrabold text-slate-900 mb-1">Score trend</h2>
              <p className="text-xs text-slate-500 mb-4">All exam scores over time (%)</p>

              {trendData.length > 1 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#0B1B3A"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#F59E0B' }}
                      activeDot={{ r: 6 }}
                      name="Score"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-44 text-slate-500 text-sm">
                  Complete more exams to see your trend
                </div>
              )}
            </div>

            {/* WAEC by subject */}
            <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-sm p-6">
              <h2 className="font-extrabold text-slate-900 mb-1">WAEC by subject</h2>
              <p className="text-xs text-slate-500 mb-4">Best score per subject (%)</p>

              {waecData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={waecData} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="subject" tick={{ fontSize: 9 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
                    <Tooltip
                      formatter={(v, n, p) => [`${v}% (${p.payload.grade})`, 'Score']}
                      contentStyle={{ fontSize: 12 }}
                    />
                    <Bar dataKey="percentage" radius={[8, 8, 0, 0]} name="Score">
                      {waecData.map((d, i) => (
                        <Cell key={i} fill={GRADE_COLOR[d.grade] || '#94a3b8'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-44 text-slate-500 text-sm">
                  No WAEC data yet
                </div>
              )}
            </div>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Subject performance table */}
            <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-sm p-6">
              <h2 className="font-extrabold text-slate-900 mb-4">Subject performance</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left text-xs text-slate-500 font-semibold pb-3 pr-4">Subject</th>
                      <th className="text-left text-xs text-slate-500 font-semibold pb-3 pr-4">Type</th>
                      <th className="text-center text-xs text-slate-500 font-semibold pb-3 pr-4">Attempts</th>
                      <th className="text-center text-xs text-slate-500 font-semibold pb-3 pr-4">Best</th>
                      <th className="text-center text-xs text-slate-500 font-semibold pb-3 pr-4">Avg</th>
                      <th className="text-center text-xs text-slate-500 font-semibold pb-3 pr-4">Grade</th>
                      <th className="text-center text-xs text-slate-500 font-semibold pb-3">Trend</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {(data.subject_stats || []).map((s, i) => {
                      const typePill =
                        s.exam_type === 'waec'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : s.exam_type === 'jamb'
                            ? 'bg-sky-100 text-sky-800 border-sky-200'
                            : s.exam_type === 'post_utme'
                              ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'

                      const bestTone =
                        s.best_score >= 60 ? 'text-emerald-700' : s.best_score >= 40 ? 'text-amber-700' : 'text-rose-700'

                      return (
                        <tr key={i} className="hover:bg-white/60 transition-colors">
                          <td className="py-3 pr-4 font-semibold text-slate-900">{s.subject_name}</td>
                          <td className="py-3 pr-4">
                            <span className={`text-[11px] px-2.5 py-1 rounded-full font-extrabold border ${typePill}`}>
                              {s.exam_type.toUpperCase().replace('_', '-')}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-center text-slate-700 font-semibold">{s.attempts}</td>
                          <td className={`py-3 pr-4 text-center font-extrabold ${bestTone}`}>{s.best_score}%</td>
                          <td className="py-3 pr-4 text-center text-slate-600">{s.avg_score}%</td>
                          <td className="py-3 pr-4 text-center">
                            {s.latest_grade ? <GradeBadge grade={s.latest_grade} /> : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="py-3 text-center">
                            {s.attempts < 2 ? (
                              <Minus size={14} className="text-slate-300 mx-auto" />
                            ) : s.is_improving ? (
                              <TrendingUp size={14} className="text-emerald-600 mx-auto" />
                            ) : (
                              <TrendingDown size={14} className="text-rose-500 mx-auto" />
                            )}
                          </td>
                        </tr>
                      )
                    })}

                    {(data.subject_stats || []).length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-slate-500 text-sm">
                          No subject data yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Weak topics */}
            <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-sm p-6">
              <h2 className="font-extrabold text-slate-900 mb-1">Weak topics</h2>
              <p className="text-xs text-slate-500 mb-4">Areas that need the most work</p>

              {(data.weak_topics || []).length > 0 ? (
                <div className="space-y-3">
                  {data.weak_topics.map((t, i) => {
                    const maxFreq = data.weak_topics[0]?.frequency || 1
                    const pct = Math.round((t.frequency / maxFreq) * 100)
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-slate-800 truncate max-w-[160px]">{t.topic_name}</span>
                          <span className="text-slate-500 flex-shrink-0 ml-2">×{t.frequency}</span>
                        </div>
                        {t.subject && <p className="text-xs text-slate-500 mb-1">{t.subject}</p>}
                        <div className="w-full bg-slate-100 rounded-full h-2 border border-slate-200">
                          <div className="bg-rose-400 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}

                  <Link
                    to="/practice"
                    className="mt-4 inline-flex items-center justify-center gap-2 w-full py-3 rounded-2xl
                               bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200
                               text-xs font-extrabold transition"
                  >
                    <Brain size={14} className="text-amber-700" /> Practice weak topics
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-slate-500 text-sm">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center mb-3">
                    <CheckCircle size={22} className="text-emerald-700" />
                  </div>
                  No weak topics identified yet
                </div>
              )}
            </div>
          </div>

          {/* Recent Exam History */}
          <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-sm p-6">
            <h2 className="font-extrabold text-slate-900 mb-4">Recent exam history</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left text-xs text-slate-500 font-semibold pb-3 pr-6">Exam</th>
                    <th className="text-left text-xs text-slate-500 font-semibold pb-3 pr-6">Subject</th>
                    <th className="text-center text-xs text-slate-500 font-semibold pb-3 pr-6">Score</th>
                    <th className="text-center text-xs text-slate-500 font-semibold pb-3 pr-6">Grade</th>
                    <th className="text-center text-xs text-slate-500 font-semibold pb-3 pr-6">Result</th>
                    <th className="text-right text-xs text-slate-500 font-semibold pb-3">Date</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {(data.recent_exams || []).map((e, i) => {
                    const pill =
                      e.exam_type === 'waec'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : e.exam_type === 'jamb'
                          ? 'bg-sky-100 text-sky-800 border-sky-200'
                          : e.exam_type === 'post_utme'
                            ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'

                    return (
                      <tr key={i} className="hover:bg-white/60 transition-colors">
                        <td className="py-3 pr-6">
                          <span className={`text-[11px] px-2.5 py-1 rounded-full font-extrabold border ${pill}`}>
                            {e.exam_type.toUpperCase().replace('_', '-')}
                          </span>
                        </td>

                        <td className="py-3 pr-6 text-slate-700 text-xs">{e.subject || '—'}</td>

                        <td className="py-3 pr-6 text-center font-extrabold text-slate-900">
                          {e.exam_type === 'jamb' ? `${e.score || 0}/400` : `${e.percentage || 0}%`}
                        </td>

                        <td className="py-3 pr-6 text-center">
                          {e.grade ? <GradeBadge grade={e.grade} /> : <span className="text-slate-300">—</span>}
                        </td>

                        <td className="py-3 pr-6 text-center">
                          {e.passed === true && (
                            <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full border bg-emerald-100 text-emerald-800 border-emerald-200">
                              Passed
                            </span>
                          )}
                          {e.passed === false && (
                            <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full border bg-rose-100 text-rose-800 border-rose-200">
                              Failed
                            </span>
                          )}
                          {e.passed === null && (
                            <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full border bg-slate-100 text-slate-700 border-slate-200">
                              —
                            </span>
                          )}
                        </td>

                        <td className="py-3 text-right text-xs text-slate-500">
                          {new Date(e.attempted_at).toLocaleDateString('en-NG', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                      </tr>
                    )
                  })}

                  {(data.recent_exams || []).length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-500 text-sm">
                        No exam history yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}