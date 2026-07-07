// frontend/src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom'
import { usePrivy } from '@privy-io/react-auth'
import { useGuestUser } from '../hooks/useGuestUser'

export default function ProtectedRoute({ children }) {
  const { authenticated } = usePrivy()
  const { isGuest } = useGuestUser()

  // Allow if authenticated OR is a guest
  return (authenticated || isGuest) ? children : <Navigate to="/" replace />
}
