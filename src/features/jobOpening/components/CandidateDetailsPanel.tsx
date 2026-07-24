import { Calendar } from "lucide-react";
import { Button, Input } from "@/ui/components/forms";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import ActivityTimeline from "@/ui/components/Timeline/ActivityTimeline";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import type { Candidate, CandidateRemark, CandidateStatus } from "../models/JobRoleModel";
import { getCandidateAvatarUrl, getRemarkAuthor, STAGE_OPTIONS } from "../utils/candidateApplication";

export type CandidateDetailsTab = "Overview" | "Remark" | "Timeline";

interface CandidateDetailsPanelProps {
  candidate: Candidate | null;
  activeTab: CandidateDetailsTab;
  visibleRemarks: CandidateRemark[];
  remarkText: string;
  editingRemark: CandidateRemark | null;
  isSavingRemark: boolean;
  isLoadingRemarks: boolean;
  isLoadingTimeline: boolean;
  timelineError: string;
  remarkError: string;
  isUpdatingStage: boolean;
  stageUpdateError: string;
  onTabChange: (tab: CandidateDetailsTab) => void;
  onScheduleInterview: (candidate: Candidate) => void;
  onRemarkTextChange: (value: string) => void;
  onRemarkSubmit: () => void;
  onRemarkEdit: (remark: CandidateRemark) => void;
  onRemarkEditCancel: () => void;
  onStageChange: (status: CandidateStatus) => void;
}

const CandidateInfo = ({ label, value }: { label: string; value: string }) => (
  <div>
    <span className="mb-1.5 block align-middle text-[12px] font-normal uppercase leading-[16px] tracking-[0.3px] text-gray-400">
      {label}
    </span>
    <span className="align-middle text-[14px] font-medium leading-[24px] tracking-[0px] text-gray-900">{value}</span>
  </div>
);

const CandidateOverview = ({ candidate }: { candidate: Candidate }) => (
  <div>
    <div className="grid grid-cols-2 gap-x-5 gap-y-6">
      <CandidateInfo label="Current Position" value={candidate.currentPosition} />
      <CandidateInfo label="Experience" value={candidate.experienceDetail} />
      <CandidateInfo label="Expected Salary" value={candidate.expectedSalary} />
      <CandidateInfo label="Notice Period" value={candidate.noticePeriod} />
    </div>

    <p className="mb-3 mt-6 align-middle text-[12px] font-normal uppercase leading-[16px] tracking-[0.3px] text-[#8A8A8A]">
      Top Skills
    </p>

    <div className="flex flex-wrap gap-2">
      {candidate.skills.length > 0 ? (
        candidate.skills.map((skill) => (
          <span key={skill} className="rounded-full bg-[#F3F4F6] px-3 py-1 text-[10px] font-normal text-[#5D6470]">
            {skill}
          </span>
        ))
      ) : (
        <span className="text-xs text-[#9CA3AF]">No skills available.</span>
      )}
    </div>

    <p className="mb-3 mt-6 align-middle text-[12px] font-normal uppercase leading-[16px] tracking-[0.3px] text-[#8A8A8A]">
      Education
    </p>

    <div className="rounded-[7px] border border-[#7B838D] bg-[#F9FAFB] px-4 py-4">
      <h4 className="text-xs font-medium text-[#30323A]">{candidate.education.degree}</h4>
      <p className="mt-1 text-[10px] font-normal text-[#7B838D]">
        {candidate.education.school} &bull; {candidate.education.duration}
      </p>
    </div>
  </div>
);

const CandidateDetailsPanel = ({
  candidate,
  activeTab,
  visibleRemarks,
  remarkText,
  editingRemark,
  isSavingRemark,
  isLoadingRemarks,
  isLoadingTimeline,
  timelineError,
  remarkError,
  isUpdatingStage,
  stageUpdateError,
  onTabChange,
  onScheduleInterview,
  onRemarkTextChange,
  onRemarkSubmit,
  onRemarkEdit,
  onRemarkEditCancel,
  onStageChange,
}: CandidateDetailsPanelProps) => (
  <section className="flex h-[600px] min-h-0 min-w-0 flex-col overflow-hidden rounded-[6px] bg-white shadow-[0_1px_4px_rgba(15,23,42,0.05)] lg:h-full">
    {candidate ? (
      <>
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="shrink-0 px-[15px] pt-[14px]">
            <h2 className="text-sm font-medium tracking-[0.6px] text-[#7B838D]">Candidate Details</h2>

            <div className="mt-[17px] flex items-center gap-2.5 px-[17px] pb-[17px]">
              <div className="h-[38px] w-[38px] shrink-0 overflow-hidden rounded-full border border-[#E5E7EB] bg-[#F3F4F6]">
                <img src={getCandidateAvatarUrl(candidate)} alt={candidate.name} className="h-full w-full object-cover" />
              </div>

              <div className="min-w-0">
                <TooltipText
                  text={candidate.name}
                  maxWidth="100%"
                  tooltipThreshold={22}
                  isApplyBgTextColor
                  tooltipClassName="text-[20px] font-semibold leading-[28px] text-[#202229]"
                />
                <TooltipText
                  text={candidate.email}
                  maxWidth="100%"
                  tooltipThreshold={28}
                  isApplyBgTextColor
                  tooltipClassName="mt-0.5 text-xs font-normal leading-[14px] text-[#7B838D]"
                />
                <TooltipText
                  text={candidate.location}
                  maxWidth="100%"
                  tooltipThreshold={28}
                  isApplyBgTextColor
                  tooltipClassName="text-xs font-normal leading-[14px] text-[#7B838D]"
                />
                <Button
                  type="button"
                  onClick={() => onScheduleInterview(candidate)}
                  color="transparent"
                  size="xs"
                  rightIcon={<Calendar className="h-3.5 w-3.5" />}
                  className="mt-1 inline-flex h-6 items-center gap-1.5 rounded-md bg-[#DCFCE7] px-2.5 text-[12px] font-medium leading-[20px] tracking-[0px] text-[#16803A] transition-colors hover:bg-[#CFF7DC]"
                  style={{
                    height: 24,
                    padding: "0 10px",
                    backgroundColor: "#DCFCE7",
                    color: "#16803A",
                    fontSize: 12,
                  }}
                >
                  Schedule Interview
                </Button>
              </div>
            </div>

            <div className="border-t border-[#C9CFDD]" />

            <div className="mt-[14px] grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-3">
              {(["Overview", "Remark", "Timeline"] as const).map((tab) => (
                <Button
                  type="button"
                  key={tab}
                  aria-pressed={activeTab === tab}
                  onClick={() => onTabChange(tab)}
                  color="transparent"
                  fullWidth
                  className={`inline-flex h-[35px] items-center justify-center rounded-[3px] border py-2 text-xs font-normal leading-none transition-colors ${
                    activeTab === tab
                      ? "border-[#8CB0FF] bg-[#DCE7FC] text-[#235EEE]"
                      : "border-[#CFCFCF] bg-white text-[#8A8A8A] hover:!border-[#AFC4EA] hover:!text-[#235EEE]"
                  }`}
                  style={{
                    height: 35,
                    padding: "8px 0",
                    borderRadius: 3,
                    border: activeTab === tab ? "1px solid #8CB0FF" : "1px solid #CFCFCF",
                    backgroundColor: activeTab === tab ? "#DCE7FC" : "#FFFFFF",
                    color: activeTab === tab ? "#235EEE" : "#8A8A8A",
                    fontWeight: 400,
                  }}
                >
                  {tab}
                </Button>
              ))}
            </div>
          </div>
          <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-[15px] pb-[20px] pt-[20px]">
            {activeTab === "Overview" && <CandidateOverview candidate={candidate} />}

            {activeTab === "Remark" && (
              <div>
                <form
                  className="mb-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (remarkText.trim() && !isSavingRemark) onRemarkSubmit();
                  }}
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label htmlFor="candidate-remark" className="text-base font-medium text-[#202229]">
                      {editingRemark ? "Edit Remark" : "Add Remark"}
                    </label>
                    {editingRemark && (
                      <Button
                        type="button"
                        color="transparent"
                        size="xs"
                        onClick={onRemarkEditCancel}
                        disabled={isSavingRemark}
                        className="text-xs text-[#7B838D] hover:text-[#202229]"
                        style={{ height: 24, padding: "0 6px" }}
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
                    onChange={(event) => onRemarkTextChange(event.target.value)}
                    placeholder={editingRemark ? "Update Remark" : "Enter Remark"}
                    disabled={isSavingRemark}
                    aria-label={editingRemark ? "Edit candidate remark" : "Add candidate remark"}
                    error={remarkError || undefined}
                    className="text-xs placeholder:text-[#B2B7C0]"
                    style={{ height: 35, borderColor: remarkError ? "#EF4444" : "#B9CBFF", borderRadius: 5 }}
                  />
                  {isSavingRemark && <p className="mt-1.5 text-xs text-[#7B838D]">Saving remark...</p>}
                </form>

                <div className="space-y-3">
                  {isLoadingRemarks ? (
                    <p className="py-8 text-center text-sm text-[#9CA3AF]">Loading remarks...</p>
                  ) : visibleRemarks.length === 0 ? (
                    <div className="rounded-[7px] bg-[#F9FAFB] px-4 py-8 text-center">
                      <p className="text-sm text-[#9CA3AF]">No remarks found.</p>
                    </div>
                  ) : (
                    visibleRemarks.map((remark) => (
                      <div key={remark.CandidateRemarkId}>
                        <TooltipText
                          text={getRemarkAuthor(remark)}
                          maxWidth="100%"
                          tooltipThreshold={30}
                          isApplyBgTextColor
                          tooltipClassName="mb-1.5 text-sm font-medium tracking-[0.15px] text-[#858585]"
                        />
                        <Button
                          type="button"
                          title="Double-click to edit"
                          onDoubleClick={() => onRemarkEdit(remark)}
                          color="transparent"
                          fullWidth
                          className="block w-full rounded-[7px] bg-[#F9FAFB] px-4 py-4 text-left text-sm leading-5 text-[#30323A] transition-colors hover:bg-[#F6F7F9]"
                          style={{
                            height: "auto",
                            padding: 16,
                            justifyContent: "flex-start",
                            backgroundColor: "#F9FAFB",
                            color: "#30323A",
                            fontSize: 14,
                            textAlign: "left",
                          }}
                        >
                          <span className="whitespace-pre-wrap break-words">{remark.Remark}</span>
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "Timeline" && (
              <>
                {isLoadingTimeline ? (
                  <p className="py-8 text-center text-sm text-[#9CA3AF]">Loading timeline...</p>
                ) : timelineError ? (
                  <p className="py-8 text-center text-sm text-red-500">{timelineError}</p>
                ) : (
                  <ActivityTimeline
                    className="pt-1"
                    compact
                    items={candidate.timeline}
                    getKey={(item, index) => `${item.event}-${item.date}-${index}`}
                    emptyState={<p className="py-8 text-center text-sm text-[#9CA3AF]">No activity yet.</p>}
                    showPending
                    // 1. Receive the isLast argument here
                    renderItem={(item, _index, isLast) => (
                      <>
                        <div className="flex items-start justify-between gap-3">
                          {/* 2. Conditionally apply text colors based on isLast */}
                          <h4
                            className={`align-middle text-base font-medium leading-6 tracking-normal ${
                              isLast ? "text-[#1D1D1D]" : "text-[#505F76]"
                            }`}
                          >
                            {item.event}
                          </h4>
                          <span className="shrink-0 whitespace-nowrap align-middle text-sm font-normal leading-6 tracking-normal text-gray-400">
                            {item.date}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[10px] font-normal text-gray-500">By : {item.by}</p>
                      </>
                    )}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {stageUpdateError && (
          <p className="shrink-0 border-t border-red-100 bg-red-50 px-3 py-1.5 text-xs text-red-500">{stageUpdateError}</p>
        )}

        <div className="flex min-h-[42px] shrink-0 flex-col gap-2 border-t border-[#E1E2EB] bg-[#F3F3FE] px-2.5 py-2 min-[420px]:h-[42px] min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between min-[420px]:py-0">
          <span className="align-middle text-xs font-normal leading-4 tracking-normal text-[#7B838D]">
            Current Stage:
          </span>
          <div className="w-full shrink-0 min-[420px]:w-[140px]">
            <SinglePageSelection
              aria-label="Current Stage"
              size="sm"
              searchable={false}
              isShowClearSelection={false}
              value={candidate.status}
              disabled={isUpdatingStage}
              options={STAGE_OPTIONS}
              onChange={(value) => onStageChange(String(value) as CandidateStatus)}
            />
          </div>
        </div>
      </>
    ) : (
      <div className="flex flex-1 items-center justify-center px-4 text-center text-sm text-[#9CA3AF]">
        Select a candidate to view details
      </div>
    )}
  </section>
);

export default CandidateDetailsPanel;
