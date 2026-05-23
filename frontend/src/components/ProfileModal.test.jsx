import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ProfileModal from './ProfileModal'
import api from '../api/axios'

// Повністю мокаємо модуль axios для ізоляції мережевих запитів
vi.mock('../api/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  }
}))

describe('ProfileModal Component', () => {
  // Створюємо універсальний тестовий об'єкт профілю користувача
  const mockProfile = {
    user_id: 123,
    name: 'Олена',
    age: 22,
    city: 'Київ',
    bio: 'Шукаю сусідку в класну квартиру. Люблю чистоту і спокій.',
    interests: 'Кодинг, Книги, Кава',
    role: 'looking',
    compatibility: 85,
    photo_url: null, // Перевіряємо рендер дефолтного текстового аватара
    breakdown: {
      "Режим дня": 90,
      "Чистота": 80,
      "Рівень шуму": 85
    }
  }

  it('рендарить ім\'я, вік та місто користувача', () => {
    render(<ProfileModal profile={mockProfile} onClose={() => {}} />)
    
    expect(screen.getByText('Олена, 22')).toBeInTheDocument()
    expect(screen.getByText('Київ')).toBeInTheDocument()
  })

  it('відображає біографію, інтереси та відсоток сумісності', () => {
    render(<ProfileModal profile={mockProfile} onClose={() => {}} />)
    
    expect(screen.getByText('Шукаю сусідку в класну квартиру. Люблю чистоту і спокій.')).toBeInTheDocument()
    expect(screen.getByText('Кодинг, Книги, Кава')).toBeInTheDocument()
    expect(screen.getByText('85% сумісності')).toBeInTheDocument()
  })

  it('показує кнопку генерації AI-аналізу за умовчанням', () => {
    render(<ProfileModal profile={mockProfile} onClose={() => {}} />)
    
    const aiButton = screen.getByText('✨ Згенерувати аналіз')
    expect(aiButton).toBeInTheDocument()
  })

  it('симулює клік на кнопку ШІ-аналізу, показує лоадер та успішно виводить результат від Gemini', async () => {
    // Емулюємо успішну відповідь від нашого FastAPI ендпоінту /matches/analyze/{id}
    api.get.mockResolvedValueOnce({
      data: {
        analysis: "✅ Спільні інтереси у кодингу\n⚠️ Можливі суперечки через графік\n💡 Спробуйте компроміс"
      }
    })

    render(<ProfileModal profile={mockProfile} onClose={() => {}} />)

    // Клікаємо на кнопку генерації аналізу
    const aiButton = screen.getByText('✨ Згенерувати аналіз')
    fireEvent.click(aiButton)

    // Перевіряємо, чи миттєво увімкнувся стан завантаження (лоадер)
    expect(screen.getByText('Аналізуємо сумісність...')).toBeInTheDocument()

    // Чекаємо обробки асинхронного запиту та перевіряємо рендер отриманих від ШІ рядків
    await waitFor(() => {
      expect(screen.getByText('✅ Спільні інтереси у кодингу')).toBeInTheDocument()
      expect(screen.getByText('⚠️ Можливі суперечки через графік')).toBeInTheDocument()
      expect(screen.getByText('💡 Спробуйте компроміс')).toBeInTheDocument()
    })

    // Переконуємось, що стара кнопка зникла після успішного підвантаження результату
    expect(screen.queryByText('✨ Згенерувати аналіз')).not.toBeInTheDocument()
  })
})