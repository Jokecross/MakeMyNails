import { useTranslation } from 'react-i18next'
import HistoryList from '../components/dashboard/HistoryList'

export default function HistoryPage() {
  const { t } = useTranslation()
  return (
    <div className="pt-20 pb-24 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="font-heading text-3xl font-bold text-brown mb-6">{t('historyPage.title')}</h1>
        <HistoryList />
      </div>
    </div>
  )
}
