import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { LOCAL_STORAGE_FOR_STATE_KEYS } from '@/core/constants';

export type JobRoleMasterListState = {
  searchTerm: string;
  departmentId: number;
  departmentName: string;
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.JOB_ROLE_MASTER;

const getInitialState = (): JobRoleMasterListState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      const parsed = JSON.parse(stored) as JobRoleMasterListState;
      return {
        searchTerm: parsed.searchTerm || '',
        departmentId: parsed.departmentId || 0,
        departmentName: parsed.departmentName || '',
      };
    }
  } catch (error) {
    console.error('Error loading job role master list state:', error);
  }

  return {
    searchTerm: '',
    departmentId: 0,
    departmentName: '',
  };
};

type JobRoleMasterListStateContextType = {
  listState: JobRoleMasterListState;
  updateListState: (updates: Partial<JobRoleMasterListState>) => void;
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

  const contextValue = useMemo<JobRoleMasterListStateContextType>(
    () => ({
      listState,
      updateListState,
    }),
    [listState, updateListState],
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
    throw new Error('useJobRoleMasterListState must be used inside JobRoleMasterListStateProvider');
  }
  return ctx;
};
