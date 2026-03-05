// import { Link } from 'react-router-dom'
// import { GraduationCap, BookOpen, Brain, MessageCircle, ArrowRight, CheckCircle } from 'lucide-react'

// const STEPS = [
//   { step: '01', title: 'Register',      desc: 'Create your account with your class level and career interests.' },
//   { step: '02', title: 'WAEC Prep',     desc: 'Take mock exams per subject. Get grades A1–F9 with topic feedback.' },
//   { step: '03', title: 'JAMB',          desc: '180 questions across 4 subjects. Score out of 400, check university cutoffs.' },
//   { step: '04', title: 'POST-UTME',     desc: 'University-specific screening. Pass → get your admission letter!' },
// ]

// const FEATURES = [
//   { icon: BookOpen,       title: 'WAEC + JAMB + POST-UTME', desc: 'Full exam simulation with real Nigerian question patterns.' },
//   { icon: Brain,          title: 'AI Study Advisor',         desc: 'Context-aware AI that remembers your progress and weak topics.' },
//   { icon: GraduationCap, title: 'University Matching',       desc: 'Instantly see which universities your JAMB score qualifies for.' },
//   { icon: MessageCircle,  title: 'Career Guidance',          desc: 'Get career path advice aligned with your strengths and interests.' },
// ]

// export default function LandingPage() {
//   return (
//     <div className="min-h-screen bg-white">
//       {/* Navbar */}
//       <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
//         <div className="flex items-center gap-2">
//           <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center">
//             <GraduationCap size={20} className="text-white" />
//           </div>
//           <span className="text-xl font-bold text-gray-900">EduGuide</span>
//         </div>
//         <div className="flex items-center gap-3">
//           <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2">Login</Link>
//           <Link to="/register" className="btn-primary text-sm">Get Started Free</Link>
//         </div>
//       </nav>

//       {/* Hero */}
//       <section className="max-w-7xl mx-auto px-6 py-20 text-center">
//         <span className="badge-green mb-4 inline-block">Nigeria's #1 Exam Prep Platform</span>
//         <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
//           From WAEC to Admission —<br />
//           <span className="text-green-600">Your Complete Journey</span>
//         </h1>
//         <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
//           Practice WAEC, JAMB, and POST-UTME with an AI advisor that knows your weak
//           topics, recommends universities, and guides you step by step to admission.
//         </p>
//         <div className="flex items-center justify-center gap-4 flex-wrap">
//           <Link to="/register" className="btn-primary flex items-center gap-2 text-base">
//             Start Free <ArrowRight size={18} />
//           </Link>
//           <Link to="/login" className="btn-outline text-base">I have an account</Link>
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16">
//           {[['10,000+','Practice Questions'], ['50+','Universities'], ['AI','Career Advisor']].map(([v, l]) => (
//             <div key={l}>
//               <p className="text-3xl font-extrabold text-green-600">{v}</p>
//               <p className="text-sm text-gray-500 mt-1">{l}</p>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* How it works */}
//       <section className="bg-gray-50 py-20">
//         <div className="max-w-7xl mx-auto px-6">
//           <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//             {STEPS.map(({ step, title, desc }) => (
//               <div key={step} className="card text-center relative">
//                 <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
//                   {step}
//                 </div>
//                 <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
//                 <p className="text-sm text-gray-500">{desc}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Features */}
//       <section className="py-20">
//         <div className="max-w-7xl mx-auto px-6">
//           <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Everything You Need</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {FEATURES.map(({ icon: Icon, title, desc }) => (
//               <div key={title} className="card flex gap-4">
//                 <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
//                   <Icon size={24} className="text-green-600" />
//                 </div>
//                 <div>
//                   <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
//                   <p className="text-sm text-gray-500">{desc}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* CTA */}
//       <section className="bg-green-600 py-16 text-center">
//         <h2 className="text-3xl font-bold text-white mb-4">Ready to get admitted?</h2>
//         <p className="text-green-100 mb-8">Join thousands of Nigerian students on their journey.</p>
//         <Link to="/register" className="bg-white text-green-700 font-bold px-8 py-3 rounded-lg hover:bg-green-50 transition-all inline-flex items-center gap-2">
//           Create Free Account <ArrowRight size={18} />
//         </Link>
//       </section>

//       <footer className="text-center py-8 text-sm text-gray-400">
//         © 2024 EduGuide. Built for Nigerian students.
//       </footer>
//     </div>
//   )
// }



import { Link } from 'react-router-dom'
import {
  GraduationCap,
  BookOpen,
  Brain,
  MessageCircle,
  ArrowRight,
  CheckCircle,
} from 'lucide-react'

const STEPS = [
  { step: '01', title: 'Register', desc: 'Create your account with your class level and career interests.' },
  { step: '02', title: 'WAEC Prep', desc: 'Take mock exams per subject. Get grades A1–F9 with topic feedback.' },
  { step: '03', title: 'JAMB', desc: '180 questions across 4 subjects. Score out of 400, check university cutoffs.' },
  { step: '04', title: 'POST-UTME', desc: 'University-specific screening. Pass → get your admission letter!' },
]

const FEATURES = [
  { icon: BookOpen, title: 'WAEC + JAMB + POST-UTME', desc: 'Full exam simulation with real Nigerian question patterns.' },
  { icon: Brain, title: 'AI Study Advisor', desc: 'Context-aware AI that remembers your progress and weak topics.' },
  { icon: GraduationCap, title: 'University Matching', desc: 'Instantly see which universities your JAMB score qualifies for.' },
  { icon: MessageCircle, title: 'Career Guidance', desc: 'Get career path advice aligned with your strengths and interests.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F7FAFF] text-slate-900">
      {/* Background accents */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute top-40 -left-40 h-[520px] w-[520px] rounded-full bg-sky-200/45 blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#0B1B3A] rounded-xl flex items-center justify-center shadow-sm">
              <GraduationCap size={20} className="text-amber-300" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">EduGuide</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-white/60 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#0B1B3A] text-white hover:bg-[#0A1630] transition shadow-sm"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative max-w-7xl mx-auto px-6 pt-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left */}
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-white/70 border border-slate-200 text-slate-700">
              <CheckCircle size={14} className="text-amber-600" />
              Built for Nigerian students • WAEC • JAMB • POST-UTME
            </span>

            <h1 className="mt-5 text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              From WAEC to Admission —
              <span className="block text-[#0B1B3A]">
                Your Complete Journey
              </span>
            </h1>

            <p className="mt-5 text-lg text-slate-600 max-w-xl">
              Practice WAEC, JAMB, and POST-UTME with an AI advisor that tracks your weak
              topics, recommends universities, and guides you step by step to admission.
            </p>

            <div className="mt-8 flex items-center gap-3 flex-wrap">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-400 text-[#0B1B3A] font-bold hover:bg-amber-300 transition shadow-sm"
              >
                Start Free <ArrowRight size={18} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/70 border border-slate-200 text-slate-700 font-semibold hover:bg-white transition"
              >
                I have an account
              </Link>
            </div>

            {/* Trust/Stats */}
            <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
              {[
                ['10,000+', 'Practice Questions'],
                ['50+', 'Universities'],
                ['AI', 'Study Advisor'],
              ].map(([v, l]) => (
                <div
                  key={l}
                  className="rounded-2xl bg-white/70 border border-slate-200 p-4 shadow-sm"
                >
                  <p className="text-2xl font-extrabold text-[#0B1B3A]">{v}</p>
                  <p className="text-xs text-slate-600 mt-1">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: “product” preview card */}
          <div className="relative">
            <div className="rounded-3xl bg-white/80 border border-slate-200 shadow-xl overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Brain size={18} className="text-amber-700" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Personal Study Plan</p>
                    <p className="text-xs text-slate-500">Today’s focus</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                  WAEC • JAMB
                </span>
              </div>

              <div className="p-6 space-y-4">
                {[
                  { title: 'English • Comprehension', meta: 'Weak topic • 12 mins', pct: 72 },
                  { title: 'Maths • Algebra', meta: 'Mock test • 20 mins', pct: 54 },
                  { title: 'Biology • Ecology', meta: 'Revision • 10 mins', pct: 81 },
                ].map((x) => (
                  <div key={x.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{x.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{x.meta}</p>
                      </div>
                      <span className="text-xs font-bold text-slate-700">{x.pct}%</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#0B1B3A]"
                        style={{ width: `${x.pct}%` }}
                      />
                    </div>
                  </div>
                ))}

                <div className="rounded-2xl bg-[#0B1B3A] text-white p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">Check University Cutoffs</p>
                    <p className="text-xs text-white/80 mt-0.5">Based on your current score</p>
                  </div>
                  <ArrowRight size={18} className="text-amber-300" />
                </div>
              </div>
            </div>

            {/* small floating accent */}
            <div className="hidden sm:block absolute -bottom-6 -left-6 rounded-2xl bg-white/80 border border-slate-200 shadow-lg p-4">
              <p className="text-xs text-slate-500">Next mock exam</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">JAMB • 40 mins</p>
              <p className="text-xs text-amber-700 font-semibold mt-1">Recommended</p>
            </div>
          </div>
        </div>
      </header>

      {/* How it works */}
      <section className="relative py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">How it works</h2>
              <p className="text-slate-600 mt-2 max-w-2xl">
                A simple path from registration to admission — with clear feedback at each step.
              </p>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map(({ step, title, desc }) => (
              <div
                key={step}
                className="rounded-3xl bg-white/80 border border-slate-200 shadow-sm p-6 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center font-extrabold text-amber-800">
                    {step}
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600">
                    Step
                  </span>
                </div>
                <h3 className="mt-4 font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold tracking-tight text-center text-slate-900">
            Everything you need
          </h2>
          <p className="text-slate-600 text-center mt-2 max-w-2xl mx-auto">
            Built around Nigerian exam realities — not generic practice questions.
          </p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-3xl bg-white/80 border border-slate-200 shadow-sm p-6 flex gap-4 hover:shadow-md transition"
              >
                <div className="w-12 h-12 bg-[#0B1B3A]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Icon size={22} className="text-[#0B1B3A]" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{title}</h3>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-gradient-to-r from-[#0B1B3A] to-[#102B63]">
            <div className="p-10 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl font-extrabold text-white">Ready to get admitted?</h2>
                <p className="text-white/85 mt-2 max-w-xl">
                  Join thousands of Nigerian students using EduGuide to prepare smarter and score higher.
                </p>
                <div className="mt-4 flex items-center gap-3 text-white/90 text-sm">
                  <CheckCircle size={16} className="text-amber-300" />
                  Free to start • No card required
                </div>
              </div>

              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 text-[#0B1B3A] font-extrabold hover:bg-amber-300 transition shadow-sm"
              >
                Create Free Account <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative text-center py-10 text-sm text-slate-500">
        © 2026 EduGuide. Built for Nigerian students.
      </footer>
    </div>
  )
}