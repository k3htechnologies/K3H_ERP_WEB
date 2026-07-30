import { Briefcase, Building, Calendar, CheckCircle2, Download } from "lucide-react";
import { Button } from "@/ui/components/forms";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import type { Candidate } from "../models/JobOpeningModel";
import { getCandidateAvatarUrl, getCandidateStatusClass, STATUS_TO_API_VALUE } from "../utils/candidateApplication";

interface CandidateListPanelProps {
  candidates: Candidate[];
  selectedCandidateId: string | null;
  isLoading: boolean;
  onCandidateSelect: (candidateId: string) => void;
}

export const CandidateListPanel: React.FC<CandidateListPanelProps> = ({ candidates, selectedCandidateId, isLoading, onCandidateSelect }) => (
  <section className="flex h-[500px] min-h-0 min-w-0 flex-col overflow-hidden rounded-[6px] bg-white p-[15px] shadow-[0_1px_4px_rgba(15,23,42,0.03)] lg:h-full">
    <h2 className="mb-[13px] text-[14px] font-medium leading-[100%] tracking-[1px] text-[#7B838D]">Candidates</h2>

    <div className="thin-scroll min-h-0 flex-1 space-y-[14px] overflow-y-auto pr-1">
      {isLoading ? (
        <p className="py-10 text-xs text-gray-400">Loading candidates...</p>
      ) : candidates.length === 0 ? (
        <NoDataView
          message="No candidates match this filter"
          className="py-10"
        />
      ) : (
        candidates.map((candidate) => {
          const selected = candidate.id === selectedCandidateId;

          return (
            <article
              key={candidate.id}
              className={`relative rounded-[7px] transition-all ${
                selected
                  ? "border border-[#D1E0FF] border-l-4 border-l-[#1E3A8A] bg-[#F4F7FF] shadow-sm"
                  : "border border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <Button
                type="button"
                aria-pressed={selected}
                onClick={() => onCandidateSelect(candidate.id)}
                color="transparent"
                variant="outline"
                fullWidth
                className="w-full text-left"
                style={{ height: "auto", padding: 0, justifyContent: "stretch", border: "none", backgroundColor: "transparent", color: "inherit" }}
              >
                <div className="block w-full p-[14px] text-left">
                  <div className="mb-[11px] flex items-start justify-between gap-2.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="h-[38px] w-[38px] flex-shrink-0 overflow-hidden rounded-full border bg-gray-100">
                        <img src={getCandidateAvatarUrl(candidate)} alt={candidate.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <TooltipText
                          text={candidate.name}
                          maxWidth="100%"
                          tooltipThreshold={18}
                          isApplyBgTextColor
                          tooltipClassName="text-base font-medium leading-[24px] text-[#202229]"
                        />
                        <TooltipText
                          text={candidate.role}
                          maxWidth="100%"
                          tooltipThreshold={22}
                          isApplyBgTextColor
                          tooltipClassName="mt-0.5 text-base font-normal leading-[24px] text-[#697386]"
                        />
                      </div>
                    </div>
                    <span
                      className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-medium uppercase ${getCandidateStatusClass(
                        candidate.status,
                      )}`}
                    >
                      {STATUS_TO_API_VALUE[candidate.status]}
                    </span>
                  </div>

                  <div className="mb-[10px] border-t border-[#D8DCE5]" />

                  <div className="grid grid-cols-2 gap-x-3 gap-y-2 pr-7 text-xs font-normal text-[#606775]">
                    <span className="flex min-w-0 items-center gap-2">
                      <Briefcase className="h-3 w-3 flex-shrink-0" />
                      <TooltipText text={candidate.experience} maxWidth="100%" tooltipThreshold={12} isApplyBgTextColor />
                    </span>
                    <span className="flex min-w-0 items-center gap-2">
                      <Building className="h-3 w-3 flex-shrink-0" />
                      <TooltipText text={candidate.company} maxWidth="100%" tooltipThreshold={14} isApplyBgTextColor />
                    </span>
                    <span className="flex min-w-0 items-center gap-2">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <TooltipText
                        text={`Applied: ${candidate.appliedDate}`}
                        maxWidth="100%"
                        tooltipThreshold={18}
                        isApplyBgTextColor
                      />
                    </span>
                    <span className="flex items-center gap-2 font-semibold text-blue-600">
                      <CheckCircle2 className="h-3 w-3" />
                      {candidate.matchScore}% Match
                    </span>
                  </div>
                </div>
              </Button>

              <Button
                type="button"
                aria-label={`Download ${candidate.name}'s resume`}
                title="Download resume"
                color="transparent"
                size="xs"
                defineWidth
                onClick={() => {
                  if (candidate.ResumeUrl) {
                    window.open(candidate.ResumeUrl, "_blank", "noopener,noreferrer");
                  } else {
                    window.alert("Resume not available");
                  }
                }}
                className="absolute bottom-[10px] right-[10px] rounded-md bg-blue-50 p-1 text-blue-600"
                style={{ backgroundColor: "#EFF6FF", color: "#2563EB" }}
              >
                <Download className="h-3.5 w-3.5" />
              </Button>
            </article>
          );
        })
      )}
    </div>
  </section>
);

export default CandidateListPanel;
