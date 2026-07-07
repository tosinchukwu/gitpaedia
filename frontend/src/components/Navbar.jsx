// frontend/src/components/Navbar.jsx
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
  }, [user, isGuest]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <nav className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400 shrink-0">
          Gitpaedia
        </Link>

        {/* Greeting */}
        {(authenticated || isGuest) && greeting && (
          <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200 truncate max-w-[150px] sm:max-w-[300px] text-center order-last sm:order-none w-full sm:w-auto mt-1 sm:mt-0">
            {greeting}
          </span>
        )}

        {/* Right side - User actions */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
          <ThemeToggle />

          {(authenticated || isGuest) ? (
            <>
              {/* Guest badge */}
              {isGuest && (
                <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full">
                  Guest
                </span>
              )}

              {/* User info - desktop */}
              <span className="text-sm hidden sm:inline-block text-gray-700 dark:text-gray-300 max-w-[120px] truncate md:max-w-[200px]">
                {displayName}
              </span>

              {/* User info - mobile */}
              <span className="text-sm sm:hidden text-gray-700 dark:text-gray-300 max-w-[80px] truncate">
                {shortName}
              </span>

              {/* Navigation Links */}
              <Link
                to="/levels"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
              >
                Levels
              </Link>

              {!isGuest && (
                <Link
                  to="/profile"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
                >
                  Profile
                </Link>
              )}

              <Link
                to="/dashboard"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
              >
                Dashboard
              </Link>

              {/* Guest save button */}
              {isGuest && (
                <button
                  onClick={login}
                  className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition whitespace-nowrap"
                >
                  Save Progress
                </button>
              )}

              {/* Logout / Guest exit */}
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
