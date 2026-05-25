import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import KnowledgeBase from './pages/KnowledgeBase'
import Incidents from './pages/Incidents'

export default function App() {
  return (
    <Router>
      <div className="flex h-screen bg-safety-bg font-inter overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-6">
            <Routes>
              <Route path="/"          element={<Dashboard />}    />
              <Route path="/chat"      element={<Chat />}         />
              <Route path="/knowledge" element={<KnowledgeBase />} />
              <Route path="/incidents" element={<Incidents />}    />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}
