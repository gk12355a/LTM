import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'

function AmountButton({ value, active, onClick }) {
  const formatted = value.toLocaleString('vi-VN')
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-primary-600/30 border border-primary-500/50 text-primary-300'
          : 'border border-white/10 text-white/40 hover:border-white/30 hover:text-white/70'
      }`}
    >
      {formatted} ₫
    </button>
  )
}

export default function TransferPage() {
  const { user, refreshUser } = useAuth()
  const [form, setForm] = useState({ toUsername: '', amount: '' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null) // { ok, error }

  const presets = [10000, 50000, 100000, 500000]

  const handleChange = e => {
    setResult(null)
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const setAmount = val => {
    setResult(null)
    setForm(f => ({ ...f, amount: String(val) }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setResult(null)
    const amount = parseInt(form.amount)
    if (!amount || amount <= 0) { setResult({ error: 'Số tiền không hợp lệ' }); return }
    if (form.toUsername === user?.username) { setResult({ error: 'Không thể chuyển tiền cho chính mình' }); return }

    setLoading(true)
    try {
      const data = await api.transfer(form.toUsername, amount)
      setResult({ ok: data })
      setForm({ toUsername: '', amount: '' })
      await refreshUser()
    } catch (err) {
      setResult({ error: err.message || 'Chuyển tiền thất bại' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="page-title">Chuyển tiền</h1>
        <p className="text-white/40 text-sm mt-1">Chuyển tiền nhanh, an toàn, real-time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transfer Form */}
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="text-base font-semibold text-white mb-5">Thông tin chuyển tiền</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Sender info */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-white/40 mb-1">Tài khoản nguồn</p>
              <p className="font-semibold text-white">{user?.username}</p>
              <p className="text-sm text-emerald-400 mt-0.5">
                Số dư: {(user?.balance ?? 0).toLocaleString('vi-VN')} ₫
              </p>
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-primary-600/20 border border-primary-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>

            {/* Recipient */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Người nhận</label>
              <input
                id="transfer-to"
                type="text"
                name="toUsername"
                value={form.toUsername}
                onChange={handleChange}
                className="input-field"
                placeholder="Nhập tên đăng nhập người nhận"
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Số tiền (VNĐ)</label>
              <input
                id="transfer-amount"
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                className="input-field"
                placeholder="Nhập số tiền"
                min={1}
                required
              />
              {/* Preset amounts */}
              <div className="flex gap-2 mt-2 flex-wrap">
                {presets.map(v => (
                  <AmountButton
                    key={v}
                    value={v}
                    active={form.amount === String(v)}
                    onClick={() => setAmount(v)}
                  />
                ))}
              </div>
            </div>

            {/* Result messages */}
            {result?.error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                {result.error}
              </div>
            )}

            {result?.ok && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-4">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  Chuyển tiền thành công!
                </div>
                <p className="text-sm text-white/60">
                  Đã chuyển <span className="text-white font-medium">{result.ok.amount?.toLocaleString('vi-VN')} ₫</span>{' '}
                  đến <span className="text-white font-medium">{result.ok.to}</span>
                </p>
              </div>
            )}

            <button
              id="transfer-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Đang xử lý...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                  Xác nhận chuyển tiền
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Info panel */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Lưu ý</h3>
            <ul className="space-y-2">
              {[
                'Giao dịch được xử lý tức thì',
                'Không thể hoàn tác sau khi chuyển',
                'Kiểm tra kỹ tên người nhận',
                'Số tiền tối thiểu: 1 ₫',
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-white/50">
                  <svg className="w-3.5 h-3.5 text-primary-400 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                  </svg>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card p-5">
            <p className="section-label mb-2">Số dư của bạn</p>
            <p className="text-2xl font-bold text-emerald-400">
              {(user?.balance ?? 0).toLocaleString('vi-VN')} ₫
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
