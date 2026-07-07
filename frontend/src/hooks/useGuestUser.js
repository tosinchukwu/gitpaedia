import { useState, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'

export function useGuestUser() {
  const { user, authenticated } = usePrivy()
  const [guestId, setGuestId] = useState(null)

  useEffect(() => {
    if (authenticated && user) {
      setGuestId(user.id)
      return
    }

    let id = localStorage.getItem('gitpaedia_guest_id')
    if (!id) {
      id = 'guest_' + Math.random().toString(36).substring(2, 10)
      localStorage.setItem('gitpaedia_guest_id', id)
    }
    setGuestId(id)
  }, [authenticated, user])

  const isGuest = !authenticated || !user

  return { guestId, isGuest, user: user || { id: guestId } }
}
