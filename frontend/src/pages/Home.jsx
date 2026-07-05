import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to Gitpaedia</h1>
      <p className="text-lg mb-8">Learn Git from zero to hero – interactively.</p>
      <Link to="/learn/1" className="btn-primary">Start Learning</Link>
    </div>
  )
}
