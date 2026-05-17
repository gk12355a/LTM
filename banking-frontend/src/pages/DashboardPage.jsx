import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'

function StatCard({ label, value, sub, icon, color = 'primary' }) {
  const colorMap = {
    primary: 'from-primary-600/30 to-primary-900/10 border-primary-500/20',
    emerald: 'from-emerald-600/30 to-emerald-900/10 border-emerald-500/20',
    purple:  'from-purple-600/30 to-purple-900/10 border-purple-500/20',
  }
  return (
    <div className={`stat-card bg-gradient-to-br ${colorMap[color]} border`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="section-label mb-2">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {sub && <p className="text-xs text-white/40 mt-1">{sub}</p>}
        </div>
        <div className="text-white/30">{icon}</div>
      </div>
    </div>
  )
}

function RecentNotification({ item }) {
  const isReceived = item.message.startsWith('Bạn nhận')
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isReceived ? 'bg-emerald-500/20' : 'bg-primary-500/20'}`}>
        <svg className={`w-4 h-4 ${isReceived ? 'text-emerald-400' : 'text-primary-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {isReceived
            ? <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
            : <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
          }
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/80">{item.message}</p>
        <p className="text-xs text-white/30 mt-0.5">
          {new Date(item.created_at).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
        </p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user, refreshUser } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        await refreshUser()
        const notifs = await api.getNotifications()
        setNotifications(notifs)
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
    // Auto-refresh every 30s
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  const sentCount = notifications.filter(n => n.message.startsWith('Bạn đã chuyển')).length
  const receivedCount = notifications.filter(n => n.message.startsWith('Bạn nhận')).length

  if (loading) return (
    <div className="space-y-4">
      <div className="shimmer h-10 w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="shimmer h-32" />)}
      </div>
    </div>
  )

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="page-title">Xin chào, <span className="text-gradient">{user?.username}</span> 👋</h1>
        <p className="text-white/40 text-sm mt-1">Đây là tổng quan tài khoản của bạn</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Số dư hiện tại"
          value={`${(user?.balance ?? 0).toLocaleString('vi-VN')} ₫`}
          sub="Cập nhật real-time"
          color="emerald"
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          }
        />
        <StatCard
          label="Đã chuyển"
          value={sentCount}
          sub="Giao dịch chuyển đi"
          color="primary"
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
            </svg>
          }
        />
        <StatCard
          label="Đã nhận"
          value={receivedCount}
          sub="Giao dịch nhận về"
          color="purple"
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
            </svg>
          }
        />
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Hoạt động gần đây</h2>
          <span className="badge-info">{notifications.length} thông báo</span>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-white/10 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <p className="text-white/30 text-sm">Chưa có hoạt động nào</p>
          </div>
        ) : (
          <div>
            {notifications.slice(0, 5).map(n => <RecentNotification key={n.id} item={n} />)}
          </div>
        )}
      </div>
    </div>
  )
}
