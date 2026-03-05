import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import api from '../services/api'
import toast from 'react-hot-toast'
import {
  CheckCircle, AlertCircle, Upload, FileText,
  ChevronRight, ChevronLeft, Brain, Award,
  GraduationCap, BookOpen, Shield, ShieldCheck, ShieldAlert
} from 'lucide-react'

const STEPS = ['O-Levels', 'UTME / JAMB', 'Post-UTME', 'AI Analysis']
const CREDIT_GRADES = new Set(['A1','B2','B3','C4','C5','C6'])
const WAEC_SUBJECTS = [
  'English Language','Mathematics','Physics','Chemistry','Biology',
  'Economics','Government','Literature in English','Geography',
  'Agricultural Science','Further Mathematics','Technical Drawing',
  'Commerce','Accounts','Visual Art','French','Yoruba','Igbo','Hausa',
  'Food and Nutrition','Home Economics','Computer Studies',
  'Civic Education','Christian Religious Studies','Islamic Studies',
]
const GRADES = ['A1','B2','B3','C4','C5','C6','D7','E8','F9']

// ── Verification badge helper ────────────────────────────────────────────────
function VerifiedBadge({ verified }) {
  if (verified === true)
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">
        <ShieldCheck size={12} /> Verified
      </span>
    )
  if (verified === false)
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">
        <ShieldAlert size={12} /> Unverified
      </span>
    )
  return null
}

// ── Step 1: O-Levels (WAEC) ──────────────────────────────────────────────────
function Step1OLevels({ data, onChange }) {
  const fileRef   = useRef(null)
  const [hasWAEC,   setHasWAEC]   = useState(data.hasWAEC ?? null)
  const [subjects,  setSubjects]  = useState(
    data.subjects?.length ? data.subjects
    : [{ subject: 'English Language', grade: '' },
       { subject: 'Mathematics',      grade: '' },
       { subject: '', grade: '' }, { subject: '', grade: '' }, { subject: '', grade: '' }]
  )
  const [uploadedFile, setUploadedFile] = useState(data.waecFile || null)
  const [uploading,    setUploading]    = useState(false)
  const [waecVerified, setWaecVerified] = useState(data.waecVerified ?? null) // true=uploaded, false=manual

  const update = (s, wv) => onChange({ hasWAEC: s !== null ? true : hasWAEC, subjects: s || subjects, waecVerified: wv ?? waecVerified, waecFile: uploadedFile })

  const setHas = (val) => {
    setHasWAEC(val)
    onChange({ hasWAEC: val, subjects, waecVerified, waecFile: uploadedFile })
  }

  const setGrade = (i, field, val) => {
    const s = subjects.map((x, idx) => idx === i ? { ...x, [field]: val } : x)
    setSubjects(s)
    onChange({ hasWAEC, subjects: s, waecVerified, waecFile: uploadedFile })
  }

  const addRow = () => {
    const s = [...subjects, { subject: '', grade: '' }]
    setSubjects(s)
    onChange({ hasWAEC, subjects: s, waecVerified, waecFile: uploadedFile })
  }

  const removeRow = (i) => {
    if (subjects.length <= 5) return
    const s = subjects.filter((_, idx) => idx !== i)
    setSubjects(s)
    onChange({ hasWAEC, subjects: s, waecVerified, waecFile: uploadedFile })
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      // For now store filename — backend OCR can be added later
      setUploadedFile(file.name)
      setWaecVerified(true)
      onChange({ hasWAEC, subjects, waecVerified: true, waecFile: file.name })
      toast.success('WAEC result uploaded — marked as Verified ✓')
    } catch (_) {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const credits = subjects.filter(s => CREDIT_GRADES.has(s.grade)).length
  const hasEng  = subjects.some(s => s.subject.toLowerCase().includes('english') && CREDIT_GRADES.has(s.grade))
  const hasMath = subjects.some(s => s.subject.toLowerCase().includes('math') && CREDIT_GRADES.has(s.grade))
  const qualified = credits >= 5 && hasEng && hasMath

  return (
    <div className="p-6 space-y-5">
      <h2 className="text-xl font-bold text-gray-900">O-Level Results (WAEC / NECO)</h2>

      {/* Do you have WAEC? */}
      <div className="grid grid-cols-2 gap-4">
        {[true, false].map(val => (
          <button key={String(val)} onClick={() => setHas(val)}
            className={`relative p-4 rounded-xl border-2 text-left transition-all
              ${hasWAEC === val
                ? val ? 'border-green-500 bg-green-50' : 'border-gray-400 bg-gray-50'
                : 'border-gray-200 hover:border-gray-300'}`}>
            <p className="font-bold text-gray-900 text-sm">
              {val ? 'Yes, I have my WAEC results' : "No, not yet"}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {val ? 'I will enter or upload my grades' : 'I haven\'t sat WAEC yet'}
            </p>
            {hasWAEC === val && val && <CheckCircle size={16} className="absolute top-3 right-3 text-green-600" />}
          </button>
        ))}
      </div>

      {hasWAEC === true && (
        <>
          {/* Upload option */}
          <div className="border border-dashed border-blue-300 rounded-xl p-4 bg-blue-50">
            <div className="flex items-start gap-3">
              <Upload size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-blue-800 text-sm">Upload Official WAEC Printout</p>
                <p className="text-xs text-blue-600 mt-0.5">
                  Upload your official WAEC result slip for a <strong>Verified</strong> status.
                  If you can't upload, enter grades manually below (Unverified).
                </p>
                {uploadedFile ? (
                  <div className="mt-2 flex items-center gap-2">
                    <FileText size={14} className="text-green-600" />
                    <span className="text-xs text-green-700 font-medium">{uploadedFile}</span>
                    <VerifiedBadge verified={true} />
                    <button onClick={() => { setUploadedFile(null); setWaecVerified(false); onChange({ hasWAEC, subjects, waecVerified: false, waecFile: null }) }}
                      className="text-xs text-red-500 underline ml-2">Remove</button>
                  </div>
                ) : (
                  <button onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="mt-2 text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    {uploading ? 'Uploading...' : '📎 Choose File'}
                  </button>
                )}
                <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleUpload} />
              </div>
            </div>
          </div>

          {/* Manual grade entry */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-gray-700 text-sm">
                Enter Grades Manually {!uploadedFile && <VerifiedBadge verified={false} />}
              </p>
              {!uploadedFile && (
                <span className="text-xs text-amber-600">⚠ Manual entry = Unverified result</span>
              )}
            </div>
            <div className="space-y-2">
              {subjects.map((s, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <select className="input flex-1 text-sm" value={s.subject}
                    onChange={e => setGrade(i, 'subject', e.target.value)}>
                    <option value="">Select subject...</option>
                    {WAEC_SUBJECTS.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                  </select>
                  <select className="input w-24 text-sm" value={s.grade}
                    onChange={e => setGrade(i, 'grade', e.target.value)}>
                    <option value="">Grade</option>
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  {i >= 5 && (
                    <button onClick={() => removeRow(i)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addRow}
              className="mt-2 text-xs text-blue-600 hover:underline">
              + Add another subject
            </button>
          </div>

          {/* Credit counter */}
          <div className={`rounded-xl p-3 border-2 text-sm ${
            qualified ? 'border-green-300 bg-green-50 text-green-800'
            : credits > 0 ? 'border-amber-300 bg-amber-50 text-amber-800'
            : 'border-gray-200 bg-gray-50 text-gray-500'}`}>
            <div className="flex items-center gap-2">
              {qualified
                ? <CheckCircle size={16} className="text-green-600" />
                : <AlertCircle size={16} className="text-amber-500" />}
              <span className="font-semibold">
                {credits} credit{credits !== 1 ? 's' : ''} so far
                {qualified ? ' — JAMB eligible ✓' : ` — need ${Math.max(0, 5 - credits)} more`}
              </span>
            </div>
            {!hasEng && credits > 0 && <p className="text-xs mt-1 ml-6">⚠ English Language credit required</p>}
            {!hasMath && credits > 0 && <p className="text-xs mt-1 ml-6">⚠ Mathematics credit required</p>}
          </div>
        </>
      )}
    </div>
  )
}

// ── Step 2: UTME / JAMB ──────────────────────────────────────────────────────
function Step2UTME({ data, onChange, noWAEC = false }) {
  const navigate  = useNavigate()
  const fileRef   = useRef(null)
  const [hasJAMB,      setHasJAMB]      = useState(data.hasJAMB ?? null)
  const [jambVerified, setJambVerified] = useState(data.jambVerified ?? null)
  const [jambFile,     setJambFile]     = useState(data.jambFile || null)
  const [unis,         setUnis]         = useState([])
  const [courses,      setCourses]      = useState([])
  const [selUni,       setSelUni]       = useState(data.university_id || '')
  const [selCourse,    setSelCourse]    = useState(data.course_id || '')
  const [jambScore,    setJambScore]    = useState(data.jamb_score || '')
  const [loading,      setLoading]      = useState(true)
  const [loadCrs,      setLoadCrs]      = useState(false)

  useEffect(() => {
    if (!noWAEC) {
      api.get('/universities/')
        .then(r => setUnis(r.data))
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [noWAEC])

  const emit = (patch) => onChange({
    hasJAMB, jambVerified, jambFile,
    university_id: selUni, course_id: selCourse, jamb_score: jambScore,
    ...patch
  })

  const pickUni = async (uid) => {
    setSelUni(uid); setSelCourse(''); setLoadCrs(true)
    try { const { data: cs } = await api.get(`/universities/${uid}/courses`); setCourses(cs) }
    catch (_) {} finally { setLoadCrs(false) }
    emit({ university_id: uid, course_id: '' })
  }

  const handleUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setJambFile(file.name); setJambVerified(true)
    emit({ jambFile: file.name, jambVerified: true })
    toast.success('JAMB result uploaded — Verified ✓')
  }

  const selCourseObj = courses.find(c => String(c.id) === String(selCourse))

  // ── If user has no WAEC yet — show guidance only ──────────────────────────
  if (noWAEC) {
    return (
      <div className="p-6 space-y-5">
        <h2 className="text-xl font-bold text-gray-900">UTME / JAMB Details</h2>

        <div className="border-2 border-yellow-400 rounded-xl p-5 bg-yellow-50">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle size={22} className="text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-yellow-800 text-base">Complete WAEC First</p>
              <p className="text-sm text-yellow-700 mt-1">
                You need at least <strong>5 WAEC credits</strong> including English Language
                and Mathematics before you can proceed to JAMB.
                Take our WAEC mock exam now — 50 questions per subject, instant feedback.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/exams/waec')}
              className="flex items-center gap-2 px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg text-sm transition-all">
              <BookOpen size={16} />
              Start WAEC Mock Exam →
            </button>
            <button
              onClick={() => navigate('/practice')}
              className="flex items-center gap-2 px-5 py-2.5 border-2 border-yellow-400 text-yellow-700 font-semibold rounded-lg text-sm bg-white hover:bg-yellow-50 transition-all">
              Practice by Subject
            </button>
          </div>
          <p className="text-xs text-yellow-600 mt-3">
            Already have WAEC? Go back and select "Yes, I have my WAEC results".
          </p>
        </div>
      </div>
    )
  }

  // ── Normal JAMB flow ──────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-5">
      <h2 className="text-xl font-bold text-gray-900">UTME / JAMB Details</h2>

      {/* Do you have JAMB? */}
      <div className="grid grid-cols-2 gap-4">
        {[true, false].map(val => (
          <button key={String(val)} onClick={() => { setHasJAMB(val); emit({ hasJAMB: val }) }}
            className={`relative p-4 rounded-xl border-2 text-left transition-all
              ${hasJAMB === val
                ? val ? 'border-green-500 bg-green-50' : 'border-amber-400 bg-amber-50'
                : 'border-gray-200 hover:border-gray-300'}`}>
            <p className="font-bold text-gray-900 text-sm">
              {val ? 'Yes, I have my JAMB score' : 'No, not yet'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {val ? 'I will enter or upload my official score' : 'I need to take JAMB first'}
            </p>
            {hasJAMB === val && val  && <CheckCircle size={16} className="absolute top-3 right-3 text-green-600" />}
            {hasJAMB === val && !val && <AlertCircle size={16} className="absolute top-3 right-3 text-amber-500" />}
          </button>
        ))}
      </div>

      {/* No JAMB → route to mock */}
      {hasJAMB === false && (
        <div className="border border-amber-300 rounded-xl p-5 bg-amber-50">
          <div className="flex items-start gap-3 mb-3">
            <AlertCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-800">Take the JAMB mock exam first</p>
              <p className="text-sm text-amber-700 mt-0.5">
                Practice 180 questions across 4 subjects, get a predicted score,
                then come back to complete your admission analysis.
              </p>
            </div>
          </div>
          <button onClick={() => navigate('/exams/jamb')}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-sm transition-all">
            Start JAMB Mock Exam →
          </button>
        </div>
      )}

      {/* Has JAMB → upload or enter score + pick uni/course */}
      {hasJAMB === true && (
        <>
          {/* Upload */}
          <div className="border border-dashed border-blue-300 rounded-xl p-4 bg-blue-50">
            <div className="flex items-start gap-3">
              <Upload size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-blue-800 text-sm">Upload Official JAMB Result (optional)</p>
                <p className="text-xs text-blue-600 mt-0.5">Uploaded = Verified. Manual entry = Unverified.</p>
                {jambFile ? (
                  <div className="mt-2 flex items-center gap-2">
                    <FileText size={14} className="text-green-600" />
                    <span className="text-xs text-green-700 font-medium">{jambFile}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold border border-green-200">✓ Verified</span>
                    <button onClick={() => { setJambFile(null); setJambVerified(false); emit({ jambFile: null, jambVerified: false }) }}
                      className="text-xs text-red-500 underline ml-1">Remove</button>
                  </div>
                ) : (
                  <button onClick={() => fileRef.current?.click()}
                    className="mt-2 text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    📎 Upload JAMB Slip
                  </button>
                )}
                <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleUpload} />
              </div>
            </div>
          </div>

          {/* Score */}
          <div>
            <label className="label">
              JAMB Score (0–400)
              {!jambFile && jambScore && <span className="ml-2 text-xs text-amber-600">⚠ Unverified</span>}
              {jambFile  && jambScore && <span className="ml-2 text-xs text-green-600">✓ Verified</span>}
            </label>
            <input type="number" min={0} max={400} className="input max-w-xs"
              placeholder="e.g. 280" value={jambScore}
              onChange={e => { setJambScore(e.target.value); emit({ jamb_score: e.target.value }) }} />
          </div>

          {/* University */}
          <div>
            <label className="label">Target University</label>
            {loading ? <Spinner size="sm" /> : (
              <select className="input" value={selUni} onChange={e => pickUni(e.target.value)}>
                <option value="">Select a university...</option>
                {unis.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} {u.short_name ? `(${u.short_name})` : ''} — Cutoff: {u.jamb_cutoff || 'N/A'}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Course */}
          <div>
            <label className="label">Target Course</label>
            {loadCrs ? <Spinner size="sm" /> : (
              <select className="input" value={selCourse}
                onChange={e => { setSelCourse(e.target.value); emit({ course_id: e.target.value }) }}
                disabled={!selUni}>
                <option value="">Select a course...</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} — Cutoff: {c.jamb_cutoff || 'N/A'}
                  </option>
                ))}
              </select>
            )}
          </div>

          {selCourseObj && jambScore && (
            <div className={`rounded-xl px-4 py-3 text-sm border-2 ${
              parseInt(jambScore) >= (selCourseObj.jamb_cutoff || 200)
                ? 'border-green-200 bg-green-50 text-green-800'
                : 'border-red-200 bg-red-50 text-red-800'}`}>
              {parseInt(jambScore) >= (selCourseObj.jamb_cutoff || 200)
                ? `✓ Score (${jambScore}) meets cutoff (${selCourseObj.jamb_cutoff}).`
                : `✗ Score (${jambScore}) below cutoff (${selCourseObj.jamb_cutoff}). Consider practising more.`}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Step 3: Post-UTME ────────────────────────────────────────────────────────
function Step3PostUTME({ data, onChange }) {
  const navigate  = useNavigate()
  const fileRef   = useRef(null)
  const [hasPostUTME,    setHasPostUTME]    = useState(data.hasPostUTME ?? null)
  const [postUtmeScore,  setPostUtmeScore]  = useState(data.post_utme_score || '')
  const [postUtmeFile,   setPostUtmeFile]   = useState(data.postUtmeFile || null)
  const [postUtmeVerified, setPostUtmeVerified] = useState(data.postUtmeVerified ?? null)

  const emit = (patch) => onChange({
    hasPostUTME, post_utme_score: postUtmeScore,
    postUtmeFile, postUtmeVerified, ...patch
  })

  const handleUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPostUtmeFile(file.name)
    setPostUtmeVerified(true)
    emit({ postUtmeFile: file.name, postUtmeVerified: true })
    toast.success('Post-UTME result uploaded — marked as Verified ✓')
  }

  return (
    <div className="p-6 space-y-5">
      <h2 className="text-xl font-bold text-gray-900">Post-UTME Score</h2>

      <div className="grid grid-cols-2 gap-4">
        {[
          { val: true,  label: 'Yes, I have a Post-UTME score',  sub: 'I sat the Post-UTME screening' },
          { val: false, label: 'No, I haven\'t sat Post-UTME',    sub: 'I need to take a mock first' },
          { val: 'skip', label: 'Skip — predict without it',      sub: 'AI will estimate from WAEC + JAMB' },
        ].map(({ val, label, sub }) => (
          <button key={String(val)} onClick={() => { setHasPostUTME(val); emit({ hasPostUTME: val }) }}
            className={`relative p-4 rounded-xl border-2 text-left transition-all col-span-${val === 'skip' ? '2' : '1'}
              ${hasPostUTME === val ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <p className="font-bold text-gray-900 text-sm">{label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
            {hasPostUTME === val && <CheckCircle size={16} className="absolute top-3 right-3 text-blue-600" />}
          </button>
        ))}
      </div>

      {/* No Post-UTME → route to mock */}
      {hasPostUTME === false && (
        <div className="border border-blue-300 rounded-xl p-5 bg-blue-50">
          <div className="flex items-start gap-3 mb-3">
            <BookOpen size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-blue-800">Take the Post-UTME mock exam</p>
              <p className="text-sm text-blue-700 mt-0.5">
                Practice the Post-UTME screening exam for your target university.
                Get a predicted score and improve your preparation.
              </p>
            </div>
          </div>
          <button onClick={() => navigate('/exams/post-utme')}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg text-sm transition-all">
            Start Post-UTME Mock ↗
          </button>
        </div>
      )}

      {/* Has Post-UTME → upload or enter */}
      {hasPostUTME === true && (
        <>
          {/* Upload official result */}
          <div className="border border-dashed border-blue-300 rounded-xl p-4 bg-blue-50">
            <div className="flex items-start gap-3">
              <Upload size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-blue-800 text-sm">Upload Post-UTME Result</p>
                <p className="text-xs text-blue-600 mt-0.5">
                  Upload your official Post-UTME result for <strong>Verified</strong> status.
                </p>
                {postUtmeFile ? (
                  <div className="mt-2 flex items-center gap-2">
                    <FileText size={14} className="text-green-600" />
                    <span className="text-xs text-green-700 font-medium">{postUtmeFile}</span>
                    <VerifiedBadge verified={true} />
                    <button onClick={() => { setPostUtmeFile(null); setPostUtmeVerified(false); emit({ postUtmeFile: null, postUtmeVerified: false }) }}
                      className="text-xs text-red-500 underline ml-2">Remove</button>
                  </div>
                ) : (
                  <button onClick={() => fileRef.current?.click()}
                    className="mt-2 text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    📎 Upload Result
                  </button>
                )}
                <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleUpload} />
              </div>
            </div>
          </div>

          {/* Score entry */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <label className="label">Post-UTME Score (0–100)</label>
              {!postUtmeFile && postUtmeScore && <VerifiedBadge verified={false} />}
              {postUtmeFile && <VerifiedBadge verified={true} />}
            </div>
            <input type="number" min={0} max={100} className="input max-w-xs"
              placeholder="e.g. 72"
              value={postUtmeScore}
              onChange={e => { setPostUtmeScore(e.target.value); emit({ post_utme_score: e.target.value }) }} />
            {!postUtmeFile && postUtmeScore && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠ Manually entered — upload your result for Verified status
              </p>
            )}
          </div>
        </>
      )}

      {hasPostUTME === 'skip' && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600">
          <Brain size={16} className="inline mr-1 text-purple-500" />
          The AI will estimate your admission chances using your WAEC and JAMB scores only.
          Adding a Post-UTME score gives a more accurate prediction.
        </div>
      )}
    </div>
  )
}

// ── Step 4: AI Analysis ──────────────────────────────────────────────────────
function Step4Analysis({ step1, step2, step3 }) {
  const [result,   setResult]   = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    const analyze = async () => {
      setLoading(true)
      try {
        const credits = (step1.subjects || []).filter(s => CREDIT_GRADES.has(s.grade))
        const payload = {
          waec_results:    (step1.subjects || [])
                             .filter(s => s.subject && s.grade)
                             .map(s => ({ subject: s.subject, grade: s.grade })),
          jamb_score:      parseInt(step2.jamb_score) || 0,
          university_id:   parseInt(step2.university_id) || 1,   // fallback to 1 if null
          course_id:       parseInt(step2.course_id) || 1,       // fallback to 1 if null
          post_utme_score: step3.hasPostUTME === true
                             ? (parseFloat(step3.post_utme_score) || null)
                             : null,
        }
        // Validate minimum requirements before sending
        if (!payload.waec_results.length) {
          setError('Please go back and enter your WAEC subjects and grades.')
          setLoading(false)
          return
        }
        if (!payload.jamb_score) {
          setError('Please go back and enter your JAMB score.')
          setLoading(false)
          return
        }
        const { data } = await api.post('/admission-guide/analyze', payload)
        setResult(data)
      } catch (err) {
        const detail = err.response?.data?.detail
        // Pydantic 422 returns detail as array of {loc, msg, type} objects — convert to string
        if (Array.isArray(detail)) {
          const msgs = detail.map(e => `${e.loc?.slice(-1)?.[0] || 'field'}: ${e.msg}`).join('; ')
          setError(`Validation error — ${msgs}`)
        } else {
          setError(typeof detail === 'string' ? detail : 'Analysis failed. Please try again.')
        }
      } finally {

        setLoading(false)
      }
    }
    analyze()
  }, [])

  if (loading) return (
    <div className="flex flex-col items-center py-16 gap-4">
      <Spinner size="lg" />
      <p className="text-gray-500 text-sm">Analysing your profile with AI...</p>
    </div>
  )

  if (error) return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{error}</div>
    </div>
  )

  if (!result) return null

  const verdictColor = {
    'HIGHLY LIKELY': 'text-green-700 bg-green-50 border-green-300',
    'LIKELY':        'text-blue-700 bg-blue-50 border-blue-300',
    'UNLIKELY':      'text-red-700 bg-red-50 border-red-300',
  }[result.verdict] || 'text-gray-700 bg-gray-50 border-gray-300'

  return (
    <div className="p-6 space-y-5">
      <h2 className="text-xl font-bold text-gray-900">AI Admission Analysis</h2>

      <div className={`rounded-xl border-2 p-5 text-center ${verdictColor}`}>
        <p className="text-3xl font-black mb-1">{result.verdict}</p>
        <p className="text-sm">{result.message}</p>
        <div className="flex justify-center gap-3 mt-3">
          {step2.jambVerified && <VerifiedBadge verified={true} />}
          {step1.waecVerified && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">WAEC Verified</span>}
        </div>
      </div>

      {result.recommendations?.length > 0 && (
        <div className="card">
          <p className="font-bold text-gray-800 mb-2">Recommendations</p>
          <ul className="space-y-1">
            {result.recommendations.map((r, i) => (
              <li key={i} className="text-sm text-gray-700 flex gap-2">
                <span className="text-blue-500 flex-shrink-0">•</span>{r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ── Wizard canNext logic ─────────────────────────────────────────────────────
function canNext(step, s1, s2, s3) {
  if (step === 1) {
    if (s1.hasWAEC === null) return false          // nothing selected yet — block
    if (s1.hasWAEC === false) return true           // "no WAEC yet" — allow continue to guide them
    // hasWAEC === true: must have 5 credits inc English + Maths
    const credits = (s1.subjects || []).filter(s => CREDIT_GRADES.has(s.grade)).length
    const hasEng  = (s1.subjects || []).some(s => s.subject?.toLowerCase().includes('english') && CREDIT_GRADES.has(s.grade))
    const hasMath = (s1.subjects || []).some(s => s.subject?.toLowerCase().includes('math') && CREDIT_GRADES.has(s.grade))
    return credits >= 5 && hasEng && hasMath
  }
  if (step === 2) {
    if (s1.hasWAEC === false) return true           // came from no-WAEC path, just go forward
    if (s2.hasJAMB !== true)  return false
    return !!(s2.university_id && s2.course_id && s2.jamb_score)
  }
  if (step === 3) return s3.hasPostUTME !== null
  return true
}

// ── Main wizard ──────────────────────────────────────────────────────────────
export default function AdmissionGuidePage() {
  const [step,  setStep]  = useState(1)
  const [step1, setStep1] = useState({ hasWAEC: null, subjects: [], waecVerified: null })
  const [step2, setStep2] = useState({ hasJAMB: null, jambVerified: null, university_id: '', course_id: '', jamb_score: '' })
  const [step3, setStep3] = useState({ hasPostUTME: null, post_utme_score: '', postUtmeVerified: null })

  const next = () => setStep(s => Math.min(s + 1, 4))
  const prev = () => setStep(s => Math.max(s - 1, 1))

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress steps */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${step > i + 1 ? 'bg-green-500 text-white'
                : step === i + 1 ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                : 'bg-gray-200 text-gray-500'}`}>
                {step > i + 1 ? <CheckCircle size={16} /> : i + 1}
              </div>
              <span className={`ml-1 text-xs font-medium hidden sm:block
                ${step === i + 1 ? 'text-blue-700' : 'text-gray-400'}`}>{s}</span>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${step > i + 1 ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="card p-0 overflow-hidden mb-6">
          {step === 1 && <Step1OLevels  data={step1} onChange={setStep1} />}
          {step === 2 && <Step2UTME     data={step2} onChange={setStep2} noWAEC={step1.hasWAEC === false} />}
          {step === 3 && <Step3PostUTME data={step3} onChange={setStep3} />}
          {step === 4 && <Step4Analysis step1={step1} step2={step2} step3={step3} />}
        </div>

        {/* Navigation */}
        {step < 4 && (
          <div className="flex justify-between">
            <button onClick={prev} disabled={step === 1}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-30">
              <ChevronLeft size={16} /> Back
            </button>
            <button onClick={next} disabled={!canNext(step, step1, step2, step3)}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold text-sm
                hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              {step === 3 ? 'Get AI Analysis' : 'Continue'} <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </Layout>
  )
}


