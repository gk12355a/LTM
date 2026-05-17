import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const BankIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
  </svg>
)

const CheckItem = ({ text }) => (
  <li className="flex items-center gap-2 text-sm text-white/50">
    <svg className="w-4 h-4 text-primary-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
    {text}
  </li>
)

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const validate = () => {
    if (form.username.length < 3) return 'Tên đăng nhập phải có ít nhất 3 ký tự'
    if (form.password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự'
    if (form.password !== form.confirm) return 'Mật khẩu xác nhận không khớp'
    return null
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }

    setError('')
    setLoading(true)
    try {
      const data = await register(form.username, form.password)
      setSuccess(`Tạo tài khoản thành công! Số dư khởi điểm: ${data.balance?.toLocaleString('vi-VN')} VNĐ`)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = () => {
    if (!form.password) return null
    if (form.password.length < 6) return { label: 'Yếu', color: 'bg-red-500', w: 'w-1/4' }
    if (form.password.length < 10) return { label: 'Trung bình', color: 'bg-yellow-500', w: 'w-1/2' }
    return { label: 'Mạnh', color: 'bg-emerald-500', w: 'w-full' }
  }
  const strength = passwordStrength()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-600/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md animate-slide-up relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-purple-600 mb-4 glow-primary">
            <BankIcon />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Banking<span className="text-gradient">App</span></h1>
          <p className="text-white/40 text-sm">Tạo tài khoản miễn phí, nhận ngay 100.000 VNĐ</p>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Đăng ký tài khoản</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Tên đăng nhập</label>
              <input
                id="register-username"
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="input-field"
                placeholder="Tối thiểu 3 ký tự"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Mật khẩu</label>
              <input
                id="register-password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="input-field"
                placeholder="Tối thiểu 6 ký tự"
                required
              />
              {strength && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-white/40">Độ mạnh mật khẩu</span>
                    <span className="text-xs text-white/60">{strength.label}</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} ${strength.w} transition-all duration-300 rounded-full`} />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Xác nhận mật khẩu</label>
              <input
                id="register-confirm"
                type="password"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                className={`input-field ${form.confirm && form.confirm !== form.password ? 'border-red-500/60' : ''}`}
                placeholder="Nhập lại mật khẩu"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                {success}
              </div>
            )}

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Đang tạo tài khoản...
                </span>
              ) : 'Tạo tài khoản'}
            </button>
          </form>

          {/* Benefits */}
          <div className="mt-5 pt-5 border-t border-white/10">
            <p className="text-xs text-white/30 mb-2">Quyền lợi khi đăng ký:</p>
            <ul className="space-y-1.5">
              <CheckItem text="Nhận ngay 100.000 VNĐ vào tài khoản" />
              <CheckItem text="Chuyển tiền real-time không giới hạn" />
              <CheckItem text="Bảo mật bằng BCrypt encryption" />
            </ul>
          </div>

          <div className="divider" />
          <p className="text-center text-white/40 text-sm">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
