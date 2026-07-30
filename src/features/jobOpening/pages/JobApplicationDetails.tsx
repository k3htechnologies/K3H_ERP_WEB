import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import * as E from "fp-ts/Either";

import { runApiWithLoader } from "@/core/utils";
import { useToast } from "@/core/hooks/useToast";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { Button } from "@/ui/components/forms";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import CandidateDetailsPanel, { type CandidateDetailsTab } from "../components/CandidateDetailsPanel";
import CandidateListPanel from "../components/CandidateListPanel";
import CandidateStageSidebar from "../components/CandidateStageSidebar";
import type { Candidate, CandidateRemark, CandidateStatus, PullCandidatesRequest } from "../models/JobOpeningModel";
import { jobOpeningService } from "../services/JobOpeningService";
import {
  CANDIDATE_STAGES,
  DEFAULT_REMARK_UNIQUE_KEY,
  formatCandidateDate,
  getCurrentUserId,
  getCurrentUserName,
  getErrorMessage,
  mapApiToCandidate,
  mapApiToRemark,
  mapApiToTimelineEvent,
  STAGE_ID_TO_STATUS,
  STATUS_TO_API_VALUE,
  STATUS_TO_STAGE_ID,
} from "../utils/candidateApplication";

interface LocationState {
  departmentName?: string;
  JobRoleName?: string;
  jobRoleName?: string;
  JobRoleMasterId?: number;
  jobRoleMasterId?: number;
  JobOpeningMasterId?: number;
  jobOpeningMasterId?: number;
}

export const JobApplicationsDetail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const { departmentId, jobOpeningMasterId: routeJobOpeningMasterId } = useParams();
  const [searchParams] = useSearchParams();

  const locationState = (location.state as LocationState | null) ?? null;
  const departmentName = locationState?.departmentName ?? "Department";
  const jobRoleName = locationState?.JobRoleName ?? locationState?.jobRoleName ?? "Role Details";
  const jobRoleMasterId = Number(searchParams.get("jobRoleMasterId")) || (locationState?.JobRoleMasterId ?? locationState?.jobRoleMasterId);
  const jobOpeningMasterId = Number(routeJobOpeningMasterId) || (locationState?.JobOpeningMasterId ?? locationState?.jobOpeningMasterId);

  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [selectedStage, setSelectedStage] = useState("all");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CandidateDetailsTab>("Timeline");
  const [, setLoadingApplicationMessage] = useState("");
  const [isLoadingApplication, setIsLoadingApplication] = useState(false);
  const [remarkText, setRemarkText] = useState("");
  const [editingRemark, setEditingRemark] = useState<CandidateRemark | null>(null);
  const [isSavingRemark, setIsSavingRemark] = useState(false);
  const [isLoadingRemarks, setIsLoadingRemarks] = useState(false);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);
  const [timelineError, setTimelineError] = useState("");
  const [remarkError, setRemarkError] = useState("");
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);
  const [stageUpdateError, setStageUpdateError] = useState("");

  const selectedCandidate = useMemo(
    () => candidates.find((candidate) => candidate.id === selectedCandidateId) ?? null,
    [candidates, selectedCandidateId],
  );

  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = { all: candidates.length };

    CANDIDATE_STAGES.forEach((stage) => {
      if (stage.status) {
        counts[stage.id] = candidates.filter((candidate) => candidate.status === stage.status).length;
      }
    });

    return counts;
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    const requiredStatus = STAGE_ID_TO_STATUS[selectedStage];
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return candidates.filter((candidate) => {
      const matchesStage = selectedStage === "all" || candidate.status === requiredStatus;
      const matchesSearch = !normalizedSearch || candidate.name.toLowerCase().includes(normalizedSearch);

      return matchesStage && matchesSearch;
    });
  }, [candidates, searchQuery, selectedStage]);

  const visibleRemarks = useMemo(() => {
    if (!selectedCandidate) return [];
    if (selectedStage === "all") return selectedCandidate.remarks;

    const requiredStatus = STAGE_ID_TO_STATUS[selectedStage];
    return selectedCandidate.remarks.filter((remark) => remark.ApplicantStatus === requiredStatus);
  }, [selectedCandidate, selectedStage]);

  const resetRemarkEditor = useCallback(() => {
    setRemarkText("");
    setEditingRemark(null);
    setRemarkError("");
  }, []);

  const loadCandidateRemarks = useCallback(async (candidateId: number, signal?: AbortSignal) => {
    if (!candidateId) return;

    setIsLoadingRemarks(true);
    setRemarkError("");

    try {
      const response = await jobOpeningService.apiCallPullCandidateRemark(
        {
          CandidateRemarkId: 0,
          CandidateId: candidateId,
        },
        { signal },
      );

      if (signal?.aborted) return;

      if (E.isLeft(response) || !response.right.IsSuccess) {
        setRemarkError(
          E.isLeft(response)
            ? response.left.message
            : response.right.ErrorMessage?.[0] || "Unable to load remarks.",
        );
        return;
      }

      const records = response.right.Data ?? [];
      const mappedRemarks = records
        .filter((item) => item.IsDeleted !== true && item.IsActive !== false)
        .map(mapApiToRemark)
        .sort((first, second) => {
          const firstDate = new Date(first.ModifiedDate || first.CreatedDate).getTime();
          const secondDate = new Date(second.ModifiedDate || second.CreatedDate).getTime();
          return secondDate - firstDate;
        });

      setCandidates((previous) =>
        previous.map((candidate) => (candidate.candidateId === candidateId ? { ...candidate, remarks: mappedRemarks } : candidate)),
      );
    } catch (error: unknown) {
      if (!signal?.aborted) {
        setRemarkError(getErrorMessage(error, "Unable to load remarks."));
      }
    } finally {
      if (!signal?.aborted) setIsLoadingRemarks(false);
    }
  }, []);

  const loadCandidateTimeline = useCallback(async (candidateId: number, signal?: AbortSignal) => {
    if (!candidateId) return;

    setIsLoadingTimeline(true);
    setTimelineError("");

    try {
      const response = await jobOpeningService.apiCallPullCandidateApplicationTimeline(
        { CandidateId: candidateId },
        { signal },
      );

      if (signal?.aborted) return;

      if (E.isLeft(response) || !response.right.IsSuccess) {
        setTimelineError(
          E.isLeft(response)
            ? response.left.message
            : response.right.ErrorMessage?.[0] || "Unable to load timeline.",
        );
        return;
      }

      const timeline = (response.right.Data ?? [])
        .map(mapApiToTimelineEvent)
        .sort((first, second) => (first.timestamp ?? 0) - (second.timestamp ?? 0));

      setCandidates((previous) =>
        previous.map((candidate) => {
          if (candidate.candidateId !== candidateId) return candidate;

          const isApplicationEvent = (event: string) => event.trim().toLowerCase().startsWith("applied for");
          const existingApplicationEvent =
            timeline.find((item) => isApplicationEvent(item.event)) ??
            candidate.timeline.find((item) => isApplicationEvent(item.event));
          const appliedRoleName = jobRoleName !== "Role Details" ? jobRoleName : candidate.appliedRole;
          const applicationEvent = {
            event: `Applied for ${appliedRoleName}`,
            by: existingApplicationEvent?.by ?? "System",
            date: existingApplicationEvent?.date ?? candidate.appliedDate,
            timestamp: existingApplicationEvent?.timestamp,
          };
          const completeTimeline = [applicationEvent, ...timeline.filter((item) => !isApplicationEvent(item.event))];

          return { ...candidate, timeline: completeTimeline };
        }),
      );
    } catch (error: unknown) {
      if (!signal?.aborted) {
        setTimelineError(getErrorMessage(error, "Unable to load timeline."));
      }
    } finally {
      if (!signal?.aborted) setIsLoadingTimeline(false);
    }
  }, [jobRoleName]);

  useEffect(() => {
    const controller = new AbortController();

    const loadCandidates = async () => {
      await runApiWithLoader(
        setIsLoadingApplication,
        setLoadingApplicationMessage,
        async () => {
          const params: PullCandidatesRequest = {};
          const parsedDepartmentId = Number(departmentId);
          const parsedJobRoleMasterId = Number(jobRoleMasterId);

          if (Number.isFinite(parsedDepartmentId) && parsedDepartmentId > 0) {
            params.DepartmentId = parsedDepartmentId;
          }
          if (Number.isFinite(parsedJobRoleMasterId) && parsedJobRoleMasterId > 0) {
            params.JobRoleMasterId = parsedJobRoleMasterId;
          }

          const response = await jobOpeningService.apiCallPullCandidates(params, { signal: controller.signal });

          if (controller.signal.aborted) return response;

          if (E.isRight(response) && response.right.IsSuccess) {
            const mappedCandidates = (response.right.Data ?? []).map((record) => {
              const candidate = mapApiToCandidate(record);
              return candidate.jobOpeningMasterId > 0
                ? candidate
                : {
                    ...candidate,
                    jobOpeningMasterId: Number(jobOpeningMasterId) || 0,
                  };
            });
            setCandidates(mappedCandidates);
            setSelectedCandidateId(mappedCandidates[0]?.id ?? null);
          } else {
            setCandidates([]);
            setSelectedCandidateId(null);
            addToast({
              type: "error",
              title: E.isLeft(response)
                ? response.left.message
                : response.right.ErrorMessage?.[0] || "Failed to load candidates",
            });
          }

          return response;
        },
        undefined,
        (error: unknown) => {
          if (!controller.signal.aborted) {
            addToast({
              type: "error",
              title: getErrorMessage(error, "Failed to load candidates"),
            });
          }
        },
        undefined,
        "Loading candidates...",
      );
    };

    void loadCandidates();
    return () => controller.abort();
  }, [addToast, departmentId, jobOpeningMasterId, jobRoleMasterId]);

  useEffect(() => {
    if (activeTab !== "Remark" || !selectedCandidate?.candidateId) return;

    const controller = new AbortController();
    void loadCandidateRemarks(selectedCandidate.candidateId, controller.signal);

    return () => controller.abort();
  }, [activeTab, selectedCandidate?.candidateId, loadCandidateRemarks]);

  useEffect(() => {
    if (activeTab !== "Timeline" || !selectedCandidate?.candidateId) return;

    const controller = new AbortController();
    void loadCandidateTimeline(selectedCandidate.candidateId, controller.signal);

    return () => controller.abort();
  }, [activeTab, selectedCandidate?.candidateId, loadCandidateTimeline]);

  useEffect(() => {
    resetRemarkEditor();
    setStageUpdateError("");
  }, [resetRemarkEditor, selectedCandidateId]);

  useEffect(() => {
    if (filteredCandidates.length === 0) {
      if (selectedStage !== "all" || searchQuery.trim()) {
        setSelectedCandidateId(null);
      }
      return;
    }

    const selectedCandidateIsVisible = filteredCandidates.some((candidate) => candidate.id === selectedCandidateId);

    if (!selectedCandidateIsVisible) {
      setSelectedCandidateId(filteredCandidates[0].id);
    }
  }, [filteredCandidates, searchQuery, selectedCandidateId, selectedStage]);

  const handleStageFilterChange = (stageId: string) => {
    setSelectedStage(stageId);
    resetRemarkEditor();
    setStageUpdateError("");

    const requiredStatus = STAGE_ID_TO_STATUS[stageId];
    const matchingCandidates = stageId === "all" ? candidates : candidates.filter((candidate) => candidate.status === requiredStatus);

    setSelectedCandidateId(matchingCandidates[0]?.id ?? null);
  };

  const handleSaveRemark = async () => {
    const remark = remarkText.trim();

    if (!selectedCandidate) {
      setRemarkError("Please select a candidate.");
      return;
    }
    if (!selectedCandidate.candidateId) {
      setRemarkError("Candidate ID is not available.");
      return;
    }
    if (!remark) {
      setRemarkError("Please enter a remark.");
      return;
    }

    setIsSavingRemark(true);
    setRemarkError("");

    try {
      const isUpdate = editingRemark !== null;
      const response = await jobOpeningService.apiCallAddUpdateCandidateRemark({
        CandidateRemarkId: isUpdate ? editingRemark.CandidateRemarkId : 0,
        UniqueKey: isUpdate ? editingRemark.UniqueKey : DEFAULT_REMARK_UNIQUE_KEY,
        CandidateId: selectedCandidate.candidateId,
        Remark: remark,
        ApplicantStatus: STATUS_TO_API_VALUE[selectedCandidate.status],
      });

      if (E.isLeft(response) || !response.right.IsSuccess) {
        setRemarkError(
          E.isLeft(response)
            ? response.left.message
            : response.right.ErrorMessage?.[0] || "Unable to save remark.",
        );
        return;
      }

      resetRemarkEditor();
      await loadCandidateRemarks(selectedCandidate.candidateId);
    } catch (error: unknown) {
      setRemarkError(getErrorMessage(error, "Unable to save remark."));
    } finally {
      setIsSavingRemark(false);
    }
  };

  const handleStageChange = async (newStatus: CandidateStatus) => {
    if (!selectedCandidate || isUpdatingStage) return;
    if (newStatus === selectedCandidate.status) return;

    setIsUpdatingStage(true);
    setStageUpdateError("");

    try {
      const currentUserId = getCurrentUserId();
      const response = await jobOpeningService.apiCallUpdateCandidateStage({
        CandidateId: selectedCandidate.candidateId,
        UniqueKey: selectedCandidate.uniqueKey,
        ApplicantStatus: STATUS_TO_API_VALUE[newStatus],
        ModifiedById: currentUserId,
        ModifiedDate: new Date().toISOString(),
      });

      if (E.isLeft(response) || !response.right.IsSuccess) {
        setStageUpdateError(
          E.isLeft(response)
            ? response.left.message
            : response.right.ErrorMessage?.[0] || "Unable to update stage.",
        );
        return;
      }

      setCandidates((previous) =>
        previous.map((candidate) =>
          candidate.id === selectedCandidate.id
            ? {
                ...candidate,
                status: newStatus,
                timeline: [
                  ...candidate.timeline,
                  {
                    event: `Moved to ${STATUS_TO_API_VALUE[newStatus]}`,
                    by: getCurrentUserName() || (currentUserId ? `User #${currentUserId}` : "System"),
                    date: formatCandidateDate(new Date().toISOString()),
                    timestamp: Date.now(),
                  },
                ],
              }
            : candidate,
        ),
      );

      setSelectedStage(STATUS_TO_STAGE_ID[newStatus]);
      resetRemarkEditor();
    } catch (error: unknown) {
      setStageUpdateError(getErrorMessage(error, "Unable to update stage."));
    } finally {
      setIsUpdatingStage(false);
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    window.setTimeout(() => setIsExporting(false), 500);
  };

  return (
    <div className="flex min-h-[calc(100dvh-96px)] min-w-0 flex-col rounded-2xl border border-gray-200/60 bg-[#F8F9FA] text-sm shadow-sm [&_button]:!font-[inherit] [&_input]:!font-[inherit] [&_select]:!font-[inherit] [&_textarea]:!font-[inherit] lg:h-[calc(100dvh-88px)] lg:min-h-0 lg:min-w-[967px] lg:overflow-hidden">
      <div className="shrink-0 px-3 pt-3 sm:px-[15px] sm:pt-[15px]">
        <TableActionToolbar
          isShowSearchBar
          searchTerm={searchQuery}
          searchPlaceholder="Search By Name"
          onSearchChange={setSearchQuery}
          onClearSearch={() => setSearchQuery("")}
          isShowFilterButton
          onOpenFilter={() => undefined}
          isShowCustomizeButton={false}
          isShowExportButton
          onExportExcel={handleExport}
          onExportPdf={handleExport}
          exportLoading={isExporting}
          isShowImportButton={false}
          isShowAddButton={false}
        />
      </div>

      <div className="min-h-0 w-full flex-1 px-3 pb-3 sm:px-[15px] sm:pb-[15px]">
        <div className="grid min-h-0 grid-cols-1 items-stretch gap-3 lg:h-full lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-[18px]">
          <CandidateStageSidebar
            stages={CANDIDATE_STAGES}
            counts={stageCounts}
            selectedStageId={selectedStage}
            onStageChange={handleStageFilterChange}
          />

          <div className="flex min-h-0 min-w-0 flex-col lg:h-full">
            <nav aria-label="Job opening breadcrumb" className="mb-3 flex min-h-5 shrink-0 flex-wrap items-center gap-x-[11px] gap-y-1 font-[inherit] lg:mb-[17px] lg:h-5 lg:flex-nowrap">
              <Button
                type="button"
                onClick={() => navigate(-1)}
                color="transparent"
                size="xs"
                className="font-semibold text-[#24262D] hover:text-blue-600"
                style={{
                  height: "auto",
                  padding: 0,
                  color: "#24262D",
                  fontSize: "16px",
                  fontWeight: 600,
                  lineHeight: "20px",
                  fontFamily: "inherit",
                }}
              >
                {departmentName}
              </Button>
              <span
                aria-hidden="true"
                className="flex h-5 items-center text-[16px] font-semibold leading-5 tracking-[0.6px] text-[#7B838D]"
              >
                &gt;
              </span>
              <div className="flex h-5 min-w-0 max-w-[220px] items-center sm:max-w-[320px]">
                <TooltipText
                  text={jobRoleName}
                  maxWidth="320px"
                  tooltipThreshold={30}
                  isApplyBgTextColor
                  tooltipClassName="flex h-5 items-center text-left text-[16px] font-[inherit] font-semibold leading-5 tracking-[0%] text-[#17181C]"
                />
              </div>
            </nav>

            <div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 items-stretch gap-3 lg:grid-cols-[1.044fr_1fr] lg:gap-[18px]">
              <CandidateListPanel
                candidates={filteredCandidates}
                selectedCandidateId={selectedCandidateId}
                isLoading={isLoadingApplication}
                onCandidateSelect={setSelectedCandidateId}
              />

              <CandidateDetailsPanel
                candidate={selectedCandidate}
                activeTab={activeTab}
                visibleRemarks={visibleRemarks}
                remarkText={remarkText}
                editingRemark={editingRemark}
                isSavingRemark={isSavingRemark}
                isLoadingRemarks={isLoadingRemarks}
                isLoadingTimeline={isLoadingTimeline}
                timelineError={timelineError}
                remarkError={remarkError}
                isUpdatingStage={isUpdatingStage}
                stageUpdateError={stageUpdateError}
                onTabChange={setActiveTab}
                onScheduleInterview={(candidate) =>
                  navigate(
                    `/jobOpenings/interviews/schedule?candidateId=${candidate.candidateId}&jobOpeningMasterId=${candidate.jobOpeningMasterId || Number(jobOpeningMasterId) || 0}`,
                    { state: { candidate } },
                  )
                }
                onRemarkTextChange={(value) => {
                  setRemarkText(value);
                  setRemarkError("");
                }}
                onRemarkSubmit={() => void handleSaveRemark()}
                onRemarkEdit={(remark) => {
                  setEditingRemark(remark);
                  setRemarkText(remark.Remark);
                  setRemarkError("");
                }}
                onRemarkEditCancel={resetRemarkEditor}
                onStageChange={(status) => void handleStageChange(status)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationsDetail;
