import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";
import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants";

export type OutDoorListState = {
  page: number;
  pageSize: number;
  searchTerm: string;
  filters: FilterInfo;
  sortInfo: SortInfo | undefined;
  outdoorId: number;
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.OUTDOOR;

const getInitialState = (): OutDoorListState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      const parsed = JSON.parse(stored) as OutDoorListState;
      return {
        ...parsed,
        outdoorId: parsed.outdoorId || 0,
      };
    }
  } catch (error) {
    console.error('Error loading outdoor list state:', error);
  }

  return {
    page: 1,
    pageSize: 10,
    searchTerm: "",
    filters: {},
    sortInfo: undefined,
    outdoorId: 0,
  };
};

type OutDoorListStateContextType = {
  listState: OutDoorListState;
  updateListState: (updates: Partial<OutDoorListState>) => void;
  resetFilters: () => void;
  resetToDefault: () => void;
  setOutDoorContext: (outdoorId: number) => void;
  clearOutDoorContext: () => void;
};

const OutDoorListStateContext = createContext<OutDoorListStateContextType | null>(null);

export const OutDoorListStateProvider = ({ children }: { children: ReactNode }) => {
  const [listState, setListState] = useState<OutDoorListState>(() => getInitialState());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listState));
    } catch (error) {
      console.error('Error saving outdoor list state:', error);
    }
  }, [listState]);

  const updateListState = useCallback((updates: Partial<OutDoorListState>) => {
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
    const defaultState: OutDoorListState = {
      page: 1,
      pageSize: 10,
      searchTerm: "",
      filters: {},
      sortInfo: undefined,
      outdoorId: 0,
    };
    setListState(defaultState);
  }, []);

  const setOutDoorContext = useCallback((outdoorId: number) => {
    setListState((prev) => ({
      ...prev,
      outdoorId,
    }));
  }, []);

  const clearOutDoorContext = useCallback(() => {
    setListState((prev) => ({
      ...prev,
      outdoorId: 0,
    }));
  }, []);

  const contextValue = useMemo<OutDoorListStateContextType>(
    () => ({
      listState,
      updateListState,
      resetFilters,
      resetToDefault,
      setOutDoorContext,
      clearOutDoorContext,
    }),
    [listState, updateListState, resetFilters, resetToDefault, setOutDoorContext, clearOutDoorContext]
  );

  return (
    <OutDoorListStateContext.Provider value={contextValue}>
      {children}
    </OutDoorListStateContext.Provider>
  );
};

export const useOutDoorListState = () => {
  const ctx = useContext(OutDoorListStateContext);
  if (!ctx) {
    throw new Error("useOutDoorListState must be used inside OutDoorListStateProvider");
  }
  return ctx;
};
