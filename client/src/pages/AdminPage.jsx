import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'

const ADMIN_EMAIL = 'sudeep2102@gmail.com'

function StatBox({ label, value, color = 'text-ink' }) {
  return (
    <div className="card p-6 text-center">
      <p className={`font-display text-4xl font-bold ${color}`}>{value}</p>
      <p className="font-body text-sm text-muted mt-1">{label}</p>
    </div>
  )
}

export default function AdminPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedUserData, setSelectedUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && user.email !== ADMIN_EMAIL) {
      navigate('/')
    }
  }, [user])

  useEffect(() => {
    const fetch = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users'),
        ])
        setStats(statsRes.data)
        setUsers(usersRes.data)
      } catch {
        toast.error('Failed to load admin data')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const handleViewUser = async (userId) => {
    setSelectedUser(userId)
    try {
      const res = await api.get(`/admin/users/${userId}`)
      setSelectedUserData(res.data)
    } catch {
      toast.error('Failed to load user data')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Delete this user and ALL their data permanently? This cannot be undone.')) return
    try {
      await api.delete(`/admin/users/${userId}`)
      setUsers(users.filter(u => u.id !== userId))
      setSelectedUser(null)
      setSelectedUserData(null)
      toast.success('User deleted from Firebase and database')
    } catch {
      toast.error('Failed to delete user')
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="flex items-center justify-center py-32 text-muted font-body">Loading...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-ink">Admin Panel</h1>
          <p className="font-body text-muted mt-1">Manage users and monitor app activity</p>
        </div>

        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-10">
            <StatBox label="Total users" value={stats.total_users} />
            <StatBox label="Total collections" value={stats.total_collections} />
            <StatBox label="Total words" value={stats.total_words} />
            <StatBox label="New users this week" value={stats.new_users_this_week} color="text-sage" />
            <StatBox label="New words this week" value={stats.new_words_this_week} color="text-accent" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink mb-4">All Users</h2>
            <div className="space-y-3">
              {users.map(u => (
                <div
                  key={u.id}
                  className={`card p-4 cursor-pointer hover:shadow-md transition-all duration-200 ${selectedUser === u.id ? 'border-accent/40' : ''}`}
                  onClick={() => handleViewUser(u.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-body font-medium text-ink">{u.email}</p>
                      <p className="font-body text-xs text-muted mt-0.5">
                        {u.name} · Joined {new Date(u.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <p className="font-display text-lg font-bold text-ink">{u.collection_count}</p>
                        <p className="font-body text-xs text-muted">collections</p>
                      </div>
                      <div>
                        <p className="font-display text-lg font-bold text-ink">{u.word_count}</p>
                        <p className="font-body text-xs text-muted">words</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <p className="font-body text-muted text-center py-10">No users yet</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold text-ink mb-4">User Detail</h2>
            {selectedUserData ? (
              <div className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-display text-xl font-semibold text-ink">{selectedUserData.user.email}</p>
                    <p className="font-body text-sm text-muted">{selectedUserData.user.name}</p>
                    <p className="font-body text-xs text-muted mt-1">
                      🔥 {selectedUserData.user.streak} day streak
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteUser(selectedUserData.user.id)}
                    className="font-body text-xs text-accent border border-accent/30 px-3 py-1.5 rounded-lg hover:bg-accent hover:text-white transition-all duration-200"
                  >
                    Delete user
                  </button>
                </div>

                <h3 className="font-body text-sm font-medium text-muted uppercase tracking-wider mb-3">
                  Collections ({selectedUserData.collections.length})
                </h3>

                {selectedUserData.collections.length === 0 ? (
                  <p className="font-body text-sm text-muted">No collections yet</p>
                ) : (
                  <div className="space-y-2">
                    {selectedUserData.collections.map(col => (
                      <div key={col.id} className="flex items-center justify-between py-2 border-b border-ink/8 last:border-0">
                        <div>
                          <p className="font-body text-sm font-medium text-ink">{col.name}</p>
                          <p className="font-body text-xs text-muted">
                            {col.source_language.toUpperCase()} → {col.target_language.toUpperCase()}
                          </p>
                        </div>
                        <p className="font-body text-sm text-muted">{col.word_count} words</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="card p-10 text-center">
                <p className="font-body text-muted">Click a user to see their details</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}