import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";
import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants";

export type LeaveListState = {
  page: number;
  pageSize: number;
  searchTerm: string;
  filters: FilterInfo;
  sortInfo: SortInfo | undefined;
  leaveId: number;
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.LEAVE;

const getInitialState = (): LeaveListState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      const parsed = JSON.parse(stored) as LeaveListState;
      return {
        ...parsed,
        leaveId: parsed.leaveId || 0,
      };
    }
  } catch (error) {
    console.error('Error loading leave list state:', error);
  }

  return {
    page: 1,
    pageSize: 20,
    searchTerm: "",
    filters: {},
    sortInfo: undefined,
    leaveId: 0,
  };
};

type LeaveListStateContextType = {
  listState: LeaveListState;
  updateListState: (updates: Partial<LeaveListState>) => void;
  resetFilters: () => void;
  resetToDefault: () => void;
  setLeaveContext: (leaveId: number) => void;
  clearLeaveContext: () => void;
};

const LeaveListStateContext = createContext<LeaveListStateContextType | null>(null);

export const LeaveListStateProvider = ({ children }: { children: ReactNode }) => {
  const [listState, setListState] = useState<LeaveListState>(() => getInitialState());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listState));
    } catch (error) {
      console.error('Error saving leave list state:', error);
    }
  }, [listState]);

  const updateListState = useCallback((updates: Partial<LeaveListState>) => {
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

  const resetToDefault = useCallback(() => {
    const defaultState: LeaveListState = {
      page: 1,
      pageSize: 20,
      searchTerm: "",
      filters: {},
      sortInfo: undefined,
      leaveId: 0,
    };
    setListState(defaultState);
  }, []);

  const setLeaveContext = useCallback((leaveId: number) => {
    setListState((prev) => ({
      ...prev,
      leaveId,
    }));
  }, []);

  const clearLeaveContext = useCallback(() => {
    setListState((prev) => ({
      ...prev,
      leaveId: 0,
    }));
  }, []);

  const contextValue = useMemo<LeaveListStateContextType>(
    () => ({
      listState,
      updateListState,
      resetFilters,
      resetToDefault,
      setLeaveContext,
      clearLeaveContext,
    }),
    [listState, updateListState, resetFilters, resetToDefault, setLeaveContext, clearLeaveContext]
  );

  return (
    <LeaveListStateContext.Provider value={contextValue}>
      {children}
    </LeaveListStateContext.Provider>
  );
};

export const useLeaveListState = () => {
  const ctx = useContext(LeaveListStateContext);
  if (!ctx) {
    throw new Error("useLeaveListState must be used inside LeaveListStateProvider");
  }
  return ctx;
}
