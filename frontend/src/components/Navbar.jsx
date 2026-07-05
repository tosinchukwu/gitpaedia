import { Link } from 'react-router-dom'
import { usePrivy } from '@privy-io/react-auth'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const { login, logout, authenticated, user } = usePrivy()

  return (
    <nav className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          Gitpaedia
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {authenticated ? (
            <>
              <span className="text-sm">{user?.email || user?.wallet?.address}</span>
              <button onClick={logout} className="btn-secondary">Logout</button>
            </>
          ) : (
            <button onClick={login} className="btn-primary">Login</button>
          )}
        </div>
      </div>
    </nav>
  )
}
