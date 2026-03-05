// import { useState, useEffect } from 'react'
// import Layout from '../components/Layout'
// import Spinner from '../components/Spinner'
// import { universityService } from '../services/examService'
// import { useAuth } from '../context/AuthContext'
// import toast from 'react-hot-toast'
// import {
//   Building2, Search, Filter, MapPin, ChevronDown,
//   ChevronUp, BookOpen, CheckCircle, ExternalLink
// } from 'lucide-react'

// const STATES = ['Lagos','Oyo','Ogun','Kaduna','Kano','Enugu','Rivers','Anambra','Delta','Osun','Ondo','FCT']
// const TYPES  = ['federal','state','private']

// function UniversityCard({ uni, expanded, onToggle, onSelect, selected }) {
//   const [courses,     setCourses]     = useState([])
//   const [loadCourses, setLoadCourses] = useState(false)
//   const [selCourse,   setSelCourse]   = useState(null)
//   const [saving,      setSaving]      = useState(false)

//   const loadC = async () => {
//     if (courses.length > 0) { onToggle(); return }
//     setLoadCourses(true)
//     try {
//       const { data } = await universityService.getCourses(uni.id)
//       setCourses(data)
//     } catch (_) {} finally { setLoadCourses(false) }
//     onToggle()
//   }

//   const handleSelect = async (course) => {
//     setSaving(true)
//     try {
//       await universityService.select(uni.id, course.id)
//       toast.success(`Selected ${uni.short_name || uni.name} — ${course.name}`)
//       onSelect(uni, course)
//     } catch (_) {
//       toast.error('Failed to save selection')
//     } finally { setSaving(false) }
//   }

//   const typeColor = { federal: 'badge-blue', state: 'badge-green', private: 'badge-yellow' }

//   return (
//     <div className={`card transition-all ${selected ? 'border-2 border-green-400' : ''}`}>
//       <div className="flex items-start justify-between">
//         <div className="flex-1">
//           <div className="flex items-center gap-2 flex-wrap mb-1">
//             <h3 className="font-bold text-gray-900">{uni.name}</h3>
//             {selected && <span className="badge-green text-xs">Selected ✓</span>}
//           </div>
//           <div className="flex items-center gap-3 text-sm text-gray-500">
//             <span className="flex items-center gap-1"><MapPin size={12} />{uni.state}</span>
//             <span className={typeColor[uni.type] || 'badge-gray'}>{uni.type}</span>
//             {uni.jamb_cutoff && <span className="text-xs">Min JAMB: {uni.jamb_cutoff}</span>}
//           </div>
//           {uni.description && <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">{uni.description}</p>}
//         </div>
//         <button onClick={loadC} className="ml-4 p-2 rounded-lg hover:bg-gray-100 transition-all">
//           {loadCourses ? <Spinner size="sm" /> : expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
//         </button>
//       </div>

//       {expanded && (
//         <div className="mt-4 pt-4 border-t border-gray-100">
//           <h4 className="text-sm font-semibold text-gray-600 mb-3">Available Courses</h4>
//           {courses.length === 0 ? (
//             <p className="text-sm text-gray-400">No courses available</p>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
//               {courses.map(c => (
//                 <div key={c.id}
//                   className={`p-3 rounded-lg border-2 transition-all
//                     ${selCourse?.id === c.id ? 'border-green-400 bg-green-50' : 'border-gray-100 hover:border-gray-300'}`}>
//                   <div className="flex items-start justify-between">
//                     <div className="flex-1">
//                       <p className="font-semibold text-gray-800 text-sm">{c.name}</p>
//                       <p className="text-xs text-gray-500">{c.faculty}</p>
//                       {c.jamb_cutoff && (
//                         <p className="text-xs text-orange-600 mt-1">JAMB Cutoff: {c.jamb_cutoff}/400</p>
//                       )}
//                       {c.jamb_subjects?.length > 0 && (
//                         <p className="text-xs text-gray-400 mt-0.5">
//                           {c.jamb_subjects.slice(0, 3).join(' · ')}
//                           {c.jamb_subjects.length > 3 && ` +${c.jamb_subjects.length - 3}`}
//                         </p>
//                       )}
//                     </div>
//                     <button onClick={() => handleSelect(c)} disabled={saving}
//                       className="ml-2 flex-shrink-0 text-xs px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-all">
//                       {saving && selCourse?.id === c.id ? '...' : 'Select'}
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }

// export default function UniversitiesPage() {
//   const { user, refreshUser } = useAuth()
//   const [unis,      setUnis]      = useState([])
//   const [loading,   setLoading]   = useState(true)
//   const [search,    setSearch]    = useState('')
//   const [filterState, setFilterState] = useState('')
//   const [filterType,  setFilterType]  = useState('')
//   const [expanded,  setExpanded]  = useState({})
//   const [selUni,    setSelUni]    = useState(null)
//   const [selCourse, setSelCourse] = useState(null)

//   // JAMB score recommendation
//   const [jambScore, setJambScore] = useState('')
//   const [recs,      setRecs]      = useState([])
//   const [recLoading,setRecLoading]= useState(false)

//   useEffect(() => {
//     const params = {}
//     if (filterState) params.state = filterState
//     if (filterType)  params.type  = filterType
//     universityService.list(params)
//       .then(r => setUnis(r.data))
//       .catch(() => toast.error('Failed to load universities'))
//       .finally(() => setLoading(false))
//   }, [filterState, filterType])

//   const getRecommendations = async () => {
//     if (!jambScore || isNaN(jambScore)) { toast.error('Enter a valid JAMB score'); return }
//     setRecLoading(true)
//     try {
//       const { data } = await universityService.recommend(parseInt(jambScore), '')
//       setRecs(data)
//     } catch (_) { toast.error('Failed to get recommendations') }
//     finally { setRecLoading(false) }
//   }

//   const handleSelect = async (uni, course) => {
//     setSelUni(uni)
//     setSelCourse(course)
//     await refreshUser()
//   }

//   const filtered = unis.filter(u =>
//     u.name.toLowerCase().includes(search.toLowerCase()) ||
//     (u.short_name || '').toLowerCase().includes(search.toLowerCase())
//   )

//   if (loading) return (
//     <Layout>
//       <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>
//     </Layout>
//   )

//   return (
//     <Layout>
//       <div className="max-w-5xl mx-auto px-6 py-8">
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">Universities</h1>
//             <p className="text-sm text-gray-500">Browse and select your target university</p>
//           </div>
//           {selUni && (
//             <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm">
//               <p className="font-semibold text-green-800">{selUni.short_name} — {selCourse?.name}</p>
//               <p className="text-xs text-green-600">Currently selected</p>
//             </div>
//           )}
//         </div>

//         {/* JAMB Score Recommendation */}
//         <div className="card mb-6 bg-blue-50 border border-blue-200">
//           <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
//             <BookOpen size={16} /> Find Universities by JAMB Score
//           </h3>
//           <div className="flex gap-3">
//             <input type="number" className="input max-w-xs" placeholder="Enter JAMB score (e.g. 240)"
//               value={jambScore} onChange={e => setJambScore(e.target.value)}
//               min={0} max={400} />
//             <button onClick={getRecommendations} disabled={recLoading}
//               className="btn-secondary flex items-center gap-2 whitespace-nowrap">
//               {recLoading ? <Spinner size="sm" color="white" /> : 'Find Matches'}
//             </button>
//           </div>
//           {recs.length > 0 && (
//             <div className="mt-3 space-y-2">
//               {recs.slice(0, 5).map((r, i) => (
//                 <div key={i} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 text-sm">
//                   <div>
//                     <p className="font-semibold text-gray-800">{r.university_name}</p>
//                     <p className="text-xs text-gray-500">{r.course_name}</p>
//                   </div>
//                   <span className="text-xs text-green-700 font-bold">+{r.score_above_cutoff} above cutoff</span>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Filters */}
//         <div className="flex items-center gap-3 mb-4 flex-wrap">
//           <div className="relative flex-1 min-w-48">
//             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//             <input className="input pl-9 text-sm" placeholder="Search universities..."
//               value={search} onChange={e => setSearch(e.target.value)} />
//           </div>
//           <select className="input max-w-xs text-sm" value={filterState} onChange={e => setFilterState(e.target.value)}>
//             <option value="">All States</option>
//             {STATES.map(s => <option key={s} value={s}>{s}</option>)}
//           </select>
//           <select className="input max-w-xs text-sm" value={filterType} onChange={e => setFilterType(e.target.value)}>
//             <option value="">All Types</option>
//             {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
//           </select>
//           <span className="text-sm text-gray-500">{filtered.length} universities</span>
//         </div>

//         {/* University list */}
//         <div className="space-y-4">
//           {filtered.map(u => (
//             <UniversityCard key={u.id} uni={u}
//               expanded={!!expanded[u.id]}
//               selected={selUni?.id === u.id}
//               onToggle={() => setExpanded(prev => ({ ...prev, [u.id]: !prev[u.id] }))}
//               onSelect={handleSelect}
//             />
//           ))}
//           {filtered.length === 0 && (
//             <div className="text-center py-16 text-gray-400">
//               <Building2 size={48} className="mx-auto mb-3 opacity-30" />
//               <p>No universities found matching your search.</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </Layout>
//   )
// }


import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import { universityService } from '../services/examService'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Building2, Search, MapPin, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'

const STATES = ['Lagos', 'Oyo', 'Ogun', 'Kaduna', 'Kano', 'Enugu', 'Rivers', 'Anambra', 'Delta', 'Osun', 'Ondo', 'FCT']
const TYPES = ['federal', 'state', 'private']

const TYPE_BADGE = {
  federal: 'bg-sky-100 text-sky-800 border-sky-200',
  state: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  private: 'bg-amber-100 text-amber-800 border-amber-200',
}

function UniversityCard({ uni, expanded, onToggle, onSelect, selected }) {
  const [courses, setCourses] = useState([])
  const [loadCourses, setLoadCourses] = useState(false)
  const [savingId, setSavingId] = useState(null)

  const loadC = async () => {
    if (courses.length > 0) {
      onToggle()
      return
    }
    setLoadCourses(true)
    try {
      const { data } = await universityService.getCourses(uni.id)
      setCourses(data)
    } catch (_) {
    } finally {
      setLoadCourses(false)
    }
    onToggle()
  }

  const handleSelect = async (course) => {
    setSavingId(course.id)
    try {
      await universityService.select(uni.id, course.id)
      toast.success(`Selected ${uni.short_name || uni.name} — ${course.name}`)
      onSelect(uni, course)
    } catch (_) {
      toast.error('Failed to save selection')
    } finally {
      setSavingId(null)
    }
  }

  const typeLabel = uni.type ? uni.type.charAt(0).toUpperCase() + uni.type.slice(1) : 'University'
  const typeBadge = TYPE_BADGE[uni.type] || 'bg-slate-100 text-slate-700 border-slate-200'

  return (
    <div
      className={[
        'rounded-3xl border bg-white/80 backdrop-blur-xl shadow-sm p-5 transition',
        selected ? 'border-amber-200 ring-2 ring-amber-300/60' : 'border-slate-200 hover:shadow-md hover:-translate-y-[1px]',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-extrabold text-slate-900 truncate">{uni.name}</h3>
            {selected && (
              <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full border bg-amber-50 text-amber-800 border-amber-200">
                Selected ✓
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap text-sm text-slate-600">
            <span className="inline-flex items-center gap-1">
              <MapPin size={12} className="text-slate-400" />
              {uni.state}
            </span>

            <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border ${typeBadge}`}>
              {typeLabel}
            </span>

            {uni.jamb_cutoff && (
              <span className="text-xs text-slate-500">
                Min JAMB: <span className="font-semibold text-slate-700">{uni.jamb_cutoff}</span>
              </span>
            )}
          </div>

          {uni.description && (
            <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
              {uni.description}
            </p>
          )}
        </div>

        <button
          onClick={loadC}
          className="p-2 rounded-xl border border-slate-200 bg-white/70 hover:bg-white transition flex-shrink-0"
          aria-label={expanded ? 'Collapse courses' : 'Expand courses'}
        >
          {loadCourses ? <Spinner size="sm" /> : expanded ? <ChevronUp size={18} className="text-slate-600" /> : <ChevronDown size={18} className="text-slate-600" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-5 pt-5 border-t border-slate-200">
          <h4 className="text-sm font-extrabold text-slate-900 mb-3">Available courses</h4>

          {courses.length === 0 ? (
            <p className="text-sm text-slate-500">No courses available</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {courses.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-extrabold text-slate-900 text-sm leading-tight">{c.name}</p>
                      <p className="text-xs text-slate-600 mt-1">{c.faculty}</p>

                      {c.jamb_cutoff && (
                        <p className="text-xs text-amber-800 mt-2 font-semibold">
                          JAMB Cutoff: {c.jamb_cutoff}/400
                        </p>
                      )}

                      {c.jamb_subjects?.length > 0 && (
                        <p className="text-xs text-slate-500 mt-1">
                          {c.jamb_subjects.slice(0, 3).join(' · ')}
                          {c.jamb_subjects.length > 3 && ` +${c.jamb_subjects.length - 3}`}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleSelect(c)}
                      disabled={!!savingId}
                      className="flex-shrink-0 text-xs px-3 py-2 rounded-xl bg-[#0B1B3A] hover:bg-[#0A1630]
                                 text-white font-extrabold transition disabled:opacity-60"
                    >
                      {savingId === c.id ? 'Saving…' : 'Select'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function UniversitiesPage() {
  const { refreshUser } = useAuth()
  const [unis, setUnis] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterState, setFilterState] = useState('')
  const [filterType, setFilterType] = useState('')
  const [expanded, setExpanded] = useState({})
  const [selUni, setSelUni] = useState(null)
  const [selCourse, setSelCourse] = useState(null)

  // JAMB score recommendation
  const [jambScore, setJambScore] = useState('')
  const [recs, setRecs] = useState([])
  const [recLoading, setRecLoading] = useState(false)

  useEffect(() => {
    const params = {}
    if (filterState) params.state = filterState
    if (filterType) params.type = filterType

    setLoading(true)
    universityService
      .list(params)
      .then((r) => setUnis(r.data))
      .catch(() => toast.error('Failed to load universities'))
      .finally(() => setLoading(false))
  }, [filterState, filterType])

  const getRecommendations = async () => {
    if (!jambScore || isNaN(jambScore)) {
      toast.error('Enter a valid JAMB score')
      return
    }
    setRecLoading(true)
    try {
      const { data } = await universityService.recommend(parseInt(jambScore), '')
      setRecs(data)
    } catch (_) {
      toast.error('Failed to get recommendations')
    } finally {
      setRecLoading(false)
    }
  }

  const handleSelect = async (uni, course) => {
    setSelUni(uni)
    setSelCourse(course)
    await refreshUser()
  }

  const filtered = unis.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      (u.short_name || '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading)
    return (
      <Layout>
        <div className="min-h-screen bg-[#F7FAFF] flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </Layout>
    )

  return (
    <Layout>
      <div className="min-h-screen bg-[#F7FAFF] text-slate-900">
        {/* Background accents */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-amber-200/35 blur-3xl" />
          <div className="absolute top-40 -left-40 h-[520px] w-[520px] rounded-full bg-sky-200/40 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Universities
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Browse and select your target university
              </p>
            </div>

            {selUni && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm shadow-sm">
                <p className="font-extrabold text-slate-900">
                  {selUni.short_name || selUni.name} — {selCourse?.name}
                </p>
                <p className="text-xs text-amber-800 font-semibold mt-0.5">Currently selected</p>
              </div>
            )}
          </div>

          {/* JAMB Score Recommendation */}
          <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-sm p-6 mb-6">
            <h3 className="font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-amber-100 flex items-center justify-center">
                <BookOpen size={16} className="text-amber-800" />
              </div>
              Find universities by JAMB score
            </h3>

            <div className="flex gap-3 flex-wrap">
              <input
                type="number"
                className="w-full sm:w-auto sm:min-w-[280px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-300/70 focus:border-transparent"
                placeholder="Enter JAMB score (e.g. 240)"
                value={jambScore}
                onChange={(e) => setJambScore(e.target.value)}
                min={0}
                max={400}
              />

              <button
                onClick={getRecommendations}
                disabled={recLoading}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl
                           bg-[#0B1B3A] hover:bg-[#0A1630] text-white font-extrabold transition
                           disabled:opacity-60 shadow-sm"
              >
                {recLoading ? <Spinner size="sm" color="white" /> : 'Find matches'}
              </button>
            </div>

            {recs.length > 0 && (
              <div className="mt-4 space-y-2">
                {recs.slice(0, 5).map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-extrabold text-slate-900 truncate">{r.university_name}</p>
                      <p className="text-xs text-slate-600 truncate">{r.course_name}</p>
                    </div>
                    <span className="text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full whitespace-nowrap">
                      +{r.score_above_cutoff} above cutoff
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-56">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-xl pl-11 pr-4 py-3 text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-300/70 focus:border-transparent"
                placeholder="Search universities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-xl px-4 py-3 text-sm
                         focus:outline-none focus:ring-2 focus:ring-amber-300/70 focus:border-transparent"
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
            >
              <option value="">All states</option>
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-xl px-4 py-3 text-sm
                         focus:outline-none focus:ring-2 focus:ring-amber-300/70 focus:border-transparent"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All types</option>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>

            <span className="text-sm text-slate-600 font-semibold">{filtered.length} universities</span>
          </div>

          {/* University list */}
          <div className="space-y-4">
            {filtered.map((u) => (
              <UniversityCard
                key={u.id}
                uni={u}
                expanded={!!expanded[u.id]}
                selected={selUni?.id === u.id}
                onToggle={() => setExpanded((prev) => ({ ...prev, [u.id]: !prev[u.id] }))}
                onSelect={handleSelect}
              />
            ))}

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
        </div>
      </div>
    </Layout>
  )
}