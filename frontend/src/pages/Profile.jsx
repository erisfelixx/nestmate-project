import { useState, useEffect } from 'react'
import GroupTab from '../components/GroupTab'
import api from '../api/axios'
import { User, Home, Coffee, ChevronRight, ChevronLeft, Save, Inbox, Users } from 'lucide-react'


const CITIES = [
  'Київ', 'Львів', 'Харків', 'Одеса', 'Дніпро', 'Запоріжжя',
  'Вінниця', 'Полтава', 'Чернігів', 'Херсон', 'Житомир', 'Суми',
  'Хмельницький', 'Черкаси', 'Івано-Франківськ', 'Тернопіль',
  'Луцьк', 'Рівне', 'Ужгород', 'Кропивницький', 'Миколаїв',
  'Маріуполь', 'Кривий Ріг', 'Чернівці',
]

const SCALE_LABELS = {
  1: 'Дуже низький',
  2: 'Низький',
  3: 'Нижче середнього',
  4: 'Середній',
  5: 'Вище середнього',
  6: 'Високий',
  7: 'Дуже високий',
}

export default function Profile() {
  const [tab, setTab] = useState('profile')

  const [form, setForm] = useState({
    name: '', age: '', gender: '', city: '', bio: '',
    interests: '', contact_info: '', role: '',
    budget_min: '', budget_max: '', move_in_date: '',
    schedule: '', cleanliness: 4, noise_level: 4,
    guests_frequency: 4, has_pets: false, ok_with_pets: true,
    smoking: false, ok_with_smoking: false, is_active_search: false,
  })
  const [isNew, setIsNew] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const totalSteps = 3

  useEffect(() => {
    api.get('/profiles/me')
      .then(res => {
        setForm({ ...res.data, age: res.data.age || '', })
        setIsNew(false)
      })
      .catch(() => setIsNew(true))
      .finally(() => setLoading(false))
  }, [])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      const payload = {
        ...form,
        age: form.age ? parseInt(form.age) : null,
        budget_min: form.budget_min ? parseInt(form.budget_min) : null,
        budget_max: form.budget_max ? parseInt(form.budget_max) : null,
        move_in_date: form.move_in_date || null,
      }
      if (isNew) {
        await api.post('/profiles/', payload)
        setIsNew(false)
      } else {
        await api.put('/profiles/me', payload)
      }
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) {
      setError(e.response?.data?.detail || 'Помилка збереження')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="loading">Завантаження профілю...</div>

  return (
    <div style={styles.root}>
      <div style={styles.container}>

        {/* Заголовок */}
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Мій профіль</h1>
          <div style={styles.activeToggle}>
            <span style={styles.activeLabel}>
              {form.is_active_search ? '🟢 Анкета активна' : '⚪ Анкета прихована'}
            </span>
            <button
              style={styles.toggleBtn(form.is_active_search)}
              onClick={() => set('is_active_search', !form.is_active_search)}
            >
              {form.is_active_search ? 'Вимкнути' : 'Активувати пошук'}
            </button>
          </div>
        </div>

        <div style={styles.tabs}>
          {[
            { key: 'profile', label: '👤 Мій профіль' },
            { key: 'requests', label: '📩 Вхідні запити' },
            { key: 'contacts', label: '✅ Контакти' },
            { key: 'group', label: '👥 Моя група' },
          ].map(t => (
            <button
              key={t.key}
              style={styles.tab(tab === t.key)}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <>
            {/* ПРОГРЕС-БАР */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '500' }}>
                <span>Крок {step} з {totalSteps}</span>
                <span>{step === 1 ? 'Базові дані' : step === 2 ? 'Житло' : 'Звички'}</span>
              </div>
              <div className="progress-bg">
                <div className="progress-fill" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
              </div>
            </div>

            <div style={styles.formCard}>
              
              {/* КРОК 1: Базові дані */}
              {step === 1 && (
                <div className="step-container">
                  <h3 style={styles.stepTitle}><User size={18} /> Базові дані</h3>
                  
                  <div style={styles.grid2}>
                    <Field label="Ім'я">
                      <input
                        style={styles.input}
                        placeholder="Як тебе звати?"
                        value={form.name}
                        onChange={e => set('name', e.target.value)}
                      />
                    </Field>
                    <Field label="Фото (URL посилання)">
                      <input
                        style={styles.input}
                        placeholder="https://i.imgur.com/yourphoto.jpg"
                        value={form.photo_url || ''}
                        onChange={e => set('photo_url', e.target.value)}
                      />
                      {form.photo_url && (
                        <img
                          src={form.photo_url}
                          alt="Фото профілю"
                          style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginTop: '8px' }}
                          onError={e => e.target.style.display = 'none'}
                        />
                      )}
                    </Field>
                  </div>

                  <div style={styles.grid2}>
                    <Field label="Вік">
                      <input
                        style={styles.input}
                        type="number"
                        placeholder="23"
                        value={form.age}
                        onChange={e => set('age', e.target.value)}
                      />
                    </Field>
                    <Field label="Стать">
                      <select
                        style={styles.input}
                        value={form.gender}
                        onChange={e => set('gender', e.target.value)}
                      >
                        <option value="">Оберіть...</option>
                        <option value="female">Жінка</option>
                        <option value="male">Чоловік</option>
                        <option value="other">Інше</option>
                      </select>
                    </Field>
                  </div>

                  <Field label="Місто">
                    <select
                      style={styles.input}
                      value={form.city}
                      onChange={e => set('city', e.target.value)}
                    >
                      <option value="">Оберіть місто...</option>
                      {CITIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Про себе">
                    <textarea
                      style={styles.textarea}
                      placeholder="Розкажи коротко про себе..."
                      value={form.bio}
                      onChange={e => set('bio', e.target.value)}
                      rows={3}
                    />
                  </Field>

                  <Field label="Інтереси та хобі" hint="Не впливає на сумісність">
                    <textarea
                      style={styles.textarea}
                      placeholder="Граю на гітарі, люблю каву, дивлюся серіали..."
                      value={form.interests}
                      onChange={e => set('interests', e.target.value)}
                      rows={2}
                    />
                  </Field>

                  <Field label="Контакти для зв'язку" hint="Буде розблоковано після взаємного підтвердження">
                    <input
                      style={styles.input}
                      placeholder="Telegram: @username / тел: +380..."
                      value={form.contact_info}
                      onChange={e => set('contact_info', e.target.value)}
                    />
                  </Field>
                </div>
              )}

              {/* КРОК 2: Житло */}
              {step === 2 && (
                <div className="step-container">
                  <h3 style={styles.stepTitle}><Home size={18} /> Житло та умови</h3>
                  
                  <Field label="Роль">
                    <div style={styles.radioGroup}>
                      {[
                        { val: 'looking', label: '🔍 Шукаю кімнату' },
                        { val: 'hosting', label: '🏠 Здаю кімнату' },
                      ].map(opt => (
                        <button
                          key={opt.val}
                          style={styles.radioBtn(form.role === opt.val)}
                          onClick={() => set('role', opt.val)}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </Field>

                  {form.role === 'hosting' && (
                    <>
                      <Field label="Поверх">
                        <input
                          style={styles.input}
                          type="number"
                          placeholder="3"
                          value={form.floor || ''}
                          onChange={e => set('floor', e.target.value ? parseInt(e.target.value) : null)}
                        />
                      </Field>

                      <Field label="Інфраструктура будинку">
                        <div style={styles.checkGrid}>
                          <CheckCard
                            label="Газова плита"
                            emoji="🔥"
                            checked={form.has_gas_appliances}
                            onChange={v => set('has_gas_appliances', v)}
                          />
                          <CheckCard
                            label="Є укриття"
                            emoji="🛡️"
                            checked={form.has_shelter}
                            onChange={v => set('has_shelter', v)}
                          />
                        </div>
                      </Field>

                      {form.has_shelter && (
                        <Field label="Тип укриття">
                          <div style={styles.radioGroup}>
                            {[
                              { val: 'basement', label: '🏚️ Підвал' },
                              { val: 'parking', label: '🚗 Паркінг' },
                              { val: 'both', label: '✅ Обидва' },
                            ].map(opt => (
                              <button
                                key={opt.val}
                                style={styles.radioBtn(form.shelter_type === opt.val)}
                                onClick={() => set('shelter_type', opt.val)}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </Field>
                      )}
                    </>
                  )}

                  <div style={styles.grid2}>
                    <Field label="Бюджет від (грн/міс)">
                      <input
                        style={styles.input}
                        type="number"
                        placeholder="4000"
                        value={form.budget_min}
                        onChange={e => set('budget_min', e.target.value)}
                      />
                    </Field>
                    <Field label="Бюджет до (грн/міс)">
                      <input
                        style={styles.input}
                        type="number"
                        placeholder="10000"
                        value={form.budget_max}
                        onChange={e => set('budget_max', e.target.value)}
                      />
                    </Field>
                  </div>

                  <Field label="Бажана дата заселення">
                    <input
                      style={styles.input}
                      type="date"
                      value={form.move_in_date || ''}
                      onChange={e => set('move_in_date', e.target.value)}
                    />
                  </Field>
                </div>
              )}

              {/* КРОК 3: Звички */}
              {step === 3 && (
                <div className="step-container">
                  <h3 style={styles.stepTitle}><Coffee size={18} /> Звички та ритм життя</h3>
                  
                  <Field label="Режим дня">
                    <div style={styles.radioGroup}>
                      {[
                        { val: 'early_bird', label: '🌅 Жайворонок' },
                        { val: 'night_owl', label: '🦉 Сова' },
                      ].map(opt => (
                        <button
                          key={opt.val}
                          style={styles.radioBtn(form.schedule === opt.val)}
                          onClick={() => set('schedule', opt.val)}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </Field>

                  <ScaleField
                    label="Рівень чистоти"
                    hint="1 — не звертаю уваги, 7 — дуже важлива чистота"
                    value={form.cleanliness}
                    onChange={v => set('cleanliness', v)}
                  />

                  <ScaleField
                    label="Рівень шуму"
                    hint="1 — повна тиша, 7 — музика та шум — норма"
                    value={form.noise_level}
                    onChange={v => set('noise_level', v)}
                  />

                  <ScaleField
                    label="Частота гостей"
                    hint="1 — ніколи, 7 — гості майже щодня"
                    value={form.guests_frequency}
                    onChange={v => set('guests_frequency', v)}
                  />

                  <div style={styles.checkGrid}>
                    <CheckCard label="Маю тварин" emoji="🐾" checked={form.has_pets} onChange={v => set('has_pets', v)} />
                    <CheckCard label="Ок з тваринами" emoji="💚" checked={form.ok_with_pets} onChange={v => set('ok_with_pets', v)} />
                    <CheckCard label="Курю" emoji="🚬" checked={form.smoking} onChange={v => set('smoking', v)} />
                    <CheckCard label="Ок з курінням" emoji="🪟" checked={form.ok_with_smoking} onChange={v => set('ok_with_smoking', v)} />
                    <CheckCard label="Є діти" emoji="👶" checked={form.has_children} onChange={v => set('has_children', v)} />
                    <CheckCard label="Ок з дітьми" emoji="🧸" checked={form.ok_with_children} onChange={v => set('ok_with_children', v)} />
                  </div>
                </div>
              )}

              {/* Повідомлення */}
              {error && <div style={styles.errorMsg} style={{ marginTop: '14px' }}>{error}</div>}
              {success && <div style={styles.successMsg} style={{ marginTop: '14px' }}>✅ Профіль збережено!</div>}

              {/* КНОПКИ НАВІГАЦІЇ СТЕПЕРА */}
              <div style={styles.stepperButtons}>
                <button 
                  className="btn" 
                  onClick={() => setStep(step - 1)} 
                  disabled={step === 1}
                  style={{ visibility: step === 1 ? 'hidden' : 'visible', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <ChevronLeft size={16} /> Назад
                </button>

                {step < totalSteps ? (
                  <button 
                    className="btn btn-primary" 
                    onClick={() => setStep(step + 1)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    Далі <ChevronRight size={16} />
                  </button>
                ) : (
                  <button 
                    className="btn btn-primary" 
                    onClick={handleSave}
                    disabled={saving}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#3B6D11', borderColor: '#3B6D11' }}
                  >
                    <Save size={16} /> {saving ? 'Збереження...' : (isNew ? 'Створити профіль' : 'Зберегти зміни')}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
        {tab === 'requests' && <RequestsTab />}
        {tab === 'contacts' && <ContactsTab />}
        {tab === 'group' && <GroupTab />}
      </div>
    </div>
  )
}

// ── Допоміжні компоненти ──────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      <div style={styles.sectionBody}>{children}</div>
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div style={styles.field}>
      <div style={styles.fieldLabelRow}>
        <label style={styles.label}>{label}</label>
        {hint && <span style={styles.hint}>{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function ScaleField({ label, hint, value, onChange }) {
  return (
    <Field label={label} hint={hint}>
      <div style={styles.scaleRow}>
        {[1, 2, 3, 4, 5, 6, 7].map(n => (
          <button
            key={n}
            style={styles.scaleBtn(value === n)}
            onClick={() => onChange(n)}
          >
            {n}
          </button>
        ))}
      </div>
      <div style={styles.scaleCaption}>
        {value ? `${value}/7 — ${SCALE_LABELS[value]}` : 'Оберіть значення'}
      </div>
    </Field>
  )
}

function CheckCard({ label, emoji, checked, onChange }) {
  return (
    <button
      style={styles.checkCard(checked)}
      onClick={() => onChange(!checked)}
    >
      <span style={styles.checkEmoji}>{emoji}</span>
      <span style={styles.checkLabel}>{label}</span>
      <span style={styles.checkMark}>{checked ? '✓' : ''}</span>
    </button>
  )
}

function RequestsTab() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/contacts/incoming')
      .then(res => setRequests(res.data))
      .catch(err => console.log('Помилка завантаження запитів:', err.response?.data))
      .finally(() => setLoading(false))
  }, [])

  const respond = async (id, accept) => {
    await api.post(`/contacts/request/${id}/${accept ? 'accept' : 'decline'}`)
    setRequests(r => r.filter(req => req.request_id !== id))
  }

  if (loading) return <div style={{ color: 'var(--text-secondary)', padding: '2rem 0', textAlign: 'center' }}>Завантаження...</div>
  
  if (!requests.length) return (
    <div style={emptyStyle.container}>
      <div style={emptyStyle.iconWrapper}><Inbox size={42} strokeWidth={1.5} /></div>
      <h3 style={emptyStyle.title}>Тут поки тихо</h3>
      <p style={emptyStyle.subtitle}>У тебе ще немає нових запитів на сусідство.</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '1rem' }}>
      {requests.map(r => (
        <div key={r.request_id} style={requestCardStyle}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div style={{
              width: '46px', height: '46px', borderRadius: '50%',
              background: 'var(--accent-secondary)', color: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'DM Serif Display, serif', fontSize: '20px', flexShrink: 0,
            }}>
              {r.name?.[0] || '?'}
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '15px' }}>
                {r.name || 'Без імені'}, {r.age}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {r.city} · {r.schedule === 'early_bird' ? '🌅 Жайворонок' : r.schedule === 'night_owl' ? '🦉 Сова' : 'Без режиму'}
              </div>
              {r.bio && (
                <div style={{ fontSize: '13px', color: 'var(--text)', marginTop: '8px', lineHeight: 1.5 }}>
                  {r.bio.slice(0, 90)}{r.bio.length > 90 ? '...' : ''}
                </div>
              )}
            </div>
          </div>
          
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Надіслано: {new Date(r.created_at).toLocaleDateString('uk-UA')}
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn" 
              style={{ flex: 1, fontSize: '14px', padding: '10px', minHeight: '44px' }}
              onClick={() => respond(r.request_id, false)}>
              Відхилити
            </button>
            <button 
              className="btn btn-primary" 
              style={{ flex: 1, fontSize: '14px', padding: '10px', minHeight: '44px' }}
              onClick={() => respond(r.request_id, true)}>
              Прийняти
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function ContactsTab() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/contacts/accepted')
      .then(res => setContacts(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ color: 'var(--text-secondary)', padding: '2rem 0', textAlign: 'center' }}>Завантаження...</div>
  
  if (!contacts.length) return (
    <div style={emptyStyle.container}>
      <div style={emptyStyle.iconWrapper}><Users size={42} strokeWidth={1.5} /></div>
      <h3 style={emptyStyle.title}>Немає контактів</h3>
      <p style={emptyStyle.subtitle}>Приймай вхідні запити або надсилай свої, щоб обмінюватися контактами з іншими.</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '1rem' }}>
      {contacts.map(c => (
        <div key={c.request_id} style={requestCardStyle}>
          <div>
            <div style={{ fontWeight: '600', fontSize: '15px' }}>{c.name || `Користувач #${c.user_id}`}</div>
            <div style={{ 
              fontSize: '14px', 
              color: 'var(--accent)', 
              marginTop: '6px', 
              background: 'var(--accent-secondary)', 
              display: 'inline-block', 
              padding: '6px 12px', 
              borderRadius: '8px',
              fontWeight: '500'
            }}>
              📞 {c.contact_info || 'Контакт не вказано'}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const emptyStyle = {
  container: {
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px', 
    padding: '4rem 1.5rem', 
    textAlign: 'center',
    background: 'var(--surface)',
    border: '1px dashed var(--border)',
    borderRadius: '12px',
    marginTop: '1rem'
  },
  iconWrapper: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: 'var(--accent-secondary)',
    color: 'var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '10px'
  },
  title: {
    fontFamily: 'DM Serif Display, serif',
    fontSize: '20px',
    color: 'var(--text)',
    margin: 0
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    margin: 0,
    maxWidth: '280px',
    lineHeight: 1.5
  }
}

const requestCardStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '1.25rem',
  boxShadow: 'var(--shadow)',
  transition: 'transform 0.2s'
}

// ── Стилі ─────────────────────────────────────────────────────────

const styles = {
  root: {
    background: 'var(--bg)',
    minHeight: '100vh',
    padding: '2rem 1.25rem 4rem',
  },
  container: {
    maxWidth: '680px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  pageTitle: {
    fontFamily: 'DM Serif Display, serif',
    fontSize: '32px',
    fontWeight: 400,
    letterSpacing: '-0.5px',
  },
  activeToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  activeLabel: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  toggleBtn: (active) => ({
    padding: '7px 14px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: active ? 'var(--accent-secondary)' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--text-secondary)',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'Manrope, sans-serif',
  }),

  section: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    overflow: 'hidden',
  },
  sectionTitle: {
    fontFamily: 'DM Serif Display, serif',
    fontSize: '18px',
    fontWeight: 400,
    padding: '1.1rem 1.5rem',
    borderBottom: '1px solid var(--border)',
  },
  sectionBody: {
    padding: '1.25rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },

  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  fieldLabelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--text-secondary)',
  },
  hint: {
    fontSize: '11px',
    color: 'var(--accent)',
    background: 'var(--accent-secondary)',
    padding: '2px 8px',
    borderRadius: '20px',
  },
  input: {
    padding: '9px 13px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    color: 'var(--text)',
    fontSize: '14px',
    fontFamily: 'Manrope, sans-serif',
    outline: 'none',
    width: '100%',
  },
  textarea: {
    padding: '9px 13px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    color: 'var(--text)',
    fontSize: '14px',
    fontFamily: 'Manrope, sans-serif',
    outline: 'none',
    width: '100%',
    resize: 'vertical',
  },

  radioGroup: {
    display: 'flex',
    gap: '8px',
  },
  radioBtn: (active) => ({
    padding: '8px 18px',
    borderRadius: '8px',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    background: active ? 'var(--accent-secondary)' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--text-secondary)',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'Manrope, sans-serif',
    transition: 'all 0.15s',
  }),

  scaleRow: {
    display: 'flex',
    gap: '6px',
  },
  scaleBtn: (active) => ({
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    background: active ? 'var(--accent)' : 'transparent',
    color: active ? '#fff' : 'var(--text-secondary)',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'Manrope, sans-serif',
    transition: 'all 0.15s',
  }),
  scaleCaption: {
    fontSize: '12px',
    color: 'var(--accent)',
    marginTop: '4px',
  },

  checkGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  },
  checkCard: (checked) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    borderRadius: '10px',
    border: `1px solid ${checked ? 'var(--accent)' : 'var(--border)'}`,
    background: checked ? 'var(--accent-secondary)' : 'transparent',
    cursor: 'pointer',
    fontFamily: 'Manrope, sans-serif',
    textAlign: 'left',
    transition: 'all 0.15s',
  }),
  checkEmoji: { fontSize: '18px' },
  checkLabel: {
    fontSize: '13px',
    color: 'var(--text)',
    flex: 1,
  },
  checkMark: {
    fontSize: '14px',
    color: 'var(--accent)',
    fontWeight: '700',
    width: '16px',
  },

  errorMsg: {
    background: '#FEE8E8',
    color: '#C0392B',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '13px',
  },
  successMsg: {
    background: '#EAF3DE',
    color: '#3B6D11',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '13px',
  },
  saveBtn: {
    width: '100%',
    padding: '13px',
    fontSize: '15px',
    fontWeight: '600',
    borderRadius: '10px',
  },

  tabs: {
    display: 'flex',
    gap: '6px',
    borderBottom: '1px solid var(--border)',
    marginBottom: '1.5rem',
  },
  tab: (active) => ({
    padding: '8px 18px',
    border: 'none',
    borderBottom: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
    background: 'transparent',
    color: active ? 'var(--accent)' : 'var(--text-secondary)',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'Manrope, sans-serif',
    marginBottom: '-1px',
  }),
  
  formCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: 'var(--shadow)',
  },
  stepTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: 'DM Serif Display, serif',
    fontSize: '20px',
    marginBottom: '1.5rem',
    color: 'var(--text)',
    borderBottom: '1px solid var(--border)',
    paddingBottom: '10px',
  },
  stepperButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '2rem',
    paddingTop: '1rem',
    borderTop: '1px solid var(--border)',
  },
}