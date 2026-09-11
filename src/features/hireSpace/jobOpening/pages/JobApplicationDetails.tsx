import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Building, Calendar, Download } from 'lucide-react';
import * as E from 'fp-ts/Either';

import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import { useToast } from '@/core/hooks/useToast';
import { runApiWithLoader } from '@/core/utils';
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import { getNameInitials } from '@/core/utils/getNameInitials';
import { Loader } from '@/core/utils/loader';
import { useViewportHeight } from '@/core/utils/useViewportHeight';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useJobOpeningListState } from '@/features/hireSpace/jobOpening/context/JobOpeningListStateContext';
import type {
  AddUpdateCandidateRemarkRequest,
  AddUpdateCandidateStageRequest,
  CandidateApplicationStageData,
  CandidateApplicationTimelineData,
  CandidateData,
  CandidateRemarkData,
  FilterWithPaginationCandidateRequest,
} from '@/features/hireSpace/jobOpening/models/CandidateModel';
import { CandidateService } from '@/features/hireSpace/jobOpening/services/CandidateService';
import { CandidateInterviewService } from '@/features/hireSpace/jobOpening/services/CandidateInterviewService';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import Tabs, { type TabItem } from '@/ui/components/Tab/Tab';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import { Breadcrumb } from '@/ui/components/Breadcrumb';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { Button, Input } from '@/ui/components/forms';
import { FieldItem } from '@/ui/components/forms/FieldItem';

const ALL_STAGES_ID = 'all';

const CANDIDATE_DETAILS_TABS: TabItem[] = [
  { id: 'Overview', label: 'Overview' },
  { id: 'Remark', label: 'Remark' },
  { id: 'Timeline', label: 'Timeline' },
];

export const JobApplicationDetails: React.FC = () => {

  const navigate = useNavigate();
  const { addToast } = useToast();
  const { canAction } = useMenuPermissions('/jobOpenings');
  const { listState, updateListState } = useJobOpeningListState();

  const departmentId = listState.departmentId;
  const jobOpeningMasterId = listState.jobOpeningMasterId;
  const departmentName = listState.departmentName || '';
  const jobRoleName = listState.jobRoleName || '';
  const jobRoleMasterId = listState.jobRoleMasterId;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState(ALL_STAGES_ID);
  const [applicationStages, setApplicationStages] = useState<CandidateApplicationStageData[]>([]);
  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [remarks, setRemarks] = useState<CandidateRemarkData[]>([]);
  const [timeline, setTimeline] = useState<CandidateApplicationTimelineData[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [remarkText, setRemarkText] = useState('');
  const [remarkError, setRemarkError] = useState('');
  const candidatesListHeight = useViewportHeight(255, 350, 900);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchCandidates(value);
  }, 350);

  const loadApplicationStages = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const response = await CandidateInterviewService.apiCallPullCandidateApplicationStage({
          DepartmentId: departmentId,
          JobOpeningId: jobOpeningMasterId,
        });

        if (E.isRight(response)) {
          setApplicationStages(response.right.Data);
        } else {
          addToast({ type: 'error', title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      'Loading Application Stages',
    );
  };

  const loadCandidates = async (searchtext?: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationCandidateRequest = {
          DepartmentId: departmentId,
          JobRoleMasterId: jobRoleMasterId,
          JobOpeningId: jobOpeningMasterId,
          ApplicationStatus: selectedStage === ALL_STAGES_ID ? undefined : selectedStage,
          FullName: searchtext?.trim() || undefined,
        };

        const response = await CandidateService.apiCallPullCandidate(params);

        if (E.isRight(response)) {
          setCandidates(response.right.Data);
          setSelectedCandidateId(response.right.Data.length > 0 ? response.right.Data[0].CandidateId : null);
        } else {
          addToast({ type: 'error', title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      'Loading Candidates',
    );
  };

  const loadCandidateRemarks = async (candidateId: number) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const response = await CandidateService.apiCallPullCandidateRemark({
          CandidateRemarkId: 0,
          CandidateId: candidateId,
        });

        if (E.isRight(response)) {
          setRemarks(response.right.Data);
        } else {
          addToast({ type: 'error', title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      'Loading Candidate Remarks',
    );
  };

  const loadCandidateTimeline = async (candidateId: number) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const response = await CandidateInterviewService.apiCallPullCandidateApplicationTimeline({
          CandidateId: candidateId,
        });

        if (E.isRight(response)) {
          setTimeline(response.right.Data);
        } else {
          addToast({ type: 'error', title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      'Loading Candidate Timeline',
    );
  };

  useEffect(() => {
    if (jobOpeningMasterId) {
      loadApplicationStages();
    }
  }, [jobOpeningMasterId]);

  useEffect(() => {
    if (jobOpeningMasterId) {
      if (searchTerm.trim()) {
        loadCandidates(searchTerm.trim());
      } else {
        loadCandidates();
      }
    }
  }, [jobOpeningMasterId, selectedStage]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    if (!selectedCandidateId) return;

    if (activeTab === 'Remark') {
      loadCandidateRemarks(selectedCandidateId);
    }

    if (activeTab === 'Timeline') {
      loadCandidateTimeline(selectedCandidateId);
    }
  }, [activeTab, selectedCandidateId]);

  useEffect(() => {
    setRemarkText('');
    setRemarkError('');
  }, [selectedCandidateId]);

  const searchCandidates = async (searchValue: string) => {
    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {
      await loadCandidates();
      return;
    }

    await loadCandidates(searchValue);
  };

  const clearSearchCandidates = () => {
    debouncedSearch.cancel?.();
    setSearchTerm('');
    loadCandidates();
  };

  const selectedCandidate = candidates.find((candidate) => candidate.CandidateId === selectedCandidateId);

    const stageTabs: TabItem[] = useMemo(
    () => [
      {
        id: ALL_STAGES_ID,
        label: 'All Applications',
        count: applicationStages.reduce((sum, stage) => sum + (Number(stage.TotalApplications) || 0), 0),
      },
      ...applicationStages.map((stage) => ({
        id: stage.Stage || '',
        label: stage.Stage || '',
        count: Number(stage.TotalApplications) || 0,
      })),
    ],
    [applicationStages],
  );

   const stageOptions = applicationStages.map((stage) => ({
    value: stage.Stage,
    label: stage.Stage,
  }));

  const handleAddCandidateRemark = async () => {
    if (!selectedCandidate) return;

    if (!remarkText.trim()) {
      setRemarkError('Please enter a remark.');
      return;
    }

    setRemarkError('');

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload: AddUpdateCandidateRemarkRequest = {
          CandidateRemarkId: 0,
          UniqueKey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          CandidateId: selectedCandidate.CandidateId,
          Remark: remarkText,
          ApplicantStatus: selectedCandidate.ApplicationStatus || '',
        };

        const response = await CandidateService.apiCallAddUpdateCandidateRemark(payload);

        if (E.isRight(response)) {
          addToast({ type: 'success', title: response.right.SuccessMessage[0] });
          await loadCandidateRemarks(payload.CandidateId);
        } else {
          addToast({ type: 'error', title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      'Add Candidate Remark',
    );
  };

  const handleStageChange = async (newStage: string) => {
    if (!selectedCandidate) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload: AddUpdateCandidateStageRequest = {
          CandidateId: selectedCandidate.CandidateId,
          UniqueKey: selectedCandidate.UniqueKey,
          ApplicantStatus: newStage,
        };

        const response = await CandidateService.apiCallAddUpdateCandidateStage(payload);

        if (E.isRight(response)) {
          addToast({ type: 'success', title: response.right.SuccessMessage[0] });
          await loadApplicationStages();
          await loadCandidates(searchTerm.trim() ? searchTerm.trim() : undefined);
        } else {
          addToast({ type: 'error', title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      'Updating Candidate Stage',
    );
  };

  const handleScheduleInterview = (candidate: CandidateData) => {
    updateListState({
      candidateId: candidate.CandidateId,
      candidateName: candidate.FullName,
    });
    navigate('/scheduleinterview', {
      state: { isComingFromJobApplicationDetails: true },
    });
  };

  const inlineBreadcrumbItems = [
    { id: 'department', label: departmentName, path: '/jobOpenings' },
    { id: 'role', label: jobRoleName },
  ];

  return (
    <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-5">
      <Loader loading={isLoading} title={loadingMessage}>
        <div />
      </Loader>

      <TableActionToolbar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Name"
        onSearchChange={(v) => {
          setSearchTerm(v);
          debouncedSearch(v);
        }}
        onClearSearch={clearSearchCandidates}
        isShowCustomizeButton={false}
        isShowExportButton={false}
        isShowImportButton={false}
        isShowAddButton={false}
      />

      <div className=" grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-4">
        <div className="min-w-0 lg:col-span-1">
          <aside className="flex flex-col rounded-lg border border-gray-200 p-4">
            <h2 className="shrink-0 pb-3 text-base font-semibold text-gray-900">Stages</h2>
            <Tabs
              tabs={stageTabs}
              defaultActive={selectedStage}
              isvertical
              onTabChange={(tab) => setSelectedStage(tab.id)}
            />
          </aside>
        </div>

        <div className="min-w-0 lg:col-span-3">
          <Breadcrumb isinline items={inlineBreadcrumbItems} className="mb-3" />

          <div className=" bg-white grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
            <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-gray-200 p-4">
              <h2 className="pb-3 text-base font-semibold text-gray-500">Candidates</h2>

              <div
                className="thin-scroll min-h-0 space-y-3 overflow-y-auto pr-1"
                style={{ maxHeight: candidatesListHeight }}
              >
                {candidates.length === 0 ? (
                  <NoDataView message="No candidates match this filter" />
                ) : (
                  candidates.map((row) => {
                    return (
                      <div
                        key={row.CandidateId}
                        className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                          selectedCandidateId === row.CandidateId
                            ? 'border-blue-300 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedCandidateId(row.CandidateId)}
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            {row.Photograph ? (
                              <img
                                src={row.Photograph}
                                alt={row.FullName || '-'}
                                className="h-10 w-10 shrink-0 rounded-full border border-gray-300 object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-600 text-sm font-semibold text-white">
                                {getNameInitials(row.FullName)}
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <TooltipText
                                text={row.FullName || '-'}
                                maxWidth="100%"
                                tooltipThreshold={18}
                                isApplyBgTextColor
                              />
                              <TooltipText
                                text={row.CurrentRole || '-'}
                                maxWidth="100%"
                                tooltipThreshold={22}
                              />
                            </div>
                          </div>

                          <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium uppercase text-gray-600">
                            {row.ApplicationStatus}
                          </span>
                        </div>

                        <div className="mb-3 border-t border-gray-200" />

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <span className="flex min-w-0 items-center gap-2 text-gray-600">
                            <Briefcase className="h-4 w-4 shrink-0" />
                            {row.YearsOfExperience ? `${row.YearsOfExperience} Years of Experience` : '-'}
                          </span>
                          <span className="flex min-w-0 items-center gap-2 text-gray-600">
                            <Building className="h-4 w-4 shrink-0" />
                            {row.CurrentCompany || '-'}
                          </span>
                          <span className="flex min-w-0 items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4 shrink-0" />
                            Applied {formatDate_dd_MonthName_yy(row.CreatedDate || '')}
                          </span>
                          <div className="flex items-center justify-end">
                            <Button
                              title="Download resume"
                              color="transparent"
                              size="sm"
                              isborderRadius
                              disabled={!row.ResumeUrl}
                              onClick={(event) => {
                                event.stopPropagation();
                                if (row.ResumeUrl) {
                                  window.open(row.ResumeUrl, '_blank');
                                }
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-gray-200 p-4">
              {selectedCandidate ? (
                <>
                  <div className="bg-white flex min-h-0 flex-1 flex-col">
                    <div className="shrink-0 border-b border-gray-200 pb-4">
                      <h2 className="text-sm text-base font-semibold text-gray-500">Candidate Details</h2>

                      <div className="mt-4 flex min-w-0 items-start gap-3">
                        {selectedCandidate.Photograph ? (
                          <img
                            src={selectedCandidate.Photograph}
                            alt={selectedCandidate.FullName || '-'}
                            className="h-10 w-10 shrink-0 rounded-full border border-gray-300 object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-600 text-sm font-semibold text-white">
                            {getNameInitials(selectedCandidate.FullName)}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <TooltipText
                            text={selectedCandidate.FullName || '-'}
                            maxWidth="100%"
                            tooltipThreshold={22}
                            isApplyBgTextColor
                            tooltipClassName="text-xl font-semibold text-gray-900"
                          />
                          {selectedCandidate.Email ? (
                            <a
                              href={`mailto:${selectedCandidate.Email}`}
                              className="mb-2.5 block truncate text-sm text-blue-600 hover:underline"
                              title={selectedCandidate.Email}
                            >
                              {selectedCandidate.Email}
                            </a>
                          ) : (
                            <span className="mt-0.5 block text-sm text-gray-500">-</span>
                          )}
                          <TooltipText
                            text={selectedCandidate.WorkLocation || '-'}
                            maxWidth="100%"
                            tooltipThreshold={28}
                            isApplyBgTextColor
                            tooltipClassName="text-sm text-gray-500"
                          />

                          {canAction && (
                            <Button
                              type="button"
                              onClick={() => handleScheduleInterview(selectedCandidate)}
                              color="green"
                              colorMode="light"
                              size="sm"
                              rightIcon={<Calendar className="h-4 w-4" />}
                            >
                              Schedule Interview
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
                        <Tabs
                          tabs={CANDIDATE_DETAILS_TABS}
                          defaultActive={activeTab}
                          islarge
                          onTabChange={(tab) => setActiveTab(tab.id)}
                        />
                      </div>
                    </div>

                    <div
                      className="thin-scroll min-h-0 overflow-x-hidden overflow-y-auto py-4"
                      style={{ maxHeight: candidatesListHeight }}
                    >
                      {activeTab === 'Overview' && (
                        <div>
                          <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2">
                            <FieldItem
                              label="Current Position"
                              value={`${selectedCandidate.CurrentRole || '-'} at ${
                                selectedCandidate.CurrentCompany || '-'
                              }`}
                            />
                        <FieldItem
                          label="Experience"
                          value={
                            selectedCandidate.YearsOfExperience
                              ? `${selectedCandidate.YearsOfExperience} years`
                              : ""}
                            />
                            <FieldItem
                              label="Expected Salary"
                              value={
                                selectedCandidate.ExpectedSalary
                                  ? `₹ ${selectedCandidate.ExpectedSalary}`
                                  : ""}
                            />

                            <FieldItem
                              label="Notice Period"
                              value={
                                selectedCandidate.NoticePeriod
                                  ? `${selectedCandidate.NoticePeriod} days`
                                  : ""}
                            />
                          </div>

                          <hr className="mt-6 border-t border-gray-200" />

                          <p className="mb-3 mt-4 text-sm font-normal uppercase text-gray-500">
                            Top Skills
                          </p>
                          <span className="text-sm font-medium text-gray-900">
                            {selectedCandidate.Skills|| '-'}
                          </span>

                          <hr className="mt-6 border-t border-gray-200" />

                          <p className="mb-3 mt-4 text-sm font-normal uppercase text-gray-500">
                            Education
                          </p>
                          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <h4 className="text-sm font-medium text-gray-900">
                              {selectedCandidate.HighestQualification || '-'}
                            </h4>
                            <p className="mt-1 text-sm font-normal text-gray-500">
                              {selectedCandidate.UniversityInstitution || '-'} &bull;{' '}
                              {selectedCandidate.GraduationYear || '-'}
                            </p>
                          </div>
                        </div>
                      )}

                      {activeTab === 'Remark' && (
                        <div>
                          {canAction && (
                            <form
                              className="mb-4"
                              onSubmit={(event) => {
                                event.preventDefault();
                                handleAddCandidateRemark();
                              }}
                            >
                              <label
                                htmlFor="candidate-remark"
                                className="mb-2 block text-base font-medium text-gray-900"
                              >
                                Add Remark
                              </label>
                              <Input
                                id="candidate-remark"
                                type="text"
                                size="sm"
                                value={remarkText}
                                onChange={(event) => {
                                  setRemarkText(event.target.value);
                                  setRemarkError('');
                                }}
                                placeholder="Enter Remark"

                                error={remarkError}
                              />
                            </form>
                          )}

                          <div className="space-y-3">
                            {remarks.length === 0 ? (
                              <NoDataView message="No remarks found" />
                            ) : (
                              remarks.map((remark) => (
                                <div key={remark.CreatedBy}>
                                  <div className="mb-1.5 text-sm font-medium text-gray-500">
                                    <TooltipText
                                      text={`${remark.CreatedBy} - ${remark.CreatedByDesignationName} `}
                                      maxWidth="100%"
                                      tooltipThreshold={30}
                                      isApplyBgTextColor
                                    />
                                  </div>
                                  <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-900">
                                    <span className="block whitespace-pre-wrap break-words text-left">
                                      {remark.Remark}
                                    </span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}

                      {activeTab === 'Timeline' && (
                        <div className="mt-3">
                          {timeline.length > 0 ? (
                            <>
                              {timeline.map((item, index) => (
                                <div
                                  key={`${item.Stage}-${item.CreatedDate}-${index}`}
                                  className="grid grid-cols-[24px_1fr] gap-3"
                                >
                                  <div className="flex flex-col items-center">
                                    <div className="h-4 w-4 shrink-0 rounded-full bg-blue-600" />
                                    <div
                                      className={`w-[3px] min-h-[40px] flex-1 ${
                                        index === timeline.length - 1 ? 'bg-blue-200' : 'bg-blue-600'
                                      }`}
                                    />
                                  </div>

                                  <div className="pb-5">
                                    <div className="flex items-start justify-between gap-3">
                                      <h4 className="text-base font-semibold text-gray-900">
                                        {item.Stage}
                                      </h4>
                                      <span className="shrink-0 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate_dd_MonthName_yy(item.CreatedDate || '')}
                                      </span>
                                    </div>
                                    <p className="mt-0.5 text-sm text-gray-400">
                                      By : {item.CreatedBy}
                                    </p>
                                  </div>
                                </div>
                              ))}

                              <div className="grid grid-cols-[24px_1fr] gap-3">
                                <div className="flex flex-col items-center">
                                  <div className="h-4 w-4 shrink-0 rounded-full bg-blue-200" />
                                </div>
                                <div />
                              </div>
                            </>
                          ) : (
                            <div className="py-8 text-center text-gray-500">
                              <NoDataView message="No activity yet" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 border-t border-gray-200 bg-blue-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm text-gray-500">Current Stage:</span>
                    <div className="w-full sm:w-36">
                      <SinglePageSelection
                        size="sm"
                        searchable={false}
                        isShowClearSelection={false}
                        value={selectedCandidate.ApplicationStatus || ''}
                        disabled={!canAction || isLoading}
                        options={stageOptions}
                        onChange={(value) => handleStageChange(String(value))}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <NoDataView message="Select a candidate to view details" />
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationDetails;
