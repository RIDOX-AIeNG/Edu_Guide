// import { useEffect, useState, useRef } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { useAuth } from '../context/AuthContext'
// import Layout from '../components/Layout'
// import { dashboardService } from '../services/examService'
// import { GraduationCap, MessageCircle, Share2, Download, CheckCircle } from 'lucide-react'

// function Confetti() {
//   const colors = ['#16a34a','#2563eb','#d97706','#dc2626','#7c3aed','#0891b2']
//   const pieces = Array.from({ length: 40 }, (_, i) => ({
//     id: i,
//     color: colors[i % colors.length],
//     left:  Math.random() * 100,
//     delay: Math.random() * 2,
//     size:  Math.random() * 10 + 6,
//   }))
//   return (
//     <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
//       {pieces.map(p => (
//         <div key={p.id} className="confetti-piece absolute rounded-sm"
//           style={{
//             left:             `${p.left}%`,
//             top:              '-20px',
//             width:            `${p.size}px`,
//             height:           `${p.size}px`,
//             backgroundColor:  p.color,
//             animationDelay:   `${p.delay}s`,
//             animationDuration:'3s',
//           }} />
//       ))}
//     </div>
//   )
// }

// export default function AdmittedPage() {
//   const { user } = useAuth()
//   const navigate  = useNavigate()
//   const [dashboard, setDashboard] = useState(null)
//   const [showConf,  setShowConf]  = useState(true)

//   useEffect(() => {
//     dashboardService.getDashboard()
//       .then(r => setDashboard(r.data))
//       .catch(console.error)
//     const t = setTimeout(() => setShowConf(false), 5000)
//     return () => clearTimeout(t)
//   }, [])

//   const postUtme = dashboard?.post_utme_card

//   return (
//     <Layout>
//       <div className="relative min-h-screen flex items-start justify-center pt-12 px-4 pb-12">
//         {showConf && <Confetti />}

//         <div className="relative z-10 max-w-xl w-full space-y-6">
//           {/* Main card */}
//           <div className="card text-center border-4 border-green-400 bg-gradient-to-b from-green-50 to-white shadow-2xl">
//             <div className="text-7xl mb-4">🎓</div>
//             <h1 className="text-3xl font-extrabold text-green-700 mb-2">CONGRATULATIONS!</h1>
//             <p className="text-xl font-bold text-gray-900 mb-1">{user?.full_name}</p>
//             <p className="text-gray-500 mb-6">You have been admitted to university!</p>

//             {/* Admission details */}
//             {postUtme && (
//               <div className="bg-white rounded-xl border-2 border-green-300 p-5 text-left mb-6">
//                 <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide mb-4">
//                   Admission Details
//                 </h3>
//                 <div className="space-y-3">
//                   {[
//                     { label: 'Status',        value: ' ADMITTED',       bold: true, green: true },
//                     { label: 'POST-UTME Score', value: postUtme.best_score != null ? `${postUtme.best_score}%` : '—' },
//                   ].map(({ label, value, bold, green }) => (
//                     <div key={label} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
//                       <span className="text-sm text-gray-600">{label}</span>
//                       <span className={`text-sm ${bold ? 'font-extrabold' : 'font-semibold'} ${green ? 'text-green-700' : 'text-gray-800'}`}>
//                         {value}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Next steps */}
//             <div className="text-left bg-blue-50 rounded-xl p-4 mb-6">
//               <p className="font-bold text-blue-800 mb-3 text-sm">📋 What to do next:</p>
//               {[
//                 'Log in to JAMB portal and accept your admission offer',
//                 'Pay the acceptance fee at your chosen university',
//                 'Collect your admission letter from the admissions office',
//                 'Register for your faculty and courses',
//                 'Prepare for your matriculation ceremony',
//               ].map((step, i) => (
//                 <div key={i} className="flex items-start gap-2 mb-2">
//                   <CheckCircle size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
//                   <p className="text-sm text-blue-700">{step}</p>
//                 </div>
//               ))}
//             </div>

//             {/* Actions */}
//             <div className="space-y-3">
//               <Link to="/advisor" className="btn-primary w-full flex items-center justify-center gap-2">
//                 <MessageCircle size={18} />
//                 Get Career Guidance from AI Advisor
//               </Link>
//               <Link to="/dashboard" className="btn-outline w-full">
//                 Back to Dashboard
//               </Link>
//             </div>
//           </div>

//           {/* Share encouragement */}
//           <div className="card bg-yellow-50 border border-yellow-200 text-center">
//             <p className="text-2xl mb-2"></p>
//             <p className="font-bold text-yellow-800">You did it!</p>
//             <p className="text-sm text-yellow-700 mt-1">
//               Your hard work and dedication paid off. The journey to your degree starts now.
//               Congratulations, graduate-to-be!
//             </p>
//           </div>
//         </div>
//       </div>
//     </Layout>
//   )
// }


import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import { dashboardService } from '../services/examService'
import { MessageCircle, CheckCircle, Sparkles } from 'lucide-react'

function Confetti() {
  const colors = ['#0B1B3A', '#F59E0B', '#10B981', '#60A5FA', '#FB7185', '#A78BFA']
  const pieces = Array.from({ length: 44 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    left: Math.random() * 100,
    delay: Math.random() * 1.4,
    size: Math.random() * 10 + 6,
    spin: Math.random() * 360,
    drift: Math.random() * 40 - 20,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece absolute rounded-sm opacity-90"
          style={{
            left: `${p.left}%`,
            top: '-20px',
            width: `${p.size}px`,
            height: `${Math.max(6, p.size * 0.6)}px`,
            backgroundColor: p.color,
            transform: `rotate(${p.spin}deg)`,
            animationDelay: `${p.delay}s`,
            animationDuration: '3.2s',
            '--drift': `${p.drift}px`,
          }}
        />
      ))}
    </div>
  )
}

export default function AdmittedPage() {
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState(null)
  const [showConf, setShowConf] = useState(true)

  useEffect(() => {
    dashboardService
      .getDashboard()
      .then((r) => setDashboard(r.data))
      .catch(console.error)

    const t = setTimeout(() => setShowConf(false), 4500)
    return () => clearTimeout(t)
  }, [])

  const postUtme = dashboard?.post_utme_card

  return (
    <Layout>
      <div className="min-h-screen bg-[#F7FAFF] text-slate-900">
        {/* Background accents */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-amber-200/35 blur-3xl" />
          <div className="absolute top-40 -left-40 h-[520px] w-[520px] rounded-full bg-sky-200/40 blur-3xl" />
        </div>

        <div className="relative flex items-start justify-center pt-12 px-4 pb-12">
          {showConf && <Confetti />}

          <div className="relative z-10 max-w-2xl w-full space-y-6">
            {/* Main card */}
            <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-sm overflow-hidden">
              {/* Top ribbon */}
              <div className="bg-[#0B1B3A] px-6 py-5 border-b border-white/10">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <p className="text-amber-300 text-xs font-extrabold uppercase tracking-[0.18em]">
                      Admission confirmed
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                      Congratulations, {user?.full_name || 'Student'} 🎓
                    </h1>
                    <p className="text-white/70 text-sm mt-1">
                      You’ve completed the journey — your next chapter starts now.
                    </p>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                    <Sparkles size={22} className="text-amber-300" />
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Admission details */}
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 mb-5">
                  <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide mb-4">
                    Admission details
                  </h3>

                  <div className="space-y-3">
                    {[
                      { label: 'Status', value: 'ADMITTED', strong: true, accent: true },
                      {
                        label: 'POST-UTME Score',
                        value: postUtme?.best_score != null ? `${postUtme.best_score}%` : '—',
                      },
                    ].map(({ label, value, strong, accent }) => (
                      <div
                        key={label}
                        className="flex justify-between items-center py-2 border-b border-emerald-200/40 last:border-0"
                      >
                        <span className="text-sm text-slate-700">{label}</span>
                        <span
                          className={[
                            'text-sm',
                            strong ? 'font-extrabold' : 'font-semibold',
                            accent ? 'text-emerald-800' : 'text-slate-900',
                          ].join(' ')}
                        >
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next steps */}
                <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 mb-6">
                  <p className="font-extrabold text-slate-900 mb-3 text-sm">What to do next</p>

                  <div className="space-y-2">
                    {[
                      'Log in to JAMB portal and accept your admission offer',
                      'Pay the acceptance fee at your chosen university',
                      'Collect your admission letter from the admissions office',
                      'Register for your faculty and courses',
                      'Prepare for your matriculation ceremony',
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-amber-700 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-700">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link
                    to="/advisor"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl
                               bg-[#0B1B3A] hover:bg-[#0A1630] text-white font-extrabold transition shadow-sm"
                  >
                    <MessageCircle size={18} className="text-amber-300" />
                    Ask AI Advisor
                  </Link>

                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center px-5 py-3 rounded-2xl
                               bg-white/80 backdrop-blur border border-slate-200 text-slate-900 font-extrabold
                               hover:bg-white transition shadow-sm"
                  >
                    Back to dashboard
                  </Link>
                </div>
              </div>
            </div>

            {/* Encouragement card */}
            <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-sm p-6 text-center">
              <p className="text-2xl mb-2">🥳</p>
              <p className="font-extrabold text-slate-900">You did it.</p>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                Your hard work paid off. The journey to your degree starts now — stay focused, stay proud.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}