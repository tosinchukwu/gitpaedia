import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { PrivyProvider } from '@privy-io/react-auth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
<PrivyProvider
  appId={import.meta.env.VITE_PRIVY_APP_ID}
  config={{
    loginMethods: ['wallet', 'google', 'twitter', 'email'],
    appearance: {
      theme: 'light',
      accentColor: '#676FFF',
      logo: '/vite.svg',
    },
    // ✅ Enable guest login
    embeddedWallets: {
      ethereum: { createOnLogin: 'users-without-wallets' }
    },
    // Show "Continue as Guest" option
    showEmail: true,
    // Custom guest login text
    translations: {
      en: {
        login: {
          guest_login: 'Continue as Guest',
        }
      }
    }
  }}
>

      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </PrivyProvider>
  </React.StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}
