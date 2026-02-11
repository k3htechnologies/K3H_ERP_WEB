import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";

export type BookingListState = {
  page: number;
  pageSize: number;
  searchTerm: string;
  filters: FilterInfo;
  sortInfo: SortInfo | undefined;
  bookingId: number;
  bookingName: string;
};

const STORAGE_KEY = 'booking.listState';

const getInitialState = (projectId: number | null): BookingListState => {
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
      const parsed = JSON.parse(stored) as { projectId: number; state: BookingListState };
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

type BookingListStateContextType = {
  listState: BookingListState;
  updateListState: (updates: Partial<BookingListState>) => void;
  resetFilters: () => void;
  resetToDefault: () => void;
  setBookingContext: (bookingId: number, bookingName: string) => void;
  clearBookingContext: () => void;
};

const BookingListStateContext = createContext<BookingListStateContextType | null>(null);

export const BookingListStateProvider = ({ children }: { children: ReactNode }) => {
  const { projectId } = useProject();
  const [listState, setListState] = useState<BookingListState>(() => getInitialState(projectId));
  const [lastProjectId, setLastProjectId] = useState<number | null>(projectId);

  useEffect(() => {
    if (projectId !== lastProjectId && lastProjectId !== null) {
      const defaultState: BookingListState = {
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
        console.error('Error saving booking list state:', error);
      }
    }
  }, [listState, projectId]);

  const updateListState = useCallback((updates: Partial<BookingListState>) => {
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
    const defaultState: BookingListState = {
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

  const setBookingContext = useCallback((bookingId: number, bookingName: string) => {
    setListState((prev) => ({
      ...prev,
      bookingId,
      bookingName,
    }));
  }, []);

  const clearBookingContext = useCallback(() => {
    setListState((prev) => ({
      ...prev,
      bookingId: 0,
      bookingName: "",
    }));
  }, []);

  const contextValue = useMemo<BookingListStateContextType>(
    () => ({
      listState,
      updateListState,
      resetFilters,
      resetToDefault,
      setBookingContext,
      clearBookingContext,
    }),
    [listState, updateListState, resetFilters, resetToDefault, setBookingContext, clearBookingContext]
  );

  return (
    <BookingListStateContext.Provider value={contextValue}>
      {children}
    </BookingListStateContext.Provider>
  );
};

export const useBookingListState = () => {
  const ctx = useContext(BookingListStateContext);
  if (!ctx) {
    throw new Error("useBookingListState must be used inside BookingListStateProvider");
  }
  return ctx;
};

