// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import Layout from '../components/Layout'
// import { HelpCircle, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react'

// const FAQS = [
//   {
//     q: 'What happens if I fail the mock WAEC on this app?',
//     a: "Don't worry! You can retake the mock exams as many times as you need. The goal is to help you learn and prepare, not to punish you.",
//   },
//   {
//     q: 'How accurate is the AI Admission Prediction?',
//     a: 'The AI uses historical cutoff marks and admission trends from Nigerian universities. While highly accurate as an estimate, final admission decisions are always up to the school\'s specific yearly quotas.',
//   },
//   {
//     q: 'Can I use my real WAEC results in the Admission Guide?',
//     a: 'Yes! In the Admission Guide, select "Yes, I have them" on Step 1 (O-Levels) and input your official grades. This gives you the most accurate prediction.',
//   },
//   {
//     q: 'What is the difference between the mock exam and the real JAMB?',
//     a: 'Our mock JAMB follows the same format — 180 questions, 4 subjects, 3 hours — but uses a practice question bank. Your mock score is a useful estimate but may differ from your actual JAMB score.',
//   },
//   {
//     q: 'How do I unlock JAMB on the platform?',
//     a: 'You unlock JAMB after achieving at least 5 O\'Level credits in your WAEC mock, including English Language and Mathematics. Once unlocked, select your target university and course, then start JAMB.',
//   },
//   {
//     q: 'Can I change my target university after starting JAMB?',
//     a: 'Yes. Go to the Universities page and select a different university and course. Your JAMB exam history is preserved regardless of which university you target.',
//   },
//   {
//     q: 'What does "HIGHLY LIKELY" mean in the Admission Guide?',
//     a: 'It means your WAEC credits, JAMB score, and Post-UTME score all exceed the historical cutoff for your chosen course. It is a strong indicator but not a guarantee — final decisions rest with the university.',
//   },
//   {
//     q: 'How do I practice specific weak topics?',
//     a: 'After completing any exam, go to the Practice page. Your AI advisor automatically recommends weak topics based on your exam performance. You can also manually select any subject and topic.',
//   },
//   {
//     q: 'Is my data and exam history saved?',
//     a: 'Yes. All your exam attempts, grades, and AI conversations are saved to your account and available whenever you log in from any device.',
//   },
//   {
//     q: 'How does the AI Advisor know about my progress?',
//     a: "The AI Advisor automatically reads your WAEC grades, JAMB score, selected university, and weak topics before every conversation. You don't need to repeat this information — it's always context-aware.",
//   },
// ]

// function FAQItem({ q, a }) {
//   const [open, setOpen] = useState(false)

//   return (
//     <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//       <button
//         onClick={() => setOpen(!open)}
//         className="w-full flex items-start justify-between px-6 py-5 text-left hover:bg-gray-50 transition-all">
//         <div className="flex items-start gap-3 flex-1 pr-4">
//           <span className="text-green-600 font-extrabold text-sm mt-0.5 flex-shrink-0">Q.</span>
//           <span className="font-bold text-gray-900 text-sm leading-relaxed">{q}</span>
//         </div>
//         {open
//           ? <ChevronUp size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
//           : <ChevronDown size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
//         }
//       </button>
//       {open && (
//         <div className="px-6 pb-5 border-t border-gray-100">
//           <p className="text-gray-600 text-sm leading-relaxed pt-4 pl-6">{a}</p>
//         </div>
//       )}
//     </div>
//   )
// }

// export default function FAQPage() {
//   const navigate = useNavigate()

//   return (
//     <Layout>
//       <div className="max-w-2xl mx-auto px-6 py-8">
//         {/* Header */}
//         <div className="text-center mb-10">
//           <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
//             <HelpCircle size={30} className="text-blue-500" />
//           </div>
//           <h1 className="text-3xl font-extrabold text-gray-900">Student FAQ</h1>
//           <p className="text-gray-500 mt-2">
//             Answers to the most common questions from students like you.
//           </p>
//         </div>

//         {/* FAQ list */}
//         <div className="space-y-3 mb-12">
//           {FAQS.map((item, i) => (
//             <FAQItem key={i} q={item.q} a={item.a} />
//           ))}
//         </div>

//         {/* ── "Still have a question?" CTA — matches screenshot ────────── */}
//         <div className="bg-gray-900 rounded-2xl p-8 text-center">
//           <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
//             <MessageCircle size={22} className="text-white" />
//           </div>
//           <h2 className="text-xl font-bold text-white mb-2">Still have a question?</h2>
//           <p className="text-gray-400 text-sm mb-6 leading-relaxed">
//             Our AI guide is online 24/7 to help you with platform issues
//             or career advice.
//           </p>
//           <button
//             onClick={() => navigate('/advisor')}
//             className="inline-flex items-center gap-2 px-7 py-3 bg-green-600
//               hover:bg-green-700 text-white font-bold rounded-xl transition-all text-sm">
//             <MessageCircle size={16} />
//             Chat with AI Support
//           </button>
//         </div>
//       </div>
//     </Layout>
//   )
// }



import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { HelpCircle, ChevronDown, ChevronUp, MessageCircle, CheckCircle } from 'lucide-react'

const FAQS = [
  {
    q: 'What happens if I fail the mock WAEC on this app?',
    a: "Don't worry! You can retake the mock exams as many times as you need. The goal is to help you learn and prepare, not to punish you.",
  },
  {
    q: 'How accurate is the AI Admission Prediction?',
    a: "The AI uses historical cutoff marks and admission trends from Nigerian universities. While highly accurate as an estimate, final admission decisions are always up to the school's specific yearly quotas.",
  },
  {
    q: 'Can I use my real WAEC results in the Admission Guide?',
    a: 'Yes! In the Admission Guide, select "Yes, I have them" on Step 1 (O-Levels) and input your official grades. This gives you the most accurate prediction.',
  },
  {
    q: 'What is the difference between the mock exam and the real JAMB?',
    a: 'Our mock JAMB follows the same format — 180 questions, 4 subjects, 3 hours — but uses a practice question bank. Your mock score is a useful estimate but may differ from your actual JAMB score.',
  },
  {
    q: 'How do I unlock JAMB on the platform?',
    a: "You unlock JAMB after achieving at least 5 O'Level credits in your WAEC mock, including English Language and Mathematics. Once unlocked, select your target university and course, then start JAMB.",
  },
  {
    q: 'Can I change my target university after starting JAMB?',
    a: 'Yes. Go to the Universities page and select a different university and course. Your JAMB exam history is preserved regardless of which university you target.',
  },
  {
    q: 'What does "HIGHLY LIKELY" mean in the Admission Guide?',
    a: 'It means your WAEC credits, JAMB score, and Post-UTME score all exceed the historical cutoff for your chosen course. It is a strong indicator but not a guarantee — final decisions rest with the university.',
  },
  {
    q: 'How do I practice specific weak topics?',
    a: 'After completing any exam, go to the Practice page. Your AI advisor automatically recommends weak topics based on your exam performance. You can also manually select any subject and topic.',
  },
  {
    q: 'Is my data and exam history saved?',
    a: 'Yes. All your exam attempts, grades, and AI conversations are saved to your account and available whenever you log in from any device.',
  },
  {
    q: 'How does the AI Advisor know about my progress?',
    a: "The AI Advisor automatically reads your WAEC grades, JAMB score, selected university, and weak topics before every conversation. You don't need to repeat this information — it's always context-aware.",
  },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-xl overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between px-6 py-5 text-left hover:bg-white transition"
      >
        <div className="flex items-start gap-3 flex-1 pr-4">
          <span className="text-amber-700 font-extrabold text-xs mt-1 flex-shrink-0">Q</span>
          <span className="font-extrabold text-slate-900 text-sm leading-relaxed">{q}</span>
        </div>
        {open ? (
          <ChevronUp size={18} className="text-slate-400 flex-shrink-0 mt-0.5" />
        ) : (
          <ChevronDown size={18} className="text-slate-400 flex-shrink-0 mt-0.5" />
        )}
      </button>

      {open && (
        <div className="px-6 pb-5 border-t border-slate-200">
          <p className="text-slate-600 text-sm leading-relaxed pt-4 pl-6">{a}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  const navigate = useNavigate()

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
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-[#0B1B3A]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <HelpCircle size={30} className="text-[#0B1B3A]" />
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Student FAQ
            </h1>
            <p className="text-slate-600 mt-2">
              Quick answers to the most common questions from students like you.
            </p>

            <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-white/70 border border-slate-200 text-slate-700">
              <CheckCircle size={14} className="text-amber-600" />
              Clear answers • No long story
            </div>
          </div>

          {/* FAQ list */}
          <div className="space-y-3 mb-12">
            {FAQS.map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} />
            ))}
          </div>

          {/* CTA */}
          <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-gradient-to-r from-[#0B1B3A] to-[#102B63]">
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <MessageCircle size={22} className="text-[#0B1B3A]" />
              </div>

              <h2 className="text-xl font-extrabold text-white mb-2">
                Still have a question?
              </h2>

              <p className="text-white/85 text-sm mb-6 leading-relaxed max-w-md mx-auto">
                Our AI guide is online 24/7 to help you with platform issues, admissions questions,
                and career advice.
              </p>

              <button
                onClick={() => navigate('/advisor')}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-amber-400 hover:bg-amber-300
                           text-[#0B1B3A] font-extrabold transition text-sm shadow-sm"
              >
                <MessageCircle size={16} />
                Chat with AI Support
              </button>

              <p className="text-xs text-white/70 mt-4">
                Tip: Ask “What course fits my strengths?” or “How do I unlock JAMB?”
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}