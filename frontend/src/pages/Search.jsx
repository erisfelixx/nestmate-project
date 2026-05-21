import { useState, useEffect } from 'react'
import api from '../api/axios'
import ProfileModal from '../components/ProfileModal'
import GroupModal from '../components/GroupModal'
import { Search as SearchIcon, User, Users, SlidersHorizontal, X } from 'lucide-react'

const CITIES = [
  'Всі міста', 'Київ', 'Львів', 'Харків', 'Одеса', 'Дніпро',
  'Запоріжжя', 'Вінниця', 'Полтава', 'Чернігів', 'Житомир',
  'Хмельницький', 'Черкаси', 'Івано-Франківськ', 'Тернопіль',
  'Луцьк', 'Рівне', 'Ужгород', 'Кропивницький', 'Чернівці',
]

const DEFAULT_FILTERS = {
  city: 'Всі міста',
  gender: '',
  role: '',
  schedule: '',
  budget_max: '',
  ok_with_pets: false,
  ok_with_smoking: false,
  has_gas_appliances: false,
  has_shelter: false,
}

export default function Search() {
  const [matches, setMatches] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [sortBy, setSortBy] = useState('compatibility')
  
  const [activeTab, setActiveTab] = useState('individuals') // 'individuals' або 'groups'
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false) // Стан для мобільної шторки

  const [selected, setSelected] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState(null)

  useEffect(() => {
    fetchMatches()
    fetchGroups()
  }, [])

  const fetchMatches = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/matches/')
      setMatches(res.data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Помилка завантаження')
    } finally {
      setLoading(false)
    }
  }

  const fetchGroups = async () => {
    try {
      const res = await api.get('/groups/')
      setGroups(res.data)
    } catch (e) {
      console.log('Помилка груп:', e.response?.data)
      setGroups([])
    }
  }

  const setFilter = (key, val) =>
    setFilters(f => ({ ...f, [key]: val }))

  const filteredMatches = matches
    .filter(m => {
      if (filters.city !== 'Всі міста' && m.city !== filters.city) return false
      if (filters.gender && m.gender !== filters.gender) return false
      if (filters.role && m.role !== filters.role) return false
      if (filters.schedule && m.schedule !== filters.schedule) return false
      if (filters.budget_max && m.budget_max > parseInt(filters.budget_max)) return false
      if (filters.ok_with_pets && !m.ok_with_pets) return false
      if (filters.ok_with_smoking && !m.ok_with_smoking) return false
      if (filters.has_gas_appliances && !m.has_gas_appliances) return false
      if (filters.has_shelter && !m.has_shelter) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'compatibility') return b.compatibility - a.compatibility
      if (sortBy === 'budget_asc') return (a.budget_max || 0) - (b.budget_max || 0)
      if (sortBy === 'budget_desc') return (b.budget_max || 0) - (a.budget_max || 0)
      return 0
    })

  const filteredGroups = groups
    .filter(g => {
      if (filters.city !== 'Всі міста' && g.city !== filters.city) return false
      if (filters.budget_max && g.budget_max > parseInt(filters.budget_max)) return false
      if (filters.role === 'hosting') return false 
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'compatibility') return (b.compatibility || 0) - (a.compatibility || 0)
      if (sortBy === 'budget_asc') return (a.budget_max || 0) - (b.budget_max || 0)
      if (sortBy === 'budget_desc') return (b.budget_max || 0) - (a.budget_max || 0)
      return 0
    })

  const activeData = activeTab === 'individuals' ? filteredMatches : filteredGroups

  return (
    <div style={styles.root}>
      {/* Затемнення фону при відкритій шторці */}
      {isMobileFiltersOpen && (
        <div className="sidebar-backdrop" onClick={() => setIsMobileFiltersOpen(false)} />
      )}

      <div className="search-layout">

        {/* САЙДБАР — фільтри */}
        <aside className={`search-sidebar ${isMobileFiltersOpen ? 'open' : ''}`} style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <div style={styles.sidebarTitle}>Фільтри</div>
            {/* Кнопка закриття (видно тільки на моб) */}
            <button 
              className="btn" 
              style={{ padding: '4px', border: 'none', display: 'flex' }}
              onClick={() => setIsMobileFiltersOpen(false)}
            >
              <X size={20} className="mobile-close-icon" />
            </button>
          </div>

          <FilterBlock label="Місто">
            <select
              style={styles.select}
              value={filters.city}
              onChange={e => setFilter('city', e.target.value)}
            >
              {CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </FilterBlock>

          <FilterBlock label="Бюджет до (грн)">
            <input
              style={styles.input}
              type="number"
              placeholder="Наприклад: 10000"
              value={filters.budget_max}
              onChange={e => setFilter('budget_max', e.target.value)}
            />
          </FilterBlock>

          {activeTab === 'individuals' && (
            <>
              <FilterBlock label="Роль">
                <FilterToggle
                  options={[
                    { val: '', label: 'Всі' },
                    { val: 'looking', label: '🔍 Шукає' },
                    { val: 'hosting', label: '🏠 Здає' },
                  ]}
                  value={filters.role}
                  onChange={v => setFilter('role', v)}
                />
              </FilterBlock>

              <FilterBlock label="Стать">
                <FilterToggle
                  options={[
                    { val: '', label: 'Будь-яка' },
                    { val: 'female', label: 'Жінка' },
                    { val: 'male', label: 'Чоловік' },
                  ]}
                  value={filters.gender}
                  onChange={v => setFilter('gender', v)}
                />
              </FilterBlock>

              <FilterBlock label="Режим дня">
                <FilterToggle
                  options={[
                    { val: '', label: 'Будь-який' },
                    { val: 'early_bird', label: '🌅 Жайворонок' },
                    { val: 'night_owl', label: '🦉 Сова' },
                  ]}
                  value={filters.schedule}
                  onChange={v => setFilter('schedule', v)}
                />
              </FilterBlock>

              <FilterBlock label="Додатково">
                <label style={styles.checkRow}>
                  <input
                    type="checkbox"
                    style={styles.checkbox}
                    checked={filters.ok_with_pets}
                    onChange={e => setFilter('ok_with_pets', e.target.checked)}
                  />
                  Можна з тваринами
                </label>
                <label style={styles.checkRow}>
                  <input
                    type="checkbox"
                    style={styles.checkbox}
                    checked={filters.ok_with_smoking}
                    onChange={e => setFilter('ok_with_smoking', e.target.checked)}
                  />
                  Дозволено курити
                </label>
              </FilterBlock>

              <FilterBlock label="Для орендодавця">
                <label style={styles.checkRow}>
                  <input type="checkbox" style={styles.checkbox}
                    checked={filters.has_gas_appliances}
                    onChange={e => setFilter('has_gas_appliances', e.target.checked)} />
                  Газове обладнання
                </label>
                <label style={styles.checkRow}>
                  <input type="checkbox" style={styles.checkbox}
                    checked={filters.has_shelter}
                    onChange={e => setFilter('has_shelter', e.target.checked)} />
                  Є укриття
                </label>
              </FilterBlock>
            </>
          )}

          <button
            className="btn"
            style={styles.resetBtn}
            onClick={() => {
              setFilters(DEFAULT_FILTERS);
              setIsMobileFiltersOpen(false);
            }}
          >
            Скинути фільтри
          </button>
        </aside>

        {/* ОСНОВНА ЧАСТИНА */}
        <main style={styles.main}>

          {/* Мобільна кнопка виклику фільтрів */}
          <button className="mobile-filter-btn" onClick={() => setIsMobileFiltersOpen(true)}>
            <SlidersHorizontal size={18} />
            Фільтри та сортування
          </button>

          {/* ВКЛАДКИ (Tabs) */}
          <div style={styles.tabsContainer}>
            <button
              style={styles.tab(activeTab === 'individuals')}
              onClick={() => setActiveTab('individuals')}
            >
              <User size={16} /> Шукаю людей
            </button>
            <button
              style={styles.tab(activeTab === 'groups')}
              onClick={() => setActiveTab('groups')}
            >
              <Users size={16} /> Шукаю групи
            </button>
          </div>

          {/* Шапка результатів */}
          <div style={styles.mainHeader}>
            <h1 style={styles.mainTitle}>
              {loading ? 'Шукаємо...' : `${activeData.length} результатів`}
              {filters.city !== 'Всі міста' && (
                <span style={styles.cityTag}> · {filters.city}</span>
              )}
            </h1>
            <select
              style={styles.sortSelect}
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="compatibility">За сумісністю</option>
              <option value="budget_asc">Бюджет: менший</option>
              <option value="budget_desc">Бюджет: більший</option>
            </select>
          </div>

          {/* Стан: помилка */}
          {error && (
            <div style={styles.errorBox}>
              {error === 'Спочатку створи профіль'
                ? 'Спочатку заповни свій профіль, щоб бачити анкети.'
                : error === 'Увімкни активний пошук у профілі'
                  ? 'Увімкни активний пошук у профілі, щоб бачити інших.'
                  : error}
            </div>
          )}

          {/* Стан: SKELETON LOADERS (Замість тексту завантаження) */}
          {loading && !error && (
            <div style={styles.grid}>
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Стан: порожньо */}
          {!loading && !error && activeData.length === 0 && (
            <div style={styles.emptyState}>
              <SearchIcon size={48} color="var(--border)" strokeWidth={1.5} />
              <p style={styles.emptyText}>За цими фільтрами нічого не знайдено</p>
              <button className="btn" onClick={() => setFilters(DEFAULT_FILTERS)}>
                Скинути фільтри
              </button>
            </div>
          )}

          {/* Картки */}
          {!loading && !error && (
            <div style={styles.grid}>
              {activeTab === 'individuals'
                ? activeData.map(match => (
                    <MatchCard
                      key={match.profile_id}
                      match={match}
                      onClick={() => setSelected(match)}
                    />
                  ))
                : activeData.map(group => (
                    <GroupCard
                      key={group.group_id}
                      group={group}
                      onClick={() => setSelectedGroup(group)}
                    />
                  ))
              }
            </div>
          )}
        </main>
      </div>

      {selected && (
        <ProfileModal
          profile={{
            user_id: selected.user_id,
            name: selected.name,
            age: selected.age,
            city: selected.city,
            compatibility: selected.compatibility,
            breakdown: selected.breakdown,
            ...selected,
          }}
          onClose={() => setSelected(null)}
        />
      )}

      {selectedGroup && (
        <GroupModal
          group={selectedGroup}
          onClose={() => setSelectedGroup(null)}
        />
      )}
    </div>
  )
}

// ── Допоміжні компоненти ─────────────────────────────────────────

// Скелетна картка завантаження
function SkeletonCard() {
  return (
    <div style={{ ...styles.card, borderColor: 'transparent', boxShadow: 'var(--shadow)' }}>
      <div className="skeleton-box" style={{ width: '40px', height: '18px', borderRadius: '20px', marginBottom: '10px' }} />
      <div style={styles.cardTop}>
        <div className="skeleton-box" style={{ width: '38px', height: '38px', borderRadius: '50%' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div className="skeleton-box" style={{ width: '60%', height: '14px' }} />
          <div className="skeleton-box" style={{ width: '40%', height: '10px' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
        <div className="skeleton-box" style={{ width: '50px', height: '16px', borderRadius: '20px' }} />
        <div className="skeleton-box" style={{ width: '70px', height: '16px', borderRadius: '20px' }} />
      </div>
      <div style={{ ...styles.cardFooter, borderTopColor: 'var(--bg)' }}>
        <div className="skeleton-box" style={{ width: '30%', height: '14px' }} />
        <div className="skeleton-box" style={{ width: '20%', height: '14px' }} />
      </div>
    </div>
  )
}

function MatchCard({ match, onClick }) {
  const compat = match.compatibility
  const compatStyle = compat >= 80
    ? { bg: '#EAF3DE', color: '#3B6D11' }
    : { bg: '#FEF3E2', color: '#854F0B' }

  const tags = [
    match.schedule === 'early_bird' ? '🌅 Жайворонок' : match.schedule === 'night_owl' ? '🦉 Сова' : null,
    match.cleanliness ? `🧹 Чистота ${match.cleanliness}/7` : null,
    match.has_pets ? '🐾 Є тварини' : null,
    match.smoking ? '🚬 Курить' : null,
    match.ok_with_pets ? '💚 З тваринами ок' : null,
  ].filter(Boolean).slice(0, 3)

  return (
    <div style={styles.card} onClick={onClick}>
      <div style={{ ...styles.compatBadge, background: compatStyle.bg, color: compatStyle.color }}>
        {compat}%
      </div>
      <div style={styles.cardTop}>
        {match.photo_url
          ? <img src={match.photo_url} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} alt="Avatar" />
          : <div style={styles.cardAvatar}>{match.name?.[0] || '?'}</div>
        }
        <div>
          <div style={styles.cardName}>{match.name}, {match.age}</div>
          <div style={styles.cardCity}>
            {match.city} · {match.role === 'looking' ? 'шукає' : 'здає'}
          </div>
        </div>
      </div>
      <div style={styles.pills}>
        {tags.map(t => <span key={t} style={styles.pill}>{t}</span>)}
      </div>
      <div style={styles.cardFooter}>
        <span style={styles.budget}>
          до <strong>{match.budget_max ? `${match.budget_max} ₴` : '—'}</strong>
        </span>
        <span style={styles.viewHint}>Відкрити →</span>
      </div>
    </div>
  )
}

function FilterBlock({ label, children }) {
  return (
    <div style={styles.filterBlock}>
      <div style={styles.filterLabel}>{label}</div>
      {children}
    </div>
  )
}

function FilterToggle({ options, value, onChange }) {
  return (
    <div style={styles.toggleGroup}>
      {options.map(o => (
        <button
          key={o.val}
          style={styles.toggleBtn(value === o.val)}
          onClick={() => onChange(o.val)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function GroupCard({ group, onClick }) {
  const compat = group.compatibility
  const compatStyle = compat >= 75
    ? { bg: '#EAF3DE', color: '#3B6D11' }
    : { bg: '#FAEEDA', color: '#854F0B' }

  return (
    <div
      style={{ ...styles.card, borderLeft: '3px solid #7C5CBF' }}
      onClick={onClick}
    >
      <div style={{ ...styles.compatBadge, background: '#EDE8F8', color: '#534AB7' }}>
        👥 Група
      </div>
      <div style={{ ...styles.compatBadge, ...compatStyle, marginLeft: '6px' }}>
        {compat}%
      </div>

      <div style={{ margin: '10px 0' }}>
        <div style={styles.cardName}>{group.name}</div>
        <div style={styles.cardCity}>
          {group.city} · {group.current_size}/{group.target_size} учасники
        </div>
      </div>

      <div style={styles.pills}>
        {group.members.map(m => (
          <span key={m.name} style={styles.pill}>{m.name}, {m.age}</span>
        ))}
      </div>

      <div style={styles.cardFooter}>
        <span style={styles.budget}>
          до <strong>{group.budget_max ? `${group.budget_max} ₴` : '—'}</strong>
        </span>
        <span style={styles.viewHint}>Відкрити →</span>
      </div>
    </div>
  )
}

// ── Стилі ────────────────────────────────────────────────────────

const styles = {
  root: {
    minHeight: '100vh',
    background: 'var(--bg)',
  },
  sidebar: {
    borderRight: '1px solid var(--border)',
    padding: '1.5rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    position: 'sticky',
    top: '57px',
    height: 'calc(100vh - 57px)',
    overflowY: 'auto',
  },
  sidebarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  sidebarTitle: {
    fontFamily: 'DM Serif Display, serif',
    fontSize: '18px',
  },
  filterBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  filterLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    minHeight: '44px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--text)',
    fontSize: '14px',
    fontFamily: 'Manrope, sans-serif',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    minHeight: '44px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--text)',
    fontSize: '14px',
    fontFamily: 'Manrope, sans-serif',
  },
  toggleGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  toggleBtn: (active) => ({
    padding: '10px 12px',
    minHeight: '40px',
    borderRadius: '7px',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    background: active ? 'var(--accent-secondary)' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--text-secondary)',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'Manrope, sans-serif',
    transition: 'all 0.15s',
  }),
  checkRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    minHeight: '34px',
  },
  checkbox: {
    accentColor: 'var(--accent)',
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  resetBtn: {
    width: '100%',
    fontSize: '13px',
    padding: '10px',
    marginTop: '4px',
    color: 'var(--text-secondary)',
    minHeight: '44px',
  },

  main: {
    padding: '1.5rem',
  },
  tabsContainer: {
    display: 'flex',
    gap: '12px',
    marginBottom: '1.5rem',
    borderBottom: '1px solid var(--border)',
    paddingBottom: '10px',
  },
  tab: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: active ? 'var(--accent)' : 'transparent',
    color: active ? '#fff' : 'var(--text-secondary)',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    padding: '8px 16px',
    minHeight: '40px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }),
  mainHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
    flexWrap: 'wrap',
    gap: '10px',
  },
  mainTitle: {
    fontFamily: 'DM Serif Display, serif',
    fontSize: '22px',
    fontWeight: 400,
  },
  cityTag: {
    color: 'var(--accent)',
  },
  sortSelect: {
    padding: '8px 12px',
    minHeight: '40px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--text)',
    fontSize: '13px',
    fontFamily: 'Manrope, sans-serif',
  },

  errorBox: {
    background: 'var(--accent-secondary)',
    color: 'var(--accent)',
    padding: '14px 18px',
    borderRadius: '10px',
    fontSize: '14px',
    marginBottom: '1rem',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '4rem 0',
    color: 'var(--text-secondary)',
  },
  emptyText: { fontSize: '15px' },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '14px',
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '1.25rem',
    cursor: 'pointer',
    transition: 'border-color 0.15s, transform 0.15s',
    position: 'relative',
  },
  compatBadge: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '600',
    padding: '4px 10px',
    borderRadius: '20px',
    marginBottom: '12px',
  },
  cardTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  cardAvatar: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    background: 'var(--accent-secondary)',
    color: 'var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'DM Serif Display, serif',
    fontSize: '18px',
    flexShrink: 0,
  },
  cardName: {
    fontSize: '15px',
    fontWeight: '600',
  },
  cardCity: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  pills: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '14px',
  },
  pill: {
    background: 'var(--accent-secondary)',
    color: 'var(--accent)',
    fontSize: '11px',
    padding: '4px 10px',
    borderRadius: '20px',
    fontWeight: '500',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid var(--border)',
    paddingTop: '12px',
  },
  budget: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  viewHint: {
    fontSize: '13px',
    color: 'var(--accent)',
    fontWeight: '600',
  },
}