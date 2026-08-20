import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import * as E from "fp-ts/Either";

import { runApiWithLoader } from "@/core/utils";
import { Loader } from "@/core/utils/loader";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useToast } from "@/core/hooks/useToast";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { Button } from "@/ui/components/forms";
import { CandidateDetailsPanel, CandidateListPanel, CandidateStageSidebar } from "@/features/jobOpening/components";
import type {
  AddUpdateCandidateRemarkRequest,
  CandidateApplicationTimelineData,
  CandidateData,
  CandidateDetailsTab,
  CandidateRemarkData,
  CandidateStatus,
  FilterWithPaginationCandidateApplicationTimelineRequest,
  FilterWithPaginationCandidateRemarkRequest,
  FilterWithPaginationCandidateRequest,
  AddUpdateCandidateStageRequest,
} from "@/features/jobOpening/models/CandidateModel";
import { CandidateService } from "@/features/jobOpening/services/CandidateService";
import {
  CANDIDATE_STAGES,
  DEFAULT_REMARK_UNIQUE_KEY,
  getCandidateName,
  getCandidateRole,
  getCandidateStatus,
  getCurrentUserId,
  getCurrentUserName,
  normalizeCandidateStatus,
  STAGE_ID_TO_STATUS,
  STATUS_TO_API_VALUE,
  STATUS_TO_STAGE_ID,
} from "@/features/jobOpening/utils/candidateApplication";
import { useJobOpeningListState } from "@/features/jobOpening/context/JobOpeningListStateContext";

interface LocationState {
  departmentName?: string;
  JobRoleName?: string;
  jobRoleName?: string;
  JobRoleMasterId?: number;
  jobRoleMasterId?: number;
  JobOpeningMasterId?: number;
  jobOpeningMasterId?: number;
}

export const JobApplicationDetails: React.FC = () => {


  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const { canAction } = useMenuPermissions("/jobOpenings");
  const { departmentId, jobOpeningMasterId: routeJobOpeningMasterId } = useParams();
  const [searchParams] = useSearchParams();

  const { listState } = useJobOpeningListState();

  const locationState = (location.state as LocationState | null) ?? null;
  const departmentName =
    locationState?.departmentName || listState.departmentName || "Department";
  const jobRoleName =
    locationState?.JobRoleName ||
    locationState?.jobRoleName ||
    listState.jobRoleName ||
    "Role Details";
  const jobRoleMasterId =
    Number(searchParams.get("jobRoleMasterId")) ||
    locationState?.JobRoleMasterId ||
    locationState?.jobRoleMasterId ||
    listState.jobRoleMasterId;
  const jobOpeningMasterId =
    Number(routeJobOpeningMasterId) ||
    locationState?.JobOpeningMasterId ||
    locationState?.jobOpeningMasterId ||
    listState.jobOpeningMasterId;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState("all");
  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [remarks, setRemarks] = useState<CandidateRemarkData[]>([]);
  const [timeline, setTimeline] = useState<CandidateApplicationTimelineData[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<CandidateDetailsTab>("Timeline");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [remarkText, setRemarkText] = useState("");
  const [editingRemark, setEditingRemark] = useState<CandidateRemarkData | null>(null);
  const [timelineError, setTimelineError] = useState("");
  const [remarkError, setRemarkError] = useState("");
  const [stageUpdateError, setStageUpdateError] = useState("");


  const selectedCandidate = useMemo(
    () => candidates.find((candidate) => candidate.CandidateId === selectedCandidateId) ?? null,
    [candidates, selectedCandidateId],
  );

  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = { all: candidates.length };

    CANDIDATE_STAGES.forEach((stage) => {
      if (stage.status) {
        counts[stage.id] = candidates.filter((candidate) => getCandidateStatus(candidate) === stage.status).length;
      }
    });

    return counts;
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    const requiredStatus = STAGE_ID_TO_STATUS[selectedStage];
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return candidates.filter((candidate) => {
      const matchesStage = selectedStage === "all" || getCandidateStatus(candidate) === requiredStatus;
      const matchesSearch = !normalizedSearch || getCandidateName(candidate).toLowerCase().includes(normalizedSearch);

      return matchesStage && matchesSearch;
    });
  }, [candidates, searchQuery, selectedStage]);

  const visibleRemarks = useMemo(() => {
    if (selectedStage === "all") return remarks;

    const requiredStatus = STAGE_ID_TO_STATUS[selectedStage];
    return remarks.filter((remark) => normalizeCandidateStatus(remark.ApplicantStatus) === requiredStatus);
  }, [remarks, selectedStage]);


  const resetRemarkEditor = useCallback(() => {
    setRemarkText("");
    setEditingRemark(null);
    setRemarkError("");
  }, []);

  const loadCandidateRemarks = useCallback(async (candidateId: number) => {
    if (!candidateId) return;

    setRemarkError("");

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationCandidateRemarkRequest = {
          CandidateRemarkId: 0,
          CandidateId: candidateId,
        };

        const response = await CandidateService.apiCallPullCandidateRemark(params);

        if (E.isRight(response)) {
          const loadedRemarks = (response.right.Data ?? [])
            .filter((item) => item.IsDeleted !== true && item.IsActive !== false)
            .sort((first, second) => {
              const firstDate = new Date(first.ModifiedDate || first.CreatedDate).getTime();
              const secondDate = new Date(second.ModifiedDate || second.CreatedDate).getTime();
              return secondDate - firstDate;
            });

          setRemarks(loadedRemarks);
        } else {
          const message = response.left.message;
          setRemarkError(message);
          addToast({ type: "error", title: message });
        }

        return response;
      },
      undefined,
      (error: any) => addToast({ type: "error", title: error.message }),
      undefined,
      "Loading Candidate Remarks"
    );
  }, [addToast]);

  const loadCandidateTimeline = useCallback(async (candidateId: number) => {
    if (!candidateId) return;

    setTimelineError("");

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationCandidateApplicationTimelineRequest = {
          CandidateId: candidateId
        };

        const response = await CandidateService.apiCallPullCandidateApplicationTimeline(params);

        if (E.isRight(response)) {
          setTimeline(response.right.Data ?? []);
        } else {
          const message = response.left.message;
          setTimelineError(message);
          addToast({ type: "error", title: message });
        }

        return response;
      },
      undefined,
      (error: any) => addToast({ type: "error", title: error.message }),
      undefined,
      "Loading Candidate Timeline"
    );
  }, [addToast]);

  const loadCandidates = useCallback(async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationCandidateRequest = {};
        const parsedDepartmentId = Number(departmentId);
        const parsedJobRoleMasterId = Number(jobRoleMasterId);

        if (Number.isFinite(parsedDepartmentId) && parsedDepartmentId > 0) {
          params.DepartmentId = parsedDepartmentId;
        }
        if (Number.isFinite(parsedJobRoleMasterId) && parsedJobRoleMasterId > 0) {
          params.JobRoleMasterId = parsedJobRoleMasterId;
        }

        const response = await CandidateService.apiCallPullCandidate(params);

        if (E.isRight(response)) {
          const loadedCandidates = response.right.Data ?? [];
          setCandidates(loadedCandidates);
          setSelectedCandidateId(loadedCandidates[0]?.CandidateId ?? null);
        } else {
          const message = response.left.message;
          setCandidates([]);
          setSelectedCandidateId(null);
          addToast({ type: "error", title: message });
        }

        return response;
      },
      undefined,
      (error: any) => addToast({ type: "error", title: error.message }),
      undefined,
      "Loading Candidates"
    );
  }, [addToast, departmentId, jobRoleMasterId]);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  useEffect(() => {
    if (activeTab !== "Remark" || !selectedCandidate?.CandidateId) return;
    loadCandidateRemarks(selectedCandidate.CandidateId);
  }, [activeTab, loadCandidateRemarks, selectedCandidate?.CandidateId]);

  useEffect(() => {
    if (activeTab !== "Timeline" || !selectedCandidate?.CandidateId) return;
    loadCandidateTimeline(selectedCandidate.CandidateId);
  }, [activeTab, loadCandidateTimeline, selectedCandidate?.CandidateId]);

  useEffect(() => {
    resetRemarkEditor();
    setStageUpdateError("");
    setRemarks([]);
    setTimeline([]);
  }, [resetRemarkEditor, selectedCandidateId]);

  useEffect(() => {
    if (filteredCandidates.length === 0) {
      if (selectedStage !== "all" || searchQuery.trim()) {
        setSelectedCandidateId(null);
      }
      return;
    }

    const selectedCandidateIsVisible = filteredCandidates.some((candidate) => candidate.CandidateId === selectedCandidateId);

    if (!selectedCandidateIsVisible) {
      setSelectedCandidateId(filteredCandidates[0].CandidateId ?? null);
    }
  }, [filteredCandidates, searchQuery, selectedCandidateId, selectedStage]);

  const handleStageFilterChange = (stageId: string) => {
    setSelectedStage(stageId);
    resetRemarkEditor();
    setStageUpdateError("");

    const requiredStatus = STAGE_ID_TO_STATUS[stageId];
    const matchingCandidates = stageId === "all"
      ? candidates
      : candidates.filter((candidate) => getCandidateStatus(candidate) === requiredStatus);

    setSelectedCandidateId(matchingCandidates[0]?.CandidateId ?? null);
  };


  const validateCandidateRemarkForm = (): {
    isValid: boolean;
    errors: { [key: string]: string };
  } => {
    const newErrors: { [key: string]: string } = {};

    if (!selectedCandidate) {
      newErrors.Remark = "Please select a candidate.";
    } else if (!selectedCandidate.CandidateId) {
      newErrors.Remark = "Candidate ID is not available.";
    }

    if (!remarkText.trim() && !newErrors.Remark) {
      newErrors.Remark = "Please enter a remark.";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  };

  const PushCandidateRemarkFormData = (): AddUpdateCandidateRemarkRequest => {
    const isUpdate = editingRemark !== null;

    return {
      CandidateRemarkId: isUpdate ? editingRemark.CandidateRemarkId : 0,
      UniqueKey: isUpdate ? editingRemark.UniqueKey : DEFAULT_REMARK_UNIQUE_KEY,
      CandidateId: selectedCandidate?.CandidateId ?? 0,
      Remark: remarkText.trim(),
      ApplicantStatus: STATUS_TO_API_VALUE[selectedCandidate ? getCandidateStatus(selectedCandidate) : "NEW"],
    };
  };

  const handleAddUpdateCandidateRemark = async () => {
    setRemarkError("");

    const validation = validateCandidateRemarkForm();

    if (!validation.isValid) {
      setRemarkError(validation.errors.Remark || "");
      return;
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = PushCandidateRemarkFormData();
        const response = await CandidateService.apiCallAddUpdateCandidateRemark(payload);

        if (E.isRight(response)) {
          addToast({
            type: "success",
            title: response.right.SuccessMessage[0]
          });

          resetRemarkEditor();
          await loadCandidateRemarks(payload.CandidateId);
        } else {
          addToast({ type: "error", title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => addToast({ type: "error", title: error.message }),
      undefined,
      editingRemark ? "Update Candidate Remark" : "Add Candidate Remark"
    );
  };


  const PushCandidateStageData = (newStatus: CandidateStatus): AddUpdateCandidateStageRequest => {
    return {
      CandidateId: selectedCandidate?.CandidateId ?? 0,
      UniqueKey: selectedCandidate?.UniqueKey || "",
      ApplicantStatus: STATUS_TO_API_VALUE[newStatus],
      ModifiedById: getCurrentUserId(),
      ModifiedDate: new Date().toISOString(),
    };
  };

  const handleStageChange = async (newStatus: CandidateStatus) => {
    if (!selectedCandidate || isLoading) return;
    if (getCandidateStatus(selectedCandidate) === newStatus) return;

    setStageUpdateError("");

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = PushCandidateStageData(newStatus);
        const response = await CandidateService.apiCallAddUpdateCandidateStage(payload);

        if (E.isRight(response)) {
          setCandidates((previous) =>
            previous.map((candidate) =>
              candidate.CandidateId === selectedCandidate.CandidateId
                ? {
                    ...candidate,
                    ApplicationStatus: STATUS_TO_API_VALUE[newStatus],
                  }
                : candidate
            )
          );

          setTimeline((previous) => [
            ...previous,
            {
              Event: `Moved to ${STATUS_TO_API_VALUE[newStatus]}`,
              CreatedByName: getCurrentUserName() || (payload.ModifiedById ? `User #${payload.ModifiedById}` : "System"),
              CreatedDate: new Date().toISOString(),
              ActivityDate: new Date().toISOString(),
            },
          ]);

          setSelectedStage(STATUS_TO_STAGE_ID[newStatus]);
          resetRemarkEditor();

          addToast({
            type: "success",
            title: response.right.SuccessMessage[0]
          });
        } else {
          const message = response.left.message;
          setStageUpdateError(message);
          addToast({ type: "error", title: message });
        }

        return response;
      },
      undefined,
      (error: any) => addToast({ type: "error", title: error.message }),
      undefined,
      "Updating Candidate Stage"
    );
  };
  
  
  const handleScheduleInterview = (candidate: CandidateData) => {
    navigate(
      `/jobOpenings/interviews/schedule?candidateId=${candidate.CandidateId}&jobOpeningMasterId=${Number(jobOpeningMasterId) || 0}`,
      {
        state: {
          candidate: {
            candidateId: candidate.CandidateId,
            jobOpeningMasterId: Number(jobOpeningMasterId) || 0,
            name: getCandidateName(candidate),
            role: getCandidateRole(candidate),
            appliedRole: jobRoleName !== "Role Details" ? jobRoleName : getCandidateRole(candidate),
          },
        },
      },
    );
  };

  return (
    <div className="flex min-h-[calc(100dvh-96px)] min-w-0 flex-col rounded-lg border border-gray-200 bg-white p-5 text-sm shadow-sm lg:h-[calc(100dvh-88px)] lg:min-h-0 lg:overflow-hidden">
      <Loader loading={isLoading} title={loadingMessage}>
        <div />
      </Loader>
      <div className="shrink-0">
        <TableActionToolbar
          searchTerm={searchQuery}
          searchPlaceholder="Search By Name"
          onSearchChange={setSearchQuery}
          onClearSearch={() => setSearchQuery("")}
          isShowCustomizeButton={false}
          isShowExportButton={false}
          isShowImportButton={false}
          isShowAddButton={false}
        />
      </div>

      <div className="mt-5 min-h-0 w-full flex-1">
        <div className="grid min-h-0 grid-cols-1 items-stretch gap-5 rounded-lg bg-[#FAFBFC] lg:h-full lg:grid-cols-[260px_minmax(0,1fr)]">
          <CandidateStageSidebar
            stages={CANDIDATE_STAGES}
            counts={stageCounts}
            selectedStageId={selectedStage}
            onStageChange={handleStageFilterChange}
          />

          <div className="flex min-h-0 min-w-0 flex-col lg:h-full">
            <nav
              aria-label="Job opening breadcrumb"
              className="mb-3 flex min-h-5 shrink-0 flex-wrap items-center gap-x-[11px] gap-y-1 lg:mb-[17px] lg:h-5 lg:flex-nowrap"
            >
              <Button
                type="button"
                onClick={() => navigate(-1)}
                color="transparent"
                size="xs"
                className="text-[16px] font-semibold leading-5 text-[#24262D] hover:text-blue-600"
                style={{ height: "auto", padding: 0, fontSize: "16px", fontWeight: 600 }}
              >
                {departmentName}
              </Button>
              <span
                aria-hidden="true"
                className="flex h-5 items-center text-[16px] font-semibold leading-5 tracking-[0.6px] text-[#7B838D]"
              >
                &gt;
              </span>
              <div className="flex h-5 min-w-0 max-w-[220px] items-center text-left text-[16px] font-semibold leading-5 text-[#17181C] sm:max-w-[320px]">
                <TooltipText text={jobRoleName} maxWidth="320px" tooltipThreshold={30} isApplyBgTextColor />
              </div>
            </nav>

            <div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 items-stretch gap-3 lg:grid-cols-[1.044fr_1fr] lg:gap-[18px]">
              <CandidateListPanel
                candidates={filteredCandidates}
                selectedCandidateId={selectedCandidateId}
                onCandidateSelect={setSelectedCandidateId}
              />

              <CandidateDetailsPanel
                candidate={selectedCandidate}
                activeTab={activeTab}
                visibleRemarks={visibleRemarks}
                timeline={timeline}
                remarkText={remarkText}
                editingRemark={editingRemark}
                isLoading={isLoading}
                timelineError={timelineError}
                remarkError={remarkError}
                stageUpdateError={stageUpdateError}
                canAction={canAction}
                onTabChange={setActiveTab}
                onScheduleInterview={handleScheduleInterview}
                onRemarkTextChange={(value) => {
                  setRemarkText(value);
                  setRemarkError("");
                }}
                onRemarkSubmit={() => void handleAddUpdateCandidateRemark()}
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
  //#endregion
};

export default JobApplicationDetails;
