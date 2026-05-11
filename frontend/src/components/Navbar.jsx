import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import AuthModal from './AuthModal'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [theme, setTheme] = useState('light')
  const navigate = useNavigate()
  const location = useLocation()

  const [hasRequests, setHasRequests] = useState(false)
  
  useEffect(() => {
    if (user) {
      api.get('/contacts/incoming')
        .then(res => setHasRequests(res.data.length > 0))
        .catch(() => { })
    }
  }, [user])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
  }

  const openAuth = (mode) => {
    setAuthMode(mode)
    setAuthOpen(true)
  }

  return (
    <>
      <nav style={styles.nav}>
        <div style={styles.logo} onClick={() => navigate('/')}>
          nest<span style={styles.logoAccent}>mate</span>
        </div>

        <div style={styles.links}>
          {user && (
            <>
              <button
                style={{
                  ...styles.navLink,
                  ...(location.pathname === '/search' ? styles.navLinkActive : {})
                }}
                onClick={() => navigate('/search')}
              >
                Пошук
              </button>
              <button
                style={{
                  ...styles.navLink,
                  ...(location.pathname === '/profile' ? styles.navLinkActive : {})
                }}
                onClick={() => navigate('/profile')}
              >
                Мій профіль {hasRequests && <span style={{ color: 'var(--accent)', fontWeight: '900', fontSize: '20px', lineHeight: 0 }}>·</span>}
              </button>
            </>
          )}
        </div>

        <div style={styles.right}>
          <button style={styles.themeBtn} onClick={toggleTheme} title="Змінити тему">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {user ? (
            <button className="btn" onClick={logout}>Вийти</button>
          ) : (
            <>
              <button className="btn" onClick={() => openAuth('login')}>
                Увійти
              </button>
              <button className="btn btn-primary" onClick={() => openAuth('register')}>
                Зареєструватись
              </button>
            </>
          )}
        </div>
      </nav>

      {authOpen && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthOpen(false)}
          onSwitchMode={(m) => setAuthMode(m)}
        />
      )}
    </>
  )
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.85rem 1.5rem',
    borderBottom: '1px solid var(--border)',
    background: 'var(--surface)',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  logo: {
    fontFamily: 'DM Serif Display, serif',
    fontSize: '20px',
    cursor: 'pointer',
    letterSpacing: '-0.3px',
  },
  logoAccent: {
    color: 'var(--accent)',
  },
  links: {
    display: 'flex',
    gap: '4px',
  },
  navLink: {
    padding: '6px 14px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  navLinkActive: {
    background: 'var(--accent-secondary)',
    color: 'var(--accent)',
  },
  right: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  themeBtn: {
    padding: '6px 10px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'transparent',
    fontSize: '16px',
    lineHeight: 1,
    cursor: 'pointer',
  },
}