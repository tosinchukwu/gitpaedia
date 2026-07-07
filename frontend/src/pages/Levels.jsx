import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { usePrivy } from '@privy-io/react-auth'
import { supabase } from '../lib/supabaseClient'

const levelsData = [
  { id: 1, title: 'Git Foundations', description: 'Learn the basics of Git – commits, staging, and history.', icon: '🌱', badge: 'Git Novice' },
  { id: 2, title: 'Branching & Merging', description: 'Create branches, switch between them, and merge changes.', icon: '🌿', badge: 'Branch Master' },
  { id: 3, title: 'Remote Repositories', description: 'Work with GitHub, push, pull, and clone.', icon: '☁️', badge: 'Remote Explorer' },
  { id: 4, title: 'Advanced Git', description: 'Rebasing, cherry-picking, stashing, and more.', icon: '⚡', badge: 'Git Ninja' },
  { id: 5, title: 'Git Workflows', description: 'Git Flow, GitHub Flow, and collaboration best practices.', icon: '🚀', badge: 'Workflow Architect' }
]

export default function Levels() {
  const { user } = usePrivy()
  const [completedLevels, setCompletedLevels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    const fetchProgress = async () => {
      try {
        await supabase.rpc('set_privy_user_id', { user_id: user.id })
        const { data } = await supabase
          .from('user_progress')
          .select('level_completed')
          .eq('privy_user_id', user.id)
          .maybeSingle()
        if (data) {
          const completed = []
          for (let i = 1; i <= data.level_completed; i++) {
            completed.push(i)
          }
          setCompletedLevels(completed)
        }
      } catch (err) {
        console.error('Failed to fetch progress:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProgress()
  }, [user])

  const isLevelUnlocked = (levelId) => {
    if (levelId === 1) return true
    return completedLevels.includes(levelId - 1)
  }

  if (loading) return <div className="text-center p-8">Loading levels...</div>

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Choose Your Level</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {levelsData.map((level) => {
          const unlocked = isLevelUnlocked(level.id)
          const completed = completedLevels.includes(level.id)
          return (
            <div
              key={level.id}
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition ${
                unlocked ? 'hover:shadow-2xl' : 'opacity-60'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{level.icon}</span>
                <h2 className="text-2xl font-bold">{level.title}</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{level.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                  Badge: {level.badge}
                </span>
                {completed && (
                  <span className="text-green-600 font-semibold text-sm">✅ Completed</span>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                {unlocked ? (
                  <>
                    <Link
                      to={`/learn/${level.id}`}
                      className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition text-sm"
                    >
                      Learn
                    </Link>
                    <Link
                      to={`/quiz/${level.id}`}
                      className="flex-1 text-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition text-sm"
                    >
                      Quiz
                    </Link>
                    <Link
                      to={`/practice/${level.id}`}
                      className="flex-1 text-center bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition text-sm"
                    >
                      Practice
                    </Link>
                  </>
                ) : (
                  <span className="text-sm text-gray-500 w-full text-center py-2">
                    🔒 Complete Level {level.id - 1} to unlock
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
