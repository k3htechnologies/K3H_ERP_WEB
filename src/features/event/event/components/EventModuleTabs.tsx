import React from 'react'
import { useNavigate } from 'react-router-dom'
import Tabs from '@/ui/components/Tab/Tab'
import { EVENT_TAB_LIST } from '@/features/event/event/constants/eventConstants'

interface EventModuleTabsProps {
  activeTab: string
  className?: string
}

export const EventModuleTabs: React.FC<EventModuleTabsProps> = ({
  activeTab,
  className = 'mb-4 w-full max-w-[520px]',
}) => {
  const navigate = useNavigate()

  const handleTabChange = (tabId: string) => {
    if (tabId === activeTab) return

    if (tabId === 'All') {
      navigate('/event')
      return
    }
    if (tabId === 'Task') {
      navigate('/task')
      return
    }
    if (tabId === 'Meeting') {
      navigate('/meeting')
      return
    }
    if (tabId === 'Conference') {
      navigate('/conference')
    }
  }

  return (
    <div className={className}>
      <Tabs
        tabs={EVENT_TAB_LIST}
        defaultActive={activeTab}
        islarge
        onTabChange={(tab) => handleTabChange(tab.id)}
      />
    </div>
  )
}
