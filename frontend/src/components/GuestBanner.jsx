import { usePrivy } from '@privy-io/react-auth'

export default function GuestBanner() {
  const { login, authenticated } = usePrivy()

  if (authenticated) return null

  return (
    <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 mb-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm text-yellow-800 dark:text-yellow-200">
          🧑‍💻 You're browsing as a guest. Your progress won't be saved if you clear your browser data.
        </span>
        <button
          onClick={login}
          className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm px-4 py-1.5 rounded-lg transition"
        >
          Connect Wallet / Social
        </button>
      </div>
    </div>
  )
}
