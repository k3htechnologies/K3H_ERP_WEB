import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants";
import type { FilterInfo, SortInfo, TableColumn } from "@/ui/components/DataTable/DataTable";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { getContractRequisitionTableColumns } from "@/features/contractRequisition/constants/ContractRequisitionColumns";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";

export type ContractRequisitionListState = {
  page: number;
  pageSize: number;
  searchTerm: string;
  filters: FilterInfo;
  sortInfo: SortInfo | undefined;
  projectId: number | null;
  ContractRequisitionId: number;
  IsLockAndKeyContract: boolean;
  SystemGeneratedCode: string;
  Uniquekey: string;
  FromDate: string;
  ToDate: string;
  ContractRequisitionStage: string;
  ContractRequisitionStatus: string;
  VendorFinalizationApprovalStatus: string;
  ContractRequisitionInvoiceId: number;
  VendorName: string;
};

export type ContractRequisitionDetailItem = {};
type Ctx = {
  listState: ContractRequisitionListState;
  updateListState: (newState: Partial<ContractRequisitionListState>) => void;
  resetFilters: () => void;
  clearContractRequisitionContext: () => void;
  selectedColumnKeys: string[];
  setSelectedColumnKeys: (keys: string[]) => void;
  detailData: ContractRequisitionDetailItem[];
  setDetailData: (data: ContractRequisitionDetailItem[]) => void;
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.CONTRACT_REQUISITION;
const REQUIRED_COLUMN_KEYS = ["SystemGeneratedCode", "Actions"];

const INITIAL_STATE: ContractRequisitionListState = {
  page: 1,
  pageSize: 20,
  searchTerm: "",
  filters: {},
  sortInfo: undefined,
  projectId: 0,
  ContractRequisitionId: 0,
  IsLockAndKeyContract: false,
  SystemGeneratedCode: "",
  Uniquekey: "",
  FromDate: "",
  ToDate: "",
  ContractRequisitionStage: "",
  ContractRequisitionStatus: "",
  VendorFinalizationApprovalStatus: "",
  ContractRequisitionInvoiceId: 0,
  VendorName: ""
};

function getInitialState(currentProjectId: number | null): ContractRequisitionListState {
  if (!currentProjectId) {
    return INITIAL_STATE;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as { projectId: number; state: ContractRequisitionListState };
      if (parsed.projectId === currentProjectId) {
        return {
          ...parsed.state,
          projectId: currentProjectId,
          ContractRequisitionId: parsed.state.ContractRequisitionId || 0,
          SystemGeneratedCode: parsed.state.SystemGeneratedCode || "",
          Uniquekey: parsed.state.Uniquekey || "",
          FromDate: parsed.state.FromDate || "",
          ToDate: parsed.state.ToDate || "",
          ContractRequisitionStage: parsed.state.ContractRequisitionStage || "",
          ContractRequisitionStatus: parsed.state.ContractRequisitionStatus || "",
        };
      }
    }
  } catch (error) {
    console.error("Error loading Contract Requisition list state:", error);
  }

  return INITIAL_STATE;
}

const ContractRequisitionListStateContext = createContext<Ctx | null>(null);

export const ContractRequisitionListStateProvider = ({ children }: { children: ReactNode }) => {
  const { projectId: currentProjectId } = useProject();
  const [listState, setListState] = useState<ContractRequisitionListState>(() => getInitialState(currentProjectId));
  const [detailData, setDetailData] = useState<ContractRequisitionDetailItem[]>([]);
  const allColumns = useMemo<TableColumn[]>(() => getContractRequisitionTableColumns(), []);
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>(() => {
    try {
      const stored = LocalStorageHelper.getContractRequisitionTableColumns();
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        const withRequired = Array.from(new Set([...parsed, ...REQUIRED_COLUMN_KEYS]));
        return withRequired.filter((k) => allColumns.some((col) => col.key === k));
      }
    } catch (error) {
      console.error("Error loading selected columns:", error);
    }

    return Array.from(new Set([...allColumns.map((col) => col.key), ...REQUIRED_COLUMN_KEYS]));
  });

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
        console.error("Error saving Contract Requisition list state:", error);
      }
    }
  }, [listState, currentProjectId]);

  const updateListState = useCallback(
    (newState: Partial<ContractRequisitionListState>) => {
      setListState((prev) => {
        const updated = { ...prev, ...newState };
        if (updated.projectId !== currentProjectId) {
          updated.projectId = currentProjectId;
        }
        return updated;
      });
    },
    [currentProjectId],
  );

  const handleSetSelectedColumnKeys = useCallback((keys: string[]) => {
    const withRequired = Array.from(new Set([...keys, ...REQUIRED_COLUMN_KEYS]));
    setSelectedColumnKeys(withRequired);

    try {
      LocalStorageHelper.storeContractRequisitionTableColumns?.(JSON.stringify(withRequired));
    } catch (error) {
      console.error("Error saving selected columns:", error);
    }
  }, []);

  const resetFilters = useCallback(() => {
    updateListState({
      page: 1,
      searchTerm: "",
      filters: {},
      sortInfo: undefined,
      ContractRequisitionId: 0,
      IsLockAndKeyContract: false,
      SystemGeneratedCode: "",
      Uniquekey: "",
      FromDate: "",
      ToDate: "",
      ContractRequisitionStage: "",
      ContractRequisitionStatus: "",
      VendorName: ""
    });
  }, [updateListState]);

  const clearContractRequisitionContext = useCallback(() => {
    setListState(getInitialState(currentProjectId));
  }, [currentProjectId]);

  const contextValue = useMemo(
    () => ({
      listState,
      updateListState,
      resetFilters,
      clearContractRequisitionContext,
      selectedColumnKeys,
      setSelectedColumnKeys: handleSetSelectedColumnKeys,
      detailData,
      setDetailData,
    }),
    [
      listState,
      updateListState,
      resetFilters,
      clearContractRequisitionContext,
      selectedColumnKeys,
      handleSetSelectedColumnKeys,
      detailData,
      setDetailData,
    ],
  );

  return <ContractRequisitionListStateContext.Provider value={contextValue}>{children}</ContractRequisitionListStateContext.Provider>;
};

export const useContractRequisitionListState = () => {
  const ctx = useContext(ContractRequisitionListStateContext);
  if (!ctx) throw new Error("use Contract Requisition ListState must be used inside Contract Requisition ListState Provider");
  return ctx;
};

export const getContractRequisitionRequiredColumnKeys = (): string[] => REQUIRED_COLUMN_KEYS;
