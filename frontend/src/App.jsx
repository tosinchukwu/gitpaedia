import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { usePrivy } from '@privy-io/react-auth'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Learn from './pages/Learn'
import Quiz from './pages/Quiz'
import Practice from './pages/Practice'
import Levels from './pages/Levels'
import Profile from './pages/Profile'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const { ready, authenticated } = usePrivy()

  if (!ready) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <BrowserRouter>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/levels"
            element={
              <ProtectedRoute>
                <Levels />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learn/:level"
            element={
              <ProtectedRoute>
                <Learn />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/:level"
            element={
              <ProtectedRoute>
                <Quiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice/:level"
            element={
              <ProtectedRoute>
                <Practice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
