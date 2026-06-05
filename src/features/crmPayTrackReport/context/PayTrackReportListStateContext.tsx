import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";
import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants";
import type { BookingOtherChargesData } from "@/features/booking/models/BookingModel";
import type { PayTrackBookingData } from "@/features/crmPayTrack/models/PayTrackBookingModel";

export type PayTrackReportListState = {
  page: number;
  pageSize: number;
  searchTerm: string;
  filters: FilterInfo;
  sortInfo: SortInfo | undefined;
  bookingId: number;
  bookingName: string;
  bookingType: string;
  bookingOtherChargesData?: BookingOtherChargesData[];
  bookingData?: PayTrackBookingData | null;
  totalUnitCost: number;
  flat: string;
  activeTab?: string;
  activeSubTab?: string;
  refreshKey: number;
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.PAY_TRACK_REPORT;

const getInitialState = (projectId: number | null): PayTrackReportListState => {
  if (!projectId) {
    return {
      page: 1,
      pageSize: 20,
      searchTerm: "",
      filters: {},
      sortInfo: undefined,
      bookingId: 0,
      bookingName: "",
      bookingType: "",
      bookingOtherChargesData: [],
      bookingData: null,
      totalUnitCost: 0,
      flat: "",
      activeTab: undefined,
      activeSubTab: undefined,
      refreshKey: 0,
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      const parsed = JSON.parse(stored) as { projectId: number; state: PayTrackReportListState };
      if (parsed.projectId === projectId) {
        return {
          ...parsed.state,
          bookingId: parsed.state.bookingId || 0,
          bookingName: parsed.state.bookingName || "",
          bookingType: parsed.state.bookingType || "",
          flat: parsed.state.flat || "",
          totalUnitCost: parsed.state.totalUnitCost || 0,
          bookingOtherChargesData: parsed.state.bookingOtherChargesData || [],
          bookingData: parsed.state.bookingData || null,
          activeTab: parsed.state.activeTab,
          activeSubTab: parsed.state.activeSubTab,
          refreshKey: 0,
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
    bookingType: "",
    flat: "",
    totalUnitCost: 0,
    bookingOtherChargesData: [],
    bookingData: null,
    activeTab: undefined,
    activeSubTab: undefined,
    refreshKey: 0,
  };
};

type PayTrackReportListStateContextType = {
  listState: PayTrackReportListState;
  updateListState: (updates: Partial<PayTrackReportListState>) => void;
  resetFilters: () => void;
  resetToDefault: () => void;
  setPayTrackReportContext: (bookingId: number, bookingName: string, bookingType: string, flat: string, totalUnitCost: number, bookingOtherChargesData?: BookingOtherChargesData[], bookingData?: PayTrackBookingData) => void;
  clearPayTrackReportContext: () => void;
  triggerRefresh: () => void;
};

const PayTrackReportListStateContext = createContext<PayTrackReportListStateContextType | null>(null);

export const PayTrackReportListStateProvider = ({ children }: { children: ReactNode }) => {
  const { projectId } = useProject();
  const [listState, setListState] = useState<PayTrackReportListState>(() => getInitialState(projectId));
  const [lastProjectId, setLastProjectId] = useState<number | null>(projectId);

  useEffect(() => {
    if (projectId !== lastProjectId && lastProjectId !== null) {
      const defaultState: PayTrackReportListState = {
        page: 1,
        pageSize: 20,
        searchTerm: "",
        filters: {},
        sortInfo: undefined,
        bookingId: 0,
        bookingName: "",
        bookingType: "",
        flat: "",
        totalUnitCost: 0,
        bookingOtherChargesData: [],
        bookingData: null,
        activeTab: undefined,
        activeSubTab: undefined,
        refreshKey: 0,
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
        console.error('Error saving booking list state:', error);
      }
    }
  }, [listState, projectId]);

  const updateListState = useCallback((updates: Partial<PayTrackReportListState>) => {
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
    const defaultState: PayTrackReportListState = {
      page: 1,
      pageSize: 20,
      searchTerm: "",
      filters: {},
      sortInfo: undefined,
      bookingId: 0,
      bookingName: "",
      bookingType: "",
      flat: "",
      totalUnitCost: 0,
      bookingOtherChargesData: [],
      bookingData: null,
      activeTab: undefined,
      activeSubTab: undefined,
      refreshKey: 0,
    };
    setListState(defaultState);
  }, []);

  const setPayTrackReportContext = useCallback((bookingId: number, bookingName: string, bookingType: string, flat: string, totalUnitCost: number, bookingOtherChargesData?: BookingOtherChargesData[], bookingData?: PayTrackBookingData) => {
    setListState((prev) => ({
      ...prev,
      bookingId,
      bookingName,
      bookingType,
      flat,
      totalUnitCost,
      bookingOtherChargesData: bookingOtherChargesData || [],
      bookingData: bookingData || null,
      activeTab: undefined,
      activeSubTab: undefined,
      refreshKey: 0,
    }));
  }, []);

  const clearPayTrackReportContext = useCallback(() => {
    setListState((prev) => ({
      ...prev,
      bookingId: 0,
      bookingName: "",
      bookingType: "",
      flat: "",
      totalUnitCost: 0,
      bookingOtherChargesData: [],
      bookingData: null,
      activeTab: undefined,
      activeSubTab: undefined,
      refreshKey: 0,
    }));
  }, []);

  const triggerRefresh = useCallback(() => {
    setListState((prev) => ({ ...prev, refreshKey: (prev.refreshKey || 0) + 1 }));
  }, []);

  const contextValue = useMemo<PayTrackReportListStateContextType>(
    () => ({
      listState,
      updateListState,
      resetFilters,
      resetToDefault,
      setPayTrackReportContext,
      clearPayTrackReportContext,
      triggerRefresh,
    }),
    [listState, updateListState, resetFilters, resetToDefault, setPayTrackReportContext, clearPayTrackReportContext, triggerRefresh]
  );

  return (
    <PayTrackReportListStateContext.Provider value={contextValue}>
      {children}
    </PayTrackReportListStateContext.Provider>
  );
};

export const usePayTrackReportListState = () => {
  const ctx = useContext(PayTrackReportListStateContext);
  if (!ctx) {
    throw new Error("useBookingListState must be used inside BookingListStateProvider");
  }
  return ctx;
};



