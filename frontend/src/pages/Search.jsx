import { useState, useEffect } from 'react'
import api from '../api/axios'
import ProfileModal from '../components/ProfileModal'
import GroupModal from '../components/GroupModal'
import { Search as SearchIcon, User, Users, SlidersHorizontal, X, Heart, Star, MapPin, BriefcaseBusiness } from 'lucide-react'

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
  
  const [activeTab, setActiveTab] = useState('individuals')
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false) 

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
      {isMobileFiltersOpen && (
        <div className="sidebar-backdrop" onClick={() => setIsMobileFiltersOpen(false)} />
      )}

      <div className="search-layout">

        {/* НОВИЙ САЙДБАР-КАРТКА */}
        <aside className={`search-sidebar ${isMobileFiltersOpen ? 'open' : ''}`} style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <div style={styles.sidebarTitle}>Фільтри</div>
            <button 
              className="btn" 
              style={{ padding: '4px', border: 'none', display: 'flex', background: 'transparent' }}
              onClick={() => setIsMobileFiltersOpen(false)}
            >
              <X size={24} className="mobile-close-icon" color="var(--text-secondary)" />
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
                    { val: '', label: '👥 Всі' },
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
                    { val: '', label: '👥 Будь-яка' },
                    { val: 'female', label: '👩 Жінка' },
                    { val: 'male', label: '👨 Чоловік' },
                  ]}
                  value={filters.gender}
                  onChange={v => setFilter('gender', v)}
                />
              </FilterBlock>

              <FilterBlock label="Режим дня">
                <FilterToggle
                  options={[
                    { val: '', label: '🕒 Будь-який' },
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

          {error && (
            <div style={styles.errorBox}>
              {error === 'Спочатку створи профіль'
                ? 'Спочатку заповни свій профіль, щоб бачити анкети.'
                : error === 'Увімкни активний пошук у профілі'
                  ? 'Увімкни активний пошук у профілі, щоб бачити інших.'
                  : error}
            </div>
          )}

          {/* Стан: SKELETON LOADERS */}
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

function SkeletonCard() {
  return (
    <article style={{ ...styles.profileCard, borderColor: 'transparent', cursor: 'default' }}>
      <div className="skeleton-box" style={{ width: '100px', height: '22px', borderRadius: '20px', marginBottom: '20px' }} />
      <div style={styles.profileInfoRow}>
        <div className="skeleton-box" style={{ width: '72px', height: '72px', borderRadius: '50%' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '6px' }}>
          <div className="skeleton-box" style={{ width: '70%', height: '18px', borderRadius: '8px' }} />
          <div className="skeleton-box" style={{ width: '50%', height: '14px', borderRadius: '8px' }} />
          <div className="skeleton-box" style={{ width: '60%', height: '14px', borderRadius: '8px' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
        <div className="skeleton-box" style={{ width: '70px', height: '26px', borderRadius: '20px' }} />
        <div className="skeleton-box" style={{ width: '90px', height: '26px', borderRadius: '20px' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
        <div className="skeleton-box" style={{ width: '35%', height: '20px', borderRadius: '8px' }} />
        <div className="skeleton-box" style={{ width: '100px', height: '34px', borderRadius: '14px' }} />
      </div>
    </article>
  )
}

function MatchCard({ match, onClick }) {
  const compat = match.compatibility
  const tone = compat >= 80 ? 'green' : 'yellow'

  const tags = [
    match.schedule === 'early_bird' ? '🌅 Жайворонок' : match.schedule === 'night_owl' ? '🦉 Сова' : null,
    match.cleanliness ? `🧹 Чистота ${match.cleanliness}/7` : null,
    match.has_pets ? '🐾 Є тварини' : null,
    match.smoking ? '🚬 Курить' : null,
    match.ok_with_pets ? '💚 З тваринами ок' : null,
  ].filter(Boolean).slice(0, 3)

  return (
    <article style={styles.profileCard} onClick={onClick}>
      <div style={styles.profileHeader}>
        <span style={styles.profileBadge(tone)}>
          {tone === 'green' ? <Heart size={12} fill="currentColor" /> : <Star size={12} fill="currentColor" />}
          {compat}% сумісності
        </span>
      </div>

      <div style={styles.profileInfoRow}>
        {match.photo_url
          ? <img src={match.photo_url} style={styles.profileAvatar} alt={match.name} />
          : <div style={styles.profileAvatarPlaceholder}>{match.name?.[0] || '?'}</div>
        }
        <div style={{ minWidth: 0, paddingTop: '6px' }}>
          <h3 style={styles.profileName}>{match.name}, {match.age}</h3>
          <div style={styles.profileMetaList}>
            <p style={styles.profileMetaItem}>
              <MapPin size={15} color="var(--accent)" /> {match.city}
            </p>
            <p style={styles.profileMetaItem}>
              <BriefcaseBusiness size={15} color="var(--accent)" /> {match.role === 'looking' ? 'Шукає кімнату' : 'Здає кімнату'}
            </p>
          </div>
        </div>
      </div>

      <div style={styles.profileTagList}>
        {tags.map(t => <span key={t} style={styles.profileTag}>{t}</span>)}
      </div>

      <div style={styles.profileFooter}>
        <p style={styles.profilePrice}>
          до {match.budget_max ? `${match.budget_max} ₴` : '—'}
        </p>
        <button style={styles.profileBtn}>Відкрити</button>
      </div>
    </article>
  )
}

function GroupCard({ group, onClick }) {
  const compat = group.compatibility
  const tone = compat >= 75 ? 'green' : 'yellow'

  return (
    <article style={{ ...styles.profileCard, borderLeft: '4px solid var(--accent)' }} onClick={onClick}>
      <div style={styles.profileHeader}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ ...styles.profileBadge('default'), background: 'var(--accent-secondary)', color: 'var(--accent)', border: '1px solid transparent' }}>
            👥 Група
          </span>
          <span style={styles.profileBadge(tone)}>
            {tone === 'green' ? <Heart size={12} fill="currentColor" /> : <Star size={12} fill="currentColor" />}
            {compat}%
          </span>
        </div>
      </div>

      <div style={styles.profileInfoRow}>
        <div style={styles.profileAvatarPlaceholder}>
          <Users size={30} />
        </div>
        <div style={{ minWidth: 0, paddingTop: '6px' }}>
          <h3 style={styles.profileName}>{group.name}</h3>
          <div style={styles.profileMetaList}>
            <p style={styles.profileMetaItem}>
              <MapPin size={15} color="var(--accent)" /> {group.city}
            </p>
            <p style={styles.profileMetaItem}>
              <User size={15} color="var(--accent)" /> {group.current_size}/{group.target_size} учасники
            </p>
          </div>
        </div>
      </div>

      <div style={styles.profileTagList}>
        {group.members.map(m => (
          <span key={m.name} style={styles.profileTag}>{m.name}, {m.age}</span>
        ))}
      </div>

      <div style={styles.profileFooter}>
        <p style={styles.profilePrice}>
          до {group.budget_max ? `${group.budget_max} ₴` : '—'}
        </p>
        <button style={styles.profileBtn}>Відкрити</button>
      </div>
    </article>
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

// ── Стилі ────────────────────────────────────────────────────────

const styles = {
  root: {
    minHeight: '100vh',
    background: 'var(--bg)',
  },
  
  // ОНОВЛЕНИЙ САЙДБАР
  sidebar: {
    alignSelf: 'start',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '24px',
    padding: '24px',
    boxShadow: '0 18px 50px rgba(45, 35, 95, 0.08)',
    position: 'sticky',
    top: '96px', 
    maxHeight: 'calc(100vh - 120px)',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    /* borderRight ВИДАЛЕНО, щоб не було жорсткої лінії */
  },
  sidebarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '26px',
  },
  sidebarTitle: {
    fontFamily: 'DM Serif Display, serif',
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--text)',
  },
  filterBlock: {
    marginBottom: '24px',
  },
  filterLabel: {
    display: 'block',
    marginBottom: '10px',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
  },
  select: {
    width: '100%',
    height: '48px',
    padding: '0 16px',
    borderRadius: '14px',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    color: 'var(--text)',
    fontSize: '14px',
    fontFamily: 'Manrope, sans-serif',
    outline: 'none',
  },
  input: {
    width: '100%',
    height: '48px',
    padding: '0 16px',
    borderRadius: '14px',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    color: 'var(--text)',
    fontSize: '14px',
    fontFamily: 'Manrope, sans-serif',
    outline: 'none',
  },
  toggleGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  toggleBtn: (active) => ({
    width: '100%',
    height: '44px',
    padding: '0 16px',
    borderRadius: '14px',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    background: active ? 'var(--accent)' : 'var(--surface)',
    color: active ? '#fff' : 'var(--text-secondary)',
    fontSize: '14px',
    fontWeight: active ? 700 : 600,
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'Manrope, sans-serif',
    transition: 'all 0.15s',
  }),
  checkRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    color: 'var(--text-secondary)',
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: '12px',
  },
  checkbox: {
    accentColor: 'var(--accent)',
    width: '20px',
    height: '20px',
    cursor: 'pointer',
  },
  resetBtn: {
    width: '100%',
    height: '48px',
    borderRadius: '14px',
    border: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: '8px'
  },

  main: {
    padding: '1.5rem 0',
  },
  tabsContainer: {
    display: 'flex',
    gap: '12px',
    marginBottom: '1.5rem',
  },
  tab: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: active ? 'var(--accent)' : 'var(--surface)',
    color: active ? '#fff' : 'var(--text-secondary)',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    padding: '8px 20px',
    minHeight: '44px',
    borderRadius: '14px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }),
  mainHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '10px',
  },
  mainTitle: {
    fontFamily: 'DM Serif Display, serif',
    fontSize: '26px',
    fontWeight: 400,
  },
  cityTag: {
    color: 'var(--accent)',
  },
  sortSelect: {
    padding: '0 16px',
    height: '44px',
    borderRadius: '14px',
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--text)',
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: 'Manrope, sans-serif',
  },

  errorBox: {
    background: 'var(--accent-secondary)',
    color: 'var(--accent)',
    padding: '14px 18px',
    borderRadius: '14px',
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
    gap: '20px', 
  },

  profileCard: {
    borderRadius: '24px', 
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    padding: '1.25rem', 
    boxShadow: 'var(--shadow)',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  profileHeader: {
    marginBottom: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileBadge: (tone) => {
    if (tone === 'default') {
      return {
        display: 'inline-flex', alignItems: 'center', gap: '4px', borderRadius: '50px', padding: '4px 10px', fontSize: '11px', fontWeight: 'bold'
      }
    }
    return {
      display: 'inline-flex', alignItems: 'center', gap: '4px', borderRadius: '50px', padding: '4px 10px', fontSize: '11px', fontWeight: 'bold',
      background: tone === 'green' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
      color: tone === 'green' ? '#047857' : '#b45309',
      border: `1px solid ${tone === 'green' ? '#d1fae5' : '#fef3c7'}`
    }
  },
  profileInfoRow: { display: 'flex', gap: '1rem' },
  profileAvatar: { 
    height: '72px', 
    width: '72px', 
    flexShrink: 0, 
    borderRadius: '50%', 
    objectFit: 'cover', 
    border: '3px solid var(--border)' 
  },
  profileAvatarPlaceholder: { 
    height: '72px', 
    width: '72px', 
    flexShrink: 0, 
    borderRadius: '50%', 
    border: '3px solid var(--border)', 
    background: 'var(--accent-secondary)', 
    color: 'var(--accent)', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontFamily: 'DM Serif Display, serif', 
    fontSize: '28px' 
  },
  profileName: { fontSize: '18px', fontWeight: 'bold', color: 'var(--text)', margin: 0 },
  profileMetaList: { marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' },
  profileMetaItem: { display: 'flex', alignItems: 'center', gap: '6px', margin: 0 },
  profileTagList: { marginTop: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '8px' },
  profileTag: { borderRadius: '50px', border: '1px solid var(--border)', background: 'var(--surface)', padding: '6px 12px', fontSize: '12px', fontWeight: '600', color: 'var(--accent)' },
  profileFooter: { marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' },
  profilePrice: { whiteSpace: 'nowrap', fontSize: '18px', fontWeight: '800', color: 'var(--text)', margin: 0 },
  profileBtn: { borderRadius: '14px', background: 'var(--accent)', padding: '8px 16px', fontSize: '13px', fontWeight: 'bold', color: '#FFFFFF', border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(124,92,191,0.25)' },
}