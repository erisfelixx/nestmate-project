import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import AuthModal from './AuthModal'
import { Search, User, Sun, Moon, Menu, X } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [theme, setTheme] = useState('light')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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
    setIsMobileMenuOpen(false)
  }

  const handleNav = (path) => {
    navigate(path)
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <nav style={styles.nav}>
        <div style={styles.logo} onClick={() => handleNav('/')}>
          nest<span style={styles.logoAccent}>mate</span>
        </div>

        {/* Десктопна навігація */}
        <div className="desktop-nav" style={styles.desktopNav}>
          {user && (
            <>
              <button
                style={{
                  ...styles.navLink,
                  ...(location.pathname === '/search' ? styles.navLinkActive : {})
                }}
                onClick={() => handleNav('/search')}
              >
                <Search size={18} /> Пошук
              </button>
              <button
                style={{
                  ...styles.navLink,
                  ...(location.pathname === '/profile' ? styles.navLinkActive : {})
                }}
                onClick={() => handleNav('/profile')}
              >
                <User size={18} /> Мій профіль 
                {hasRequests && <span style={styles.notificationDot} />}
              </button>
            </>
          )}
        </div>

        <div className="desktop-nav" style={styles.right}>
          <button style={styles.iconBtn} onClick={toggleTheme} title="Змінити тему">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {user ? (
            <button className="btn" style={{ minHeight: '40px' }} onClick={logout}>Вийти</button>
          ) : (
            <>
              <button className="btn" style={{ minHeight: '40px' }} onClick={() => openAuth('login')}>
                Увійти
              </button>
              <button className="btn btn-primary" style={{ minHeight: '40px' }} onClick={() => openAuth('register')}>
                Зареєструватись
              </button>
            </>
          )}
        </div>

        {/* Кнопка мобільного меню */}
        <button 
          className="mobile-nav-toggle" 
          style={styles.mobileToggleBtn}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Мобільне меню (випадаюче) */}
      {isMobileMenuOpen && (
        <div style={styles.mobileMenu}>
          {user && (
            <>
              <button style={styles.mobileNavLink} onClick={() => handleNav('/search')}>
                <Search size={20} /> Пошук
              </button>
              <button style={styles.mobileNavLink} onClick={() => handleNav('/profile')}>
                <User size={20} /> Мій профіль
                {hasRequests && <span style={styles.notificationDot} />}
              </button>
              <hr style={styles.divider} />
            </>
          )}
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', padding: '0 10px' }}>
            <button style={styles.iconBtn} onClick={toggleTheme}>
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            {user ? (
              <button className="btn" style={{ flex: 1 }} onClick={logout}>Вийти</button>
            ) : (
              <>
                <button className="btn" style={{ flex: 1 }} onClick={() => openAuth('login')}>Увійти</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => openAuth('register')}>Зареєстр.</button>
              </>
            )}
          </div>
        </div>
      )}

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
    fontSize: '22px', 
    cursor: 'pointer',
    letterSpacing: '-0.3px',
  },
  logoAccent: {
    color: 'var(--accent)',
  },
  desktopNav: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    minHeight: '40px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background 0.2s',
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
  iconBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--text)',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  notificationDot: {
    width: '8px',
    height: '8px',
    backgroundColor: 'var(--accent)',
    borderRadius: '50%',
    display: 'inline-block',
    marginLeft: '4px',
  },
  mobileToggleBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text)',
    cursor: 'pointer',
    display: 'none',
  },
  mobileMenu: {
    position: 'absolute',
    top: '65px',
    left: 0,
    right: 0,
    background: 'var(--surface)',
    borderBottom: '1px solid var(--border)',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    zIndex: 49,
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  mobileNavLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 10px',
    fontSize: '16px',
    color: 'var(--text)',
    background: 'transparent',
    border: 'none',
    textAlign: 'left',
    width: '100%',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid var(--border)',
    margin: '4px 0',
  }
}