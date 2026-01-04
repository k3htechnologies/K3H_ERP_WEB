import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";

export type EnquiryListState = {
  page: number;
  pageSize: number;
  searchTerm: string;
  filters: FilterInfo;
  sortInfo: SortInfo | undefined;
  projectId: number | null;
  enquiryId: number;
  enquiryName: string;
};

const STORAGE_KEY = 'enquiry.listState';

const getInitialState = (currentProjectId: number | null): EnquiryListState => {
  if (!currentProjectId) {
    return {
      page: 1,
      pageSize: 20,
      searchTerm: "",
      filters: {},
      sortInfo: undefined,
      projectId: currentProjectId,
      enquiryId: 0,
      enquiryName: '',
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as { projectId: number; state: EnquiryListState };
      // Only use stored state if it's for the same project
      if (parsed.projectId === currentProjectId) {
        return {
          ...parsed.state,
          // Ensure enquiryId and enquiryName are reset when on list page
          enquiryId: parsed.state.enquiryId || 0,
          enquiryName: parsed.state.enquiryName || "",
          projectId: currentProjectId,
        };
      }
    }
  } catch (error) {
    console.error('Error loading enquiry list state:', error);
  }

  return {
    page: 1,
    pageSize: 20,
    searchTerm: "",
    filters: {},
    sortInfo: undefined,
    projectId: currentProjectId,
    enquiryId: 0,
    enquiryName: '',
  };
};

type Ctx = {
  listState: EnquiryListState;
  updateListState: (newState: Partial<EnquiryListState>) => void;
  resetFilters: () => void;
  clearEnquiryContext: () => void;
};

const EnquiryListStateContext = createContext<Ctx | null>(null);

export const EnquiryListStateProvider = ({ children }: { children: ReactNode }) => {
  const { projectId: currentProjectId } = useProject();
  const [listState, setListState] = useState<EnquiryListState>(() => getInitialState(currentProjectId));

  // Reset state when project changes
  useEffect(() => {
    setListState(getInitialState(currentProjectId));
  }, [currentProjectId]);

  // Persist state to local storage
  useEffect(() => {
    if (listState.projectId === currentProjectId && currentProjectId) {
      try {
        const stateToStore = {
          projectId: currentProjectId,
          state: listState,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToStore));
      } catch (error) {
        console.error('Error saving enquiry list state:', error);
      }
    }
  }, [listState, currentProjectId]);

  const updateListState = useCallback((newState: Partial<EnquiryListState>) => {
    setListState(prev => {
      const updated = { ...prev, ...newState };
      // Ensure projectId is always currentProjectId from useProject
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
      filters: {},
      sortInfo: undefined,
      enquiryId: 0,
      enquiryName: ''
    });
  }, [updateListState]);

  const clearEnquiryContext = useCallback(() => {
    setListState(getInitialState(currentProjectId));
  }, [currentProjectId]);

  const contextValue = useMemo(() => ({
    listState,
    updateListState,
    resetFilters,
    clearEnquiryContext
  }), [listState, updateListState, resetFilters, clearEnquiryContext]);

  return (
    <EnquiryListStateContext.Provider value={contextValue}>
      {children}
    </EnquiryListStateContext.Provider>
  );
};

export const useEnquiryListState = () => {
  const ctx = useContext(EnquiryListStateContext);
  if (!ctx) throw new Error("useEnquiryListState must be used inside EnquiryListStateProvider");
  return ctx;
};


