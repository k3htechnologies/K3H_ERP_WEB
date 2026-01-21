import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";
import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants";

export type EmployeeListState = {
  page: number;
  pageSize: number;
  searchTerm: string;
  filters: FilterInfo;
  sortInfo: SortInfo | undefined;
  employeeId: number;
  employeeName: string;
  pageName: string;

};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.EMPLOYEE;

const getInitialState = (): EmployeeListState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      const parsed = JSON.parse(stored) as EmployeeListState;
      return {
        ...parsed,
        employeeId: parsed.employeeId || 0,
        employeeName: parsed.employeeName || "",
      };
    }
  } catch (error) {
    console.error('Error loading employee list state:', error);
  }

  return {
    page: 1,
    pageSize: 20,
    searchTerm: "",
    filters: {},
    sortInfo: undefined,
    employeeId: 0,
    employeeName: "",
    pageName: "",
  };
};

type EmployeeListStateContextType = {
  listState: EmployeeListState;
  updateListState: (updates: Partial<EmployeeListState>) => void;
  resetFilters: () => void;
  resetToDefault: () => void;
  setEmployeeContext: (employeeId: number, employeeName: string) => void;
  clearEmployeeContext: () => void;
};

const EmployeeListStateContext = createContext<EmployeeListStateContextType | null>(null);

export const EmployeeListStateProvider = ({ children }: { children: ReactNode }) => {
  const [listState, setListState] = useState<EmployeeListState>(() => getInitialState());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listState));
    } catch (error) {
      console.error('Error saving employee list state:', error);
    }
  }, [listState]);

  
  const updateListState = useCallback((updates: Partial<EmployeeListState>) => {
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
    const defaultState: EmployeeListState = {
      page: 1,
      pageSize: 20,
      searchTerm: "",
      filters: {},
      sortInfo: undefined,
      employeeId: 0,
      employeeName: "",
      pageName: "",
    };
    setListState(defaultState);
  }, []);


  const setEmployeeContext = useCallback((employeeId: number, employeeName: string) => {
    setListState((prev) => ({
      ...prev,
      employeeId,
      employeeName,
    }));
  }, []);

  
  const clearEmployeeContext = useCallback(() => {
    setListState((prev) => ({
      ...prev,
      employeeId: 0,
      employeeName: "",
    }));
  }, []);

  const contextValue = useMemo<EmployeeListStateContextType>(
    () => ({
      listState,
      updateListState,
      resetFilters,
      resetToDefault,
      setEmployeeContext,
      clearEmployeeContext,
    }),
    [listState, updateListState, resetFilters, resetToDefault, setEmployeeContext, clearEmployeeContext]
  );

  return (
    <EmployeeListStateContext.Provider value={contextValue}>
      {children}
    </EmployeeListStateContext.Provider>
  );
};

export const useEmployeeListState = () => {
  const ctx = useContext(EmployeeListStateContext);
  if (!ctx) {
    throw new Error("useEmployeeListState must be used inside EmployeeListStateProvider");
  }
  return ctx;
};

