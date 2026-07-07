import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { usePrivy } from '@privy-io/react-auth'
import { supabase } from '../lib/supabaseClient'
import { useGuestUser } from '../hooks/useGuestUser'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const { login, logout, authenticated, user } = usePrivy()
  const { isGuest } = useGuestUser()
  const [isReturning, setIsReturning] = useState(false)
  const [greeting, setGreeting] = useState('')
  const [profileName, setProfileName] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Helper: truncate wallet address
  const truncateAddress = (address) => {
    if (!address) return ''
    if (address.length <= 12) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Get display name – email, wallet, or fallback
  const getDisplayName = () => {
    if (profileName) return profileName
    if (user?.email) return user.email
    if (user?.wallet?.address) return user.wallet.address
    return 'Guest'
  }

  const displayName = getDisplayName()
  const isWallet = !!user?.wallet?.address && !user?.email && !profileName
  const shortName = isWallet ? truncateAddress(displayName) : displayName

  // Determine time-based greeting
  const getTimeGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    if (hour < 21) return 'Good Evening'
    return 'Good Night'
  }

  // Fetch user progress and profile
  useEffect(() => {
    if (!user && !isGuest) return

    const fetchUserData = async () => {
      try {
        // For guests, check localStorage
        if (isGuest) {
          const progress = JSON.parse(localStorage.getItem('gitpaedia_progress') || '{}')
          const hasProgress = Object.keys(progress).length > 0
          setIsReturning(hasProgress)
          const name = 'Guest'
          if (hasProgress) {
            setGreeting(`Welcome back, ${name}!`)
          } else {
            setGreeting(`${getTimeGreeting()}, ${name}!`)
          }
          return
        }

        // For authenticated users
        await supabase.rpc('set_privy_user_id', { user_id: user.id })

        // Fetch progress
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('level_completed, badges')
          .eq('privy_user_id', user.id)
          .maybeSingle()

        // Fetch custom display name
        const { data: profileData } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('privy_user_id', user.id)
          .maybeSingle()

        if (profileData?.display_name) {
          setProfileName(profileData.display_name)
        }

        const hasProgress = progressData && (progressData.level_completed > 0 || progressData.badges?.length > 0)
        setIsReturning(!!hasProgress)

        const name = profileData?.display_name || getDisplayName()
        if (hasProgress) {
          setGreeting(`Welcome back, ${name}!`)
        } else {
          setGreeting(`${getTimeGreeting()}, ${name}!`)
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err)
        const fallbackName = user?.email || user?.wallet?.address || 'Guest'
        setGreeting(`${getTimeGreeting()}, ${fallbackName}!`)
      }
    }
    fetchUserData()
  }, [user, isGuest])

  return (
    <nav className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <div className="container mx-auto">
        {/* Top row: Logo, Greeting, Mobile toggle */}
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400 shrink-0">
            Gitpaedia
          </Link>

          {/* Greeting - hidden on mobile, visible on tablet+ */}
          {(authenticated || isGuest) && greeting && (
            <span className="hidden md:inline-block text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-[200px] lg:max-w-[300px]">
              {greeting}
            </span>
          )}

          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Greeting on mobile */}
        {(authenticated || isGuest) && greeting && (
          <div className="md:hidden text-center text-sm font-medium text-gray-700 dark:text-gray-200 mt-1 truncate">
            {greeting}
          </div>
        )}

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
            {(authenticated || isGuest) ? (
              <>
                <div className="flex items-center gap-2">
                  {isGuest && (
                    <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full">
                      Guest
                    </span>
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    {displayName}
                  </span>
                </div>
                <Link to="/levels" className="block text-sm text-blue-600 dark:text-blue-400 py-1" onClick={() => setMobileMenuOpen(false)}>
                  Levels
                </Link>
                <Link to="/dashboard" className="block text-sm text-blue-600 dark:text-blue-400 py-1" onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </Link>
                {!isGuest && (
                  <Link to="/profile" className="block text-sm text-blue-600 dark:text-blue-400 py-1" onClick={() => setMobileMenuOpen(false)}>
                    Profile
                  </Link>
                )}
                {isGuest && (
                  <button onClick={() => { login(); setMobileMenuOpen(false) }} className="block w-full text-left text-sm text-green-600 dark:text-green-400 py-1">
                    Save Progress
                  </button>
                )}
                <button
                  onClick={() => {
                    if (isGuest) {
                      localStorage.removeItem('gitpaedia_guest_id')
                      window.location.reload()
                    } else {
                      logout()
                    }
                    setMobileMenuOpen(false)
                  }}
                  className="block w-full text-left text-sm text-red-600 dark:text-red-400 py-1"
                >
                  {isGuest ? 'Exit' : 'Logout'}
                </button>
              </>
            ) : (
              <button
                onClick={() => { login(); setMobileMenuOpen(false) }}
                className="block w-full text-left text-sm text-blue-600 dark:text-blue-400 py-1"
              >
                Login
              </button>
            )}
          </div>
        )}

        {/* Desktop menu */}
        <div className="hidden md:flex items-center justify-end gap-3 mt-2">
          {(authenticated || isGuest) ? (
            <>
              {isGuest && (
                <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full">
                  Guest
                </span>
              )}
              <span className="text-sm text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
                {displayName}
              </span>
              <Link to="/levels" className="text-sm text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap">
                Levels
              </Link>
              <Link to="/dashboard" className="text-sm text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap">
                Dashboard
              </Link>
              {!isGuest && (
                <Link to="/profile" className="text-sm text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap">
                  Profile
                </Link>
              )}
              {isGuest && (
                <button onClick={login} className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition whitespace-nowrap">
                  Save Progress
                </button>
              )}
              <button
                onClick={() => {
                  if (isGuest) {
                    localStorage.removeItem('gitpaedia_guest_id')
                    window.location.reload()
                  } else {
                    logout()
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1.5 rounded-lg transition whitespace-nowrap"
              >
                {isGuest ? 'Exit' : 'Logout'}
              </button>
            </>
          ) : (
            <button
              onClick={login}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1.5 rounded-lg transition whitespace-nowrap"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
