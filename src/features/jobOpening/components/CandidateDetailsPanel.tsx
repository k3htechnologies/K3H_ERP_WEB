import React, { useEffect, useState } from "react";
import { Calendar, Edit } from "lucide-react";
import { getNameInitials } from "@/core/utils/getNameInitials";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import Tabs, { type TabItem } from "@/ui/components/Tab/Tab";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { Button, Input } from "@/ui/components/forms";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import type {
  CandidateApplicationTimelineData,
  CandidateData,
  CandidateDetailsTab,
  CandidateRemarkData,
  CandidateStatus,
} from "@/features/jobOpening/models/CandidateModel";
import {
  formatCandidateDate,
  getCandidateCompany,
  getCandidateEmail,
  getCandidateExperienceLabel,
  getCandidateLocation,
  getCandidateName,
  getCandidatePhoto,
  getCandidateRole,
  getCandidateSkills,
  getCandidateStatus,
  getRemarkAuthor,
  STAGE_OPTIONS,
} from "@/features/jobOpening/utils/candidateApplication";

const CANDIDATE_DETAILS_TABS: TabItem[] = [
  { id: "Overview", label: "Overview" },
  { id: "Remark", label: "Remark" },
  { id: "Timeline", label: "Timeline" },
];

interface CandidateDetailsPanelProps {
  candidate: CandidateData | null;
  activeTab: CandidateDetailsTab;
  visibleRemarks: CandidateRemarkData[];
  timeline: CandidateApplicationTimelineData[];
  remarkText: string;
  editingRemark: CandidateRemarkData | null;
  isLoading: boolean;
  timelineError: string;
  remarkError: string;
  stageUpdateError: string;
  canAction: boolean;
  onTabChange: (tab: CandidateDetailsTab) => void;
  onScheduleInterview: (candidate: CandidateData) => void;
  onRemarkTextChange: (value: string) => void;
  onRemarkSubmit: () => void;
  onRemarkEdit: (remark: CandidateRemarkData) => void;
  onRemarkEditCancel: () => void;
  onStageChange: (status: CandidateStatus) => void;
}

export const CandidateDetailsPanel: React.FC<CandidateDetailsPanelProps> = ({
  candidate,
  activeTab,
  visibleRemarks,
  timeline,
  remarkText,
  editingRemark,
  isLoading,
  timelineError,
  remarkError,
  stageUpdateError,
  canAction,
  onTabChange,
  onScheduleInterview,
  onRemarkTextChange,
  onRemarkSubmit,
  onRemarkEdit,
  onRemarkEditCancel,
  onStageChange,
}) => {
  const [hasImageError, setHasImageError] = useState(false);
  const name = candidate ? getCandidateName(candidate) : "";
  const photoUrl = candidate ? getCandidatePhoto(candidate) : "";
  const hasImage = Boolean(photoUrl && photoUrl !== "-");
  const skills = candidate ? getCandidateSkills(candidate) : [];
  const status = candidate ? getCandidateStatus(candidate) : "NEW";

  useEffect(() => {
    setHasImageError(false);
  }, [photoUrl]);

  return (
    <section className="flex min-h-0 min-w-0 flex-col rounded-lg bg-white p-4 lg:h-full">
      {candidate ? (
        <>
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="shrink-0 px-[15px] pt-[14px]">
              <h2 className="text-sm font-medium tracking-[0.6px] text-[#7B838D]">
                Candidate Details
              </h2>

              <div className="mt-[17px] px-[17px] pb-[17px]">
                <div className="flex min-w-0 items-start gap-3">
                  {!hasImage || hasImageError ? (
                    <div
                      role="img"
                      aria-label={name || "Candidate"}
                      title={name || "-"}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-600 text-sm font-semibold text-white"
                    >
                      {getNameInitials(name)}
                    </div>
                  ) : (
                    <img
                      src={photoUrl}
                      alt={name}
                      className="h-10 w-10 shrink-0 rounded-full border border-gray-300 object-cover"
                      onError={() => setHasImageError(true)}
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    <TooltipText
                      text={name}
                      maxWidth="100%"
                      tooltipThreshold={22}
                      isApplyBgTextColor
                      tooltipClassName="text-xl font-semibold leading-7 text-[#202229]"
                    />
                    <TooltipText
                      text={getCandidateEmail(candidate)}
                      maxWidth="100%"
                      tooltipThreshold={28}
                      isApplyBgTextColor
                      tooltipClassName="mt-0.5 text-xs font-normal leading-[14px] text-[#7B838D]"
                    />
                    <TooltipText
                      text={getCandidateLocation(candidate)}
                      maxWidth="100%"
                      tooltipThreshold={28}
                      isApplyBgTextColor
                      tooltipClassName="text-xs font-normal leading-[14px] text-[#7B838D]"
                    />

                    {canAction && (
                      <Button
                        type="button"
                        onClick={() => onScheduleInterview(candidate)}
                        color="green"
                        colorMode="light"
                        size="xs"
                        rightIcon={<Calendar className="h-3.5 w-3.5" />}
                      >
                        Schedule Interview
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-[#C9CFDD]" />
              <div className="mt-[14px]">
                <Tabs
                  tabs={CANDIDATE_DETAILS_TABS}
                  defaultActive={activeTab}
                  islarge
                  onTabChange={(tab) =>
                    onTabChange(tab.id as CandidateDetailsTab)
                  }
                />
              </div>
            </div>

            <div className="thin-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-[15px] pb-5 pt-5">
              {activeTab === "Overview" && (
                <div>
                  <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2">
                    <FieldItem
                      label="Current Position"
                      value={`${getCandidateRole(candidate)} at ${getCandidateCompany(candidate)}`}
                    />
                    <FieldItem
                      label="Experience"
                      value={getCandidateExperienceLabel(candidate)}
                    />
                    <FieldItem
                      label="Expected Salary"
                      value={
                        candidate.ExpectedSalary != null
                          ? "\u20B9" + Number(candidate.ExpectedSalary).toLocaleString("en-IN")
                          : "-"
                      }
                    />
                    <FieldItem
                      label="Notice Period"
                      value={candidate.NoticePeriod != null ? `${candidate.NoticePeriod} Days` : "-"}
                    />
                  </div>

                  <p className="mb-3 mt-6 text-xs font-normal uppercase leading-4 tracking-[0.3px] text-[#8A8A8A]">
                    Top Skills
                  </p>
                  {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-normal text-[#5D6470]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm font-medium text-[#1D1D1D]">
                      -
                    </span>
                  )}

                  <p className="mb-3 mt-6 text-sm font-normal uppercase leading-4 tracking-[0.3px] text-[#8A8A8A]">
                    Education
                  </p>
                  <div className="rounded-[7px] border border-[#7B838D] bg-[#F9FAFB] p-4">
                    <h4 className="text-sm font-medium text-[#30323A]">
                      {candidate.HighestQualification || "-"}
                    </h4>
                    <p className="mt-1 text-sm font-normal text-[#7B838D]">
                      {candidate.UniversityInstitution || "-"} &bull;{" "}
                      {candidate.GraduationYear || "-"}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "Remark" && (
                <div>
                  {canAction && (
                    <form
                      className="mb-4"
                      onSubmit={(event) => {
                        event.preventDefault();
                        if (remarkText.trim() && !isLoading) onRemarkSubmit();
                      }}
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <label
                          htmlFor="candidate-remark"
                          className="text-base font-medium text-[#202229]"
                        >
                          {editingRemark ? "Edit Remark" : "Add Remark"}
                        </label>
                        {editingRemark && (
                          <Button
                            type="button"
                            color="cancel"
                            size="xs"
                            onClick={onRemarkEditCancel}
                            disabled={isLoading}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>

                      <Input
                        id="candidate-remark"
                        type="text"
                        size="sm"
                        value={remarkText}
                        onChange={(event) =>
                          onRemarkTextChange(event.target.value)
                        }
                        placeholder={
                          editingRemark ? "Update Remark" : "Enter Remark"
                        }
                        disabled={isLoading}
                        aria-label={
                          editingRemark
                            ? "Edit candidate remark"
                            : "Add candidate remark"
                        }
                        error={remarkError}
                      />
                      {isLoading && (
                        <p className="mt-1.5 text-xs text-[#7B838D]">
                          Saving remark...
                        </p>
                      )}
                    </form>
                  )}

                  <div className="space-y-3">
                    {visibleRemarks.length === 0 ? (
                      <NoDataView message="No remarks found" />
                    ) : (
                      visibleRemarks.map((remark) => (
                        <div
                          key={remark.UniqueKey || remark.CandidateRemarkId}
                        >
                          <div className="mb-1.5 text-sm font-medium tracking-[0.15px] text-[#858585]">
                            <TooltipText
                              text={getRemarkAuthor(remark)}
                              maxWidth="100%"
                              tooltipThreshold={30}
                              isApplyBgTextColor
                            />
                          </div>
                          <div className="flex items-start gap-2 rounded-[7px] bg-[#F9FAFB] p-4 text-sm text-[#30323A]">
                            <span className="block w-full whitespace-pre-wrap break-words text-left">
                              {remark.Remark}
                            </span>
                            {canAction && (
                              <Button
                                type="button"
                                color="transparent"
                                size="sm"
                                isborderRadius
                                title="Edit"
                                onClick={() => onRemarkEdit(remark)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === "Timeline" &&
                (timelineError ? (
                  <p className="py-8 text-center text-sm text-red-500">
                    {timelineError}
                  </p>
                ) : (
                  <div className="pt-1">
                    {timeline.length > 0 ? (
                      timeline.map((item, index) => {
                        const isLast = index === timeline.length - 1;

                        return (
                          <div
                            key={`${item.Event || item.Description || item.ApplicantStatus}-${item.CreatedDate || item.ActivityDate}-${index}`}
                            className="grid grid-cols-[24px_1fr] gap-3"
                          >
                            <div className="flex flex-col items-center">
                              <div className="h-4 w-4 rounded-full bg-blue-600" />
                              {!isLast && (
                                <div className="w-[3px] flex-1 bg-blue-600" />
                              )}
                            </div>
                            <div className="pb-4">
                              <div className="flex items-start justify-between gap-3">
                                <h4
                                  className={`text-base font-medium leading-6 ${
                                    isLast
                                      ? "text-[#1D1D1D]"
                                      : "text-[#505F76]"
                                  }`}
                                >
                                  {item.Event ||
                                    item.Description ||
                                    item.ApplicantStatus ||
                                    "Candidate application updated"}
                                </h4>
                                <span className="shrink-0 whitespace-nowrap text-sm font-normal leading-6 text-gray-400">
                                  {formatCandidateDate(
                                    item.ActivityDate ||
                                      item.CreatedDate ||
                                      item.ModifiedDate,
                                  )}
                                </span>
                              </div>
                              <p className="mt-0.5 text-xs font-normal text-gray-500">
                                By :{" "}
                                {item.CreatedByName ||
                                  item.ModifiedByName ||
                                  item.EmployeeName ||
                                  "System"}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <NoDataView message="No activity yet" />
                    )}
                  </div>
                ))}
            </div>
          </div>

          {stageUpdateError && (
            <p className="shrink-0 border-t border-red-100 bg-red-50 px-3 py-1.5 text-xs text-red-500">
              {stageUpdateError}
            </p>
          )}

          <div className="flex min-h-[42px] shrink-0 flex-col gap-2 border-t border-[#E1E2EB] bg-[#F3F3FE] px-2.5 py-2 min-[420px]:h-[42px] min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between min-[420px]:py-0">
            <span className="text-xs font-normal leading-4 text-[#7B838D]">
              Current Stage:
            </span>
            <div className="w-full shrink-0 min-[420px]:w-[140px]">
              <SinglePageSelection
                aria-label="Current Stage"
                size="sm"
                searchable={false}
                isShowClearSelection={false}
                value={status}
                disabled={!canAction || isLoading}
                options={STAGE_OPTIONS}
                onChange={(value) =>
                  onStageChange(String(value) as CandidateStatus)
                }
              />
            </div>
          </div>
        </>
      ) : (
        <NoDataView message="Select a candidate to view details" />
      )}
    </section>
  );
};

export default CandidateDetailsPanel;
