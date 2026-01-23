import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";
import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants";

export type ShiftMasterListState = {
  page: number;
  pageSize: number;
  searchTerm: string;
  filters: FilterInfo;
  sortInfo: SortInfo | undefined;
  shiftMasterId: number;
  shiftName: string;
  pageName: string;
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.SHIFT_MASTER;

const getInitialState = (): ShiftMasterListState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      const parsed = JSON.parse(stored) as ShiftMasterListState;
      return {
        ...parsed,
        shiftMasterId: parsed.shiftMasterId || 0,
        shiftName: parsed.shiftName || "",
      };
    }
  } catch (error) {
    console.error('Error loading shift master list state:', error);
  }

  return {
    page: 1,
    pageSize: 20,
    searchTerm: "",
    filters: {},
    sortInfo: undefined,
    shiftMasterId: 0,
    shiftName: "",
    pageName: "",
  };
};

type ShiftMasterListStateContextType = {
  listState: ShiftMasterListState;
  updateListState: (updates: Partial<ShiftMasterListState>) => void;
  resetFilters: () => void;
  resetToDefault: () => void;
  setShiftContext: (shiftMasterId: number, shiftName: string) => void;
  clearShiftContext: () => void;
};

const ShiftMasterListStateContext = createContext<ShiftMasterListStateContextType | null>(null);

export const ShiftMasterListStateProvider = ({ children }: { children: ReactNode }) => {
  const [listState, setListState] = useState<ShiftMasterListState>(() => getInitialState());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listState));
    } catch (error) {
      console.error('Error saving shift master list state:', error);
    }
  }, [listState]);

  
  const updateListState = useCallback((updates: Partial<ShiftMasterListState>) => {
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
    const defaultState: ShiftMasterListState = {
      page: 1,
      pageSize: 20,
      searchTerm: "",
      filters: {},
      sortInfo: undefined,
      shiftMasterId: 0,
      shiftName: "",
      pageName: "",
    };
    setListState(defaultState);
  }, []);


  const setShiftContext = useCallback((shiftMasterId: number, shiftName: string) => {
    setListState((prev) => ({
      ...prev,
      shiftMasterId,
      shiftName,
    }));
  }, []);

  
  const clearShiftContext = useCallback(() => {
    setListState((prev) => ({
      ...prev,
      shiftMasterId: 0,
      shiftName: "",
    }));
  }, []);

  const contextValue = useMemo<ShiftMasterListStateContextType>(
    () => ({
      listState,
      updateListState,
      resetFilters,
      resetToDefault,
      setShiftContext,
      clearShiftContext,
    }),
    [listState, updateListState, resetFilters, resetToDefault, setShiftContext, clearShiftContext]
  );

  return (
    <ShiftMasterListStateContext.Provider value={contextValue}>
      {children}
    </ShiftMasterListStateContext.Provider>
  );
};

export const useShiftMasterListState = () => {
  const ctx = useContext(ShiftMasterListStateContext);
  if (!ctx) {
    throw new Error("useShiftMasterListState must be used inside ShiftMasterListStateProvider");
  }
  return ctx;
};

