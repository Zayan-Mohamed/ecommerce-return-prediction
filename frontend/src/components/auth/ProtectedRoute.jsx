import { Navigate, useLocation } from 'react-router-dom'

const ProtectedRoute = ({ children, user }) => {
  const location = useLocation()

  if (!user) {
    // Redirect to login page with return URL
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute