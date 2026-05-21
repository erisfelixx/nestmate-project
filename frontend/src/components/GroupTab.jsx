import { useState, useEffect } from 'react'
import api from '../api/axios'
import ProfileModal from './ProfileModal'

export default function GroupTab() {
  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    name: '', city: '', budget_min: '', budget_max: '', target_size: 3, description: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [contacts, setContacts] = useState([])
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [viewProfile, setViewProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)

  const CITIES = [
    'Київ', 'Львів', 'Харків', 'Одеса', 'Дніпро', 'Запоріжжя',
    'Вінниця', 'Полтава', 'Чернігів', 'Житомир', 'Хмельницький',
    'Черкаси', 'Івано-Франківськ', 'Тернопіль', 'Луцьк', 'Рівне',
    'Ужгород', 'Кропивницький', 'Чернівці',
  ]

  useEffect(() => {
    fetchGroup()
    api.get('/contacts/accepted')
      .then(res => setContacts(res.data))
      .catch(() => { })
  }, [])

  const fetchGroup = async () => {
    setLoading(true)
    try {
      const res = await api.get('/groups/me')
      setGroup(res.data)
    } catch {
      setGroup(null)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    setError('')
    if (!form.name) { setError("Введи назву групи"); return }
    try {
      await api.post('/groups/', {
        ...form,
        budget_min: form.budget_min ? parseInt(form.budget_min) : null,
        budget_max: form.budget_max ? parseInt(form.budget_max) : null,
        target_size: parseInt(form.target_size)
      })
      setCreating(false)
      fetchGroup()
    } catch (e) {
      setError(e.response?.data?.detail || 'Помилка створення')
    }
  }

  const handleRespond = async (requestId, accept) => {
    try {
      await api.post(`/groups/requests/${requestId}/${accept ? 'accept' : 'decline'}`)
      setSuccess(accept ? 'Кандидата прийнято!' : 'Запит відхилено')
      fetchGroup()
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e.response?.data?.detail || 'Помилка')
    }
  }

  const handleInvite = async (userId) => {
    try {
      await api.post(`/groups/me/invite/${userId}`)
      setSuccess('Користувача додано!')
      fetchGroup()
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e.response?.data?.detail || 'Помилка')
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete('/groups/me')
      setGroup(null)
      setConfirmDelete(false)
    } catch (e) {
      setError(e.response?.data?.detail || 'Помилка видалення')
    }
  }

  const handleViewProfile = async (userId) => {
    setProfileLoading(true)
    try {
      const res = await api.get(`/profiles/user/${userId}`)
      setViewProfile({ ...res.data, user_id: userId })
    } catch {
      setError('Не вдалося завантажити профіль')
    } finally {
      setProfileLoading(false)
    }
  }

  if (loading) return <div style={s.empty}>Завантаження...</div>

  // форма створення групи
  if (!group && !creating) return (
    <div style={s.emptyState}>
      <div style={s.emptyIcon}>👥</div>
      <p style={s.emptyText}>У тебе ще немає групи</p>
      <p style={s.emptySub}>Створи групу, щоб шукати кількох співмешканців одразу</p>
      <button className="btn btn-primary" style={s.createBtn}
        onClick={() => setCreating(true)}>
        Створити групу
      </button>
    </div>
  )

  if (creating) return (
    <div style={s.card}>
      <div style={s.cardTitle}>Нова група</div>
      <div style={s.fields}>
        <Field label="Назва групи">
          <input style={s.input} placeholder="Шукаємо третього у Києві"
            value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </Field>
        <Field label="Опис групи">
          <textarea
            style={{ ...s.input, resize: 'vertical', minHeight: '70px' }}
            placeholder="Розкажіть про себе та умови проживання..."
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
        </Field>
        <div style={s.grid2}>
          <Field label="Місто">
            <select style={s.input} value={form.city}
              onChange={e => setForm(f => ({ ...f, city: e.target.value }))}>
              <option value="">Оберіть...</option>
              {CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Кількість людей разом">
            <select style={s.input} value={form.target_size}
              onChange={e => setForm(f => ({ ...f, target_size: e.target.value }))}>
              <option value={2}>2 людини</option>
              <option value={3}>3 людини</option>
              <option value={4}>4 людини</option>
            </select>
          </Field>
        </div>
        <div style={s.grid2}>
          <Field label="Бюджет від (грн)">
            <input style={s.input} type="number" placeholder="4000"
              value={form.budget_min}
              onChange={e => setForm(f => ({ ...f, budget_min: e.target.value }))} />
          </Field>
          <Field label="Бюджет до (грн)">
            <input style={s.input} type="number" placeholder="12000"
              value={form.budget_max}
              onChange={e => setForm(f => ({ ...f, budget_max: e.target.value }))} />
          </Field>
        </div>
      </div>
      {error && <div style={s.errorMsg}>{error}</div>}
      <div style={s.formBtns}>
        <button className="btn" onClick={() => setCreating(false)}>Скасувати</button>
        <button className="btn btn-primary" onClick={handleCreate}>Створити</button>
      </div>
    </div>
  )

  // інформація про групу
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {success && <div style={s.successMsg}>{success}</div>}
      {error && <div style={s.errorMsg}>{error}</div>}

      {/* Інфо про групу */}
      <div style={s.card}>
        <div style={s.cardHead}>
          {/* Ліва частина: Назва та місто */}
          <div>
            <div style={s.cardTitle}>{group.name}</div>
            <div style={s.cardSub}>
              {group.city} · бюджет {group.budget_min}–{group.budget_max} грн
            </div>
          </div>

          {/* Права частина: Спільний контейнер для бейджиків та кнопок */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>

            {/* Бейджики */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={s.badge(group.current_size < group.target_size)}>
                {group.current_size} / {group.target_size}
              </span>
              <span style={s.statusBadge(group.is_active_search)}>
                {group.is_active_search ? 'Активна' : 'Прихована'}
              </span>
            </div>

            {/* Кнопки керування */}
            {/* Кнопки керування */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              
              {group.am_i_creator ? (
                <>
                  <button
                    className="btn"
                    style={{ fontSize: '12px' }}
                    onClick={() => {
                      api.put(`/groups/me`, { ...group, is_active_search: !group.is_active_search })
                        .then(fetchGroup)
                        .catch(() => {})
                    }}
                  >
                    {group.is_active_search ? 'Приховати з пошуку' : 'Повернути в пошук'}
                  </button>

                  {!confirmDelete ? (
                    <button
                      className="btn"
                      style={{ fontSize: '12px', color: '#C0392B', borderColor: '#C0392B' }}
                      onClick={() => setConfirmDelete(true)}
                    >
                      Видалити групу
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Впевнені?</span>
                      <button className="btn" style={{ fontSize: '12px', background: '#C0392B', color: '#fff', borderColor: '#C0392B' }} onClick={handleDelete}>Так</button>
                      <button className="btn" style={{ fontSize: '12px' }} onClick={() => setConfirmDelete(false)}>Ні</button>
                    </div>
                  )}
                </>
              ) : (
                <button
                  className="btn"
                  style={{ fontSize: '12px', color: '#C0392B', borderColor: '#C0392B' }}
                  onClick={async () => {
                    if (window.confirm("Ви дійсно хочете покинути цю групу?")) {
                      try {
                        await api.post('/groups/me/leave');
                        setGroup(null); // Скидаємо стейт, щоб показати екран "Створити групу"
                      } catch (e) {
                        setError('Не вдалося покинути групу');
                      }
                    }
                  }}
                >
                  🚪 Покинути групу
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Учасники */}
        <div style={s.membersGrid}>
          {group.members.map(m => (
            <div key={m.user_id} style={s.memberCard}>
              <div style={s.memberAvatar}>{m.name?.[0] || '?'}</div>
              <div style={s.memberName}>{m.name}, {m.age}</div>
              <div style={s.memberSub}>
                {m.schedule === 'early_bird' ? '🌅 Жайворонок' :
                  m.schedule === 'night_owl' ? '🦉 Сова' : ''}
              </div>
              {m.is_creator && <div style={s.creatorTag}>засновник</div>}
            </div>
          ))}

          {/* Порожні слоти */}
          {Array.from({ length: group.target_size - group.current_size }).map((_, i) => (
            <div key={i} style={s.emptySlot}>
              <div style={s.emptySlotIcon}>+</div>
              <div style={s.emptySlotText}>Вільне місце</div>
            </div>
          ))}
        </div>
      </div>

      {group.current_size < group.target_size && (
        <div style={s.card}>
          <div style={s.cardTitle}>Запросити з контактів</div>
          {contacts.length === 0 ? (
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Немає доступних контактів. Спочатку обміняйся контактами з кимось у пошуку.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {contacts
                .filter(c => !group.members.find(m => m.user_id === c.user_id))
                .map(c => (
                  <div key={c.user_id} style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', padding: '10px 12px',
                    background: 'var(--bg)', borderRadius: '8px',
                    border: '1px solid var(--border)',
                  }}>
                    <div>
                      <div style={{ fontWeight: '500', fontSize: '13px' }}>{c.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {c.contact_info}
                      </div>
                    </div>
                    <button className="btn btn-primary"
                      style={{ fontSize: '12px', padding: '5px 12px' }}
                      onClick={() => handleInvite(c.user_id)}>
                      Додати
                    </button>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      )}

      {/* Вхідні запити на вступ */}
      {group.pending_requests?.length > 0 && (
        <div style={s.card}>
          <div style={s.cardTitle}>
            Запити на вступ
            <span style={{ ...s.badge(true), marginLeft: '8px' }}>
              {group.pending_requests.length}
            </span>
          </div>

          {group.pending_requests.map(req => (
            <div key={req.request_id} style={s.requestCard}>
              <div style={s.requestTop}>
                <div style={s.memberAvatar}>{req.name?.[0] || '?'}</div>
                <div style={{ flex: 1 }}>
                  <div style={s.memberName}>{req.name}, {req.age}</div>
                  <div style={s.memberSub}>Запитує про вступ до групи</div>
                  <button
                    className="btn"
                    style={{ fontSize: '11px', padding: '3px 10px', marginTop: '5px' }}
                    onClick={() => handleViewProfile(req.user_id)}
                    disabled={profileLoading}
                  >
                    Переглянути анкету →
                  </button>
                </div>
                <div style={s.compatCircle(req.compatibility)}>
                  {req.compatibility}%
                </div>
              </div>

              {/* Розбивка по учасниках */}
              <div style={s.breakdownList}>
                {req.breakdown_per_member?.map(b => (
                  <div key={b.user_id} style={s.breakdownRow}>
                    <span style={s.breakdownName}>з {b.name}</span>
                    <div style={s.barBg}>
                      <div style={s.barFill(b.compatibility)} />
                    </div>
                    <span style={s.barVal}>{b.compatibility}%</span>
                  </div>
                ))}
              </div>

              <div style={s.requestBtns}>
                <button className="btn" style={{ fontSize: '12px' }}
                  onClick={() => handleRespond(req.request_id, false)}>
                  Відхилити
                </button>
                <button className="btn btn-primary" style={{ fontSize: '12px' }}
                  onClick={() => handleRespond(req.request_id, true)}>
                  Прийняти до групи
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {viewProfile && (
        <ProfileModal
          profile={viewProfile}
          onClose={() => setViewProfile(null)}
          zIndex={200}
        />
      )}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--color-text-secondary, #7A7090)' }}>{label}</label>
      {children}
    </div>
  )
}

const s = {
  empty: { color: 'var(--text-secondary)', padding: '2rem 0' },
  emptyState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '10px', padding: '3rem 0', textAlign: 'center',
  },
  emptyIcon: { fontSize: '40px' },
  emptyText: { fontSize: '16px', fontWeight: '500' },
  emptySub: { fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '300px' },
  createBtn: { padding: '10px 24px', fontSize: '14px', marginTop: '8px' },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  cardHead: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', gap: '12px',
  },
  cardTitle: {
    fontFamily: 'DM Serif Display, serif',
    fontSize: '18px', fontWeight: 400,
    display: 'flex', alignItems: 'center', gap: '8px',
  },
  cardSub: { fontSize: '13px', color: 'var(--text-secondary)', marginTop: '3px' },
  badge: (active) => ({
    background: active ? '#EDE8F8' : 'var(--bg)',
    color: active ? '#534AB7' : 'var(--text-secondary)',
    fontSize: '12px', fontWeight: '500',
    padding: '3px 10px', borderRadius: '20px',
    border: '1px solid var(--border)',
  }),
  statusBadge: (active) => ({
    background: active ? '#EAF3DE' : 'var(--bg)',
    color: active ? '#3B6D11' : 'var(--text-secondary)',
    fontSize: '11px', fontWeight: '500',
    padding: '3px 10px', borderRadius: '20px',
  }),
  membersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
  },
  memberCard: {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '1rem',
    textAlign: 'center',
    position: 'relative',
  },
  memberAvatar: {
    width: '42px', height: '42px', borderRadius: '50%',
    background: '#EDE8F8', color: '#534AB7',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'DM Serif Display, serif', fontSize: '18px',
    margin: '0 auto 8px',
  },
  memberName: { fontSize: '13px', fontWeight: '500' },
  memberSub: { fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' },
  creatorTag: {
    position: 'absolute', top: '8px', right: '8px',
    fontSize: '10px', background: '#EDE8F8', color: '#534AB7',
    padding: '2px 6px', borderRadius: '20px',
  },
  emptySlot: {
    background: 'var(--bg)',
    border: '1px dashed var(--border)',
    borderRadius: '10px',
    padding: '1rem',
    textAlign: 'center',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: '6px', minHeight: '100px',
  },
  emptySlotIcon: {
    width: '32px', height: '32px', borderRadius: '50%',
    background: 'var(--border)', color: 'var(--text-secondary)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '20px',
  },
  emptySlotText: { fontSize: '12px', color: 'var(--text-secondary)' },
  requestCard: {
    background: 'var(--bg)', border: '1px solid var(--border)',
    borderRadius: '10px', padding: '1rem',
    display: 'flex', flexDirection: 'column', gap: '10px',
  },
  requestTop: { display: 'flex', alignItems: 'center', gap: '10px' },
  compatCircle: (val) => ({
    width: '48px', height: '48px', borderRadius: '50%',
    background: val >= 75 ? '#EAF3DE' : val >= 55 ? '#FAEEDA' : '#FCEBEB',
    color: val >= 75 ? '#3B6D11' : val >= 55 ? '#854F0B' : '#A32D2D',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '12px', fontWeight: '600', flexShrink: 0,
  }),
  breakdownList: { display: 'flex', flexDirection: 'column', gap: '6px' },
  breakdownRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  breakdownName: { fontSize: '12px', color: 'var(--text-secondary)', width: '80px', flexShrink: 0 },
  barBg: { flex: 1, height: '5px', background: 'var(--border)', borderRadius: '10px', overflow: 'hidden' },
  barFill: (val) => ({
    height: '100%', borderRadius: '10px',
    width: `${val}%`,
    background: val >= 75 ? '#639922' : val >= 55 ? '#BA7517' : '#E24B4A',
    transition: 'width 0.4s ease',
  }),
  barVal: { fontSize: '12px', fontWeight: '500', width: '32px', textAlign: 'right' },
  requestBtns: { display: 'flex', gap: '8px', justifyContent: 'flex-end' },
  fields: { display: 'flex', flexDirection: 'column', gap: '12px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  input: {
    padding: '9px 13px', borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--bg)', color: 'var(--text)',
    fontSize: '14px', fontFamily: 'Manrope, sans-serif',
    width: '100%',
  },
  formBtns: { display: 'flex', gap: '8px', justifyContent: 'flex-end' },
  errorMsg: { background: '#FEE8E8', color: '#C0392B', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' },
  successMsg: { background: '#EAF3DE', color: '#3B6D11', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' },
}