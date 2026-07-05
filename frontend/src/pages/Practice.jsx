import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'

export default function Practice() {
  const { level } = useParams()
  const [command, setCommand] = useState('')
  const [output, setOutput] = useState([])
  const [files, setFiles] = useState(['README.md'])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!command.trim()) return
    const cmd = command.trim()
    let response = ''
    const lower = cmd.toLowerCase()

    if (lower === 'git init') {
      response = '✅ Initialized empty Git repository in /practice/.git'
      setFiles([...files, '.git'])
    } else if (lower === 'git status') {
      response = 'On branch main\nNo commits yet\nUntracked files: README.md'
    } else if (lower === 'git add readme.md' || lower === 'git add .') {
      response = '✅ Changes staged for commit'
    } else if (lower.startsWith('git commit -m')) {
      response = `✅ [main (root-commit)] ${cmd.slice(15)} \n 1 file changed, 1 insertion(+)`
    } else if (lower === 'git log') {
      response = 'commit abc123 (HEAD -> main)\nAuthor: You <you@example.com>\nDate: Today\n    Initial commit'
    } else if (lower === 'git branch') {
      response = '* main'
    } else if (lower === 'git checkout -b new-branch') {
      response = '✅ Switched to a new branch "new-branch"'
    } else if (lower === 'ls') {
      response = files.join('  ')
    } else if (lower === 'help') {
      response = 'Available commands: git init, git status, git add <file>, git commit -m "message", git log, git branch, git checkout -b <branch>, ls, help'
    } else {
      response = `❌ Command not found: ${cmd}`
    }

    setOutput([...output, { cmd, response }])
    setCommand('')
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold mb-4">Practice Terminal</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Type Git commands below. Try: <code>git init</code>, <code>git status</code>, etc.</p>
        <div className="bg-gray-900 text-white rounded-lg p-4 font-mono text-sm h-64 overflow-y-auto mb-4">
          {output.map((item, i) => (
            <div key={i} className="mb-2">
              <span className="text-green-400">$ {item.cmd}</span>
              <pre className="text-gray-300 whitespace-pre-wrap">{item.response}</pre>
            </div>
          ))}
          {output.length === 0 && <div className="text-gray-500">Welcome to the Git simulator. Type a command to start.</div>}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Type a Git command..."
            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white"
            autoFocus
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            Run
          </button>
        </form>
        <div className="mt-4 flex gap-2 text-sm">
          <Link to={`/learn/${level}`} className="text-blue-600 dark:text-blue-400 hover:underline">Back to Lesson</Link>
        </div>
      </div>
    </div>
  )
}