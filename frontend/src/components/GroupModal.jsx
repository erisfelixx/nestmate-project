import { useState } from 'react'
import api from '../api/axios'
import ProfileModal from './ProfileModal'

export default function GroupModal({ group, onClose }) {
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [applied, setApplied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleApply = async () => {
    setLoading(true)
    setError('')
    try {
      await api.post(`/groups/${group.group_id}/apply`)
      setApplied(true)
    } catch (e) {
      setError(e.response?.data?.detail || 'Помилка надсилання запиту')
    } finally {
      setLoading(false)
    }
  }

  const handleMemberClick = async (userId) => {
    if (!userId) return // Захист від порожнього ID
    setProfileLoading(true)
    try {
      const res = await api.get(`/profiles/user/${userId}`)
      setSelectedProfile({ ...res.data, user_id: userId })
    } catch {
      // якщо профіль не знайдено, можна нічого не робити або вивести помилку
      console.error("Профіль не знайдено")
    } finally {
      setProfileLoading(false)
    }
  }

  const spotsLeft = group.target_size - group.current_size

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={s.modal} onClick={e => e.stopPropagation()}>

        {/* Шапка */}
        <div style={s.header}>
          <div style={s.headerIcon}>👥</div>
          <div style={s.headerInfo}>
            <h2 style={s.title}>{group.name}</h2>
            <div style={s.subtitle}>{group.city}</div>
            <div style={s.badges}>
              <span style={s.badge}>
                {group.current_size} / {group.target_size} учасники
              </span>
              <span style={s.spotsbadge}>
                {spotsLeft} {spotsLeft === 1 ? 'місце' : 'місця'} вільно
              </span>
            </div>
          </div>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={s.body}>

          {/* Сумісність */}
          {group.compatibility !== undefined && (
            <div style={s.compatRow}>
              <div style={s.compatCircle(group.compatibility)}>
                {group.compatibility}%
              </div>
              <div>
                <div style={s.compatTitle}>Твоя сумісність з групою</div>
                <div style={s.compatSub}>
                  середнє між тобою і кожним учасником
                </div>
              </div>
            </div>
          )}

          {/* Бюджет */}
          <div style={s.block}>
            <div style={s.blockLabel}>Бюджет</div>
            <div style={s.infoRow}>
              <span style={s.infoVal}>
                {group.budget_min && group.budget_max
                  ? `${group.budget_min} – ${group.budget_max} грн / міс`
                  : '—'}
              </span>
            </div>
          </div>
          {group.description && (
            <div style={s.block}>
              <div style={s.blockLabel}>Про групу</div>
              <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text)', margin: 0 }}>
                {group.description}
              </p>
            </div>
          )}

          {/* Учасники */}
          <div style={s.block}>
            <div style={s.blockLabel}>Учасники</div>
            <div style={s.membersGrid}>

              {group.members.map((m, i) => (
                <div
                  key={i}
                  style={{ ...s.memberCard, cursor: 'pointer' }}
                  onClick={() => handleMemberClick(m.user_id)}
                >
                  <div style={s.memberAvatar}>{m.name?.[0] || '?'}</div>
                  <div style={s.memberName}>{m.name}, {m.age}</div>
                  <div style={{ fontSize: '10px', color: '#7C5CBF', marginTop: '4px' }}>
                    {profileLoading ? '...' : 'переглянути →'}
                  </div>
                </div>
              ))}

              {/* Порожні слоти */}
              {Array.from({ length: spotsLeft }).map((_, i) => (
                <div key={`empty-${i}`} style={s.emptySlot}>
                  <div style={s.emptyIcon}>+</div>
                  <div style={s.emptyText}>Вільне місце</div>
                </div>
              ))}
            </div>
          </div>

          {/* Розбивка сумісності по учасниках */}
          {group.breakdown_per_member?.length > 0 && (
            <div style={s.block}>
              <div style={s.blockLabel}>Сумісність з кожним учасником</div>
              {group.breakdown_per_member.map(b => (
                <div key={b.user_id} style={s.barRow}>
                  <span style={s.barName}>з {b.name}</span>
                  <div style={s.barBg}>
                    <div style={s.barFill(b.compatibility)} />
                  </div>
                  <span style={s.barVal}>{b.compatibility}%</span>
                </div>
              ))}
            </div>
          )}

          {/* Помилка */}
          {error && <div style={s.errorMsg}>{error}</div>}

          {/* Кнопка */}
          {applied ? (
            <div style={s.successMsg}>
              ✅ Заявку надіслано! Очікуй підтвердження від учасників.
            </div>
          ) : (
            <button
              className="btn btn-primary"
              style={s.applyBtn}
              onClick={handleApply}
              disabled={loading || spotsLeft === 0}
            >
              {loading ? 'Надсилання...' :
                spotsLeft === 0 ? 'Група заповнена' :
                  '📩 Подати заявку до групи'}
            </button>
          )}

        </div>
      </div>

      {selectedProfile && (
        <ProfileModal
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
          zIndex={200}
        />
      )}
    </div>
  )
}

const s = {
  modal: {
    maxWidth: '500px',
    width: '92%',
    maxHeight: '85vh',
    overflowY: 'auto',
    padding: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    padding: '1.5rem',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: 0,
    background: 'var(--surface)',
    zIndex: 1,
  },
  headerIcon: {
    width: '52px', height: '52px',
    borderRadius: '50%',
    background: '#EDE8F8',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px', flexShrink: 0,
  },
  headerInfo: {
    flex: 1,
    display: 'flex', flexDirection: 'column', gap: '4px',
  },
  title: {
    fontFamily: 'DM Serif Display, serif',
    fontSize: '20px', fontWeight: 400,
  },
  subtitle: {
    fontSize: '13px', color: 'var(--text-secondary)',
  },
  badges: {
    display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px',
  },
  badge: {
    background: '#EDE8F8', color: '#534AB7',
    fontSize: '11px', fontWeight: '500',
    padding: '3px 10px', borderRadius: '20px',
  },
  spotsbage: {
    background: '#EAF3DE', color: '#3B6D11',
    fontSize: '11px', fontWeight: '500',
    padding: '3px 10px', borderRadius: '20px',
  },
  spotsbadge: {
    background: '#EAF3DE', color: '#3B6D11',
    fontSize: '11px', fontWeight: '500',
    padding: '3px 10px', borderRadius: '20px',
  },
  closeBtn: {
    border: 'none', background: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: '18px', padding: '4px 8px',
    borderRadius: '6px', cursor: 'pointer', flexShrink: 0,
  },
  body: {
    padding: '1.25rem 1.5rem',
    display: 'flex', flexDirection: 'column', gap: '1.1rem',
  },
  compatRow: {
    display: 'flex', alignItems: 'center', gap: '14px',
    background: 'var(--accent-secondary)',
    borderRadius: '10px', padding: '1rem',
  },
  compatCircle: (val) => ({
    width: '56px', height: '56px', borderRadius: '50%',
    background: val >= 75 ? '#EAF3DE' : val >= 55 ? '#FAEEDA' : '#FCEBEB',
    color: val >= 75 ? '#3B6D11' : val >= 55 ? '#854F0B' : '#A32D2D',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '14px', fontWeight: '600', flexShrink: 0,
  }),
  compatTitle: { fontSize: '14px', fontWeight: '500' },
  compatSub: { fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' },
  block: {
    display: 'flex', flexDirection: 'column', gap: '8px',
  },
  blockLabel: {
    fontSize: '11px', fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  infoRow: { fontSize: '14px', fontWeight: '500' },
  infoVal: { color: 'var(--text)' },
  membersGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px',
  },
  memberCard: {
    background: 'var(--bg)', border: '1px solid var(--border)',
    borderRadius: '10px', padding: '10px',
    textAlign: 'center',
  },
  memberAvatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    background: '#EDE8F8', color: '#534AB7',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'DM Serif Display, serif', fontSize: '16px',
    margin: '0 auto 6px',
  },
  memberName: { fontSize: '12px', fontWeight: '500' },
  emptySlot: {
    background: 'var(--bg)', border: '1px dashed var(--border)',
    borderRadius: '10px', padding: '10px',
    textAlign: 'center', minHeight: '72px',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '4px',
  },
  emptyIcon: {
    width: '28px', height: '28px', borderRadius: '50%',
    background: 'var(--border)', color: 'var(--text-secondary)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '18px',
  },
  emptyText: { fontSize: '11px', color: 'var(--text-secondary)' },
  barRow: {
    display: 'flex', alignItems: 'center', gap: '10px',
  },
  barName: {
    fontSize: '12px', color: 'var(--text-secondary)',
    width: '90px', flexShrink: 0,
  },
  barBg: {
    flex: 1, height: '5px',
    background: 'var(--border)', borderRadius: '10px', overflow: 'hidden',
  },
  barFill: (val) => ({
    height: '100%', borderRadius: '10px',
    width: `${val}%`,
    background: val >= 75 ? '#639922' : val >= 55 ? '#BA7517' : '#E24B4A',
    transition: 'width 0.4s ease',
  }),
  barVal: {
    fontSize: '12px', fontWeight: '500',
    width: '32px', textAlign: 'right',
  },
  applyBtn: {
    width: '100%', padding: '12px',
    fontSize: '14px', fontWeight: '600',
    borderRadius: '10px', marginTop: '4px',
  },
  errorMsg: {
    background: '#FEE8E8', color: '#C0392B',
    padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
  },
  successMsg: {
    background: '#EAF3DE', color: '#3B6D11',
    padding: '12px 16px', borderRadius: '10px',
    fontSize: '13px', textAlign: 'center',
  },
}