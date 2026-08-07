import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { Button } from "@/ui/components/forms";
import type { Stage } from "../models/JobOpeningModel";

interface CandidateStageSidebarProps {
  stages: Stage[];
  counts: Record<string, number>;
  selectedStageId: string;
  onStageChange: (stageId: string) => void;
}

export const CandidateStageSidebar: React.FC<CandidateStageSidebarProps> = ({ stages, counts, selectedStageId, onStageChange }) => (
  <aside className="min-h-0 overflow-hidden rounded-[6px] border border-gray-200 bg-white px-3 py-3 shadow-[0_1px_4px_rgba(15,23,42,0.03)] lg:h-full lg:px-[15px] lg:pb-0 lg:pt-[13px]">
    <h2 className="mb-2 text-base font-medium leading-[15px] text-[#24262D] lg:mb-[15px]">Stages</h2>
    <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0">
      {stages.map((stage) => {
        const selected = selectedStageId === stage.id;

        return (
          <Button
            type="button"
            key={stage.id}
            aria-pressed={selected}
            onClick={() => onStageChange(stage.id)}
            color="transparent"
            className={`min-w-[150px] rounded-[3px] !text-sm leading-6 transition-all lg:w-full lg:min-w-0 lg:rounded-none lg:!text-base ${
              selected
                ? "bg-[#2563EB] font-medium text-white shadow-sm lg:rounded-[3px]"
                : "border-b border-[#ECEEF2] text-[#656B78] last:border-0 hover:!bg-gray-50"
            }`}
            style={{
              height: "auto",
              padding: 0,
              backgroundColor: selected ? "#2563EB" : "transparent",
              color: selected ? "#FFFFFF" : "#656B78",
              fontWeight: selected ? 500 : "inherit",
            }}
          >
            <div className="flex h-[44px] w-full items-center justify-between gap-2 px-3 lg:h-[50px]">
              <div className="min-w-0 flex-1 text-left">
                <TooltipText
                  text={stage.name}
                  maxWidth="100%"
                  tooltipThreshold={12}
                  isApplyBgTextColor
                  tooltipClassName="text-left whitespace-nowrap"
                />
              </div>
              <span className={`shrink-0 px-1 text-xs ${selected ? "text-white" : "text-gray-400"}`}>
                {(counts[stage.id] ?? 0).toLocaleString()}
              </span>
            </div>
          </Button>
        );
      })}
    </div>
  </aside>
);

export default CandidateStageSidebar;
