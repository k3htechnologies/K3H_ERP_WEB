import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";
import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants";

export type DeductionMasterListState = {
  page: number;
  pageSize: number;
  searchTerm: string;
  filters: FilterInfo;
  sortInfo: SortInfo | undefined;
  deductionMasterId: number;
  deductionName: string;
  pageName: string;
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.DEDUCTION_MASTER;

const getInitialState = (): DeductionMasterListState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      const parsed = JSON.parse(stored) as DeductionMasterListState;
      return {
        ...parsed,
        deductionMasterId: parsed.deductionMasterId || 0,
        deductionName: parsed.deductionName || "",
      };
    }
  } catch (error) {
    console.error('Error loading deduction master list state:', error);
  }

  return {
    page: 1,
    pageSize: 20,
    searchTerm: "",
    filters: {},
    sortInfo: undefined,
    deductionMasterId: 0,
    deductionName: "",
    pageName: "",
  };
};

type DeductionMasterListStateContextType = {
  listState: DeductionMasterListState;
  updateListState: (updates: Partial<DeductionMasterListState>) => void;
  resetFilters: () => void;
  resetToDefault: () => void;
  setDeductionContext: (deductionMasterId: number, deductionName: string) => void;
  clearDeductionContext: () => void;
};

const DeductionMasterListStateContext = createContext<DeductionMasterListStateContextType | null>(null);

export const DeductionMasterListStateProvider = ({ children }: { children: ReactNode }) => {
  const [listState, setListState] = useState<DeductionMasterListState>(() => getInitialState());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listState));
    } catch (error) {
      console.error('Error saving deduction master list state:', error);
    }
  }, [listState]);

  
  const updateListState = useCallback((updates: Partial<DeductionMasterListState>) => {
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
    const defaultState: DeductionMasterListState = {
      page: 1,
      pageSize: 20,
      searchTerm: "",
      filters: {},
      sortInfo: undefined,
      deductionMasterId: 0,
      deductionName: "",
      pageName: "",
    };
    setListState(defaultState);
  }, []);


  const setDeductionContext = useCallback((deductionMasterId: number, deductionName: string) => {
    setListState((prev) => ({
      ...prev,
      deductionMasterId,
      deductionName,
    }));
  }, []);

  
  const clearDeductionContext = useCallback(() => {
    setListState((prev) => ({
      ...prev,
      deductionMasterId: 0,
      deductionName: "",
    }));
  }, []);

  const contextValue = useMemo<DeductionMasterListStateContextType>(
    () => ({
      listState,
      updateListState,
      resetFilters,
      resetToDefault,
      setDeductionContext,
      clearDeductionContext,
    }),
    [listState, updateListState, resetFilters, resetToDefault, setDeductionContext, clearDeductionContext]
  );

  return (
    <DeductionMasterListStateContext.Provider value={contextValue}>
      {children}
    </DeductionMasterListStateContext.Provider>
  );
};

export const useDeductionMasterListState = () => {
  const ctx = useContext(DeductionMasterListStateContext);
  if (!ctx) {
    throw new Error("useDeductionMasterListState must be used inside DeductionMasterListStateProvider");
  }
  return ctx;
};

