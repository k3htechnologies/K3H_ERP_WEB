import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";
import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants";

export type WeekOffMasterListState = {
  page: number;
  pageSize: number;
  searchTerm: string;
  filters: FilterInfo;
  sortInfo: SortInfo | undefined;
  weekOffMasterId: number;
  weekOffName: string;
  pageName: string;
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.WEEK_OFF_MASTER;

const getInitialState = (): WeekOffMasterListState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      const parsed = JSON.parse(stored) as WeekOffMasterListState;
      return {
        ...parsed,
        weekOffMasterId: parsed.weekOffMasterId || 0,
        weekOffName: parsed.weekOffName || "",
      };
    }
  } catch (error) {
    console.error('Error loading week off master list state:', error);
  }

  return {
    page: 1,
    pageSize: 20,
    searchTerm: "",
    filters: {},
    sortInfo: undefined,
    weekOffMasterId: 0,
    weekOffName: "",
    pageName: "",
  };
};

type WeekOffMasterListStateContextType = {
  listState: WeekOffMasterListState;
  updateListState: (updates: Partial<WeekOffMasterListState>) => void;
  resetFilters: () => void;
  resetToDefault: () => void;
  setWeekOffContext: (weekOffMasterId: number, weekOffName: string) => void;
  clearWeekOffContext: () => void;
};

const WeekOffMasterListStateContext = createContext<WeekOffMasterListStateContextType | null>(null);

export const WeekOffMasterListStateProvider = ({ children }: { children: ReactNode }) => {
  const [listState, setListState] = useState<WeekOffMasterListState>(() => getInitialState());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listState));
    } catch (error) {
      console.error('Error saving week off master list state:', error);
    }
  }, [listState]);

  
  const updateListState = useCallback((updates: Partial<WeekOffMasterListState>) => {
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
    const defaultState: WeekOffMasterListState = {
      page: 1,
      pageSize: 20,
      searchTerm: "",
      filters: {},
      sortInfo: undefined,
      weekOffMasterId: 0,
      weekOffName: "",
      pageName: "",
    };
    setListState(defaultState);
  }, []);


  const setWeekOffContext = useCallback((weekOffMasterId: number, weekOffName: string) => {
    setListState((prev) => ({
      ...prev,
      weekOffMasterId,
      weekOffName,
    }));
  }, []);

  
  const clearWeekOffContext = useCallback(() => {
    setListState((prev) => ({
      ...prev,
      weekOffMasterId: 0,
      weekOffName: "",
    }));
  }, []);

  const contextValue = useMemo<WeekOffMasterListStateContextType>(
    () => ({
      listState,
      updateListState,
      resetFilters,
      resetToDefault,
      setWeekOffContext,
      clearWeekOffContext,
    }),
    [listState, updateListState, resetFilters, resetToDefault, setWeekOffContext, clearWeekOffContext]
  );

  return (
    <WeekOffMasterListStateContext.Provider value={contextValue}>
      {children}
    </WeekOffMasterListStateContext.Provider>
  );
};

export const useWeekOffMasterListState = () => {
  const ctx = useContext(WeekOffMasterListStateContext);
  if (!ctx) {
    throw new Error("useWeekOffMasterListState must be used inside WeekOffMasterListStateProvider");
  }
  return ctx;
};

