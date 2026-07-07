import { useState, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { supabase } from '../lib/supabaseClient'

export default function Profile() {
  const { user } = usePrivy()
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // Fetch current profile
  useEffect(() => {
    if (!user) return
    const fetchProfile = async () => {
      try {
        // ✅ Set RLS session variable before query
        await supabase.rpc('set_privy_user_id', { user_id: user.id })
        
        const { data } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('privy_user_id', user.id)
          .maybeSingle()
          
        if (data?.display_name) {
          setDisplayName(data.display_name)
        } else {
          // Prefill with email or wallet address as default
          setDisplayName(user.email || user.wallet?.address || '')
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [user])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!user || !displayName.trim()) return
    setSaving(true)
    setMessage('')
    try {
      // ✅ Set RLS session variable before upsert
      await supabase.rpc('set_privy_user_id', { user_id: user.id })
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          privy_user_id: user.id,
          display_name: displayName.trim(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'privy_user_id' })
        
      if (error) throw error
      setMessage('✅ Display name updated!')
    } catch (err) {
      setMessage('❌ Failed to save: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center p-8">Loading...</div>

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
      <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name or nickname"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white"
            required
          />
          <p className="text-xs text-gray-500 mt-1">This name will appear in greetings and your dashboard.</p>
        </div>
        {message && <p className="text-sm">{message}</p>}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
        >
          {saving ? 'Saving...' : 'Save Display Name'}
        </button>
      </form>
    </div>
  )
}
