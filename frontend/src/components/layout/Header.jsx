import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import './Header.css'

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    onLogout()
    navigate('/')
    setIsMobileMenuOpen(false)
  }

  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link'
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="logo">
          <div className="logo-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#gradient)" />
              <path d="M8 12L16 8L24 12V20C24 22.2091 22.2091 24 20 24H12C9.79086 24 8 22.2091 8 20V12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 8V16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#667eea" />
                  <stop offset="1" stopColor="#764ba2" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="logo-text">ReturnPredict</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          {user ? (
            <>
              <Link to="/dashboard" className={isActive('/dashboard')}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                Dashboard
              </Link>
              <Link to="/add-data" className={isActive('/add-data')}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Data
              </Link>
              <Link to="/history" className={isActive('/history')}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3v5h5M3.05 13a9 9 0 1 0 1.5-5.5" />
                </svg>
                History
              </Link>
              <Link to="/reports" className={isActive('/reports')}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                Reports
              </Link>
            </>
          ) : (
            <>
              <Link to="/" className={isActive('/')}>Home</Link>
              <Link to="/login" className={isActive('/login')}>Login</Link>
              <Link to="/signup" className={isActive('/signup')}>Sign Up</Link>
            </>
          )}
        </nav>

        {/* User Menu */}
        {user && (
          <div className="user-menu">
            <div className="user-avatar">
              <span>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
            </div>
            <div className="user-dropdown">
              <div className="user-info">
                <p className="user-name">{user.name || 'User'}</p>
                <p className="user-email">{user.email}</p>
              </div>
              <div className="dropdown-divider"></div>
              <Link to="/profile" className="dropdown-item">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Profile & Settings
              </Link>
              <button onClick={handleLogout} className="dropdown-item logout-btn">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16,17 21,12 16,7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        )}

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          {user ? (
            <>
              <div className="mobile-user-info">
                <div className="user-avatar small">
                  <span>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                </div>
                <div>
                  <p className="user-name">{user.name || 'User'}</p>
                  <p className="user-email">{user.email}</p>
                </div>
              </div>
              <div className="mobile-nav-divider"></div>
              <Link to="/dashboard" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                Dashboard
              </Link>
              <Link to="/add-data" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Data
              </Link>
              <Link to="/history" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3v5h5M3.05 13a9 9 0 1 0 1.5-5.5" />
                </svg>
                History
              </Link>
              <Link to="/reports" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                Reports
              </Link>
              <Link to="/profile" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Profile
              </Link>
              <div className="mobile-nav-divider"></div>
              <button onClick={handleLogout} className="mobile-nav-item logout-btn">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16,17 21,12 16,7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
              <Link to="/login" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
              <Link to="/signup" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}

export default Header