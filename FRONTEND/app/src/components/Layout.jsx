// FILE: src/components/Layout.jsx  — COMPLETE REPLACEMENT
//
// ★ Premium dark sidebar with gradient logo + glowing active states
// ★ Grouped nav: LEARNING / EXAMS / PLANNING / SUPPORT
// ★ Journey progress bar with colour per stage
// ★ Theme switcher (Forest / Midnight / Amber) — bottom of sidebar
// ★ ScholarshipBanner pinned at bottom of viewport (pb-10 on main prevents overlap)
// ★ Mobile: slide-in drawer with backdrop

import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import ScholarshipBanner from './ScholarshipBanner'
import {
  LayoutDashboard, BookOpen, GraduationCap, Brain, Building2,
  MessageCircle, LogOut, Menu, X, ChevronRight, Trophy, Map,
  HelpCircle, BarChart3, Compass, Info, Palette, Check,
} from 'lucide-react'

/* ─── Navigation structure ─────────────────────────────────────────────────── */
const NAV_GROUPS = [
  {
    heading: 'LEARNING',
    items: [
      { to: '/dashboard',       Icon: LayoutDashboard, label: 'Dashboard'       },
      { to: '/my-journey',      Icon: Map,             label: 'My Journey'      },
      { to: '/practice',        Icon: Brain,           label: 'Practice'        },
    ],
  },
  {
    heading: 'EXAMS',
    items: [
      { to: '/exams/waec',      Icon: BookOpen,        label: 'WAEC'            },
      { to: '/exams/jamb',      Icon: GraduationCap,   label: 'JAMB'            },
      { to: '/exams/post-utme', Icon: Trophy,          label: 'Post-UTME'       },
    ],
  },
  {
    heading: 'PLANNING',
    items: [
      { to: '/universities',    Icon: Building2,       label: 'Universities'    },
      { to: '/admission-guide', Icon: Compass,         label: 'Admission Guide' },
      { to: '/info-guide',      Icon: Info,            label: 'Info Guide'      },
      { to: '/analytics',       Icon: BarChart3,       label: 'Analytics'       },
    ],
  },
  {
    heading: 'SUPPORT',
    items: [
      { to: '/advisor',         Icon: MessageCircle,   label: 'AI Advisor'      },
      { to: '/faq',             Icon: HelpCircle,      label: 'Student FAQ'     },
    ],
  },
]

/* ─── Stage metadata ────────────────────────────────────────────────────────── */
const STAGES = {
  onboarding: { label: 'Getting Started', color: '#94a3b8', pct: 8  },
  waec:       { label: 'WAEC Stage',      color: '#f59e0b', pct: 28 },
  jamb:       { label: 'JAMB Stage',      color: '#3b82f6', pct: 52 },
  post_utme:  { label: 'Post-UTME',       color: '#a855f7', pct: 74 },
  admitted:   { label: 'Admitted! 🎉',    color: '#22c55e', pct: 95 },
  completed:  { label: 'Completed ✓',     color: '#22c55e', pct: 100},
}

/* ─── NavLink ──────────────────────────────────────────────────────────────── */
function NavLink({ to, Icon, label, onClick }) {
  const { pathname } = useLocation()
  const active = pathname === to || (to !== '/dashboard' && pathname.startsWith(to + '/'))

  return (
    <Link
      to={to}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 12px',
        borderRadius: 10,
        textDecoration: 'none',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: '0.845rem',
        fontWeight: active ? 700 : 600,
        color: active ? 'var(--sidebar-active)' : 'var(--sidebar-text)',
        background: active ? 'var(--sidebar-active-bg)' : 'transparent',
        opacity: active ? 1 : 0.7,
        transition: 'all 0.17s ease',
        position: 'relative',
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.background = 'var(--sidebar-hover)'
          e.currentTarget.style.opacity = '1'
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.opacity = '0.7'
        }
      }}
    >
      {/* Active indicator stripe */}
      {active && (
        <span style={{
          position: 'absolute', left: 0, top: '50%',
          transform: 'translateY(-50%)',
          width: 3, height: 20,
          background: 'var(--sidebar-active)',
          borderRadius: '0 3px 3px 0',
        }} />
      )}
      <Icon size={15} style={{ flexShrink: 0 }} />
      <span>{label}</span>
      {active && (
        <ChevronRight size={12} style={{ marginLeft: 'auto', color: 'var(--sidebar-active)' }} />
      )}
    </Link>
  )
}

/* ─── ThemePicker ──────────────────────────────────────────────────────────── */
function ThemePicker() {
  const { theme, setTheme, themes } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 9,
          width: '100%', padding: '9px 12px',
          background: open ? 'var(--sidebar-hover)' : 'transparent',
          border: 'none', borderRadius: 10, cursor: 'pointer',
          color: 'var(--sidebar-muted)',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '0.845rem', fontWeight: 600,
          transition: 'background 0.17s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--sidebar-hover)'}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'transparent' }}
      >
        <Palette size={15} style={{ flexShrink: 0 }} />
        <span style={{ opacity: 0.7 }}>Theme</span>
        <span style={{
          marginLeft: 'auto',
          padding: '2px 8px', borderRadius: 6,
          background: 'var(--sidebar-active-bg)',
          color: 'var(--sidebar-active)',
          fontSize: '0.7rem', fontWeight: 800,
          textTransform: 'capitalize',
        }}>
          {theme}
        </span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: 0, right: 0,
            zIndex: 999,
            background: 'var(--surface)',
            border: '1px solid var(--border-base)',
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {themes.map(t => (
            <button
              key={t.id}
              onClick={() => { setTheme(t.id); setOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                width: '100%', padding: '12px 14px',
                background: theme === t.id ? 'var(--accent-subtle)' : 'transparent',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                color: theme === t.id ? 'var(--accent-text)' : 'var(--text-b)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => {
                if (theme !== t.id) e.currentTarget.style.background = 'var(--surface-raised)'
              }}
              onMouseLeave={e => {
                if (theme !== t.id) e.currentTarget.style.background = 'transparent'
              }}
            >
              <span style={{
                width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                background: t.swatch,
                boxShadow: theme === t.id ? `0 0 10px ${t.swatch}80` : 'none',
                border: `2px solid ${theme === t.id ? t.swatch : 'transparent'}`,
                transition: 'box-shadow 0.2s',
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontFamily: "'Fraunces', serif",
                  fontWeight: 700, fontSize: '0.85rem',
                  color: theme === t.id ? 'var(--accent-text)' : 'var(--text-h)',
                  lineHeight: 1.2,
                }}>
                  {t.name}
                </p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-m)', marginTop: 1 }}>
                  {t.desc}
                </p>
              </div>
              {theme === t.id && (
                <Check size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── SidebarContents (shared between desktop + mobile drawer) ──────────────── */
function SidebarContents({ user, stage, stageMeta, onLogout, onNav }) {
  const initials = user?.full_name
    ? user.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'S'

  return (
    <>
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '18px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11, flexShrink: 0,
          background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 16px var(--accent-glow)',
        }}>
          <GraduationCap size={20} color="#fff" />
        </div>
        <div>
          <p style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 900, fontSize: '1.1rem',
            color: '#fff', lineHeight: 1.1,
            letterSpacing: '-0.03em',
          }}>
            EduGuide
          </p>
          <p style={{ fontSize: '0.62rem', color: 'var(--sidebar-muted)', marginTop: 1, letterSpacing: '0.04em' }}>
            NIGERIA'S #1 EXAM PLATFORM
          </p>
        </div>
      </div>

      {/* User card */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Fraunces', serif",
            fontWeight: 900, fontSize: '0.85rem', color: '#fff',
            boxShadow: '0 0 12px var(--accent-glow)',
          }}>
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700, fontSize: '0.85rem', color: '#fff',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {user?.full_name || 'Student'}
            </p>
            <p style={{
              fontSize: '0.7rem', color: 'var(--sidebar-muted)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {user?.class_level || 'Student'}
            </p>
          </div>
        </div>

        {/* Journey progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700, fontSize: '0.65rem',
              color: 'var(--sidebar-muted)', letterSpacing: '0.04em',
            }}>
              {stageMeta.label}
            </span>
            <span style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 900, fontSize: '0.7rem',
              color: stageMeta.color,
            }}>
              {stageMeta.pct}%
            </span>
          </div>
          <div style={{
            height: 5, borderRadius: 99,
            background: 'rgba(255,255,255,0.09)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: 99,
              width: `${stageMeta.pct}%`,
              background: stageMeta.color,
              transition: 'width 0.9s ease',
              boxShadow: `0 0 8px ${stageMeta.color}80`,
            }} />
          </div>
        </div>
      </div>

      {/* Navigation groups */}
      <nav style={{
        flex: 1, overflowY: 'auto',
        padding: '10px 10px',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        {NAV_GROUPS.map(group => (
          <div key={group.heading}>
            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800, fontSize: '0.6rem',
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.22)',
              padding: '0 12px', marginBottom: 3,
            }}>
              {group.heading}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {group.items.map(item => (
                <NavLink key={item.to} {...item} onClick={onNav} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer: theme + logout */}
      <div style={{
        padding: '8px 10px',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', flexDirection: 'column', gap: 2,
      }}>
        <ThemePicker />
        <button
          onClick={onLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 9,
            width: '100%', padding: '9px 12px',
            background: 'transparent', border: 'none', borderRadius: 10,
            cursor: 'pointer',
            color: '#f87171',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '0.845rem', fontWeight: 600,
            transition: 'background 0.17s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={15} style={{ flexShrink: 0 }} />
          Logout
        </button>
      </div>
    </>
  )
}

/* ─── Main export ───────────────────────────────────────────────────────────── */
export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const stage     = user?.journey_stage || 'onboarding'
  const stageMeta = STAGES[stage] || STAGES.onboarding

  const handleLogout = async () => { await logout(); navigate('/login') }

  const sharedProps = {
    user, stage, stageMeta,
    onLogout: handleLogout,
    onNav: () => setMobileOpen(false),
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>

      {/* ── Desktop Sidebar ─────────────────────────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col"
        style={{
          width: 252,
          position: 'fixed', top: 0, left: 0, bottom: 0,
          zIndex: 20,
          background: 'var(--sidebar)',
          overflowY: 'auto',
        }}
      >
        <SidebarContents {...sharedProps} />
      </aside>

      {/* ── Mobile top bar ──────────────────────────────────────────────── */}
      <div
        className="lg:hidden"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '11px 16px',
          background: 'var(--sidebar)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <GraduationCap size={16} color="#fff" />
          </div>
          <span style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 900, fontSize: '1rem', color: '#fff',
          }}>
            EduGuide
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(o => !o)}
          style={{
            padding: 8, borderRadius: 9, border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,0.09)',
            color: 'var(--sidebar-text)',
          }}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Mobile drawer ───────────────────────────────────────────────── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden"
            style={{
              position: 'fixed', inset: 0, zIndex: 40,
              background: 'rgba(0,0,0,0.65)',
            }}
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div
            className="lg:hidden animate-slideInLeft"
            style={{
              position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
              width: 268,
              background: 'var(--sidebar)',
              display: 'flex', flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            <SidebarContents {...sharedProps} />
          </div>
        </>
      )}

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main
        className="lg:ml-[252px]"
        style={{ flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        {/*
          pt-14 on mobile (clears fixed top bar)
          pb-12 on all screens (clears 40px scholarship banner at bottom)
        */}
        <div
          className="pt-14 lg:pt-0"
          style={{ flex: 1, paddingBottom: 50 }}
        >
          {children}
        </div>
      </main>

      {/* ── Scholarship banner — FIXED at bottom, on every page ─────────── */}
      <ScholarshipBanner />
    </div>
  )
}
