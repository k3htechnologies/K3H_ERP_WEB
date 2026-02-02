import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";
import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants";

export type LeaveCreditConfigurationListState = {
  page: number;
  pageSize: number;
  searchTerm: string;
  filters: FilterInfo;
  sortInfo: SortInfo | undefined;
  leaveCreditConfigurationId: number;
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.LEAVECREDITCONFIGURATION;

const getInitialState = (): LeaveCreditConfigurationListState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as LeaveCreditConfigurationListState;
      return {
        ...parsed,
        leaveCreditConfigurationId: parsed.leaveCreditConfigurationId || 0,
      };
    }
  } catch (error) {
    console.error('Error loading leave credit configuration list state:', error);
  }

  return {
    page: 1,
    pageSize: 20,
    searchTerm: "",
    filters: {},
    sortInfo: undefined,
    leaveCreditConfigurationId: 0,
  };
};

type LeaveCreditConfigurationListStateContextType = {
  listState: LeaveCreditConfigurationListState;
  updateListState: (updates: Partial<LeaveCreditConfigurationListState>) => void;
  resetFilters: () => void;
  resetToDefault: () => void;
  clearLeaveCreditConfigurationContext: () => void;
};

const LeaveCreditConfigurationListStateContext = createContext<LeaveCreditConfigurationListStateContextType | null>(null);

export const LeaveCreditConfigurationListStateProvider = ({ children }: { children: ReactNode }) => {
  const [listState, setListState] = useState<LeaveCreditConfigurationListState>(() => getInitialState());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listState));
    } catch (error) {
      console.error('Error saving leave credit configuration list state:', error);
    }
  }, [listState]);

  const updateListState = useCallback((updates: Partial<LeaveCreditConfigurationListState>) => {
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
    const defaultState: LeaveCreditConfigurationListState = {
      page: 1,
      pageSize: 20,
      searchTerm: "",
      filters: {},
      sortInfo: undefined,
      leaveCreditConfigurationId: 0,
    };
    setListState(defaultState);
  }, []);

  const clearLeaveCreditConfigurationContext = useCallback(() => {
    setListState((prev) => ({
      ...prev,
      leaveCreditConfigurationId: 0,
    }));
  }, []);

  const contextValue = useMemo<LeaveCreditConfigurationListStateContextType>(
    () => ({
      listState,
      updateListState,
      resetFilters,
      resetToDefault,
      clearLeaveCreditConfigurationContext,
    }),
    [listState, updateListState, resetFilters, resetToDefault, clearLeaveCreditConfigurationContext]
  );

  return (
    <LeaveCreditConfigurationListStateContext.Provider value={contextValue}>
      {children}
    </LeaveCreditConfigurationListStateContext.Provider>
  );
};

export const useLeaveCreditConfigurationListState = () => {
  const ctx = useContext(LeaveCreditConfigurationListStateContext);
  if (!ctx) {
    throw new Error("useLeaveCreditConfigurationListState must be used inside LeaveCreditConfigurationListStateProvider");
  }
  return ctx;
};





