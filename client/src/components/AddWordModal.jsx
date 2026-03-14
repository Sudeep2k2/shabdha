import { useState, useEffect, useRef } from 'react'
import api from '../api'
import toast from 'react-hot-toast'

const TAGS = ['food', 'travel', 'greetings', 'work', 'family', 'numbers', 'nature', 'other']

export default function AddWordModal({ collection, onClose, onAdded, editWord = null }) {
  const [sourceWord, setSourceWord] = useState(editWord?.source_word || '')
  const [translation, setTranslation] = useState(editWord?.translation || '')
  const [example, setExample] = useState(editWord?.example_sentence || '')
  const [notes, setNotes] = useState(editWord?.notes || '')
  const [selectedTags, setSelectedTags] = useState(editWord?.tags || [])
  const [translating, setTranslating] = useState(false)
  const [loading, setLoading] = useState(false)
  const translateTimer = useRef(null)

  useEffect(() => {
    if (!sourceWord.trim() || editWord) return

    clearTimeout(translateTimer.current)
    translateTimer.current = setTimeout(async () => {
      setTranslating(true)
      try {
        const res = await api.get('/translate', {
          params: {
            word: sourceWord.trim(),
            from: collection.source_language,
            to: collection.target_language,
          },
        })
        setTranslation(res.data.translation)
      } catch {
        // Silently fail — user can type manually
      } finally {
        setTranslating(false)
      }
    }, 600)

    return () => clearTimeout(translateTimer.current)
  }, [sourceWord])

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      let res
      if (editWord) {
        res = await api.put(`/words/word/${editWord.id}`, {
          source_word: sourceWord,
          translation,
          example_sentence: example,
          tags: selectedTags,
          notes,
        })
        toast.success('Word updated!')
      } else {
        res = await api.post(`/words/${collection.id}`, {
          source_word: sourceWord,
          translation,
          example_sentence: example,
          tags: selectedTags,
          notes,
        })
        toast.success('Word added!')
      }
      onAdded(res.data)
    } catch {
      toast.error('Failed to save word')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fade-in">
      <div className="card w-full max-w-lg p-8 animate-fade-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-semibold text-ink">
            {editWord ? 'Edit word' : 'Add word'}
          </h2>
          <button onClick={onClose} className="text-muted hover:text-ink text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-body text-sm font-medium text-ink/70 mb-1.5">
              Word in {collection.source_language.toUpperCase()}
            </label>
            <input
              className="input"
              placeholder="Type the word you learned..."
              value={sourceWord}
              onChange={e => setSourceWord(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block font-body text-sm font-medium text-ink/70 mb-1.5">
              Meaning in {collection.target_language.toUpperCase()}
              {translating && (
                <span className="ml-2 text-xs text-accent animate-pulse">translating...</span>
              )}
            </label>
            <input
              className="input"
              placeholder="Translation will appear here..."
              value={translation}
              onChange={e => setTranslation(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-body text-sm font-medium text-ink/70 mb-1.5">
              Example sentence <span className="text-muted font-normal">(optional)</span>
            </label>
            <input
              className="input"
              placeholder="Use it in a sentence..."
              value={example}
              onChange={e => setExample(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-body text-sm font-medium text-ink/70 mb-2">
              Tags <span className="text-muted font-normal">(optional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`font-body text-xs px-3 py-1.5 rounded-full border transition-all duration-150 ${
                    selectedTags.includes(tag)
                      ? 'bg-accent text-white border-accent'
                      : 'border-ink/15 text-muted hover:border-accent/40'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-body text-sm font-medium text-ink/70 mb-1.5">
              Personal notes <span className="text-muted font-normal">(optional)</span>
            </label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Memory tricks, context, anything..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving...' : editWord ? 'Save changes' : 'Add word'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}