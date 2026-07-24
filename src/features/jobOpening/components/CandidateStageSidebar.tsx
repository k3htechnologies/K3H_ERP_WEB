import TooltipText from "@/ui/components/Tooltip/TooltipText";
import type { Stage } from "../models/JobRoleModel";

interface CandidateStageSidebarProps {
  stages: Stage[];
  counts: Record<string, number>;
  selectedStageId: string;
  onStageChange: (stageId: string) => void;
}

const CandidateStageSidebar = ({ stages, counts, selectedStageId, onStageChange }: CandidateStageSidebarProps) => (
  <aside className="min-h-0 overflow-hidden rounded-[6px] bg-white px-3 py-3 shadow-[0_1px_4px_rgba(15,23,42,0.03)] lg:h-full lg:px-[15px] lg:pb-0 lg:pt-[13px]">
    <h2 className="mb-2 text-base font-medium leading-[15px] text-[#24262D] lg:mb-[15px]">Stages</h2>
    <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0">
      {stages.map((stage) => {
        const selected = selectedStageId === stage.id;

        return (
          <button
            type="button"
            key={stage.id}
            aria-pressed={selected}
            onClick={() => onStageChange(stage.id)}
            className={`flex h-[44px] min-w-[150px] items-center justify-between gap-2 rounded-[3px] px-3 text-sm leading-6 transition-all lg:h-[50px] lg:w-full lg:min-w-0 lg:rounded-none lg:text-base ${
              selected
                ? "bg-[#2563EB] font-medium text-white shadow-sm lg:rounded-[3px]"
                : "border-b border-[#ECEEF2] text-[#656B78] last:border-0 hover:bg-gray-50"
            }`}
          >
            <div className="min-w-0 flex-1 text-left">
              <TooltipText
                text={stage.name}
                maxWidth="100%"
                tooltipThreshold={12}
                isApplyBgTextColor
                tooltipClassName="text-left whitespace-nowrap"
              />
            </div>
            <span className={`shrink-0 px-1 text-[10px] ${selected ? "text-white" : "text-gray-400"}`}>
              {(counts[stage.id] ?? 0).toLocaleString()}
            </span>
          </button>
        );
      })}
    </div>
  </aside>
);

export default CandidateStageSidebar;
