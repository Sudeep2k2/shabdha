import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import CollectionPage from './pages/CollectionPage'
import QuizPage from './pages/QuizPage'
import StatsPage from './pages/StatsPage'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-paper flex items-center justify-center">
      <div className="text-muted font-body">Loading...</div>
    </div>
  )
  return user ? children : <Navigate to="/login" />
}

export default function App() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/collection/:id" element={<PrivateRoute><CollectionPage /></PrivateRoute>} />
      <Route path="/quiz/:id" element={<PrivateRoute><QuizPage /></PrivateRoute>} />
      <Route path="/stats/:id" element={<PrivateRoute><StatsPage /></PrivateRoute>} />
    </Routes>
  )
}