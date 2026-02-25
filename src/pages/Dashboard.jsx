import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import CreditCounter from '../components/dashboard/CreditCounter'
import UploadZone from '../components/dashboard/UploadZone'
import RecommendationCard from '../components/dashboard/RecommendationCard'
import RecommendationChat from '../components/dashboard/RecommendationChat'
import NewVisualizationFlow from '../components/dashboard/NewVisualizationFlow'
import HistoryList from '../components/dashboard/HistoryList'

export default function Dashboard() {
  const [chatOpen, setChatOpen] = useState(false)
  const [flowOpen, setFlowOpen] = useState(false)

  return (
    <>
      <div className="pt-20 pb-24 px-4">
        <div className="max-w-lg mx-auto space-y-6">
          <CreditCounter />
          <UploadZone onStart={() => setFlowOpen(true)} />
          <RecommendationCard onClick={() => setChatOpen(true)} />
          <HistoryList limit={3} />
        </div>
      </div>

      <AnimatePresence>
        {chatOpen && <RecommendationChat open={chatOpen} onClose={() => setChatOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {flowOpen && <NewVisualizationFlow open={flowOpen} onClose={() => setFlowOpen(false)} />}
      </AnimatePresence>
    </>
  )
}
