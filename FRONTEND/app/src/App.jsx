// FILE: src/App.jsx  — COMPLETE REPLACEMENT
// Adds missing routes: /my-journey, /admission-guide, /analytics, /info-guide, /faq
// These were in the sidebar nav but not registered → caused redirect to login

import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import LandingPage       from './pages/LandingPage'
import LoginPage         from './pages/LoginPage'
import RegisterPage      from './pages/RegisterPage'
import DashboardPage     from './pages/DashboardPage'
import WAECPage          from './pages/exams/WAECPage'
import JAMBPage          from './pages/exams/JAMBPage'
import PostUTMEPage      from './pages/exams/PostUTMEPage'
import PracticePage      from './pages/PracticePage'
import UniversitiesPage  from './pages/UniversitiesPage'
import AdvisorPage       from './pages/AdvisorPage'
import AdmittedPage      from './pages/AdmittedPage'

// ── Pages that were in nav but missing from routes ─────────────────────────
import JourneyPage      from './pages/JourneyPage'
import AdmissionGuidePage from './pages/AdmissionGuidePage'
import AnalyticsPage      from './pages/AnalyticsPage'
import InfoGuidePage      from './pages/InfoGuidePage'
import FAQPage            from './pages/FAQPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'var(--bg)' }}>
      <div style={{ width:40, height:40, border:'4px solid var(--accent-subtle)', borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

function GuestRoute({ children }) {
  const { user } = useAuth()
  return user ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/"         element={<LandingPage />} />
        <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        {/* Core protected */}
        <Route path="/dashboard"       element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/exams/waec"      element={<ProtectedRoute><WAECPage /></ProtectedRoute>} />
        <Route path="/exams/jamb"      element={<ProtectedRoute><JAMBPage /></ProtectedRoute>} />
        <Route path="/exams/post-utme" element={<ProtectedRoute><PostUTMEPage /></ProtectedRoute>} />
        <Route path="/practice"        element={<ProtectedRoute><PracticePage /></ProtectedRoute>} />
        <Route path="/universities"    element={<ProtectedRoute><UniversitiesPage /></ProtectedRoute>} />
        <Route path="/advisor"         element={<ProtectedRoute><AdvisorPage /></ProtectedRoute>} />
        <Route path="/admitted"        element={<ProtectedRoute><AdmittedPage /></ProtectedRoute>} />

        {/* Previously missing routes — now registered */}
        <Route path="/my-journey"      element={<ProtectedRoute><JourneyPage /></ProtectedRoute>} />
        <Route path="/admission-guide" element={<ProtectedRoute><AdmissionGuidePage /></ProtectedRoute>} />
        <Route path="/analytics"       element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/info-guide"      element={<ProtectedRoute><InfoGuidePage /></ProtectedRoute>} />
        <Route path="/faq"             element={<ProtectedRoute><FAQPage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}
