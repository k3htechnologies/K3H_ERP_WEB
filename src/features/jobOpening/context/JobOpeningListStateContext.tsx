import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { FilterInfo } from '@/ui/components/DataTable/DataTable';
import { LOCAL_STORAGE_FOR_STATE_KEYS } from '@/core/constants';

export type JobOpeningListState = {
  page: number;
  pageSize: number;
  searchTerm: string;
  filters: FilterInfo;
  departmentId: number;
  departmentName: string;
  jobOpeningMasterId: number;
  jobRoleMasterId: number;
  jobRoleName: string;
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.JOB_OPENING;

const getInitialState = (): JobOpeningListState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      const parsed = JSON.parse(stored) as JobOpeningListState;
      return {
        ...parsed,
        departmentId: parsed.departmentId || 0,
        departmentName: parsed.departmentName || '',
        jobOpeningMasterId: parsed.jobOpeningMasterId || 0,
        jobRoleMasterId: parsed.jobRoleMasterId || 0,
        jobRoleName: parsed.jobRoleName || '',
      };
    }
  } catch (error) {
    console.error('Error loading job opening list state:', error);
  }

  return {
    page: 1,
    pageSize: 20,
    searchTerm: '',
    filters: {},
    departmentId: 0,
    departmentName: '',
    jobOpeningMasterId: 0,
    jobRoleMasterId: 0,
    jobRoleName: '',
  };
};

type JobOpeningListStateContextType = {
  listState: JobOpeningListState;
  updateListState: (updates: Partial<JobOpeningListState>) => void;
  resetFilters: () => void;
  resetToDefault: () => void;
  setJobOpeningContext: (jobOpeningMasterId: number, jobRoleMasterId: number, jobRoleName: string) => void;
  clearJobOpeningContext: () => void;
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
    setListState((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    setListState((prev) => ({
      ...prev,
      filters: {},
      searchTerm: '',
      page: 1,
    }));
  }, []);

  const resetToDefault = useCallback(() => {
    const defaultState: JobOpeningListState = {
      page: 1,
      pageSize: 20,
      searchTerm: '',
      filters: {},
      departmentId: 0,
      departmentName: '',
      jobOpeningMasterId: 0,
      jobRoleMasterId: 0,
      jobRoleName: '',
    };
    setListState(defaultState);
  }, []);

  const setJobOpeningContext = useCallback((jobOpeningMasterId: number, jobRoleMasterId: number, jobRoleName: string) => {
    setListState((prev) => ({
      ...prev,
      jobOpeningMasterId,
      jobRoleMasterId,
      jobRoleName,
    }));
  }, []);

  const clearJobOpeningContext = useCallback(() => {
    setListState((prev) => ({
      ...prev,
      jobOpeningMasterId: 0,
      jobRoleMasterId: 0,
      jobRoleName: '',
    }));
  }, []);

  const contextValue = useMemo<JobOpeningListStateContextType>(
    () => ({
      listState,
      updateListState,
      resetFilters,
      resetToDefault,
      setJobOpeningContext,
      clearJobOpeningContext,
    }),
    [listState, updateListState, resetFilters, resetToDefault, setJobOpeningContext, clearJobOpeningContext]
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
