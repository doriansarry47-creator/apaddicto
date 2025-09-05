import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          Apaddicto - Application de Thérapie Sportive
        </h1>
        <div className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">
            Application thérapeutique d'activité physique adaptée pour patients en addictologie 
            avec suivi des cravings et outils de régulation émotionnelle
          </p>
          <div className="flex items-center justify-center space-x-4">
            <button 
              onClick={() => setCount((count) => count + 1)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Count is {count}
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            Build successful! Application is ready for development.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App