import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";

export type RentListState = {
  page: number;
  pageSize: number;
  searchTerm: string;
  filters: FilterInfo;
  sortInfo: SortInfo | undefined;
  buildingId: number;
  buildingName: string;
  tenantId: number;
  tenantName: string;
  tenantApplicantId: number;
  flatNumber: string;
  applicantName: string;
  activeTab: string;
  tenure: string;
  totalAmount: number;
  paidTotalAmount: number;
  unitType:string;
  carpetArea:number;
  // PayTrackRent related state
  payTrackRentTenantApplicantId: number;
  payTrackRentTenantApplicantName: string;
};

const STORAGE_KEY = 'rent.listState';

const getInitialState = (projectId: number | null): RentListState => {
  if (!projectId) {
    return {
      page: 1,
      pageSize: 20,
      searchTerm: "",
      filters: {},
      sortInfo: undefined,
      buildingId: 0,
      buildingName: "",
      tenantId: 0,
      tenantName: "",
      tenantApplicantId: 0,
      flatNumber  : "",
      applicantName: "",
      activeTab: "",
      tenure: "",
      totalAmount: 0, 
      paidTotalAmount: 0,
      unitType:"",
      carpetArea:0,
      payTrackRentTenantApplicantId: 0,
      payTrackRentTenantApplicantName: "",
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as { projectId: number; state: RentListState };
      // Only use stored state if it's for the same project
      if (parsed.projectId === projectId) {
        return {
          ...parsed.state,
          // Ensure payTrackRentTenantApplicantId is reset when on list page
          payTrackRentTenantApplicantId: parsed.state.payTrackRentTenantApplicantId || 0,
          payTrackRentTenantApplicantName: parsed.state.payTrackRentTenantApplicantName || "",
        };
      }
    }
  } catch (error) {
    console.error('Error loading rent list state:', error);
  }

  return {
    page: 1,
    pageSize: 20,
    searchTerm: "",
    filters: {},
    sortInfo: undefined,
    buildingId: 0,
    buildingName: "",
    tenantId: 0,
    tenantName: "",
    tenantApplicantId: 0,
    flatNumber  : "",
    applicantName: "",
    activeTab: "",
    tenure: "",
    totalAmount: 0,
    paidTotalAmount: 0,
    unitType:"",
    carpetArea:0,
    payTrackRentTenantApplicantId: 0,
    payTrackRentTenantApplicantName: "",
  };
};

type RentListStateContextType = {
  listState: RentListState;
  updateListState: (updates: Partial<RentListState>) => void;
  resetFilters: () => void;
  resetToDefault: () => void;
  setPayTrackRentContext: (tenantApplicantId: number, tenantApplicantName: string) => void;
  clearPayTrackRentContext: () => void;
  setBuildingContext: (buildingId: number, buildingName: string) => void;
  clearBuildingContext: () => void;
};

const RentListStateContext = createContext<RentListStateContextType | null>(null);

export const RentListStateProvider = ({ children }: { children: ReactNode }) => {
  const { projectId } = useProject();
  const [listState, setListState] = useState<RentListState>(() => getInitialState(projectId));
  const [lastProjectId, setLastProjectId] = useState<number | null>(projectId);

  // Reset state when project changes
  useEffect(() => {
    if (projectId !== lastProjectId && lastProjectId !== null) {
      // Project changed - reset to default state (including building)
      const defaultState: RentListState = {
        page: 1,
        pageSize: 20,
        searchTerm: "",
        filters: {},
        sortInfo: undefined,
        buildingId: 0,
        buildingName: "",
        tenantId: 0,
        tenantName: "",
        tenantApplicantId: 0,
        flatNumber: "",
        applicantName: "",
        activeTab: "",
        tenure: "",
        totalAmount: 0,
        paidTotalAmount: 0,
        unitType:"",
        carpetArea:0,
        payTrackRentTenantApplicantId: 0,
        payTrackRentTenantApplicantName: "",
      };
      setListState(defaultState);
      // Clear stored state for old project
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error('Error clearing rent list state:', error);
      }
    }
    setLastProjectId(projectId);
  }, [projectId, lastProjectId]);

  useEffect(() => {
    if (projectId) {
      try {
        const stateToStore = {
          projectId,
          state: listState,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToStore));
      } catch (error) {
        console.error('Error saving rent list state:', error);
      }
    }
  }, [listState, projectId]);

  const updateListState = useCallback((updates: Partial<RentListState>) => {
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
    const defaultState: RentListState = {
      page: 1,
      pageSize: 20,
      searchTerm: "",
      filters: {},
      sortInfo: undefined,
      buildingId: 0,
      buildingName: "",
      tenantId: 0,
      tenantName: "",
      tenantApplicantId: 0,
      flatNumber: "",
      applicantName: "",
      activeTab: "",
      tenure: "",
      totalAmount: 0,
      paidTotalAmount: 0,
      unitType:"",
      carpetArea:0,
      payTrackRentTenantApplicantId: 0,
      payTrackRentTenantApplicantName: "",
    };
    setListState(defaultState);
  }, []);

  const setPayTrackRentContext = useCallback((
    tenantApplicantId: number,
    tenantApplicantName: string
  ) => {
    setListState((prev) => ({
      ...prev,
      payTrackRentTenantApplicantId: tenantApplicantId,
      payTrackRentTenantApplicantName: tenantApplicantName,
    }));
  }, []);

  const clearPayTrackRentContext = useCallback(() => {
    setListState((prev) => ({
      ...prev,
      payTrackRentTenantApplicantId: 0,
      payTrackRentTenantApplicantName: "",
    }));
  }, []);

  const setBuildingContext = useCallback((buildingId: number, buildingName: string) => {
    setListState((prev) => ({
      ...prev,
      buildingId,
      buildingName,
      filters: {},
      searchTerm: "",
      sortInfo: undefined,
      page: 1,
    }));
  }, []);

  const clearBuildingContext = useCallback(() => {
    setListState((prev) => ({
      ...prev,
      buildingId: 0,
      buildingName: "",
      filters: {},
      searchTerm: "",
      sortInfo: undefined,
      page: 1,
    }));
  }, []);

  const contextValue = useMemo<RentListStateContextType>(
    () => ({
      listState,
      updateListState,
      resetFilters,
      resetToDefault,
      setPayTrackRentContext,
      clearPayTrackRentContext,
      setBuildingContext,
      clearBuildingContext,
    }),
    [listState, updateListState, resetFilters, resetToDefault, setPayTrackRentContext, clearPayTrackRentContext, setBuildingContext, clearBuildingContext]
  );

  return (
    <RentListStateContext.Provider value={contextValue}>
      {children}
    </RentListStateContext.Provider>
  );
};

export const useRentListState = () => {
  const ctx = useContext(RentListStateContext);
  if (!ctx) {
    throw new Error("useRentListState must be used inside RentListStateProvider");
  }
  return ctx;
};

