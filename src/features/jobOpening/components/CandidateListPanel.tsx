import React from "react";
import { Briefcase, Building, Calendar, CheckCircle2, Download } from "lucide-react";
import { getNameInitials } from "@/core/utils/getNameInitials";
import PaginationCard from "@/ui/components/Card/PaginationCard";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { Button } from "@/ui/components/forms";
import type { CandidateData } from "@/features/jobOpening/models/CandidateModel";
import {
  formatCandidateDate,
  getCandidateCompany,
  getCandidateExperienceLabel,
  getCandidateName,
  getCandidatePhoto,
  getCandidateResumeUrl,
  getCandidateRole,
  getCandidateStatus,
  getCandidateStatusClass,
  STATUS_TO_API_VALUE,
} from "@/features/jobOpening/utils/candidateApplication";

interface CandidateListPanelProps {
  candidates: CandidateData[];
  selectedCandidateId: number | null;
  onCandidateSelect: (candidateId: number) => void;
}

export const CandidateListPanel: React.FC<CandidateListPanelProps> = ({
  candidates,
  selectedCandidateId,
  onCandidateSelect,
}) => (
  <section className="flex min-h-0 min-w-0 flex-col rounded-lg bg-white p-4 lg:h-full">
    <h2 className="shrink-0 pb-3 text-base font-semibold text-[#292D32]">
      Candidates
    </h2>

    <div className="min-h-0 flex-1">
      <PaginationCard
        data={candidates}
        rowKey="CandidateId"
        selectedRowKey={selectedCandidateId}
        onRowClick={(candidate: CandidateData) => onCandidateSelect(Number(candidate.CandidateId) || 0)}
        emptyMessage="No candidates match this filter"
        maxHeight="100%"
        header={(candidate: CandidateData) => {
          const name = getCandidateName(candidate);
          const photoUrl = getCandidatePhoto(candidate);
          const resumeUrl = getCandidateResumeUrl(candidate);
          const status = getCandidateStatus(candidate);
          const hasAvatar = Boolean(photoUrl && photoUrl !== "-");
          const hasResume = Boolean(resumeUrl);

          return (
            <div className="p-3">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {hasAvatar ? (
                    <img
                      src={photoUrl}
                      alt={name}
                      className="h-10 w-10 shrink-0 rounded-full border border-gray-300 object-cover"
                    />
                  ) : (
                    <div
                      role="img"
                      aria-label={name || "Candidate"}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-600 text-sm font-semibold text-white"
                    >
                      {getNameInitials(name)}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <TooltipText
                      text={name}
                      maxWidth="100%"
                      tooltipThreshold={18}
                      isApplyBgTextColor
                    />
                    <TooltipText
                      text={getCandidateRole(candidate)}
                      maxWidth="100%"
                      tooltipThreshold={22}
                    />
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium uppercase ${getCandidateStatusClass(
                    status,
                  )}`}
                >
                  {STATUS_TO_API_VALUE[status]}
                </span>
              </div>

              <div className="mb-3 border-t border-[#D8DCE5]" />

              <div className="grid grid-cols-2 gap-3">
                <span className="flex min-w-0 items-center gap-2 text-[#606775]">
                  <Briefcase className="h-3 w-3 shrink-0" />
                  {getCandidateExperienceLabel(candidate)}
                </span>
                <span className="flex min-w-0 items-center gap-2 text-[#606775]">
                  <Building className="h-3 w-3 shrink-0" />
                  {getCandidateCompany(candidate)}
                </span>
                <span className="flex min-w-0 items-center gap-2 text-[#606775]">
                  <Calendar className="h-3 w-3 shrink-0" />
                  {formatCandidateDate(candidate.CreatedDate)}
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 font-semibold text-blue-600">
                    <CheckCircle2 className="h-3 w-3" />
                    -
                  </span>
                  <Button
                    type="button"
                    aria-label={`Download ${name}'s resume`}
                    title={
                      hasResume ? "Download resume" : "Resume not available"
                    }
                    color="transparent"
                    size="sm"
                    isborderRadius
                    disabled={!hasResume}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (hasResume) {
                        window.open(
                          resumeUrl,
                          "_blank",
                          "noopener,noreferrer",
                        );
                      }
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        }}
      />
    </div>
  </section>
);

export default CandidateListPanel;
