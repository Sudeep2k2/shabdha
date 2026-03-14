import { useState } from 'react'
import api from '../api'
import toast from 'react-hot-toast'
import AddWordModal from './AddWordModal'

export default function WordCard({ word, index, onDeleted, onUpdated, collection }) {
  const [expanded, setExpanded] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!confirm('Delete this word?')) return
    try {
      await api.delete(`/words/word/${word.id}`)
      onDeleted(word.id)
      toast.success('Word deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <>
      <div
        className="card px-5 py-4 cursor-pointer hover:shadow-md transition-all duration-200 animate-fade-up"
        style={{ animationDelay: `${index * 40}ms` }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="min-w-0">
              <p className="font-display text-lg font-semibold text-ink truncate">{word.source_word}</p>
              <p className="font-body text-sm text-muted truncate">{word.translation}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-4 shrink-0">
            {word.mastered && (
              <span className="font-body text-xs text-sage bg-sage/10 px-2 py-0.5 rounded-full">
                mastered
              </span>
            )}
            {word.tags?.length > 0 && (
              <span className="font-body text-xs text-muted bg-ink/5 px-2 py-0.5 rounded-full">
                {word.tags[0]}{word.tags.length > 1 ? ` +${word.tags.length - 1}` : ''}
              </span>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setShowEdit(true) }}
              className="text-muted hover:text-ink text-xs transition-colors"
            >
              edit
            </button>
            <button
              onClick={handleDelete}
              className="text-muted hover:text-accent text-xs transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-ink/8 space-y-2 animate-fade-in">
            {word.example_sentence && (
              <div>
                <p className="font-body text-xs font-medium text-muted uppercase tracking-wider mb-1">Example</p>
                <p className="font-body text-sm text-ink/80 italic">"{word.example_sentence}"</p>
              </div>
            )}
            {word.notes && (
              <div>
                <p className="font-body text-xs font-medium text-muted uppercase tracking-wider mb-1">Notes</p>
                <p className="font-body text-sm text-ink/80">{word.notes}</p>
              </div>
            )}
            {word.tags?.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {word.tags.map(tag => (
                  <span key={tag} className="font-body text-xs text-muted bg-ink/5 px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <p className="font-body text-xs text-muted">
              Next review: {word.next_review ? new Date(word.next_review).toLocaleDateString() : 'Today'}
            </p>
          </div>
        )}
      </div>

      {showEdit && (
        <AddWordModal
          collection={collection}
          editWord={word}
          onClose={() => setShowEdit(false)}
          onAdded={(updated) => {
            onUpdated(updated)
            setShowEdit(false)
          }}
        />
      )}
    </>
  )
}