import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";
import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants";

export type MeetingListState = {
  page: number;
  pageSize: number;
  searchTerm: string;
  filters: FilterInfo;
  sortInfo: SortInfo | undefined;
  meetingId: number;
  meetingTitle: string;
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.MEETING;

const getInitialState = (): MeetingListState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      const parsed = JSON.parse(stored) as MeetingListState;
      return {
        ...parsed,
        meetingId: parsed.meetingId || 0,
        meetingTitle: parsed.meetingTitle || "",
      };
    }
  } catch (error) {
    console.error('Error loading meeting list state:', error);
  }

  return {
    page: 1,
    pageSize: 20,
    searchTerm: "",
    filters: {},
    sortInfo: undefined,
    meetingId: 0,
    meetingTitle: "",
  };
};

type MeetingListStateContextType = {
  listState: MeetingListState;
  updateListState: (updates: Partial<MeetingListState>) => void;
  resetFilters: () => void;
  resetToDefault: () => void;
  setMeetingContext: (meetingId: number, meetingTitle: string) => void;
  clearMeetingContext: () => void;
};

const MeetingListStateContext = createContext<MeetingListStateContextType | null>(null);

export const MeetingListStateProvider = ({ children }: { children: ReactNode }) => {
  const [listState, setListState] = useState<MeetingListState>(() => getInitialState());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listState));
    } catch (error) {
      console.error('Error saving meeting list state:', error);
    }
  }, [listState]);

  const updateListState = useCallback((updates: Partial<MeetingListState>) => {
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
    const defaultState: MeetingListState = {
      page: 1,
      pageSize: 20,
      searchTerm: "",
      filters: {},
      sortInfo: undefined,
      meetingId: 0,
      meetingTitle: "",
    };
    setListState(defaultState);
  }, []);

  const setMeetingContext = useCallback((meetingId: number, meetingTitle: string) => {
    setListState((prev) => ({
      ...prev,
      meetingId,
      meetingTitle,
    }));
  }, []);

  const clearMeetingContext = useCallback(() => {
    setListState((prev) => ({
      ...prev,
      meetingId: 0,
      meetingTitle: "",
    }));
  }, []);

  const contextValue = useMemo<MeetingListStateContextType>(
    () => ({
      listState,
      updateListState,
      resetFilters,
      resetToDefault,
      setMeetingContext,
      clearMeetingContext,
    }),
    [listState, updateListState, resetFilters, resetToDefault, setMeetingContext, clearMeetingContext]
  );

  return (
    <MeetingListStateContext.Provider value={contextValue}>
      {children}
    </MeetingListStateContext.Provider>
  );
};

export const useMeetingListState = () => {
  const ctx = useContext(MeetingListStateContext);
  if (!ctx) {
    throw new Error("useMeetingListState must be used inside MeetingListStateProvider");
  }
  return ctx;
};
