import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import type {SortInfo } from "@/ui/components/DataTable/DataTable";

export type ApprovedBankListState = {
  page: number;
  pageSize: number;
  searchTerm: string;
  sortInfo: SortInfo | undefined;
  projectId: number | null;
  ApprovedBankFolderId: number;
  BankName: string;
};

const STORAGE_KEY = 'ApprovedBank.listState';

const getInitialState = (currentProjectId: number | null): ApprovedBankListState => {
  if (!currentProjectId) {
    return {
      page: 1,
      pageSize: 20,
      searchTerm: "",
      sortInfo: undefined,
      projectId: currentProjectId,
      ApprovedBankFolderId: 0,
      BankName: '',
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as { projectId: number; state: ApprovedBankListState };
      if (parsed.projectId === currentProjectId) {
        return {
          ...parsed.state,
          ApprovedBankFolderId: parsed.state.ApprovedBankFolderId || 0,
          BankName: parsed.state.BankName || "",
          projectId: currentProjectId,
        };
      }
    }
  } catch (error) {
    console.error('Error loading Approved Bank list state:', error);
  }

  return {
    page: 1,
    pageSize: 20,
    searchTerm: "",
    sortInfo: undefined,
    projectId: currentProjectId,
    ApprovedBankFolderId: 0,
    BankName: '',
  };
};

type Ctx = {
  listState: ApprovedBankListState;
  updateListState: (newState: Partial<ApprovedBankListState>) => void;
  resetFilters: () => void;
  clearApprovedBankContext: () => void;
};

const ApprovedBankListStateContext = createContext<Ctx | null>(null);

export const ApprovedBankListStateProvider = ({ children }: { children: ReactNode }) => {
  const { projectId: currentProjectId } = useProject();
  const [listState, setListState] = useState<ApprovedBankListState>(() => getInitialState(currentProjectId));

  useEffect(() => {
    setListState(getInitialState(currentProjectId));
  }, [currentProjectId]);

  useEffect(() => {
    if (listState.projectId === currentProjectId && currentProjectId) {
      try {
        const stateToStore = {
          projectId: currentProjectId,
          state: listState,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToStore));
      } catch (error) {
        console.error('Error saving Approved Bank list state:', error);
      }
    }
  }, [listState, currentProjectId]);

  const updateListState = useCallback((newState: Partial<ApprovedBankListState>) => {
    setListState(prev => {
      const updated = { ...prev, ...newState };
      if (updated.projectId !== currentProjectId) {
        updated.projectId = currentProjectId;
      }
      return updated;
    });
  }, [currentProjectId]);

  const resetFilters = useCallback(() => {
    updateListState({
      page: 1,
      searchTerm: '',
      sortInfo: undefined,
      ApprovedBankFolderId: 0,
      BankName: ''
    });
  }, [updateListState]);

  const clearApprovedBankContext = useCallback(() => {
    setListState(getInitialState(currentProjectId));
  }, [currentProjectId]);

  const contextValue = useMemo(() => ({
    listState,
    updateListState,
    resetFilters,
    clearApprovedBankContext
  }), [listState, updateListState, resetFilters, clearApprovedBankContext]);

  return (
    <ApprovedBankListStateContext.Provider value={contextValue}>
      {children}
    </ApprovedBankListStateContext.Provider>
  );
};

export const useApprovedBankListState = () => {
  const ctx = useContext(ApprovedBankListStateContext);
  if (!ctx) throw new Error("use Approved Bank ListState must be used inside Approved Bank ListState Provider");
  return ctx;
};



