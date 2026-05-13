import './App.css'
import { Footer, MainContent, Navbar } from './layouts'

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-secondary-soft">
      <Navbar />
      <div className="pt-16 flex-1">
        <MainContent />
      </div>
      <Footer />
    </div>
  )
}

export default App
