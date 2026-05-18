import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: { 'Content-Type': 'application/json' }
})

// функція для отримання профілю по user_id
export const fetchProfile = async (userId) => {
  const res = await api.get(`/profiles/user/${userId}`)
  return res.data
}

//автоматично додає токен до кожного запиту
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api