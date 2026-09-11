import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { FilterInfo } from '@/ui/components/DataTable/DataTable';
import { LOCAL_STORAGE_FOR_STATE_KEYS } from '@/core/constants';

export type JobOpeningListState = {
  searchTerm: string;
  filters: FilterInfo;
  departmentId: number;
  departmentName: string;
  jobOpeningMasterId: number;
  jobRoleMasterId: number;
  jobRoleName: string;
  candidateId: number;
  candidateName: string;
  candidateCurrentRole: string;
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.JOB_OPENING;

const getInitialState = (): JobOpeningListState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      const parsed = JSON.parse(stored) as JobOpeningListState;
      return {
        searchTerm: parsed.searchTerm || '',
        filters: parsed.filters || {},
        departmentId: parsed.departmentId || 0,
        departmentName: parsed.departmentName || '',
        jobOpeningMasterId: parsed.jobOpeningMasterId || 0,
        jobRoleMasterId: parsed.jobRoleMasterId || 0,
        jobRoleName: parsed.jobRoleName || '',
        candidateId: parsed.candidateId || 0,
        candidateName: parsed.candidateName || '',
        candidateCurrentRole: parsed.candidateCurrentRole || '',
      };
    }
  } catch (error) {
    console.error('Error loading job opening list state:', error);
  }

  return {
    searchTerm: '',
    filters: {},
    departmentId: 0,
    departmentName: '',
    jobOpeningMasterId: 0,
    jobRoleMasterId: 0,
    jobRoleName: '',
    candidateId: 0,
    candidateName: '',
    candidateCurrentRole: '',
  };
};

type JobOpeningListStateContextType = {
  listState: JobOpeningListState;
  updateListState: (updates: Partial<JobOpeningListState>) => void;
};

const JobOpeningListStateContext = createContext<JobOpeningListStateContextType | null>(null);

export const JobOpeningListStateProvider = ({ children }: { children: ReactNode }) => {
  const [listState, setListState] = useState<JobOpeningListState>(() => getInitialState());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listState));
    } catch (error) {
      console.error('Error saving job opening list state:', error);
    }
  }, [listState]);

  const updateListState = useCallback((updates: Partial<JobOpeningListState>) => {
    setListState((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (error) {
        console.error('Error saving job opening list state:', error);
      }
      return next;
    });
  }, []);

  const contextValue = useMemo<JobOpeningListStateContextType>(
    () => ({
      listState,
      updateListState,
    }),
    [listState, updateListState],
  );

  return (
    <JobOpeningListStateContext.Provider value={contextValue}>
      {children}
    </JobOpeningListStateContext.Provider>
  );
};

export const useJobOpeningListState = () => {
  const ctx = useContext(JobOpeningListStateContext);
  if (!ctx) {
    throw new Error('useJobOpeningListState must be used inside JobOpeningListStateProvider');
  }
  return ctx;
};
