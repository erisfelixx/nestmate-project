import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function AuthModal({ mode, onClose, onSwitchMode }) {
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isLogin = mode === 'login'

  const handleSubmit = async () => {
    setError('')
    if (!email || !password) {
      setError('Заповни всі поля')
      return
    }
    setLoading(true)
    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await register(email, password)
      }
      onClose()
      navigate('/profile')
    } catch (e) {
      setError(
        e.response?.data?.detail || 'Щось пішло не так. Спробуй ще раз.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>

        {/* Заголовок */}
        <div style={styles.header}>
          <h2 style={styles.title}>
            {isLogin ? 'Вхід' : 'Реєстрація'}
          </h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <p style={styles.subtitle}>
          {isLogin
            ? 'Раді бачити тебе знову 👋'
            : 'Створи акаунт, щоб знайти свого сусіда'}
        </p>

        {/* Поля */}
        <div style={styles.fields}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKey}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Пароль</label>
            <input
              style={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKey}
            />
          </div>
        </div>

        {/* Помилка */}
        {error && <div style={styles.error}>{error}</div>}

        {/* Кнопка */}
        <button
          className="btn btn-primary"
          style={styles.submitBtn}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Завантаження...' : isLogin ? 'Увійти' : 'Зареєструватись'}
        </button>

        {/* Перемикач режиму */}
        <p style={styles.switchText}>
          {isLogin ? 'Ще немає акаунту?' : 'Вже є акаунт?'}
          {' '}
          <span
            style={styles.switchLink}
            onClick={() => onSwitchMode(isLogin ? 'register' : 'login')}
          >
            {isLogin ? 'Зареєструватись' : 'Увійти'}
          </span>
        </p>
      </div>
    </div>
  )
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  title: {
    fontFamily: 'DM Serif Display, serif',
    fontSize: '24px',
    fontWeight: 400,
  },
  closeBtn: {
    border: 'none',
    background: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: '18px',
    padding: '4px 8px',
    borderRadius: '6px',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    marginBottom: '1.5rem',
  },
  fields: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginBottom: '16px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--text-secondary)',
  },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    color: 'var(--text)',
    fontSize: '14px',
    fontFamily: 'Manrope, sans-serif',
    outline: 'none',
    transition: 'border-color 0.15s',
  },
  error: {
    background: '#FEE8E8',
    color: '#C0392B',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '14px',
  },
  submitBtn: {
    width: '100%',
    padding: '11px',
    fontSize: '14px',
    marginBottom: '16px',
  },
  switchText: {
    textAlign: 'center',
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  switchLink: {
    color: 'var(--accent)',
    fontWeight: '500',
    cursor: 'pointer',
  },
}