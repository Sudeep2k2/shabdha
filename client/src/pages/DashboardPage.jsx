import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api'
import Navbar from '../components/Navbar'
import CreateCollectionModal from '../components/CreateCollectionModal'

export default function DashboardPage() {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()

  const fetchCollections = async () => {
    try {
      const res = await api.get('/collections')
      setCollections(res.data)
    } catch {
      toast.error('Failed to load collections')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCollections() }, [])

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!confirm('Delete this collection and all its words?')) return
    try {
      await api.delete(`/collections/${id}`)
      setCollections(collections.filter(c => c.id !== id))
      toast.success('Collection deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold text-ink">My Collections</h1>
            <p className="font-body text-muted mt-1">Each collection is a language you're learning</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            + New collection
          </button>
        </div>

        {loading ? (
          <div className="text-muted font-body text-center py-20">Loading...</div>
        ) : collections.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-2xl text-ink/30 mb-2">No collections yet</p>
            <p className="font-body text-muted text-sm">Create your first collection to start learning</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {collections.map((col, i) => (
              <div
                key={col.id}
                onClick={() => navigate(`/collection/${col.id}`)}
                className="card p-6 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-ink">{col.name}</h2>
                    <p className="font-body text-sm text-muted mt-0.5">
                      {col.source_language.toUpperCase()} → {col.target_language.toUpperCase()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, col.id)}
                    className="text-muted hover:text-accent text-xs font-body transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="font-display text-2xl font-bold text-ink">{col.word_count}</p>
                    <p className="font-body text-xs text-muted">words</p>
                  </div>
                  {col.due_count > 0 && (
                    <div className="text-center">
                      <p className="font-display text-2xl font-bold text-accent">{col.due_count}</p>
                      <p className="font-body text-xs text-muted">due today</p>
                    </div>
                  )}
                </div>

                {col.due_count > 0 && (
                  <div className="mt-4">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/quiz/${col.id}`) }}
                      className="w-full text-center font-body text-sm font-medium text-accent border border-accent/30 rounded-lg py-2 hover:bg-accent hover:text-white transition-all duration-200"
                    >
                      Review {col.due_count} word{col.due_count > 1 ? 's' : ''}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <CreateCollectionModal
          onClose={() => setShowModal(false)}
          onCreated={(newCol) => {
            setCollections([newCol, ...collections])
            setShowModal(false)
          }}
        />
      )}
    </div>
  )
}