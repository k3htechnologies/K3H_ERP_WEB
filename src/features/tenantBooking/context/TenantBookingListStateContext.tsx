import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";
import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants";

export type TenantBookingListState = {
  page: number;
  pageSize: number;
  searchTerm: string;
  filters: FilterInfo;
  sortInfo: SortInfo | undefined;
  bookingId: number;
  bookingName: string;
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.TENANT_BOOKING;

const getInitialState = (projectId: number | null): TenantBookingListState => {
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
      const parsed = JSON.parse(stored) as { projectId: number; state: TenantBookingListState };
      if (parsed.projectId === projectId) {
        return {
          ...parsed.state,
          bookingId: parsed.state.bookingId || 0,
          bookingName: parsed.state.bookingName || "",
        };
      }
    }
  } catch (error) {
    console.error('Error loading booking list state:', error);
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

type TenantBookingListStateContextType = {
  listState: TenantBookingListState;
  updateTenantListState: (updates: Partial<TenantBookingListState>) => void;
  resetFilters: () => void;
  resetToDefault: () => void;
  setTenantBookingContext: (bookingId: number, bookingName: string) => void;
  clearTenantBookingContext: () => void;
};

const TenantBookingListStateContext = createContext<TenantBookingListStateContextType | null>(null);

export const TenantBookingListStateProvider = ({ children }: { children: ReactNode }) => {
  const { projectId } = useProject();
  const [listState, setListState] = useState<TenantBookingListState>(() => getInitialState(projectId));
  const [lastProjectId, setLastProjectId] = useState<number | null>(projectId);

  useEffect(() => {
    if (projectId !== lastProjectId && lastProjectId !== null) {
      const defaultState: TenantBookingListState = {
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
        console.error('Error clearing booking list state:', error);
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
        console.error('Error saving tenant booking list state:', error);
      }
    }
  }, [listState, projectId]);

  const updateTenantListState = useCallback((updates: Partial<TenantBookingListState>) => {
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
    const defaultState: TenantBookingListState = {
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

  const setTenantBookingContext = useCallback((bookingId: number, bookingName: string) => {
    setListState((prev) => ({
      ...prev,
      bookingId,
      bookingName,
    }));
  }, []);

  const clearTenantBookingContext = useCallback(() => {
    setListState((prev) => ({
      ...prev,
      bookingId: 0,
      bookingName: "",
    }));
  }, []);

  const contextValue = useMemo<TenantBookingListStateContextType>(
    () => ({
      listState,
      updateTenantListState,
      resetFilters,
      resetToDefault,
      setTenantBookingContext,
      clearTenantBookingContext,
    }),
    [listState, updateTenantListState, resetFilters, resetToDefault, setTenantBookingContext, clearTenantBookingContext]
  );

  return (
    <TenantBookingListStateContext.Provider value={contextValue}>
      {children}
    </TenantBookingListStateContext.Provider>
  );
};

export const useTenantBookingListState = () => {
  const ctx = useContext(TenantBookingListStateContext);
  if (!ctx) {
    throw new Error("useTenantBookingListState must be used inside TenantBookingListStateProvider");
  }
  return ctx;
};

