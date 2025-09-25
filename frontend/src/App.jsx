import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import AddData from './pages/AddData';
import PredictionHistory from './pages/PredictionHistory';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import { useState, useEffect } from 'react'
import './App.css'

// Layout Components
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'

// Protected Route Component
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in (from localStorage or session)
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <Router>
      <div className="app">
        <Header user={user} onLogout={logout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage onLogin={login} />} />
            <Route path="/signup" element={<SignupPage onLogin={login} />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute user={user}>
                <Dashboard user={user} />
              </ProtectedRoute>
            } />
            <Route path="/add-data" element={
              <ProtectedRoute user={user}>
                <AddData user={user} />
              </ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute user={user}>
                <PredictionHistory user={user} />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute user={user}>
                <Reports user={user} />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute user={user}>
                <Profile user={user} onUpdateUser={setUser} />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
