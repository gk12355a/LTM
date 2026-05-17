// Dùng URL tương đối để tận dụng Vite proxy (dev) hoặc cùng origin (production)
// Vite proxy: /api/* → http://localhost:5156 (BankingApp trực tiếp)
const BASE_URL = ''

function getSession() {
  return localStorage.getItem('session')
}

async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' }
  const session = getSession()
  if (session) headers['x-session'] = session

  const options = { method, headers }
  if (body) options.body = JSON.stringify(body)

  const res = await fetch(`${BASE_URL}${path}`, options)
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.message || `HTTP ${res.status}`)
  }
  return data
}

export const api = {
  // Auth
  register: (username, password) =>
    request('POST', '/api/register', { username: username, password: password }),

  login: (username, password) =>
    request('POST', '/api/login', { username: username, password: password }),

  // Account
  getMe: () => request('GET', '/api/me'),
  getBalance: () => request('GET', '/api/balance'),

  // Transfer
  transfer: (toUsername, amount) =>
    request('POST', '/api/transfer', { toUsername: toUsername, amount: amount }),

  // Notifications
  getNotifications: () => request('GET', '/api/notifications'),
}
