import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api'
import Navbar from '../components/Navbar'

function StatBox({ label, value, sub, color = 'text-ink' }) {
  return (
    <div className="card p-6 text-center animate-fade-up">
      <p className={`font-display text-4xl font-bold ${color}`}>{value}</p>
      <p className="font-body text-sm font-medium text-ink/70 mt-1">{label}</p>
      {sub && <p className="font-body text-xs text-muted mt-0.5">{sub}</p>}
    </div>
  )
}

export default function StatsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [collection, setCollection] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [colRes, statsRes] = await Promise.all([
          api.get(`/collections/${id}`),
          api.get(`/quiz/${id}/stats`),
        ])
        setCollection(colRes.data)
        setStats(statsRes.data)
      } catch {
        toast.error('Failed to load stats')
        navigate('/')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-paper"><Navbar />
      <div className="flex items-center justify-center py-32 text-muted font-body">Loading...</div>
    </div>
  )

  const masteryPercent = stats.total_words > 0
    ? Math.round((stats.mastered_count / stats.total_words) * 100)
    : 0

  return (
    <div className="min-h-screen bg-paper"><Navbar />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <button onClick={() => navigate(`/collection/${id}`)} className="font-body text-sm text-muted hover:text-accent mb-4 flex items-center gap-1 transition-colors">
            ← Back
          </button>
          <h1 className="font-display text-4xl font-bold text-ink">{collection.name}</h1>
          <p className="font-body text-muted mt-1">Your progress</p>
        </div>

        {stats.streak > 0 && (
          <div className="card p-5 mb-6 flex items-center gap-4 border-l-4 border-accent animate-fade-up">
            <span className="text-3xl">🔥</span>
            <div>
              <p className="font-display text-2xl font-bold text-ink">{stats.streak} day streak</p>
              <p className="font-body text-sm text-muted">Keep reviewing daily to maintain it</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          <StatBox label="Total words" value={stats.total_words} sub="in this collection" />
          <StatBox label="Due today" value={stats.due_today} sub="words to review" color={stats.due_today > 0 ? 'text-accent' : 'text-sage'} />
          <StatBox label="Mastered" value={stats.mastered_count} sub={`${masteryPercent}% of collection`} color="text-sage" />
          <StatBox label="Still learning" value={stats.learning_count} sub="words in progress" color="text-amber-500" />
        </div>

        <div className="card p-6 mb-6 animate-fade-up">
          <div className="flex justify-between font-body text-sm mb-3">
            <span className="font-medium text-ink">Mastery progress</span>
            <span className="text-muted">{masteryPercent}%</span>
          </div>
          <div className="w-full bg-ink/10 rounded-full h-3">
            <div className="bg-sage h-3 rounded-full transition-all duration-700" style={{ width: `${masteryPercent}%` }} />
          </div>
          <div className="flex justify-between font-body text-xs text-muted mt-2">
            <span>{stats.mastered_count} mastered</span>
            <span>{stats.learning_count} learning</span>
          </div>
        </div>

        <div className="card p-6 animate-fade-up">
          <p className="font-body text-sm font-medium text-ink/70 mb-1">Added this week</p>
          <p className="font-display text-3xl font-bold text-ink">{stats.added_this_week}</p>
          <p className="font-body text-xs text-muted mt-1">new words</p>
        </div>

        {stats.due_today > 0 && (
          <button onClick={() => navigate(`/quiz/${id}`)} className="btn-primary w-full mt-6">
            Start review — {stats.due_today} word{stats.due_today > 1 ? 's' : ''} due
          </button>
        )}
      </main>
    </div>
  )
}