import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";
import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants";

export type IncentiveReportListState = {
  page: number;
  pageSize: number;
  searchTerm: string;
  filters: FilterInfo;
  sortInfo: SortInfo | undefined;
  bookingId: number;
  bookingName: string;
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.INCENTIVE_REPORT;

const getInitialState = (projectId: number | null): IncentiveReportListState => {
  if (!projectId) {
    return {
      page: 1,
      pageSize: 20,
      searchTerm: "",
      filters: {},
      sortInfo: undefined,
      bookingId: 0,
      bookingName: "",
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      const parsed = JSON.parse(stored) as { projectId: number; state: IncentiveReportListState };
      if (parsed.projectId === projectId) {
        return {
          ...parsed.state,
          bookingId: parsed.state.bookingId || 0,
          bookingName: parsed.state.bookingName || "",
        };
      }
    }
  } catch (error) {
    console.error('Error loading incentive report list state:', error);
  }

  return {
    page: 1,
    pageSize: 20,
    searchTerm: "",
    filters: {},
    sortInfo: undefined,
    bookingId: 0,
    bookingName: "",
  };
};

type IncentiveReportListStateContextType = {
  listState: IncentiveReportListState;
  updateListState: (updates: Partial<IncentiveReportListState>) => void;
  resetFilters: () => void;
  resetToDefault: () => void;
  setIncentiveReportContext: (bookingId: number, bookingName: string) => void;
  clearIncentiveReportContext: () => void;
};

const IncentiveReportListStateContext = createContext<IncentiveReportListStateContextType | null>(null);

export const IncentiveReportListStateProvider = ({ children }: { children: ReactNode }) => {
  const { projectId } = useProject();
  const [listState, setListState] = useState<IncentiveReportListState>(() => getInitialState(projectId));
  const [lastProjectId, setLastProjectId] = useState<number | null>(projectId);

  useEffect(() => {
    if (projectId !== lastProjectId && lastProjectId !== null) {
      const defaultState: IncentiveReportListState = {
        page: 1,
        pageSize: 20,
        searchTerm: "",
        filters: {},
        sortInfo: undefined,
        bookingId: 0,
        bookingName: "",
      };
      setListState(defaultState);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error('Error clearing incentive report list state:', error);
      }
    }
    setLastProjectId(projectId);
  }, [projectId, lastProjectId]);

  useEffect(() => {
    if (projectId) {
      try {
        const stateToStore = {
          projectId,
          state: listState,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToStore));
      } catch (error) {
        console.error('Error saving incentive report list state:', error);
      }
    }
  }, [listState, projectId]);

  const updateListState = useCallback((updates: Partial<IncentiveReportListState>) => {
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
    const defaultState: IncentiveReportListState = {
      page: 1,
      pageSize: 20,
      searchTerm: "",
      filters: {},
      sortInfo: undefined,
      bookingId: 0,
      bookingName: "",
    };
    setListState(defaultState);
  }, []);

  const setIncentiveReportContext = useCallback((bookingId: number, bookingName: string) => {
    setListState((prev) => ({
      ...prev,
      bookingId,
      bookingName,
    }));
  }, []);

  const clearIncentiveReportContext = useCallback(() => {
    setListState((prev) => ({
      ...prev,
      bookingId: 0,
      bookingName: "",
    }));
  }, []);

  const contextValue = useMemo<IncentiveReportListStateContextType>(
    () => ({
      listState,
      updateListState,
      resetFilters,
      resetToDefault,
      setIncentiveReportContext,
      clearIncentiveReportContext,
    }),
    [listState, updateListState, resetFilters, resetToDefault, setIncentiveReportContext, clearIncentiveReportContext]
  );

  return (
    <IncentiveReportListStateContext.Provider value={contextValue}>
      {children}
    </IncentiveReportListStateContext.Provider>
  );
};

export const useIncentiveReportListState = () => {
  const ctx = useContext(IncentiveReportListStateContext);
  if (!ctx) {
    throw new Error("useIncentiveReportListState must be used insideIncentiveReportListStateProvider");
  }
  return ctx;
};
