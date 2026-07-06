import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePrivy } from '@privy-io/react-auth'
import { supabase } from '../lib/supabaseClient'
import level1 from '../content/level1.json'

const levels = { 1: level1 }

export default function Learn() {
  const { level } = useParams()
  const { user } = usePrivy()
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(false)

  const data = levels[level]
  if (!data) return <div>Level not found</div>

  const markComplete = async () => {
  if (!user) return
  setLoading(true)
  // Set the user ID for RLS
  await supabase.rpc('set_privy_user_id', { user_id: user.id })
  const { error } = await supabase
    .from('user_progress')
    .upsert({
      privy_user_id: user.id,
      level_completed: Math.max(parseInt(level), 0),
      updated_at: new Date().toISOString()
    }, { onConflict: 'privy_user_id' })
  setLoading(false)
  if (!error) setCompleted(true)
}

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
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