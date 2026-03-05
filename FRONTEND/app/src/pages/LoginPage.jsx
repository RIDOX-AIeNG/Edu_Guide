// import { useState } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { useAuth } from '../context/AuthContext'
// import { GraduationCap, Eye, EyeOff } from 'lucide-react'
// import toast from 'react-hot-toast'
// import student from '../assets/images/download.jpg'

// export default function LoginPage() {
//   const { login } = useAuth()
//   const navigate = useNavigate()

//   const [form, setForm] = useState({ email: '', password: '' })
//   const [showPwd, setShowPwd] = useState(false)
//   const [loading, setLoading] = useState(false)

//   const handle = async (e) => {
//     e.preventDefault()
//     setLoading(true)

//     try {
//       await login(form.email, form.password)
//       toast.success('Welcome back!')
//       navigate('/dashboard')
//     } catch (err) {
//       toast.error(err.response?.data?.detail || 'Invalid credentials')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center px-6 py-10">

//       <div className="flex w-full max-w-6xl bg-white rounded-3xl overflow-hidden shadow-xl border min-h-[600px]">

//         {/* Nigerian Student Image */}
//         <div className="hidden md:block md:w-3/5 relative">

//           <img
//             src={student}
//             alt="Nigerian student studying"
//             className="h-full w-full object-cover"
//           />

//           {/* Overlay */}
//           <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-transparent"></div>

//           {/* Text on image */}
//           <div className="absolute bottom-10 left-10 text-white max-w-sm">
//             <h2 className="text-3xl font-bold">
             
//             </h2>

//             <p className="mt-2 text-sm text-white/90">
//               Access university guidance, track your progress,
//               and unlock opportunities for your future.
//             </p>
//           </div>

//         </div>

//         {/* Login Form */}
//         <div className="w-full md:w-2/5 p-10 flex items-center">

//           <div className="w-full">

//             {/* Logo */}
//             <div className="text-center mb-10">

//               <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
//                 <GraduationCap size={30} className="text-white" />
//               </div>

//               <h1 className="text-3xl font-bold text-gray-900">
//                 Welcome Back
//               </h1>

//               <p className="text-gray-500 mt-1">
//                 Sign in to continue your journey
//               </p>

//             </div>

//             <form onSubmit={handle} className="space-y-5">

//               {/* Email */}
//               <div>

//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Email Address
//                 </label>

//                 <input
//                   type="email"
//                   placeholder="you@example.com"
//                   value={form.email}
//                   onChange={(e) =>
//                     setForm(f => ({ ...f, email: e.target.value }))
//                   }
//                   required
//                   className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-400 outline-none"
//                 />

//               </div>

//               {/* Password */}
//               <div>

//                 <div className="flex justify-between items-center mb-1">

//                   <label className="block text-sm font-medium text-gray-700">
//                     Password
//                   </label>

//                   <Link
//                     to="/forgot-password"
//                     className="text-sm text-blue-600 hover:underline"
//                   >
//                     Forgot password?
//                   </Link>

//                 </div>

//                 <div className="relative">

//                   <input
//                     type={showPwd ? 'text' : 'password'}
//                     placeholder="••••••••"
//                     value={form.password}
//                     onChange={(e) =>
//                       setForm(f => ({ ...f, password: e.target.value }))
//                     }
//                     required
//                     className="w-full border rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-400 outline-none"
//                   />

//                   <button
//                     type="button"
//                     onClick={() => setShowPwd(!showPwd)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
//                   >
//                     {showPwd ? <EyeOff size={18}/> : <Eye size={18}/>}
//                   </button>

//                 </div>

//               </div>

//               {/* Login Button */}
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition"
//               >
//                 {loading ? 'Signing in...' : 'Sign In'}
//               </button>

//             </form>

//             <p className="text-center text-sm text-gray-500 mt-8">
//               Don’t have an account?{" "}
//               <Link
//                 to="/register"
//                 className="text-blue-600 font-semibold hover:underline"
//               >
//                 Create one
//               </Link>
//             </p>

//           </div>

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
import student from '../assets/images/download.jpg'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7FAFF] text-slate-900 flex items-center justify-center px-6 py-10">
      {/* Background accents (same theme as landing) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute top-40 -left-40 h-[520px] w-[520px] rounded-full bg-sky-200/45 blur-3xl" />
      </div>

      <div className="relative flex w-full max-w-6xl bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl border border-slate-200 min-h-[620px]">
        {/* Nigerian Student Image */}
        <div className="hidden md:block md:w-3/5 relative">
          <img
            src={student}
            alt="Nigerian student studying"
            className="h-full w-full object-cover"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1B3A]/60 via-[#0B1B3A]/20 to-transparent" />

          {/* Text on image */}
          <div className="absolute bottom-10 left-10 right-10 text-white max-w-md">
            <p className="text-xs uppercase tracking-wider text-white/80">EduGuide</p>
            <h2 className="text-3xl font-extrabold leading-tight mt-2">
              Welcome back.
              <span className="block text-amber-300">Let’s continue.</span>
            </h2>
            <p className="mt-3 text-sm text-white/90 leading-relaxed">
              Access university guidance, track your progress, and unlock opportunities
              for your future.
            </p>

            <div className="mt-5 flex items-center gap-2 text-sm text-white/90">
              <CheckCircle size={16} className="text-amber-300" />
              Secure login • Fast access
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="w-full md:w-2/5 p-8 sm:p-10 flex items-center">
          <div className="w-full">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#0B1B3A] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <GraduationCap size={30} className="text-amber-300" />
              </div>

              <h1 className="text-3xl font-extrabold text-slate-900">Sign in</h1>
              <p className="text-slate-600 mt-1">Continue your journey with EduGuide</p>
            </div>

            <form onSubmit={handle} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white text-slate-900 placeholder:text-slate-400
                             focus:outline-none focus:ring-2 focus:ring-amber-300/70 focus:border-transparent"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-slate-700">
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-sm font-semibold text-[#0B1B3A] hover:text-[#102B63] hover:underline underline-offset-4"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    required
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
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0B1B3A] text-white font-semibold py-3 rounded-xl hover:bg-[#0A1630] transition
                           disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              {/* Optional: subtle secondary action */}
              <div className="text-center text-xs text-slate-500">
                By signing in, you agree to our <span className="text-slate-700">Terms</span> &{' '}
                <span className="text-slate-700">Privacy Policy</span>.
              </div>
            </form>

            <p className="text-center text-sm text-slate-600 mt-7">
              Don’t have an account?{' '}
              <Link
                to="/register"
                className="text-amber-700 font-bold hover:text-amber-600 hover:underline underline-offset-4"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}