import React from "react"
import type { Stage } from "@/features/hireSpace/jobOpening/models/CandidateModel"
import NoDataView from "@/ui/components/NoDataView/NoDataView"
import TooltipText from "@/ui/components/Tooltip/TooltipText"
import { Button } from "@/ui/components/forms"

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
}) => (
  <aside className="flex flex-col rounded-lg bg-white p-4">
    <h2 className="shrink-0 pb-3 text-base font-semibold text-[#292D32]">Stages</h2>

    {stages.length === 0 ? (
      <NoDataView message="No stages available" />
    ) : (
      <div>
        {stages.map((stage) => {
          const selected = selectedStageId === stage.id
          const stageCount = counts[stage.id] ?? 0

          return (
            <div key={stage.id} className="border-b border-[#EEF0F3] py-1 last:border-b-0">
              <Button
                color={selected ? "blue" : "transparent"}
                colorMode={selected ? "extraLight" : undefined}
                fullWidth
                onClick={() => onStageChange(stage.id)}
              >
                <span className="flex w-full min-w-0 flex-1 items-center justify-between gap-3 text-left">
                  <span className="min-w-0 flex-1 text-left text-sm font-medium">
                    <TooltipText text={stage.name || "-"} maxWidth="100%" tooltipThreshold={18} isApplyBgTextColor />
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-medium leading-none ${
                      selected ? "bg-white text-[#135BEC]" : "bg-[#E7EFFA] text-[#6B7C93]"
                    }`}
                  >
                    {stageCount}
                  </span>
                </span>
              </Button>
            </div>
          )
        })}
      </div>
    )}
  </aside>
)

export default CandidateStageSidebar
