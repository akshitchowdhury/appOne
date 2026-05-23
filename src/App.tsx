import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ArchDiagram from './components/ArchDiagram'
import TabPanel from './components/TabPanel'
import './App.css'

const TABS = ['Architecture', 'Phase Breakdown', 'Stack Details', 'Live Flow']

export default function App() {
  const [activeTab, setActiveTab] = useState(0)
  const [activeNode, setActiveNode] = useState<string | null>(null)

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-badge">AWS · EC2 · React</div>
        <h1 className="app-title">Cloud Deployment Architecture</h1>
        <p className="app-subtitle">
          How this React app is built, deployed, and served from an AWS EC2 instance
        </p>
      </header>

      <nav className="tab-nav">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            className={`tab-btn${activeTab === i ? ' active' : ''}`}
            onClick={() => setActiveTab(i)}
          >
            {tab}
            {activeTab === i && <motion.span className="tab-underline" layoutId="tab-underline" />}
          </button>
        ))}
      </nav>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.22 }}
          className="tab-content"
        >
          {activeTab === 0 && (
            <ArchDiagram activeNode={activeNode} setActiveNode={setActiveNode} />
          )}
          {activeTab !== 0 && (
            <TabPanel tab={activeTab} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
