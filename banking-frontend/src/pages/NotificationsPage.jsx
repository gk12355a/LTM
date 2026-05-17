import React, { useEffect, useState } from 'react'
import { api } from '../services/api'

function NotificationItem({ item, index }) {
  const isReceived = item.message.startsWith('Bạn nhận')
  return (
    <div
      className="glass-card-hover p-4 flex items-start gap-4 animate-slide-up"
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
        isReceived ? 'bg-emerald-500/20 border border-emerald-500/20' : 'bg-primary-500/20 border border-primary-500/20'
      }`}>
        <svg className={`w-5 h-5 ${isReceived ? 'text-emerald-400' : 'text-primary-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {isReceived
            ? <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
            : <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
          }
        </svg>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/80">{item.message}</p>
        <p className="text-xs text-white/30 mt-1">
          {new Date(item.created_at).toLocaleString('vi-VN', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      {/* Badge */}
      <span className={isReceived ? 'badge-success' : 'badge-info'}>
        {isReceived ? '+ Nhận' : '− Gửi'}
      </span>
    </div>
  )
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all') // 'all' | 'sent' | 'received'

  const load = async () => {
    try {
      const data = await api.getNotifications()
      setNotifications(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 15000) // refresh every 15s
    return () => clearInterval(interval)
  }, [])

  const filtered = notifications.filter(n => {
    if (filter === 'sent') return n.message.startsWith('Bạn đã chuyển')
    if (filter === 'received') return n.message.startsWith('Bạn nhận')
    return true
  })

  const sentCount = notifications.filter(n => n.message.startsWith('Bạn đã chuyển')).length
  const receivedCount = notifications.filter(n => n.message.startsWith('Bạn nhận')).length

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Thông báo</h1>
          <p className="text-white/40 text-sm mt-1">50 thông báo gần nhất của bạn</p>
        </div>
        <button
          id="notif-refresh"
          onClick={() => { setLoading(true); load() }}
          className="btn-ghost flex items-center gap-2 text-sm py-2 px-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Làm mới
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Tất cả', count: notifications.length, key: 'all', color: 'text-white' },
          { label: 'Đã gửi', count: sentCount, key: 'sent', color: 'text-primary-400' },
          { label: 'Đã nhận', count: receivedCount, key: 'received', color: 'text-emerald-400' },
        ].map(tab => (
          <button
            key={tab.key}
            id={`notif-filter-${tab.key}`}
            onClick={() => setFilter(tab.key)}
            className={`glass-card p-3 text-center transition-all duration-200 ${
              filter === tab.key ? 'border-primary-500/40 bg-primary-600/10' : 'hover:bg-white/5'
            }`}
          >
            <p className={`text-xl font-bold ${tab.color}`}>{tab.count}</p>
            <p className="text-xs text-white/40 mt-0.5">{tab.label}</p>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="shimmer h-20" />
          ))
        ) : error ? (
          <div className="glass-card p-8 text-center text-red-400">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <svg className="w-16 h-16 text-white/10 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <p className="text-white/30">Không có thông báo nào</p>
          </div>
        ) : (
          filtered.map((item, i) => <NotificationItem key={item.id} item={item} index={i} />)
        )}
      </div>
    </div>
  )
}
