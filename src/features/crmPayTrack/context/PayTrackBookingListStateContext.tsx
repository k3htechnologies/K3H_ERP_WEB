import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";
import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants";
import type { BookingOtherChargesData } from "@/features/booking/models/BookingModel";

export type PayTrackBookingListState = {
  page: number;
  pageSize: number;
  searchTerm: string;
  filters: FilterInfo;
  sortInfo: SortInfo | undefined;
  bookingId: number;
  bookingName: string;
  bookingType: string;
  bookingOtherChargesData?: BookingOtherChargesData[];
  totalUnitCost: number;
  flat: string;
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.PAY_TRACK_BOOKING;

const getInitialState = (projectId: number | null): PayTrackBookingListState => {
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
      totalUnitCost: 0,
      flat: "",
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      const parsed = JSON.parse(stored) as { projectId: number; state: PayTrackBookingListState };
      if (parsed.projectId === projectId) {
        return {
          ...parsed.state,
          bookingId: parsed.state.bookingId || 0,
          bookingName: parsed.state.bookingName || "",
          bookingType: parsed.state.bookingType || "",
          flat: parsed.state.flat || "",
          totalUnitCost: parsed.state.totalUnitCost || 0,
          bookingOtherChargesData: parsed.state.bookingOtherChargesData || [],
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
    totalUnitCost:0,
    bookingOtherChargesData: [],

  };
};

type PayTrackBookingListStateContextType = {
  listState: PayTrackBookingListState;
  updateListState: (updates: Partial<PayTrackBookingListState>) => void;
  resetFilters: () => void;
  resetToDefault: () => void;
  setPayTrackBookingContext: (bookingId: number, bookingName: string, bookingType: string, flat: string,totalUnitCost: number, bookingOtherChargesData?: BookingOtherChargesData[]) => void;
  clearPayTrackBookingContext: () => void;
};

const PayTrackBookingListStateContext = createContext<PayTrackBookingListStateContextType | null>(null);

export const PayTrackBookingListStateProvider = ({ children }: { children: ReactNode }) => {
  const { projectId } = useProject();
  const [listState, setListState] = useState<PayTrackBookingListState>(() => getInitialState(projectId));
  const [lastProjectId, setLastProjectId] = useState<number | null>(projectId);

  useEffect(() => {
    if (projectId !== lastProjectId && lastProjectId !== null) {
      const defaultState: PayTrackBookingListState = {
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

  const updateListState = useCallback((updates: Partial<PayTrackBookingListState>) => {
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
    const defaultState: PayTrackBookingListState = {
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
    };
    setListState(defaultState);
  }, []);

  const setPayTrackBookingContext = useCallback((bookingId: number, bookingName: string,bookingType: string, flat: string,totalUnitCost: number, bookingOtherChargesData?: BookingOtherChargesData[]) => {
    setListState((prev) => ({
      ...prev,
      bookingId,
      bookingName,
      bookingType,
      flat,
      totalUnitCost,
      bookingOtherChargesData: bookingOtherChargesData || [],
    }));
  }, []);

  const clearPayTrackBookingContext = useCallback(() => {
    setListState((prev) => ({
      ...prev,
      bookingId: 0,
      bookingName: "",
      bookingType: "",
      flat: "",
      totalUnitCost: 0,
      bookingOtherChargesData: [],
    }));
  }, []);

  const contextValue = useMemo<PayTrackBookingListStateContextType>(
    () => ({
      listState,
      updateListState,
      resetFilters,
      resetToDefault,
      setPayTrackBookingContext,
      clearPayTrackBookingContext,
    }),
    [listState, updateListState, resetFilters, resetToDefault, setPayTrackBookingContext, clearPayTrackBookingContext]
  );

  return (
    <PayTrackBookingListStateContext.Provider value={contextValue}>
      {children}
    </PayTrackBookingListStateContext.Provider>
  );
};

export const usePayTrackBookingListState = () => {
  const ctx = useContext(PayTrackBookingListStateContext);
  if (!ctx) {
    throw new Error("useBookingListState must be used inside BookingListStateProvider");
  }
  return ctx;
};

