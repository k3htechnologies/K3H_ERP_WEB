import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";
import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants";

export type TermSheetListState = {
  page: number;
  pageSize: number;
  searchTerm: string;
  filters: FilterInfo;
  sortInfo: SortInfo | undefined;
  TermSheetId: number;
  TermSheetDetailsId: number;
  NameOfInstitutionBankNBFC: string;
  ProjectId: number;
  ProjectName: string;
  ApprovalStatus: string;
  uniquekey: string;
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.TERM_SHEET;

const getInitialState = (): TermSheetListState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      const parsed = JSON.parse(stored) as TermSheetListState;
      return {
        ...parsed,
        TermSheetId: parsed.TermSheetId || 0,
        TermSheetDetailsId: parsed.TermSheetDetailsId || 0,
        NameOfInstitutionBankNBFC: parsed.NameOfInstitutionBankNBFC || "",
        ProjectId: parsed.ProjectId || 0,
        ProjectName: parsed.ProjectName || "",
        ApprovalStatus: parsed.ApprovalStatus || "",
        uniquekey: parsed.uniquekey || "",
      };
    }
  } catch (error) {
    console.error('Error loading term sheet list state:', error);
  }

  return {
    page: 1,
    pageSize: 20,
    searchTerm: "",
    filters: {},
    sortInfo: undefined,
    TermSheetId: 0,
    TermSheetDetailsId: 0,
    NameOfInstitutionBankNBFC: "",
    ProjectId: 0,
    ProjectName: "",
    ApprovalStatus: "",
    uniquekey: "",
  };
};

type TermSheetListStateContextType = {
  listState: TermSheetListState;
  updateListState: (updates: Partial<TermSheetListState>) => void;
  resetFilters: () => void;
  resetToDefault: () => void;
  setTermSheetContext: (termSheetIdId: number, termSheetDetailsId: number, nameOfInstitutionBankNBFC: string, projectId: number, projectName: string, approvalStatus: string, uniquekey: string) => void;
  clearTermSheetContext: () => void;
};

const TermSheetListStateContext = createContext<TermSheetListStateContextType | null>(null);

export const TermSheetListStateProvider = ({ children }: { children: ReactNode }) => {
  const [listState, setListState] = useState<TermSheetListState>(() => getInitialState());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listState));
    } catch (error) {
      console.error('Error saving term sheet list state:', error);
    }
  }, [listState]);


  const updateListState = useCallback((updates: Partial<TermSheetListState>) => {
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
    const defaultState: TermSheetListState = {
      page: 1,
      pageSize: 20,
      searchTerm: "",
      filters: {},
      sortInfo: undefined,
      TermSheetId: 0,
      TermSheetDetailsId: 0,
      NameOfInstitutionBankNBFC: "",
      ProjectId: 0,
      ProjectName: "",
      ApprovalStatus: "",
      uniquekey: "",
    };
    setListState(defaultState);
  }, []);


  const setTermSheetContext = useCallback((termSheetId: number, termSheetDetailsId: number, nameOfInstitutionBankNBFC: string, projectId: number, projectName: string, approvalStatus: string, uniquekey: string) => {
    setListState((prev) => ({
      ...prev,
      TermSheetId: termSheetId,
      TermSheetDetailsId: termSheetDetailsId,
      NameOfInstitutionBankNBFC: nameOfInstitutionBankNBFC,
      ProjectId: projectId,
      ProjectName: projectName,
      ApprovalStatus: approvalStatus,
      uniquekey: uniquekey,
    }));
  }, []);


  const clearTermSheetContext = useCallback(() => {
    setListState((prev) => ({
      ...prev,
      TermSheetId: 0,
      TermSheetDetailsId: 0,
      NameOfInstitutionBankNBFC: "",
      ProjectId: 0,
      ProjectName: "",
      ApprovalStatus: "",
      uniquekey: "",
    }));
  }, []);

  const contextValue = useMemo<TermSheetListStateContextType>(
    () => ({
      listState,
      updateListState,
      resetFilters,
      resetToDefault,
      setTermSheetContext,
      clearTermSheetContext,
    }),
    [listState, updateListState, resetFilters, resetToDefault, setTermSheetContext, clearTermSheetContext]
  );

  return (
    <TermSheetListStateContext.Provider value={contextValue}>
      {children}
    </TermSheetListStateContext.Provider>
  );
};

export const useTermSheetListState = () => {
  const ctx = useContext(TermSheetListStateContext);
  if (!ctx) {
    throw new Error("useTermSheetListState must be used inside TermSheetListStateProvider");
  }
  return ctx;
};

