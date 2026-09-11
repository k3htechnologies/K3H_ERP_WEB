import React from 'react';
import { Edit, Eye } from 'lucide-react';
import { convert_hh_mm_ss_to_hh_mm } from '@/core/utils/dateFormat';
import { getNameInitials } from '@/core/utils/getNameInitials';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { Button } from '@/ui/components/forms';
import type { CandidateInterviewData } from '@/features/hireSpace/jobOpening/models/CandidateInterviewModel';

interface InterviewDetailsPanelProps {
  heading: string;
  interviewCount: number;
  interviews: CandidateInterviewData[];
  emptyMessage: string;
  canAction: boolean;
  isViewOnly: boolean;
  onEdit: (interview: CandidateInterviewData) => void;
  onView: (interview: CandidateInterviewData) => void;
  onViewAll: () => void;
  showViewAllButton: boolean;
  className?: string;
}

export const InterviewDetailsPanel: React.FC<InterviewDetailsPanelProps> = ({
  heading,
  interviewCount,
  interviews,
  emptyMessage,
  canAction,
  isViewOnly,
  onEdit,
  onView,
  onViewAll,
  showViewAllButton,
  className = '',
}) => {
  return (
    <section className={`flex min-w-0 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white p-4 ${className}`}>
      <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900">{heading}</h2>
        <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium uppercase leading-none text-blue-600">
          {interviewCount} {interviewCount === 1 ? 'Interview' : 'Interviews'}
        </span>
      </div>

      <div className="thin-scroll min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {interviews.length === 0 ? (
          <NoDataView message={emptyMessage} />
        ) : (
          interviews.map((interview) => {
            const candidateName = interview.CandidateName || '-';
            const roleName = interview.RoleName || '-';
            const interviewerName = interview.InterviewPanelName || '-';

            return (
              <div
                key={interview.InterviewId}
                className="rounded-lg border border-gray-200 bg-white px-4 py-3 transition-colors hover:border-blue-300 hover:bg-gray-50"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold ">
                    {convert_hh_mm_ss_to_hh_mm(interview.InterviewTime || '')}
                  </span>
                  {canAction && (
                    isViewOnly ? (
                      <Button
                        color="transparent"
                        size="sm"
                        isborderRadius
                        title="View"
                        onClick={() => onView(interview)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        color="transparent"
                        size="sm"
                        isborderRadius
                        title="Edit"
                        onClick={() => onEdit(interview)}
                      >
                        <Edit className="h-4 w-4 text-blue-700" />
                      </Button>
                    )
                  )}
                </div>

                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-xs font-bold text-blue-700">
                    {interview.Photograph ? (
                      <img
                        src={interview.Photograph}
                        alt={candidateName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      getNameInitials(candidateName)
                    )}
                  </span>
                  <div className="min-w-0">
                    <TooltipText
                      text={candidateName}
                      maxWidth="100%"
                      tooltipThreshold={22}
                      isApplyBgTextColor
                      tooltipClassName="text-base font-semibold text-gray-900"
                    />
                    <TooltipText
                      text={roleName}
                      maxWidth="100%"
                      tooltipThreshold={28}
                      tooltipClassName="text-sm text-gray-500"
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-600 text-xs font-semibold text-white">
                    {getNameInitials(interviewerName)}
                  </div>
                  <span className="text-sm text-gray-500">
                    Interviewer: <span className="text-gray-600">{interviewerName}</span>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showViewAllButton && (
        <div className="mt-4 shrink-0">
          <Button onClick={onViewAll} color="blue" fullWidth>
            View All Interviews
          </Button>
        </div>
      )}
    </section>
  );
};
