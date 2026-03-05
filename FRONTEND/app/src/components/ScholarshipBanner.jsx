// FILE: src/components/ScholarshipBanner.jsx  — COMPLETE REPLACEMENT
//
// ★ Fixed at BOTTOM of viewport — position:fixed, bottom:0, z-index:100
// ★ Lives inside Layout so it shows on EVERY authenticated page
// ★ Each item is fully CLICKABLE — opens apply_url in new tab
// ★ Scrolling pauses on hover so users can read / click
// ★ Only renders when there are scholarships (returns null if empty)
// ★ Layout adds pb-10 to main content so banner never overlaps text

import { useState, useEffect } from 'react'
import api from '../services/api'
import { GraduationCap, AlertCircle, ExternalLink } from 'lucide-react'

function Item({ item }) {
  const daysLeft = item.deadline
    ? Math.ceil((new Date(item.deadline) - new Date()) / 86400000)
    : null
  const isUrgent = item.is_urgent || (daysLeft !== null && daysLeft >= 0 && daysLeft <= 14)

  const deadlineLabel = item.deadline
    ? new Date(item.deadline).toLocaleDateString('en-NG', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : null

  const handleClick = () => {
    if (item.apply_url) {
      window.open(item.apply_url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={!item.apply_url}
      title={item.apply_url ? `Apply for: ${item.title}` : item.title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '0 22px',
        background: 'none',
        border: 'none',
        cursor: item.apply_url ? 'pointer' : 'default',
        whiteSpace: 'nowrap',
        transition: 'opacity 0.15s ease',
        flexShrink: 0,
      }}
      onMouseEnter={e => { if (item.apply_url) e.currentTarget.style.opacity = '0.75' }}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >
      {isUrgent && (
        <AlertCircle
          size={11}
          style={{ color: '#fca5a5', flexShrink: 0, animation: 'pulse-red 1.2s infinite' }}
        />
      )}

      {/* Title */}
      <span style={{
        fontFamily: "'Fraunces', serif",
        fontWeight: 700,
        fontSize: '0.78rem',
        color: '#fff',
        letterSpacing: '0.005em',
      }}>
        {item.title}
      </span>

      {/* Dot divider */}
      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', flexShrink: 0 }}>•</span>

      {/* Provider */}
      <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>
        {item.provider}
      </span>

      {/* Amount */}
      {item.amount && (
        <>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', flexShrink: 0 }}>•</span>
          <span style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            fontSize: '0.75rem',
            color: '#fde68a',
          }}>
            {item.amount}
          </span>
        </>
      )}

      {/* Deadline */}
      {deadlineLabel && (
        <>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', flexShrink: 0 }}>•</span>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            color: isUrgent ? '#fca5a5' : 'rgba(255,255,255,0.6)',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            Closes {deadlineLabel}
          </span>
        </>
      )}

      {/* Apply CTA — only shown when URL exists */}
      {item.apply_url && (
        <>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', flexShrink: 0 }}>•</span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
            fontSize: '0.72rem',
            fontWeight: 800,
            color: '#86efac',
            textDecoration: 'underline',
            textUnderlineOffset: 2,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            Apply Now <ExternalLink size={9} />
          </span>
        </>
      )}

      {/* Track separator */}
      <span style={{
        color: 'rgba(255,255,255,0.15)',
        fontSize: '1rem',
        marginLeft: 10,
        flexShrink: 0,
        lineHeight: 1,
      }}>
        |
      </span>
    </button>
  )
}

export default function ScholarshipBanner() {
  const [items,  setItems]  = useState([])
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    api.get('/scholarships')
      .then(r => setItems(r.data || []))
      .catch(() => {})
  }, [])

  // Don't render anything if no scholarships seeded yet
  if (items.length === 0) return null

  // Double the array so the CSS scroll loops seamlessly
  const doubled = [...items, ...items]

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: 40,
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: 'linear-gradient(90deg, #052e16 0%, #14532d 35%, #166534 70%, #15803d 100%)',
        borderTop: '1px solid rgba(74,222,128,0.25)',
        boxShadow: '0 -4px 20px rgba(22,163,74,0.18)',
      }}
    >
      {/* ── Static label pill (never scrolls) ─────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        padding: '0 16px 0 14px',
        height: '100%',
        background: 'rgba(0,0,0,0.32)',
        borderRight: '1px solid rgba(74,222,128,0.2)',
        flexShrink: 0,
      }}>
        <GraduationCap size={13} style={{ color: '#fde68a', flexShrink: 0 }} />
        <span style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 800,
          fontSize: '0.65rem',
          letterSpacing: '0.12em',
          color: '#ffffff',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}>
          Scholarships
        </span>
      </div>

      {/* ── Scrolling track ────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
      }}>
        <div
          className={`edu-scroll-track${paused ? ' paused' : ''}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          {doubled.map((item, i) => (
            <Item key={`${item.id ?? i}-${i}`} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}
