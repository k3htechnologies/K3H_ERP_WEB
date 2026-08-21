import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";
import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants";

export type JobRoleMasterListState = {
  page: number;
  pageSize: number;
  searchTerm: string;
  filters: FilterInfo;
  sortInfo: SortInfo | undefined;
  departmentId: number;
  departmentName: string;
  jobRoleId: number;
  jobRoleName: string;
  uniqueKey: string;
  pageName: string;
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.JOB_ROLE_MASTER;

const getInitialState = (): JobRoleMasterListState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      const parsed = JSON.parse(stored) as JobRoleMasterListState;
      return {
        ...parsed,
        departmentId: parsed.departmentId || 0,
        departmentName: parsed.departmentName || "",
        jobRoleId: parsed.jobRoleId || 0,
        jobRoleName: parsed.jobRoleName || "",
        uniqueKey: parsed.uniqueKey || "",
      };
    }
  } catch (error) {
    console.error('Error loading job role master list state:', error);
  }

  return {
    page: 1,
    pageSize: 20,
    searchTerm: "",
    filters: {},
    sortInfo: undefined,
    departmentId: 0,
    departmentName: "",
    jobRoleId: 0,
    jobRoleName: "",
    uniqueKey: "",
    pageName: "",
  };
};

type JobRoleMasterListStateContextType = {
  listState: JobRoleMasterListState;
  updateListState: (updates: Partial<JobRoleMasterListState>) => void;
  resetFilters: () => void;
  resetToDefault: () => void;
  setJobRoleMasterContext: (jobRoleId: number, jobRoleName: string, uniqueKey: string) => void;
  clearJobRoleMasterContext: () => void;
};

const JobRoleMasterListStateContext = createContext<JobRoleMasterListStateContextType | null>(null);

export const JobRoleMasterListStateProvider = ({ children }: { children: ReactNode }) => {
  const [listState, setListState] = useState<JobRoleMasterListState>(() => getInitialState());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listState));
    } catch (error) {
      console.error('Error saving job role master list state:', error);
    }
  }, [listState]);

  const updateListState = useCallback((updates: Partial<JobRoleMasterListState>) => {
    setListState((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    setListState((prev) => ({
      ...prev,
      filters: {},
      searchTerm: "",
      sortInfo: undefined,
      page: 1,
    }));
  }, []);

  const setJobRoleMasterContext = useCallback((jobRoleId: number, jobRoleName: string, uniqueKey: string) => {
    setListState((prev) => ({
      ...prev,
      jobRoleId,
      jobRoleName,
      uniqueKey,
    }));
  }, []);

  const clearJobRoleMasterContext = useCallback(() => {
    setListState((prev) => ({
      ...prev,
      jobRoleId: 0,
      jobRoleName: "",
      uniqueKey: "",
    }));
  }, []);

  const resetToDefault = useCallback(() => {
    const defaultState: JobRoleMasterListState = {
      page: 1,
      pageSize: 20,
      searchTerm: "",
      filters: {},
      sortInfo: undefined,
      departmentId: 0,
      departmentName: "",
      jobRoleId: 0,
      jobRoleName: "",
      uniqueKey: "",
      pageName: "",
    };
    setListState(defaultState);
  }, []);

  const contextValue = useMemo<JobRoleMasterListStateContextType>(
    () => ({
      listState,
      updateListState,
      resetFilters,
      resetToDefault,
      setJobRoleMasterContext,
      clearJobRoleMasterContext,
    }),
    [listState, updateListState, resetFilters, resetToDefault, setJobRoleMasterContext, clearJobRoleMasterContext]
  );

  return (
    <JobRoleMasterListStateContext.Provider value={contextValue}>
      {children}
    </JobRoleMasterListStateContext.Provider>
  );
};

export const useJobRoleMasterListState = () => {
  const ctx = useContext(JobRoleMasterListStateContext);
  if (!ctx) {
    throw new Error("useJobRoleMasterListState must be used inside JobRoleMasterListStateProvider");
  }
  return ctx;
};
