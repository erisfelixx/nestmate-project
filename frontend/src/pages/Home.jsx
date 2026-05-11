import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthModal from '../components/AuthModal'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('register')

  const handleCTA = () => {
    if (user) navigate('/search')
    else {
      setAuthMode('register')
      setAuthOpen(true)
    }
  }

  return (
    <>
      <main style={styles.root}>

        {/* HERO */}
        <section style={styles.hero}>
          <div style={styles.tag}>Пошук співмешканців в Україні</div>

          <h1 style={styles.h1}>
            Знайди свого{' '}
            <em style={styles.accent}>ідеального</em>
            <br />сусіда
          </h1>

          <p style={styles.sub}>
            Заповни анкету — ми підберемо людей,
            <br />з якими тобі буде комфортно жити разом.
          </p>

          <div style={styles.heroBtns}>
            <button className="btn btn-primary" style={styles.ctaBtn} onClick={handleCTA}>
              Знайти співмешканця
            </button>
            <a href="#how" style={{ textDecoration: 'none' }}>
              <button className="btn" style={styles.secondBtn}>
                Як це працює?
              </button>
            </a>
          </div>
        </section>

        {/* СТАТИСТИКА */}
        <section style={styles.stats}>
          {[
            { num: '1 200+', label: 'активних анкет' },
            { num: '87%',    label: 'вдалих підборів' },
            { num: '24',     label: 'міста України' },
          ].map((s) => (
            <div key={s.label} style={styles.statCard}>
              <div style={styles.statNum}>{s.num}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </section>

        {/* ЯК ЦЕ ПРАЦЮЄ */}
        <section id="how" style={styles.section}>
          <h2 style={styles.sectionTitle}>Як це працює</h2>
          <div style={styles.steps}>
            {[
              {
                n: '1',
                title: 'Створи профіль',
                desc: 'Розкажи про себе, свої звички та побажання до житла',
              },
              {
                n: '2',
                title: 'Заповни анкету',
                desc: 'Режим дня, чистота, ставлення до тварин та гостей',
              },
              {
                n: '3',
                title: 'Переглядай матчі',
                desc: 'Ми покажемо найсумісніших першими з відсотком збігу',
              },
            ].map((s) => (
              <div key={s.n} style={styles.step}>
                <div style={styles.stepNum}>{s.n}</div>
                <h3 style={styles.stepTitle}>{s.title}</h3>
                <p style={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ПРИКЛАДИ КАРТОК */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Активні анкети</h2>
          <div style={styles.cards}>
            {SAMPLE_CARDS.map((c) => (
              <div key={c.name} style={styles.card}>
                <div style={styles.compatBadge(c.compat)}>
                  {c.compat}% сумісності
                </div>
                <div style={styles.cardTop}>
                  <div style={styles.avatar(c.color)}>{c.initial}</div>
                  <div>
                    <div style={styles.cardName}>{c.name}</div>
                    <div style={styles.cardCity}>{c.city}</div>
                  </div>
                </div>
                <div style={styles.pills}>
                  {c.tags.map((t) => (
                    <span key={t} style={styles.pill}>{t}</span>
                  ))}
                </div>
                <div style={styles.cardFooter}>
                  <span style={styles.budget}>до <strong>{c.budget}</strong></span>
                  <button
                    className="btn"
                    style={styles.cardBtn}
                    onClick={handleCTA}
                  >
                    Переглянути
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA БАНЕР */}
        <section style={styles.banner}>
          <h2 style={styles.bannerTitle}>Готова знайти свого сусіда?</h2>
          <p style={styles.bannerSub}>
            Реєстрація займає менше хвилини
          </p>
          <button
            className="btn btn-primary"
            style={styles.ctaBtn}
            onClick={handleCTA}
          >
            Почати зараз
          </button>
        </section>

      </main>

      {authOpen && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthOpen(false)}
          onSwitchMode={setAuthMode}
        />
      )}
    </>
  )
}

const SAMPLE_CARDS = [
  {
    name: 'Оля, 23',
    city: 'Київ · шукає кімнату',
    compat: 92,
    budget: '8 000 грн',
    initial: 'О',
    color: '#EDE8F8',
    tags: ['жайворонок', 'чистота 6/7', 'без тварин'],
  },
  {
    name: 'Макс, 25',
    city: 'Львів · здає кімнату',
    compat: 85,
    budget: '6 500 грн',
    initial: 'М',
    color: '#E1F5EE',
    tags: ['сова', 'є кіт', 'тихий'],
  },
  {
    name: 'Іра, 21',
    city: 'Київ · шукає кімнату',
    compat: 74,
    budget: '7 000 грн',
    initial: 'І',
    color: '#E6F1FB',
    tags: ['жайворонок', 'чистота 5/7', 'некурящий'],
  },
]

const styles = {
  root: {
    maxWidth: '860px',
    margin: '0 auto',
    padding: '0 1.25rem 4rem',
  },

  // HERO
  hero: {
    textAlign: 'center',
    padding: '4rem 0 3rem',
  },
  tag: {
    display: 'inline-block',
    background: 'var(--accent-secondary)',
    color: 'var(--accent)',
    fontSize: '12px',
    fontWeight: '500',
    padding: '5px 14px',
    borderRadius: '20px',
    marginBottom: '1.25rem',
  },
  h1: {
    fontFamily: 'DM Serif Display, serif',
    fontSize: '48px',
    lineHeight: 1.1,
    letterSpacing: '-1px',
    marginBottom: '1rem',
    fontWeight: 400,
  },
  accent: {
    fontStyle: 'italic',
    color: 'var(--accent)',
  },
  sub: {
    color: 'var(--text-secondary)',
    fontSize: '15px',
    lineHeight: 1.7,
    marginBottom: '2rem',
  },
  heroBtns: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  ctaBtn: {
    padding: '11px 26px',
    fontSize: '14px',
    fontWeight: '600',
  },
  secondBtn: {
    padding: '11px 22px',
    fontSize: '14px',
  },

  // СТАТИСТИКА
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '3rem',
  },
  statCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '1.25rem',
    textAlign: 'center',
  },
  statNum: {
    fontFamily: 'DM Serif Display, serif',
    fontSize: '28px',
    color: 'var(--accent)',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },

  // СЕКЦІЯ
  section: {
    marginBottom: '3rem',
  },
  sectionTitle: {
    fontFamily: 'DM Serif Display, serif',
    fontSize: '26px',
    fontWeight: 400,
    marginBottom: '1.25rem',
    letterSpacing: '-0.3px',
  },

  // КРОКИ
  steps: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  step: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '1.25rem',
  },
  stepNum: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: 'var(--accent-secondary)',
    color: 'var(--accent)',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
  },
  stepTitle: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '6px',
  },
  stepDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
  },

  // КАРТКИ
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '1rem',
    position: 'relative',
  },
  compatBadge: (compat) => ({
    display: 'inline-block',
    background: compat >= 80 ? '#EAF3DE' : '#FEF3E2',
    color: compat >= 80 ? '#3B6D11' : '#854F0B',
    fontSize: '11px',
    fontWeight: '500',
    padding: '3px 9px',
    borderRadius: '20px',
    marginBottom: '10px',
  }),
  cardTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  avatar: (color) => ({
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'DM Serif Display, serif',
    fontSize: '16px',
    flexShrink: 0,
    color: '#1A1726',
  }),
  cardName: {
    fontSize: '13px',
    fontWeight: '600',
  },
  cardCity: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
  },
  pills: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '5px',
    marginBottom: '10px',
  },
  pill: {
    background: 'var(--accent-secondary)',
    color: 'var(--accent)',
    fontSize: '10px',
    padding: '3px 8px',
    borderRadius: '20px',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid var(--border)',
    paddingTop: '8px',
  },
  budget: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  cardBtn: {
    fontSize: '11px',
    padding: '4px 12px',
  },

  // БАНЕР
  banner: {
    background: 'var(--accent-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '2.5rem',
    textAlign: 'center',
  },
  bannerTitle: {
    fontFamily: 'DM Serif Display, serif',
    fontSize: '28px',
    fontWeight: 400,
    marginBottom: '8px',
  },
  bannerSub: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    marginBottom: '1.5rem',
  },
}