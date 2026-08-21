import React from "react";
import { Edit } from "lucide-react";
import { convert_hh_mm_ss_to_hh_mm } from "@/core/utils/dateFormat";
import { Button } from "@/ui/components/forms";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import type { CandidateInterviewData, InterviewRouteCandidate } from "@/features/hireSpace/jobOpening/models/CandidateInterviewModel";
import {
  addHourToTime,
  getInterviewCandidateName,
  getInterviewRoleName,
  getInterviewTime,
} from "@/features/hireSpace/jobOpening/utils/interviewSchedule";

interface InterviewDetailsCardProps {
  interview: CandidateInterviewData;
  canAction: boolean;
  routeCandidate?: InterviewRouteCandidate | null;
  routeCandidateId?: number;
  onEdit: (interview: CandidateInterviewData) => void;
}

export const InterviewDetailsCard = React.memo<InterviewDetailsCardProps>(({
  interview,
  canAction,
  routeCandidate,
  routeCandidateId,
  onEdit,
}) => {
  const candidateName = getInterviewCandidateName(interview, routeCandidate, routeCandidateId);
  const roleName = getInterviewRoleName(interview, routeCandidate, routeCandidateId);
  const startTime = getInterviewTime(interview);
  const timeLabel = startTime
    ? `${convert_hh_mm_ss_to_hh_mm(startTime)} - ${convert_hh_mm_ss_to_hh_mm(addHourToTime(startTime))}`
    : "-";

  return (
    <article className="relative rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-[0_1px_1px_rgba(15,23,42,0.02)] transition hover:border-blue-200 hover:shadow-sm">
      {canAction && (
        <div className="absolute right-2 top-2">
          <Button
            onClick={() => onEdit(interview)}
            aria-label={`Edit ${candidateName} interview`}
            title="Edit"
            color="transparent"
            isborderRadius
            size="sm"
          >
            <Edit className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      )}

      <Button
        type="button"
        onClick={() => onEdit(interview)}
        color="transparent"
        fullWidth
        className="block pr-7 text-left"
        style={{ height: "auto", padding: 0, justifyContent: "flex-start" }}
      >
        <div className="grid w-full grid-cols-1 gap-3 text-left">
          <FieldItem
            label="Time"
            value={
              <span className="text-sm font-semibold leading-5 text-[#075DE7]">
                {timeLabel}
              </span>
            }
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FieldItem label="Candidate" value={candidateName} />
            <FieldItem label="Position" value={roleName} />
          </div>
          <FieldItem label="Interviewer" value={interview.InterviewPanelName?.trim() || "-"} />
        </div>
      </Button>
    </article>
  );
});

InterviewDetailsCard.displayName = "InterviewDetailsCard";
