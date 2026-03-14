import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Signed out')
    navigate('/login')
  }

  return (
    <nav className="border-b border-ink/8 bg-card px-6 py-4 flex items-center justify-between">
      <button onClick={() => navigate('/')} className="font-display text-2xl font-bold text-ink hover:text-accent transition-colors">
        Shabdha
      </button>
      <button
        onClick={handleLogout}
        className="font-body text-sm text-muted hover:text-accent transition-colors"
      >
        Sign out
      </button>
    </nav>
  )
}