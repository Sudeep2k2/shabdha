import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api'
import Navbar from '../components/Navbar'
import AddWordModal from '../components/AddWordModal'
import WordCard from '../components/WordCard'

export default function CollectionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [collection, setCollection] = useState(null)
  const [words, setWords] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const fetchWords = useCallback(async (q = '') => {
    try {
      const res = await api.get(`/words/${id}`, { params: q ? { search: q } : {} })
      setWords(res.data)
    } catch {
      toast.error('Failed to load words')
    }
  }, [id])

  useEffect(() => {
    const init = async () => {
      try {
        const [colRes] = await Promise.all([
          api.get(`/collections/${id}`),
          fetchWords(),
        ])
        setCollection(colRes.data)
      } catch {
        toast.error('Collection not found')
        navigate('/')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [id])

  useEffect(() => {
    const timer = setTimeout(() => fetchWords(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  if (loading) return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="flex items-center justify-center py-32 text-muted font-body">Loading...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="font-body text-sm text-muted hover:text-accent mb-4 flex items-center gap-1 transition-colors"
          >
            ← Back
          </button>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="font-display text-4xl font-bold text-ink">{collection.name}</h1>
              <p className="font-body text-muted mt-1">
                {collection.source_language.toUpperCase()} → {collection.target_language.toUpperCase()}
                <span className="mx-2">·</span>
                {words.length} word{words.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigate(`/stats/${id}`)} className="btn-secondary text-sm">Stats</button>
              <button onClick={() => navigate(`/quiz/${id}`)} className="btn-secondary text-sm">Quiz</button>
              <button onClick={() => setShowModal(true)} className="btn-primary text-sm">+ Add word</button>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <input
            className="input"
            placeholder="Search words..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {words.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-2xl text-ink/30 mb-2">
              {search ? 'No words found' : 'No words yet'}
            </p>
            <p className="font-body text-muted text-sm">
              {search ? 'Try a different search' : 'Add your first word to get started'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {words.map((word, i) => (
              <WordCard
                key={word.id}
                word={word}
                index={i}
                collection={collection}
                onDeleted={(wordId) => setWords(words.filter(w => w.id !== wordId))}
                onUpdated={(updated) => setWords(words.map(w => w.id === updated.id ? updated : w))}
              />
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <AddWordModal
          collection={collection}
          onClose={() => setShowModal(false)}
          onAdded={(word) => { setWords([word, ...words]); setShowModal(false) }}
        />
      )}
    </div>
  )
}