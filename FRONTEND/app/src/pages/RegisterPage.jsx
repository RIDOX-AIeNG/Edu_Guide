// import { useState } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { useAuth } from '../context/AuthContext'
// import { GraduationCap, Eye, EyeOff } from 'lucide-react'
// import toast from 'react-hot-toast'

// const CLASS_LEVELS = ['SS1', 'SS2', 'SS3']
// const INTERESTS    = ['Medicine', 'Engineering', 'Law', 'Accounting', 'Computer Science',
//                       'Architecture', 'Pharmacy', 'Education', 'Agriculture', 'Mass Communication']

// export default function RegisterPage() {
//   const { register } = useAuth()
//   const navigate     = useNavigate()
//   const [form, setForm] = useState({
//     full_name: '', email: '', password: '', class_level: '', career_interests: ''
//   })
//   const [selected, setSelected] = useState([])
//   const [showPwd,  setShowPwd]  = useState(false)
//   const [loading,  setLoading]  = useState(false)

//   const toggleInterest = (i) => {
//     setSelected(prev =>
//       prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
//     )
//   }

//   const handle = async (e) => {
//     e.preventDefault()
//     if (!form.class_level) { toast.error('Please select your class level'); return }
//     setLoading(true)
//     try {
//       await register({ ...form, career_interests: selected.join(', ') })
//       toast.success('Account created! Welcome to EduGuide 🎉')
//       navigate('/dashboard')
//     } catch (err) {
//       toast.error(err.response?.data?.detail || 'Registration failed')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const F = (k) => ({ value: form[k], onChange: e => setForm(f => ({ ...f, [k]: e.target.value })) })

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center px-4 py-10">
//       <div className="w-full max-w-lg">
//         <div className="text-center mb-8">
//           <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
//             <GraduationCap size={28} className="text-white" />
//           </div>
//           <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
//           <p className="text-gray-500 text-sm mt-1">Start your journey to university admission</p>
//         </div>

//         <div className="card">
//           <form onSubmit={handle} className="space-y-4">
//             <div>
//               <label className="label">Full Name</label>
//               <input type="text" className="input" placeholder="John Doe" {...F('full_name')} required />
//             </div>
//             <div>
//               <label className="label">Email Address</label>
//               <input type="email" className="input" placeholder="you@example.com" {...F('email')} required />
//             </div>
//             <div>
//               <label className="label">Password</label>
//               <div className="relative">
//                 <input type={showPwd ? 'text' : 'password'} className="input pr-10"
//                   placeholder="At least 6 characters" {...F('password')} required minLength={6} />
//                 <button type="button" onClick={() => setShowPwd(!showPwd)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
//                   {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
//                 </button>
//               </div>
//             </div>
//             <div>
//               <label className="label">Class Level</label>
//               <div className="flex gap-3">
//                 {CLASS_LEVELS.map(lvl => (
//                   <button key={lvl} type="button"
//                     onClick={() => setForm(f => ({ ...f, class_level: lvl }))}
//                     className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all
//                       ${form.class_level === lvl
//                         ? 'border-green-500 bg-green-50 text-green-700'
//                         : 'border-gray-200 text-gray-600 hover:border-green-300'}`}>
//                     {lvl}
//                   </button>
//                 ))}
//               </div>
//             </div>
//             <div>
//               <label className="label">Career Interests (optional)</label>
//               <div className="flex flex-wrap gap-2 mt-1">
//                 {INTERESTS.map(i => (
//                   <button key={i} type="button" onClick={() => toggleInterest(i)}
//                     className={`text-xs px-3 py-1.5 rounded-full border transition-all
//                       ${selected.includes(i)
//                         ? 'bg-green-600 border-green-600 text-white'
//                         : 'border-gray-300 text-gray-600 hover:border-green-400'}`}>
//                     {i}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
//               {loading ? 'Creating account...' : 'Create Account'}
//             </button>
//           </form>
//           <p className="text-center text-sm text-gray-500 mt-6">
//             Already have an account?{' '}
//             <Link to="/login" className="text-green-600 font-semibold hover:underline">Sign in</Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   )
// }


import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { GraduationCap, Eye, EyeOff, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const CLASS_LEVELS = ['SS1', 'SS2', 'SS3']
const INTERESTS = [
  'Medicine',
  'Engineering',
  'Law',
  'Accounting',
  'Computer Science',
  'Architecture',
  'Pharmacy',
  'Education',
  'Agriculture',
  'Mass Communication',
]

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    class_level: '',
    career_interests: '',
  })
  const [selected, setSelected] = useState([])
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const toggleInterest = (i) => {
    setSelected((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]))
  }

  const handle = async (e) => {
    e.preventDefault()
    if (!form.class_level) {
      toast.error('Please select your class level')
      return
    }
    setLoading(true)
    try {
      await register({ ...form, career_interests: selected.join(', ') })
      toast.success('Account created! Welcome to EduGuide 🎉')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const F = (k) => ({
    value: form[k],
    onChange: (e) => setForm((f) => ({ ...f, [k]: e.target.value })),
  })

  return (
    <div className="min-h-screen bg-[#F7FAFF] text-slate-900 flex items-center justify-center px-6 py-10">
      {/* Background accents (same theme as landing/login) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute top-40 -left-40 h-[520px] w-[520px] rounded-full bg-sky-200/45 blur-3xl" />
      </div>

      <div className="relative w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#0B1B3A] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <GraduationCap size={28} className="text-amber-300" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Create your account</h1>
          <p className="text-slate-600 text-sm mt-1">
            Start your journey to university admission
          </p>

          <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-white/70 border border-slate-200 text-slate-700">
            <CheckCircle size={14} className="text-amber-600" />
            Free to start • No card required
          </div>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl p-6 sm:p-8">
          <form onSubmit={handle} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                {...F('full_name')}
                required
                className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white text-slate-900 placeholder:text-slate-400
                           focus:outline-none focus:ring-2 focus:ring-amber-300/70 focus:border-transparent"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                {...F('email')}
                required
                className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white text-slate-900 placeholder:text-slate-400
                           focus:outline-none focus:ring-2 focus:ring-amber-300/70 focus:border-transparent"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  {...F('password')}
                  required
                  minLength={6}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-11 bg-white text-slate-900 placeholder:text-slate-400
                             focus:outline-none focus:ring-2 focus:ring-amber-300/70 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Use 6+ characters for a stronger password.
              </p>
            </div>

            {/* Class Level */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Class level
              </label>
              <div className="flex gap-3">
                {CLASS_LEVELS.map((lvl) => {
                  const active = form.class_level === lvl
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, class_level: lvl }))}
                      className={[
                        'flex-1 py-2.5 rounded-xl border text-sm font-semibold transition',
                        active
                          ? 'border-amber-300 bg-amber-50 text-[#0B1B3A] shadow-sm'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-white',
                      ].join(' ')}
                    >
                      {lvl}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Career interests <span className="text-slate-400 font-normal">(optional)</span>
              </label>

              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((i) => {
                  const on = selected.includes(i)
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleInterest(i)}
                      className={[
                        'text-xs px-3 py-1.5 rounded-full border transition',
                        on
                          ? 'bg-[#0B1B3A] border-[#0B1B3A] text-white'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50',
                      ].join(' ')}
                    >
                      {i}
                    </button>
                  )
                })}
              </div>

              <p className="text-xs text-slate-500 mt-2">
                Pick a few so we can personalize your recommendations.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#0B1B3A] text-white font-semibold py-3 rounded-xl hover:bg-[#0A1630] transition
                         disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-amber-700 font-bold hover:text-amber-600 hover:underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>

          <p className="text-center text-xs text-slate-500 mt-3">
            By creating an account, you agree to our{' '}
            <span className="text-slate-700">Terms</span> &{' '}
            <span className="text-slate-700">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  )
}