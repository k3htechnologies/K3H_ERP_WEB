import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";
import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants";

export type InwardOutwardListState = {
  page: number;
  pageSize: number;
  searchTerm: string;
  filters: FilterInfo;
  sortInfo: SortInfo | undefined;
  InwardOutwardId: number;
  DocumentTitle: string;
  uniquekey: string;
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.INWARD_OUTWARD;

const getInitialState = (): InwardOutwardListState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      const parsed = JSON.parse(stored) as InwardOutwardListState;
      return {
        ...parsed,
        InwardOutwardId: parsed.InwardOutwardId || 0,
        DocumentTitle: parsed.DocumentTitle || "",
        uniquekey: parsed.uniquekey || "",
      };
    }
  } catch (error) {
    console.error('Error loading Inward Outward list state:', error);
  }

  return {
    page: 1,
    pageSize: 20,
    searchTerm: "",
    filters: {},
    sortInfo: undefined,
    InwardOutwardId: 0,
    DocumentTitle: "",
    uniquekey: "",
  };
};

type InwardOutwardListStateContextType = {
  listState: InwardOutwardListState;
  updateListState: (updates: Partial<InwardOutwardListState>) => void;
  resetFilters: () => void;
  resetToDefault: () => void;
  setInwardOutwardContext: (InwardOutwardId: number, DocumentTitle: string, uniquekey: string) => void;
  clearInwardOutwardContext: () => void;
};

const InwardOutwardListStateContext = createContext<InwardOutwardListStateContextType | null>(null);

export const InwardOutwardListStateProvider = ({ children }: { children: ReactNode }) => {
  const [listState, setListState] = useState<InwardOutwardListState>(() => getInitialState());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listState));
    } catch (error) {
      console.error('Error saving Inward Outward list state:', error);
    }
  }, [listState]);


  const updateListState = useCallback((updates: Partial<InwardOutwardListState>) => {
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
    const defaultState: InwardOutwardListState = {
      page: 1,
      pageSize: 20,
      searchTerm: "",
      filters: {},
      sortInfo: undefined,
      InwardOutwardId: 0,
      DocumentTitle: "",
      uniquekey: "",
    };
    setListState(defaultState);
  }, []);


  const setInwardOutwardContext = useCallback((InwardOutwardId: number, DocumentTitle: string, uniquekey: string) => {
    setListState((prev) => ({
      ...prev,
      InwardOutwardId,
      DocumentTitle,
      uniquekey,
    }));
  }, []);


  const clearInwardOutwardContext = useCallback(() => {
    setListState((prev) => ({
      ...prev,
      InwardOutwardId: 0,
      DocumentTitle: "",
      uniquekey: "",
    }));
  }, []);

  const contextValue = useMemo<InwardOutwardListStateContextType>(
    () => ({
      listState,
      updateListState,
      resetFilters,
      resetToDefault,
      setInwardOutwardContext,
      clearInwardOutwardContext,
    }),
    [listState, updateListState, resetFilters, resetToDefault, setInwardOutwardContext, clearInwardOutwardContext]
  );

  return (
    <InwardOutwardListStateContext.Provider value={contextValue}>
      {children}
    </InwardOutwardListStateContext.Provider>
  );
};

export const useInwardOutwardListState = () => {
  const ctx = useContext(InwardOutwardListStateContext);
  if (!ctx) {
    throw new Error("useInwardOutwardListState must be used inside InwardOutwardListStateProvider");
  }
  return ctx;
};

