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

// ✅ Shuffle function
const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function Quiz() {
  const { level } = useParams()
  const { user } = usePrivy()
  const { isGuest } = useGuestUser()
  const data = levels[level]
  if (!data) return <div>Quiz not found</div>

  // ✅ Shuffle questions when component mounts
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [answered, setAnswered] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setQuestions(shuffleArray(data.quiz))
  }, [data.quiz])

  const handleOptionClick = (idx) => {
    if (answered) return
    setSelected(idx)
    setAnswered(true)
    if (idx === questions[current].correct) {
      setScore(score + 1)
    }
  }

  const handleNext = async () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1)
      setSelected(null)
      setAnswered(false)
    } else {
      // Quiz finished – save progress
      if (isGuest) {
        const progress = JSON.parse(localStorage.getItem('gitpaedia_progress') || '{}')
        const badges = JSON.parse(localStorage.getItem('gitpaedia_badges') || '[]')
        if (!badges.includes(data.badgeName)) {
          badges.push(data.badgeName)
        }
        progress[`level_${level}`] = { 
          completed: true, 
          score: score,
          updated_at: new Date().toISOString()
        }
        localStorage.setItem('gitpaedia_progress', JSON.stringify(progress))
        localStorage.setItem('gitpaedia_badges', JSON.stringify(badges))
      } else if (user) {
        setSaving(true)
        try {
          await supabase.rpc('set_privy_user_id', { user_id: user.id })

          const { data: currentProgress } = await supabase
            .from('user_progress')
            .select('badges, total_xp')
            .eq('privy_user_id', user.id)
            .maybeSingle()

          const existingBadges = currentProgress?.badges || []
          const existingXP = currentProgress?.total_xp || 0

          const newBadges = existingBadges.includes(data.badgeName)
            ? existingBadges
            : [...existingBadges, data.badgeName]

          const newXP = existingXP + score * 10

          await supabase
            .from('user_progress')
            .upsert({
              privy_user_id: user.id,
              badges: newBadges,
              total_xp: newXP,
              updated_at: new Date().toISOString()
            }, { onConflict: 'privy_user_id' })

        } catch (err) {
          console.error('Failed to save quiz result:', err)
        } finally {
          setSaving(false)
        }
      }
      setShowResult(true)
    }
  }

  if (questions.length === 0) return <div className="text-center p-8">Loading quiz...</div>

  if (showResult) {
    const passed = score >= questions.length * 0.6
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl text-center">
        <GuestBanner />
        <h2 className="text-3xl font-bold mb-4">Quiz Complete!</h2>
        <p className="text-xl">You scored {score} out of {questions.length}</p>
        {passed ? (
          <div className="mt-4 text-green-600">
            🎉 Congratulations! You earned the <strong>{data.badgeName}</strong> badge!
          </div>
        ) : (
          <div className="mt-4 text-red-600">
            Keep learning and try again!
          </div>
        )}
        {saving && <p className="text-sm text-gray-500 mt-2">Saving progress...</p>}
        {isGuest && (
          <p className="text-xs text-yellow-600 mt-2">💡 Connect a wallet to save your progress permanently!</p>
        )}
        <Link
          to={`/learn/${level}`}
          className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition"
        >
          Back to Lesson
        </Link>
      </div>
    )
  }

  const q = questions[current]
  return (
    <div className="max-w-3xl mx-auto p-4">
      <GuestBanner />
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Question {current+1} of {questions.length}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Score: {score}
          </span>
        </div>
        <h2 className="text-2xl font-semibold mb-4">{q.question}</h2>
        <div className="space-y-3">
          {q.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleOptionClick(idx)}
              className={`w-full text-left p-3 rounded-lg border transition ${
                selected === idx
                  ? idx === q.correct
                    ? 'bg-green-100 border-green-500 dark:bg-green-900 dark:border-green-400'
                    : 'bg-red-100 border-red-500 dark:bg-red-900 dark:border-red-400'
                  : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              disabled={answered}
            >
              {opt}
            </button>
          ))}
        </div>
        {answered && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-sm">
            <strong>Explanation:</strong> {q.explanation}
          </div>
        )}
        {answered && current < questions.length - 1 && (
          <button
            onClick={handleNext}
            className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition"
          >
            Next Question
          </button>
        )}
        {answered && current === questions.length - 1 && (
          <button
            onClick={handleNext}
            className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition"
          >
            See Results
          </button>
        )}
      </div>
    </div>
  )
}
