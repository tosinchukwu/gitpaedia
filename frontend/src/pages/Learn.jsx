import { useParams } from 'react-router-dom'
import level1 from '../content/level1.json'

export default function Learn() {
  const { level } = useParams()
  const data = level1 // later, load based on level

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{data.title}</h1>
      <div className="prose dark:prose-invert">
        {data.content.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </div>
  )
}
