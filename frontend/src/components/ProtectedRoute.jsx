import { Navigate } from 'react-router-dom'
import { usePrivy } from '@privy-io/react-auth'

export default function ProtectedRoute({ children }) {
  const { authenticated } = usePrivy()
  return authenticated ? children : <Navigate to="/" replace />
}
