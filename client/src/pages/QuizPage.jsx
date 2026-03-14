import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api'
import Navbar from '../components/Navbar'

export default function QuizPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [collection, setCollection] = useState(null)
  const [words, setWords] = useState([])
  const [current, setCurrent] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const [done, setDone] = useState(false)
  const [results, setResults] = useState({ easy: 0, hard: 0, forgot: 0 })

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/quiz/${id}/due`)
        setCollection(res.data.collection)
        setWords(res.data.due_words)
        if (res.data.due_words.length === 0) setDone(true)
      } catch {
        toast.error('Failed to load quiz')
        navigate('/')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const handleRate = async (rating) => {
    const word = words[current]
    try {
      await api.post(`/quiz/review/${word.id}`, { rating })
      setResults(prev => ({ ...prev, [rating]: prev[rating] + 1 }))
      if (current + 1 >= words.length) {
        setDone(true)
      } else {
        setFlipped(false)
        setTimeout(() => setCurrent(current + 1), 100)
      }
    } catch {
      toast.error('Failed to save review')
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-paper"><Navbar />
      <div className="flex items-center justify-center py-32 text-muted font-body">Loading...</div>
    </div>
  )

  if (done) return (
    <div className="min-h-screen bg-paper"><Navbar />
      <div className="max-w-lg mx-auto px-6 py-20 text-center animate-fade-up">
        <div className="text-5xl mb-6">🎉</div>
        <h1 className="font-display text-4xl font-bold text-ink mb-2">
          {words.length === 0 ? 'All caught up!' : 'Session complete!'}
        </h1>
        <p className="font-body text-muted mb-8">
          {words.length === 0 ? 'No words due today. Come back tomorrow!' : `You reviewed ${words.length} word${words.length > 1 ? 's' : ''}`}
        </p>
        {words.length > 0 && (
          <div className="card p-6 mb-8 flex justify-around">
            <div className="text-center">
              <p className="font-display text-3xl font-bold text-sage">{results.easy}</p>
              <p className="font-body text-sm text-muted">Easy</p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl font-bold text-amber-500">{results.hard}</p>
              <p className="font-body text-sm text-muted">Hard</p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl font-bold text-accent">{results.forgot}</p>
              <p className="font-body text-sm text-muted">Forgot</p>
            </div>
          </div>
        )}
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate(`/collection/${id}`)} className="btn-secondary">Back to collection</button>
          <button onClick={() => navigate('/')} className="btn-primary">Dashboard</button>
        </div>
      </div>
    </div>
  )

  const word = words[current]
  const progress = (current / words.length) * 100

  return (
    <div className="min-h-screen bg-paper"><Navbar />
      <main className="max-w-lg mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="flex justify-between font-body text-sm text-muted mb-2">
            <span>{collection?.name}</span>
            <span>{current} / {words.length}</span>
          </div>
          <div className="w-full bg-ink/10 rounded-full h-1.5">
            <div className="bg-accent h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div
          className="card p-10 min-h-64 flex flex-col items-center justify-center cursor-pointer select-none mb-6 hover:shadow-lg transition-shadow duration-200 animate-fade-up"
          onClick={() => setFlipped(!flipped)}
        >
          {!flipped ? (
            <div className="text-center">
              <p className="font-body text-xs text-muted uppercase tracking-widest mb-4">
                {collection?.source_language.toUpperCase()} — tap to reveal
              </p>
              <p className="font-display text-4xl font-bold text-ink">{word.source_word}</p>
              {word.example_sentence && (
                <p className="font-body text-sm text-muted mt-4 italic">"{word.example_sentence}"</p>
              )}
            </div>
          ) : (
            <div className="text-center animate-fade-in">
              <p className="font-body text-xs text-muted uppercase tracking-widest mb-4">
                {collection?.target_language.toUpperCase()} — meaning
              </p>
              <p className="font-display text-4xl font-bold text-ink">{word.translation}</p>
              {word.notes && <p className="font-body text-sm text-muted mt-4">{word.notes}</p>}
            </div>
          )}
        </div>

        {flipped ? (
          <div className="grid grid-cols-3 gap-3 animate-fade-up">
            <button onClick={() => handleRate('forgot')} className="card py-4 text-center hover:border-accent/40 hover:shadow-md transition-all duration-200">
              <p className="font-display text-2xl mb-1">😟</p>
              <p className="font-body text-sm font-medium text-accent">Forgot</p>
              <p className="font-body text-xs text-muted">review tomorrow</p>
            </button>
            <button onClick={() => handleRate('hard')} className="card py-4 text-center hover:border-amber-400/40 hover:shadow-md transition-all duration-200">
              <p className="font-display text-2xl mb-1">😅</p>
              <p className="font-body text-sm font-medium text-amber-500">Hard</p>
              <p className="font-body text-xs text-muted">review soon</p>
            </button>
            <button onClick={() => handleRate('easy')} className="card py-4 text-center hover:border-sage/40 hover:shadow-md transition-all duration-200">
              <p className="font-display text-2xl mb-1">😊</p>
              <p className="font-body text-sm font-medium text-sage">Easy</p>
              <p className="font-body text-xs text-muted">review later</p>
            </button>
          </div>
        ) : (
          <p className="text-center font-body text-sm text-muted">Tap the card to reveal the meaning</p>
        )}

        <button onClick={() => navigate(`/collection/${id}`)} className="w-full text-center font-body text-sm text-muted hover:text-accent mt-8 transition-colors">
          End session
        </button>
      </main>
    </div>
  )
}