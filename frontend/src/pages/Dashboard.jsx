import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { supabase } from '../lib/supabaseClient'
import { useGuestUser } from '../hooks/useGuestUser'
import GuestBanner from '../components/GuestBanner'

export default function Dashboard() {
  const { user } = usePrivy()
  const { isGuest } = useGuestUser()
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isGuest) {
      // Guest – load from localStorage
      const progressData = JSON.parse(localStorage.getItem('gitpaedia_progress') || '{}')
      const badges = JSON.parse(localStorage.getItem('gitpaedia_badges') || '[]')
      const completedLevels = Object.keys(progressData).filter(k => progressData[k].completed).length
      setProgress({
        level_completed: completedLevels,
        badges: badges,
        total_xp: completedLevels * 50,
        streak: 0
      })
      setLoading(false)
      return
    }

    if (!user) {
      setLoading(false)
      return
    }

    const fetchProgress = async () => {
      try {
        await supabase.rpc('set_privy_user_id', { user_id: user.id })
        const { data, error } = await supabase
          .from('user_progress')
          .select('*')
          .eq('privy_user_id', user.id)
          .maybeSingle()
        if (!error && data) setProgress(data)
      } catch (err) {
        console.error('Failed to fetch progress:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProgress()
  }, [user, isGuest])

  if (loading) return <div className="text-center p-8">Loading...</div>
  if (!user && !isGuest) return <div className="text-center p-8">Please log in to see your progress.</div>

  return (
    <div className="max-w-4xl mx-auto p-4">
      <GuestBanner />
      <h1 className="text-3xl font-bold mb-6 text-center">Your Dashboard</h1>
      
      {isGuest && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 mb-6 text-center">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            📌 Your progress is saved locally. Connect a wallet or social account to save permanently!
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 text-center">
          <div className="text-5xl mb-2">🏆</div>
          <h3 className="text-lg font-semibold">Level</h3>
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{progress?.level_completed || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 text-center">
          <div className="text-5xl mb-2">⭐</div>
          <h3 className="text-lg font-semibold">XP</h3>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{progress?.total_xp || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 text-center">
          <div className="text-5xl mb-2">🔥</div>
          <h3 className="text-lg font-semibold">Streak</h3>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{progress?.streak || 0} days</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 text-center">
          <div className="text-5xl mb-2">🎖️</div>
          <h3 className="text-lg font-semibold">Badges</h3>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {progress?.badges?.length > 0 ? (
              progress.badges.map((b, i) => <span key={i} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">{b}</span>)
            ) : (
              <span className="text-gray-500">None yet</span>
            )}
          </div>
        </div>
      </div>
      
      {!isGuest && (
        <div className="mt-8 text-center">
          <button
            onClick={async () => {
              if (confirm('Are you sure you want to delete all your progress?')) {
                await supabase.rpc('set_privy_user_id', { user_id: user.id })
                await supabase.from('user_progress').delete().eq('privy_user_id', user.id)
                window.location.reload()
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg transition"
          >
            Delete My Data
          </button>
        </div>
      )}
    </div>
  )
}
