import { useState, useEffect } from 'react'
import api from '../api'
import toast from 'react-hot-toast'

export default function CreateCollectionModal({ onClose, onCreated }) {
  const [name, setName] = useState('')
  const [sourceLang, setSourceLang] = useState('')
  const [targetLang, setTargetLang] = useState('')
  const [languages, setLanguages] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/translate/languages').then(res => setLanguages(res.data))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (sourceLang === targetLang) {
      toast.error('Source and target languages must be different')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/collections', {
        name,
        source_language: sourceLang,
        target_language: targetLang,
      })
      toast.success('Collection created!')
      onCreated(res.data)
    } catch (err) {
      toast.error('Failed to create collection')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fade-in">
      <div className="card w-full max-w-md p-8 animate-fade-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-semibold text-ink">New Collection</h2>
          <button onClick={onClose} className="text-muted hover:text-ink text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-body text-sm font-medium text-ink/70 mb-1.5">
              Collection name
            </label>
            <input
              className="input"
              placeholder='e.g. "My Kannada Words"'
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-body text-sm font-medium text-ink/70 mb-1.5">
              I am learning
            </label>
            <select
              className="input"
              value={sourceLang}
              onChange={e => setSourceLang(e.target.value)}
              required
            >
              <option value="">Select language...</option>
              {languages.map(l => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-body text-sm font-medium text-ink/70 mb-1.5">
              My native language
            </label>
            <select
              className="input"
              value={targetLang}
              onChange={e => setTargetLang(e.target.value)}
              required
            >
              <option value="">Select language...</option>
              {languages.map(l => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}