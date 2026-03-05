// import { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import Layout from '../components/Layout'
// import Spinner from '../components/Spinner'
// import { universityService } from '../services/examService'
// import { Building2, Search, ChevronRight } from 'lucide-react'

// const STATUS_LABELS = {
//   'Admitting Now': { bg: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
//   'Forms Out':     { bg: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500'  },
//   'Closed':        { bg: 'bg-gray-100 text-gray-500',    dot: 'bg-gray-400'  },
//   'Opening Soon':  { bg: 'bg-yellow-100 text-yellow-700',dot: 'bg-yellow-400'},
// }

// // Hard-coded status overlays (replace with live DB data later)
// const UNI_STATUS = {
//   'UNILAG': 'Admitting Now',
//   'OAU':    'Forms Out',
//   'LASU':   'Admitting Now',
//   'UI':     'Closed',
//   'ABU':    'Opening Soon',
//   'UNN':    'Forms Out',
//   'CU':     'Admitting Now',
//   'FUTA':   'Opening Soon',
// }

// export default function InfoGuidePage() {
//   const navigate = useNavigate()
//   const [unis,    setUnis]    = useState([])
//   const [search,  setSearch]  = useState('')
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     universityService.list()
//       .then(r => setUnis(r.data))
//       .catch(console.error)
//       .finally(() => setLoading(false))
//   }, [])

//   const filtered = unis.filter(u =>
//     u.name.toLowerCase().includes(search.toLowerCase()) ||
//     (u.short_name || '').toLowerCase().includes(search.toLowerCase())
//   )

//   return (
//     <Layout>
//       <div className="max-w-3xl mx-auto px-6 py-8">
//         {/* Page header */}
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold text-gray-900">Info Guide</h1>
//           <p className="text-gray-500 text-sm mt-1">
//             Browse Nigerian universities — requirements, status, and courses.
//           </p>
//         </div>

//         {/* Search */}
//         <div className="relative mb-5">
//           <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
//           <input className="input pl-10 text-sm" placeholder="Search universities..."
//             value={search} onChange={e => setSearch(e.target.value)} />
//         </div>

//         {loading ? (
//           <div className="flex justify-center py-16"><Spinner size="lg" /></div>
//         ) : (
//           <div className="space-y-3">
//             {filtered.map(u => {
//               const statusKey   = UNI_STATUS[u.short_name] || 'Opening Soon'
//               const statusStyle = STATUS_LABELS[statusKey] || STATUS_LABELS['Opening Soon']
//               const typeLabel   = u.type
//                 ? u.type.charAt(0).toUpperCase() + u.type.slice(1)
//                 : 'University'

//               return (
//                 <div key={u.id}
//                   className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-5 py-4 hover:shadow-sm transition-all">
//                   <div className="flex items-center gap-4">
//                     {/* Icon */}
//                     <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
//                       <Building2 size={18} className="text-gray-500" />
//                     </div>

//                     {/* Info */}
//                     <div>
//                       <p className="font-bold text-gray-900">
//                         {u.name} ({u.short_name || u.name})
//                       </p>
//                       <div className="flex items-center gap-2 mt-1 flex-wrap">
//                         <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
//                           {typeLabel}
//                         </span>
//                         <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusStyle.bg}`}>
//                           {statusKey}
//                         </span>
//                       </div>
//                       <p className="text-xs text-gray-500 mt-1">
//                         Req: JAMB {u.jamb_cutoff || 200}+, 5 O'Level Credits
//                       </p>
//                     </div>
//                   </div>

//                   {/* View Courses button */}
//                   <button
//                     onClick={() => navigate(`/universities?highlight=${u.id}`)}
//                     className="flex-shrink-0 text-sm font-medium text-gray-700 border border-gray-200
//                       px-4 py-2 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all
//                       flex items-center gap-1.5">
//                     View Courses
//                     <ChevronRight size={14} />
//                   </button>
//                 </div>
//               )
//             })}

//             {filtered.length === 0 && (
//               <div className="text-center py-16 text-gray-400">
//                 <Building2 size={40} className="mx-auto mb-3 opacity-30" />
//                 <p>No universities found.</p>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </Layout>
//   )
// }


import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import { universityService } from '../services/examService'
import { Building2, Search, ChevronRight } from 'lucide-react'

const STATUS_LABELS = {
  'Admitting Now': { pill: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' },
  'Forms Out': { pill: 'bg-sky-100 text-sky-800 border-sky-200', dot: 'bg-sky-500' },
  'Closed': { pill: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' },
  'Opening Soon': { pill: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
}

// Hard-coded status overlays (replace with live DB data later)
const UNI_STATUS = {
  UNILAG: 'Admitting Now',
  OAU: 'Forms Out',
  LASU: 'Admitting Now',
  UI: 'Closed',
  ABU: 'Opening Soon',
  UNN: 'Forms Out',
  CU: 'Admitting Now',
  FUTA: 'Opening Soon',
}

export default function InfoGuidePage() {
  const navigate = useNavigate()
  const [unis, setUnis] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    universityService
      .list()
      .then((r) => setUnis(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = unis.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      (u.short_name || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Layout>
      <div className="min-h-screen bg-[#F7FAFF] text-slate-900">
        {/* Background accents (theme-consistent) */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-amber-200/35 blur-3xl" />
          <div className="absolute top-40 -left-40 h-[520px] w-[520px] rounded-full bg-sky-200/40 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="mb-7">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0B1B3A]/10 flex items-center justify-center">
                <Building2 size={22} className="text-[#0B1B3A]" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  Info Guide
                </h1>
                <p className="text-slate-600 text-sm mt-1">
                  Browse Nigerian universities — requirements, status, and courses.
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              className="w-full rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-xl px-11 py-3 text-sm text-slate-900
                         placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-300/70 focus:border-transparent"
              placeholder="Search universities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((u) => {
                const statusKey = UNI_STATUS[u.short_name] || 'Opening Soon'
                const statusStyle = STATUS_LABELS[statusKey] || STATUS_LABELS['Opening Soon']
                const typeLabel = u.type
                  ? u.type.charAt(0).toUpperCase() + u.type.slice(1)
                  : 'University'

                return (
                  <div
                    key={u.id}
                    className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl
                               px-5 py-4 shadow-sm hover:shadow-md hover:-translate-y-[1px] transition"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Icon */}
                      <div className="w-11 h-11 bg-[#0B1B3A]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Building2 size={18} className="text-[#0B1B3A]" />
                      </div>

                      {/* Info */}
                      <div className="min-w-0">
                        <p className="font-extrabold text-slate-900 truncate">
                          {u.name} <span className="text-slate-400 font-bold">({u.short_name || u.name})</span>
                        </p>

                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200 font-semibold">
                            {typeLabel}
                          </span>

                          <span
                            className={`inline-flex items-center gap-2 text-xs px-2.5 py-1 rounded-full border font-extrabold ${statusStyle.pill}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                            {statusKey}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 mt-2">
                          Req: JAMB {u.jamb_cutoff || 200}+, 5 O&apos;Level Credits
                        </p>
                      </div>
                    </div>

                    {/* View Courses button */}
                    <button
                      onClick={() => navigate(`/universities?highlight=${u.id}`)}
                      className="flex-shrink-0 inline-flex items-center gap-2 text-sm font-extrabold
                                 text-[#0B1B3A] border border-slate-200 bg-white/70 px-4 py-2 rounded-xl
                                 hover:bg-amber-50 hover:border-amber-200 transition"
                    >
                      View courses
                      <ChevronRight size={14} className="text-amber-700" />
                    </button>
                  </div>
                )
              })}

              {filtered.length === 0 && (
                <div className="text-center py-16 text-slate-500">
                  <div className="w-14 h-14 rounded-2xl bg-[#0B1B3A]/10 flex items-center justify-center mx-auto mb-3">
                    <Building2 size={28} className="text-[#0B1B3A]" />
                  </div>
                  <p className="font-semibold">No universities found.</p>
                  <p className="text-sm text-slate-500 mt-1">Try a different keyword.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}