// import { useState, useEffect, useRef } from 'react'
// import Layout from '../components/Layout'
// import Spinner from '../components/Spinner'
// import { advisorService } from '../services/examService'
// import { useAuth } from '../context/AuthContext'
// import toast from 'react-hot-toast'
// import {
//   MessageCircle, Send, Plus, Brain, BookOpen,
//   GraduationCap, TrendingUp, Trash2, ChevronRight
// } from 'lucide-react'

// const CONTEXTS = [
//   { key: 'general',     icon: MessageCircle, label: 'General',      color: 'bg-gray-100 text-gray-700',   active: 'bg-gray-800 text-white' },
//   { key: 'career',      icon: TrendingUp,    label: 'Career',       color: 'bg-purple-100 text-purple-700', active: 'bg-purple-600 text-white' },
//   { key: 'exam_prep',   icon: BookOpen,      label: 'Exam Prep',    color: 'bg-blue-100 text-blue-700',   active: 'bg-blue-600 text-white' },
//   { key: 'performance', icon: Brain,         label: 'Performance',  color: 'bg-green-100 text-green-700', active: 'bg-green-600 text-white' },
// ]

// const QUICK_PROMPTS = [
//   'What careers suit me based on my performance?',
//   'How can I improve my WAEC Mathematics score?',
//   'Which universities can I apply to with my JAMB score?',
//   'Give me a 2-week study plan for JAMB',
//   'What subjects do I need for Medicine?',
//   'Explain my weak topics and how to fix them',
// ]

// function Message({ msg }) {
//   const isUser = msg.role === 'user'
//   return (
//     <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
//       {!isUser && (
//         <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mt-1">
//           <Brain size={16} className="text-white" />
//         </div>
//       )}
//       <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed
//         ${isUser
//           ? 'bg-green-600 text-white rounded-br-sm'
//           : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'}`}>
//         <p className="whitespace-pre-wrap">{msg.content}</p>
//         <p className={`text-xs mt-1.5 ${isUser ? 'text-green-200' : 'text-gray-400'}`}>
//           {new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//         </p>
//       </div>
//       {isUser && (
//         <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 mt-1 text-xs font-bold text-gray-700">
//           You
//         </div>
//       )}
//     </div>
//   )
// }

// export default function AdvisorPage() {
//   const { user } = useAuth()
//   const [messages,    setMessages]    = useState([])
//   const [input,       setInput]       = useState('')
//   const [context,     setContext]     = useState('general')
//   const [convId,      setConvId]      = useState(null)
//   const [history,     setHistory]     = useState([])
//   const [sending,     setSending]     = useState(false)
//   const [showHistory, setShowHistory] = useState(false)
//   const bottomRef = useRef(null)
//   const inputRef  = useRef(null)

//   // Welcome message
//   useEffect(() => {
//     setMessages([{
//       role: 'assistant',
//       content: `Hi ${user?.full_name?.split(' ')[0] || 'there'}! 👋 I'm your EduGuide AI Advisor.\n\nI know your exam history, WAEC grades, JAMB score, and weak topics — so my advice is personalised just for you.\n\nWhat would you like to talk about today?`,
//       created_at: new Date().toISOString(),
//     }])
//   }, [])

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
//   }, [messages])

//   const loadHistory = async () => {
//     try {
//       const { data } = await advisorService.getHistory()
//       setHistory(data)
//     } catch (_) {}
//     setShowHistory(true)
//   }

//   const loadConversation = async (id) => {
//     try {
//       const { data } = await advisorService.getConversation(id)
//       // Backend returns: { id, title, context, messages: [{role, content, created_at}] }
//       const msgs = (data.messages || []).map(m => ({
//         role:       m.role,
//         content:    m.content,
//         created_at: m.created_at || new Date().toISOString(),
//       }))
//       if (msgs.length === 0) {
//         msgs.push({
//           role:       'assistant',
//           content:    'Continuing this conversation. What would you like to ask?',
//           created_at: new Date().toISOString(),
//         })
//       }
//       setMessages(msgs)
//       setConvId(id)         // FIX: set convId so next chat continues this conversation
//       setContext(data.context || 'general')
//       setShowHistory(false)
//     } catch (err) {
//       toast.error('Could not load conversation — ' + (err.response?.data?.detail || 'try again'))
//     }
//   }

//   const sendMessage = async (text) => {
//     const msg = text || input.trim()
//     if (!msg || sending) return
//     setInput('')

//     // Optimistic UI
//     const userMsg = { role: 'user', content: msg, created_at: new Date().toISOString() }
//     setMessages(prev => [...prev, userMsg])
//     setSending(true)

//     try {
//       const { data } = await advisorService.chat(msg, context, convId)
//       setConvId(data.conversation_id)
//       setMessages(prev => [...prev, {
//         role: 'assistant',
//         content: data.response,
//         created_at: new Date().toISOString(),
//       }])
//     } catch (_) {
//       toast.error('Failed to get response. Please try again.')
//       setMessages(prev => prev.slice(0, -1))
//     } finally {
//       setSending(false)
//       inputRef.current?.focus()
//     }
//   }

//   const newChat = () => {
//     setConvId(null)
//     setMessages([{
//       role: 'assistant',
//       content: "New conversation started! What would you like to discuss?",
//       created_at: new Date().toISOString(),
//     }])
//   }

//   return (
//     <Layout>
//       <div className="flex h-screen lg:h-[calc(100vh-0px)] overflow-hidden">
//         {/* Sidebar */}
//         <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 flex-shrink-0">
//           <div className="p-4 border-b border-gray-100">
//             <button onClick={newChat}
//               className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-all">
//               <Plus size={16} /> New Chat
//             </button>
//           </div>

//           {/* Context selector */}
//           <div className="p-4 border-b border-gray-100">
//             <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Focus Area</p>
//             <div className="space-y-1">
//               {CONTEXTS.map(({ key, icon: Icon, label, color, active }) => (
//                 <button key={key} onClick={() => setContext(key)}
//                   className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
//                     ${context === key ? active : `${color} hover:opacity-80`}`}>
//                   <Icon size={15} /> {label}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* History */}
//           <div className="flex-1 overflow-y-auto p-4">
//             <div className="flex items-center justify-between mb-2">
//               <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">History</p>
//               <button onClick={loadHistory} className="text-xs text-green-600 hover:underline">Load</button>
//             </div>
//             {showHistory && (
//               <div className="space-y-1">
//                 {history.length === 0 ? (
//                   <p className="text-xs text-gray-400">No previous chats</p>
//                 ) : (
//                   history.map(h => (
//                     <button key={h.id} onClick={() => loadConversation(h.id)}
//                       className={`w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-gray-100 transition-all
//                         ${convId === h.id ? 'bg-green-50 text-green-700' : 'text-gray-600'}`}>
//                       <p className="font-medium truncate">{h.title || 'Conversation'}</p>
//                       <p className="text-gray-400 mt-0.5">{new Date(h.created_at).toLocaleDateString()}</p>
//                     </button>
//                   ))
//                 )}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Chat area */}
//         <div className="flex-1 flex flex-col min-w-0">
//           {/* Chat header */}
//           <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-gray-200">
//             <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center">
//               <Brain size={18} className="text-white" />
//             </div>
//             <div>
//               <p className="font-bold text-gray-900">EduGuide AI Advisor</p>
//               <p className="text-xs text-gray-500 capitalize">
//                 Context: {CONTEXTS.find(c => c.key === context)?.label || 'General'}
//               </p>
//             </div>
//             <div className="ml-auto flex items-center gap-2">
//               {/* Mobile new chat */}
//               <button onClick={newChat} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
//                 <Plus size={18} />
//               </button>
//             </div>
//           </div>

//           {/* Messages */}
//           <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
//             {messages.map((m, i) => <Message key={i} msg={m} />)}
//             {sending && (
//               <div className="flex gap-3 justify-start">
//                 <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
//                   <Brain size={16} className="text-white" />
//                 </div>
//                 <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
//                   <div className="flex gap-1 items-center">
//                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
//                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
//                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
//                   </div>
//                 </div>
//               </div>
//             )}
//             <div ref={bottomRef} />
//           </div>

//           {/* Quick prompts */}
//           {messages.length <= 1 && (
//             <div className="px-6 pb-3">
//               <p className="text-xs text-gray-400 mb-2">Quick questions:</p>
//               <div className="flex flex-wrap gap-2">
//                 {QUICK_PROMPTS.slice(0, 4).map((p, i) => (
//                   <button key={i} onClick={() => sendMessage(p)}
//                     className="text-xs px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition-all">
//                     {p}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Input */}
//           <div className="px-6 py-4 bg-white border-t border-gray-200">
//             <div className="flex gap-3 items-end">
//               <textarea ref={inputRef} rows={1}
//                 className="flex-1 input resize-none min-h-[44px] max-h-32 py-3"
//                 placeholder="Ask me about WAEC, JAMB, careers, universities..."
//                 value={input}
//                 onChange={e => {
//                   setInput(e.target.value)
//                   e.target.style.height = 'auto'
//                   e.target.style.height = e.target.scrollHeight + 'px'
//                 }}
//                 onKeyDown={e => {
//                   if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
//                 }}
//               />
//               <button onClick={() => sendMessage()} disabled={!input.trim() || sending}
//                 className="w-11 h-11 rounded-xl bg-green-600 hover:bg-green-700 text-white flex items-center justify-center transition-all disabled:opacity-40 flex-shrink-0">
//                 <Send size={18} />
//               </button>
//             </div>
//             <p className="text-xs text-gray-400 mt-2 text-center">
//               Press Enter to send · Shift+Enter for new line
//             </p>
//           </div>
//         </div>
//       </div>
//     </Layout>
//   )
// }


import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { advisorService } from '../services/examService'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
  MessageCircle,
  Send,
  Plus,
  Brain,
  BookOpen,
  TrendingUp,
  ChevronRight,
  History,
} from 'lucide-react'

const CONTEXTS = [
  {
    key: 'general',
    icon: MessageCircle,
    label: 'General',
    chip: 'bg-slate-100 text-slate-700 border-slate-200',
    active: 'bg-[#0B1B3A] text-amber-300 border-[#0B1B3A]',
  },
  {
    key: 'career',
    icon: TrendingUp,
    label: 'Career',
    chip: 'bg-amber-50 text-amber-900 border-amber-200',
    active: 'bg-amber-500 text-[#0B1B3A] border-amber-500',
  },
  {
    key: 'exam_prep',
    icon: BookOpen,
    label: 'Exam Prep',
    chip: 'bg-sky-50 text-sky-900 border-sky-200',
    active: 'bg-sky-600 text-white border-sky-600',
  },
  {
    key: 'performance',
    icon: Brain,
    label: 'Performance',
    chip: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    active: 'bg-emerald-600 text-white border-emerald-600',
  },
]

const QUICK_PROMPTS = [
  'What careers suit me based on my performance?',
  'How can I improve my WAEC Mathematics score?',
  'Which universities can I apply to with my JAMB score?',
  'Give me a 2-week study plan for JAMB',
  'What subjects do I need for Medicine?',
  'Explain my weak topics and how to fix them',
]

function ChatBubble({ msg }) {
  const isUser = msg.role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-9 h-9 rounded-2xl bg-[#0B1B3A] border border-white/10 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
          <Brain size={16} className="text-amber-300" />
        </div>
      )}

      <div
        className={[
          'max-w-[78%] rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-sm',
          isUser
            ? 'bg-[#0B1B3A] text-white rounded-br-lg border border-[#0B1B3A]'
            : 'bg-white/80 backdrop-blur border border-slate-200 text-slate-800 rounded-bl-lg',
        ].join(' ')}
      >
        <p className="whitespace-pre-wrap">{msg.content}</p>
        <p className={`text-[11px] mt-2 ${isUser ? 'text-white/70' : 'text-slate-500'}`}>
          {new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {isUser && (
        <div className="w-9 h-9 rounded-2xl bg-slate-200 border border-slate-300 flex items-center justify-center flex-shrink-0 mt-1 text-[11px] font-extrabold text-slate-700">
          You
        </div>
      )}
    </div>
  )
}

export default function AdvisorPage() {
  const { user } = useAuth()

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [context, setContext] = useState('general')
  const [convId, setConvId] = useState(null)
  const [history, setHistory] = useState([])
  const [sending, setSending] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  // Welcome message
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: `Hi ${user?.full_name?.split(' ')[0] || 'there'}! 👋 I’m your EduGuide AI Advisor.\n\nI can use your exam history, WAEC grades, JAMB score, and weak topics to give you personalised advice.\n\nWhat would you like to talk about today?`,
        created_at: new Date().toISOString(),
      },
    ])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  const loadHistory = async () => {
    try {
      const { data } = await advisorService.getHistory()
      setHistory(data || [])
      setShowHistory(true)
    } catch (_) {
      toast.error('Could not load chat history.')
    }
  }

  const loadConversation = async (id) => {
    try {
      const { data } = await advisorService.getConversation(id)
      const msgs = (data.messages || []).map((m) => ({
        role: m.role,
        content: m.content,
        created_at: m.created_at || new Date().toISOString(),
      }))

      if (msgs.length === 0) {
        msgs.push({
          role: 'assistant',
          content: 'Continuing this conversation. What would you like to ask?',
          created_at: new Date().toISOString(),
        })
      }

      setMessages(msgs)
      setConvId(id)
      setContext(data.context || 'general')
      setShowHistory(false)
    } catch (err) {
      toast.error('Could not load conversation — ' + (err.response?.data?.detail || 'try again'))
    }
  }

  const sendMessage = async (text) => {
    const msg = (text ?? input).trim()
    if (!msg || sending) return

    setInput('')
    const userMsg = { role: 'user', content: msg, created_at: new Date().toISOString() }
    setMessages((prev) => [...prev, userMsg])
    setSending(true)

    try {
      const { data } = await advisorService.chat(msg, context, convId)
      setConvId(data.conversation_id)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.response, created_at: new Date().toISOString() },
      ])
    } catch (_) {
      toast.error('Failed to get response. Please try again.')
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const newChat = () => {
    setConvId(null)
    setShowHistory(false)
    setMessages([
      {
        role: 'assistant',
        content: "New conversation started! What would you like to discuss?",
        created_at: new Date().toISOString(),
      },
    ])
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#F7FAFF] text-slate-900">
        {/* Background accents */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-amber-200/35 blur-3xl" />
          <div className="absolute top-40 -left-40 h-[520px] w-[520px] rounded-full bg-sky-200/40 blur-3xl" />
        </div>

        <div className="relative flex h-screen lg:h-[calc(100vh-0px)] overflow-hidden">
          {/* Sidebar */}
          <div className="hidden md:flex flex-col w-72 bg-white/75 backdrop-blur-xl border-r border-slate-200 flex-shrink-0">
            <div className="p-4 border-b border-slate-200">
              <button
                onClick={newChat}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl
                           bg-[#0B1B3A] hover:bg-[#0A1630] text-white font-extrabold text-sm transition shadow-sm"
              >
                <Plus size={16} className="text-amber-300" /> New chat
              </button>
            </div>

            {/* Context selector */}
            <div className="p-4 border-b border-slate-200">
              <p className="text-xs font-extrabold text-slate-500 uppercase tracking-[0.18em] mb-3">
                Focus area
              </p>
              <div className="space-y-2">
                {CONTEXTS.map(({ key, icon: Icon, label, chip, active }) => (
                  <button
                    key={key}
                    onClick={() => setContext(key)}
                    className={[
                      'w-full flex items-center gap-2 px-3 py-2.5 rounded-2xl text-sm font-extrabold transition border',
                      context === key ? active : `${chip} hover:opacity-90`,
                    ].join(' ')}
                  >
                    <Icon size={16} /> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* History */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-extrabold text-slate-500 uppercase tracking-[0.18em]">History</p>
                <button
                  onClick={loadHistory}
                  className="text-xs font-extrabold text-amber-700 hover:underline inline-flex items-center gap-1"
                >
                  <History size={14} /> Load
                </button>
              </div>

              {showHistory && (
                <div className="space-y-2">
                  {history.length === 0 ? (
                    <p className="text-xs text-slate-500">No previous chats</p>
                  ) : (
                    history.map((h) => (
                      <button
                        key={h.id}
                        onClick={() => loadConversation(h.id)}
                        className={[
                          'w-full text-left px-3 py-3 rounded-2xl text-xs transition border',
                          convId === h.id
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-white/70 border-slate-200 text-slate-700 hover:bg-white',
                        ].join(' ')}
                      >
                        <div className="flex items-center gap-2">
                          <p className="font-extrabold truncate flex-1">{h.title || 'Conversation'}</p>
                          <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                        </div>
                        <p className="text-slate-500 mt-1">
                          {new Date(h.created_at).toLocaleDateString()}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              )}

              {!showHistory && (
                <div className="mt-3 rounded-2xl border border-slate-200 bg-white/70 p-3">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Tip: Use <span className="font-extrabold text-slate-900">Performance</span> context to get advice tied to your weak topics.
                  </p>
                </div>
              )}
            </div>

            {/* Footer links */}
            <div className="p-4 border-t border-slate-200">
              <Link
                to="/practice"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-2xl
                           bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900
                           text-sm font-extrabold transition"
              >
                <Brain size={16} className="text-amber-700" /> Practice weak topics
              </Link>
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 bg-white/75 backdrop-blur-xl border-b border-slate-200">
              <div className="w-10 h-10 rounded-2xl bg-[#0B1B3A] border border-white/10 flex items-center justify-center shadow-sm">
                <Brain size={18} className="text-amber-300" />
              </div>

              <div className="min-w-0">
                <p className="font-extrabold text-slate-900">EduGuide AI Advisor</p>
                <p className="text-xs text-slate-600">
                  Context:{' '}
                  <span className="font-extrabold text-slate-900">
                    {CONTEXTS.find((c) => c.key === context)?.label || 'General'}
                  </span>
                </p>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={newChat}
                  className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-2xl
                             bg-white/70 border border-slate-200 hover:bg-white transition"
                  aria-label="New chat"
                >
                  <Plus size={18} className="text-amber-700" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {messages.map((m, i) => (
                <ChatBubble key={i} msg={m} />
              ))}

              {sending && (
                <div className="flex gap-3 justify-start">
                  <div className="w-9 h-9 rounded-2xl bg-[#0B1B3A] border border-white/10 flex items-center justify-center flex-shrink-0">
                    <Brain size={16} className="text-amber-300" />
                  </div>
                  <div className="bg-white/80 backdrop-blur border border-slate-200 rounded-3xl rounded-bl-lg px-4 py-3 shadow-sm">
                    <div className="flex gap-1 items-center">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Quick prompts */}
            {messages.length <= 1 && (
              <div className="px-6 pb-3">
                <p className="text-xs text-slate-500 mb-2 font-extrabold uppercase tracking-[0.18em]">
                  Quick questions
                </p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_PROMPTS.slice(0, 4).map((p, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(p)}
                      className="text-xs px-3 py-2 rounded-full bg-white/70 border border-slate-200
                                 text-slate-700 hover:bg-white transition font-extrabold"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="px-6 py-4 bg-white/75 backdrop-blur-xl border-t border-slate-200">
              <div className="flex gap-3 items-end">
                <textarea
                  ref={inputRef}
                  rows={1}
                  className="flex-1 resize-none min-h-[48px] max-h-32 px-4 py-3 rounded-2xl
                             bg-white/80 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-300
                             text-sm shadow-sm"
                  placeholder="Ask me about WAEC, JAMB, careers, universities..."
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value)
                    e.target.style.height = 'auto'
                    e.target.style.height = e.target.scrollHeight + 'px'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                />

                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || sending}
                  className="w-12 h-12 rounded-2xl bg-[#0B1B3A] hover:bg-[#0A1630] text-white
                             flex items-center justify-center transition disabled:opacity-40 flex-shrink-0 shadow-sm"
                  aria-label="Send message"
                >
                  <Send size={18} className="text-amber-300" />
                </button>
              </div>

              <p className="text-xs text-slate-500 mt-2 text-center">
                Press Enter to send · Shift+Enter for new line
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}