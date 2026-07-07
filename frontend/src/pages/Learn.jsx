import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePrivy } from '@privy-io/react-auth'
import { supabase } from '../lib/supabaseClient'
import { useGuestUser } from '../hooks/useGuestUser'
import GuestBanner from '../components/GuestBanner'
import level1 from '../content/level1.json'
import level2 from '../content/level2.json'

const levels = { 
  1: level1,
  2: level2,
  // 3: level3,
  // 4: level4,
  // 5: level5
}

export default function Learn() {
  const { level } = useParams()
  const { user } = usePrivy()
  const { isGuest } = useGuestUser()
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(false)

  const data = levels[level]
  if (!data) return <div>Level not found</div>

  // Check if level is already completed (guest or auth)
  useEffect(() => {
    const checkCompletion = async () => {
      if (isGuest) {
        const progress = JSON.parse(localStorage.getItem('gitpaedia_progress') || '{}')
        if (progress[`level_${level}`]?.completed) {
          setCompleted(true)
        }
        return
      }
      
      if (!user) return
      try {
        await supabase.rpc('set_privy_user_id', { user_id: user.id })
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('level_completed')
          .eq('privy_user_id', user.id)
          .maybeSingle()
        if (progressData && progressData.level_completed >= parseInt(level)) {
          setCompleted(true)
        }
      } catch (err) {
        console.error('Failed to check completion:', err)
      }
    }
    checkCompletion()
  }, [level, user, isGuest])

  const markComplete = async () => {
    if (!user && !isGuest) return
    setLoading(true)

    // Guest – save to localStorage
    if (isGuest) {
      const progress = JSON.parse(localStorage.getItem('gitpaedia_progress') || '{}')
      progress[`level_${level}`] = { 
        completed: true, 
        updated_at: new Date().toISOString() 
      }
      localStorage.setItem('gitpaedia_progress', JSON.stringify(progress))
      setCompleted(true)
      setLoading(false)
      return
    }

    // Authenticated – save to Supabase
    try {
      await supabase.rpc('set_privy_user_id', { user_id: user.id })
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          privy_user_id: user.id,
          level_completed: Math.max(parseInt(level), 0),
          updated_at: new Date().toISOString()
        }, { onConflict: 'privy_user_id' })
      if (error) throw error
      setCompleted(true)
    } catch (err) {
      console.error('Failed to save progress:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <GuestBanner />
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <h1 className="text-3xl font-bold">{data.title}</h1>
          <p className="text-blue-100 mt-2">{data.description}</p>
        </div>
        <div className="p-6 space-y-6">
          {data.sections.map((section, idx) => (
            <div key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{section.heading}</h2>
              <p className="text-gray-700 dark:text-gray-300 mt-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: section.content }} />
            </div>
          ))}
        </div>
        <div className="p-6 bg-gray-50 dark:bg-gray-900 flex flex-wrap gap-4 justify-between items-center">
          <div>
            {completed ? (
              <span className="text-green-600 font-semibold">✅ Level completed!</span>
            ) : (
              <button
                onClick={markComplete}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition"
              >
                {loading ? 'Saving...' : 'Mark as Complete'}
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <Link to={`/quiz/${level}`} className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg transition">
              Take Quiz
            </Link>
            <Link to={`/practice/${level}`} className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-lg transition">
              Practice
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
