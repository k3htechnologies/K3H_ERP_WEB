import React, { useMemo } from "react"
import type { Stage } from "@/features/hireSpace/jobOpening/models/CandidateModel"
import NoDataView from "@/ui/components/NoDataView/NoDataView"
import Tabs, { type TabItem } from "@/ui/components/Tab/Tab"

interface CandidateStageSidebarProps {
  stages: Stage[]
  counts: Record<string, number>
  selectedStageId: string
  onStageChange: (stageId: string) => void
}

export const CandidateStageSidebar: React.FC<CandidateStageSidebarProps> = ({
  stages,
  counts,
  selectedStageId,
  onStageChange,
}) => {
  const stageTabs = useMemo<TabItem[]>(
    () =>
      stages.map((stage) => ({
        id: stage.id,
        label: stage.name || "-",
        count: counts[stage.id] ?? 0,
      })),
    [counts, stages],
  )

  return (
    <aside className="flex flex-col rounded-lg bg-white p-4">
      <h2 className="shrink-0 pb-3 text-base font-semibold text-[#292D32]">Stages</h2>

      {stages.length === 0 ? (
        <NoDataView message="No stages available" />
      ) : (
        <Tabs
          tabs={stageTabs}
          defaultActive={selectedStageId}
          isvertical
          onTabChange={(tab) => onStageChange(tab.id)}
        />
      )}
    </aside>
  )
}

export default CandidateStageSidebar
