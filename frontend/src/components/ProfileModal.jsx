import { useState } from 'react'
import api from '../api/axios'

export default function ProfileModal({ profile, onClose }) {
  const [requested, setRequested] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRequest = async () => {
    console.log('Надсилаємо запит до user_id:', profile.user_id)
    setLoading(true)
    setError('')
    try {
      await api.post(`/contacts/request/${profile.user_id}`)
      setRequested(true)
    } catch (e) {
      setError(e.response?.data?.detail || 'Помилка надсилання запиту')
    } finally {
      setLoading(false)
    }
  }

  const compatColor = profile.compatibility >= 80
    ? { bg: '#EAF3DE', color: '#3B6D11' }
    : { bg: '#FEF3E2', color: '#854F0B' }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={styles.modal}
        onClick={e => e.stopPropagation()}
      >
        {/* Шапка */}
        <div style={styles.header}>
            {profile.photo_url
              ? <img src={profile.photo_url} style={{ width:'52px', height:'52px', borderRadius:'50%', objectFit:'cover' }} alt="Avatar" />
              : <div style={styles.avatar}>{profile.name?.[0] || '?'}</div>
            }
          <div style={styles.headerInfo}>
            <h2 style={styles.name}>{profile.name}, {profile.age}</h2>
            <div style={styles.city}>{profile.city}</div>
            {profile.compatibility !== undefined && (
              <div style={{ ...styles.compatBadge, background: compatColor.bg, color: compatColor.color }}>
                {profile.compatibility}% сумісності
              </div>
            )}
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.body}>

          {/* Про себе */}
          {profile.bio && (
            <div style={styles.block}>
              <div style={styles.blockLabel}>Про себе</div>
              <p style={styles.blockText}>{profile.bio}</p>
            </div>
          )}

          {/* Інтереси */}
          {profile.interests && (
            <div style={styles.block}>
              <div style={styles.blockLabel}>Інтереси</div>
              <p style={styles.blockText}>{profile.interests}</p>
            </div>
          )}

          {/* Житло */}
          <div style={styles.block}>
            <div style={styles.blockLabel}>Житло</div>
            <div style={styles.infoGrid}>
              <InfoItem label="Роль" value={profile.role === 'looking' ? '🔍 Шукає кімнату' : '🏠 Здає кімнату'} />
              <InfoItem label="Бюджет" value={profile.budget_min && profile.budget_max ? `${profile.budget_min} – ${profile.budget_max} грн` : '—'} />
              <InfoItem label="Дата заселення" value={profile.move_in_date || '—'} />
            </div>
          </div>

          {/* Звички */}
          <div style={styles.block}>
            <div style={styles.blockLabel}>Звички</div>
            <div style={styles.infoGrid}>
              <InfoItem label="Режим дня" value={profile.schedule === 'early_bird' ? '🌅 Жайворонок' : profile.schedule === 'night_owl' ? '🦉 Сова' : '—'} />
              <InfoItem label="Чистота" value={profile.cleanliness ? `${profile.cleanliness}/7` : '—'} />
              <InfoItem label="Рівень шуму" value={profile.noise_level ? `${profile.noise_level}/7` : '—'} />
              <InfoItem label="Гості" value={profile.guests_frequency ? `${profile.guests_frequency}/7` : '—'} />
              <InfoItem label="Тварини" value={profile.has_pets ? '🐾 Є тварини' : '—'} />
              <InfoItem label="Куріння" value={profile.smoking ? '🚬 Курить' : '✅ Не курить'} />
            </div>
          </div>

          {/* Розбивка сумісності */}
          {profile.breakdown && (
            <div style={styles.block}>
              <div style={styles.blockLabel}>Розбивка сумісності</div>
              {Object.entries(profile.breakdown).map(([key, val]) => (
                <div key={key} style={styles.barRow}>
                  <span style={styles.barLabel}>{key}</span>
                  <div style={styles.barBg}>
                    <div style={styles.barFill(val)} />
                  </div>
                  <span style={styles.barVal}>{val}%</span>
                </div>
              ))}
            </div>
          )}

          {/* Помилка */}
          {error && <div style={styles.errorMsg}>{error}</div>}

          {/* Кнопка запиту */}
          {requested ? (
            <div style={styles.successMsg}>✅ Запит надіслано! Очікуй підтвердження.</div>
          ) : (
            <button
              className="btn btn-primary"
              style={styles.requestBtn}
              onClick={handleRequest}
              disabled={loading}
            >
              {loading ? 'Надсилання...' : '📩 Надіслати запит на контакт'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoItem({ label, value }) {
  return (
    <div style={styles.infoItem}>
      <span style={styles.infoLabel}>{label}</span>
      <span style={styles.infoValue}>{value}</span>
    </div>
  )
}

const styles = {
  modal: {
    maxWidth: '520px',
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
  avatar: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    background: 'var(--accent-secondary)',
    color: 'var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'DM Serif Display, serif',
    fontSize: '22px',
    flexShrink: 0,
  },
  headerInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  name: {
    fontFamily: 'DM Serif Display, serif',
    fontSize: '22px',
    fontWeight: 400,
  },
  city: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  compatBadge: {
    display: 'inline-block',
    fontSize: '12px',
    fontWeight: '500',
    padding: '3px 10px',
    borderRadius: '20px',
    marginTop: '2px',
    width: 'fit-content',
  },
  closeBtn: {
    border: 'none',
    background: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: '18px',
    padding: '4px 8px',
    borderRadius: '6px',
    cursor: 'pointer',
    flexShrink: 0,
  },
  body: {
    padding: '1.25rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.1rem',
  },
  block: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  blockLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  blockText: {
    fontSize: '14px',
    color: 'var(--text)',
    lineHeight: 1.6,
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  },
  infoItem: {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '8px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  infoLabel: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
  },
  infoValue: {
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--text)',
  },
  barRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  barLabel: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    width: '110px',
    flexShrink: 0,
  },
  barBg: {
    flex: 1,
    height: '6px',
    background: 'var(--border)',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  barFill: (val) => ({
    height: '100%',
    width: `${val}%`,
    background: val >= 80 ? '#6DBB3A' : val >= 50 ? '#F0A500' : '#E05050',
    borderRadius: '10px',
    transition: 'width 0.4s ease',
  }),
  barVal: {
    fontSize: '12px',
    fontWeight: '500',
    color: 'var(--text)',
    width: '32px',
    textAlign: 'right',
  },
  requestBtn: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '10px',
    marginTop: '4px',
  },
  errorMsg: {
    background: '#FEE8E8',
    color: '#C0392B',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
  },
  successMsg: {
    background: '#EAF3DE',
    color: '#3B6D11',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '13px',
    textAlign: 'center',
  },
}