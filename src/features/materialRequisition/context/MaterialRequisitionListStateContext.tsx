import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import type { FilterInfo, SortInfo, TableColumn } from "@/ui/components/DataTable/DataTable";
import { getMaterialRequisitionTableColumns } from "@/features/materialRequisition/constants/MaterialRequisitionColumns";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants/localStorageKeys";

export type MaterialRequisitionListState = {
    page: number;
    pageSize: number;
    searchTerm: string;
    filters: FilterInfo;
    sortInfo: SortInfo | undefined;
    projectId: number | null;
    MaterialRequisitionId: number;
    SystemGeneratedCode: string;
    Uniquekey: string;
    FromDate: string;
    ToDate: string;
    MaterialRequisitionStage: string;
    MaterialRequisitionStatus: string;
};

export type MaterialRequisitionDetailItem = {
    MaterialRequisitionDetailId: number
    Uniquekey: string
    MaterialMasterId: number
    MaterialCode: string
    MaterialName: string
    SubMaterialName: string
    SubMaterialMasterId: number
    MaterialQuantity: number
    UomMasterId: number
    UomCode: string
    Uom: string
    RequiredDate: string
    MaterialReceivedQuantityTillDate: number

}

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.MATERIAL_REQUISITION;
const REQUIRED_COLUMN_KEYS = ['SystemGeneratedCode', 'Actions'];

function getInitialState(currentProjectId: number | null): MaterialRequisitionListState {
    if (!currentProjectId) {
        return {
            page: 1,
            pageSize: 20,
            searchTerm: "",
            filters: {},
            sortInfo: undefined,
            projectId: currentProjectId,
            MaterialRequisitionId: 0,
            SystemGeneratedCode: "",
            Uniquekey: "",
            FromDate: "",
            ToDate: "",
            MaterialRequisitionStage: "",
            MaterialRequisitionStatus: "",
        };
    }

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored) as { projectId: number; state: MaterialRequisitionListState; };
            if (parsed.projectId === currentProjectId) {
                return {
                    ...parsed.state,
                    projectId: currentProjectId,
                    MaterialRequisitionId: parsed.state.MaterialRequisitionId || 0,
                    SystemGeneratedCode: parsed.state.SystemGeneratedCode || "",
                    Uniquekey: parsed.state.Uniquekey || "",
                    FromDate: parsed.state.FromDate || "",
                    ToDate: parsed.state.ToDate || "",
                    MaterialRequisitionStage: parsed.state.MaterialRequisitionStage || "",
                    MaterialRequisitionStatus: parsed.state.MaterialRequisitionStatus || "",
                };
            }
        }
    } catch (error) {
        console.error('Error loading Material Requisition list state:', error);
    }

    return {
        page: 1,
        pageSize: 20,
        searchTerm: "",
        filters: {},
        sortInfo: undefined,
        projectId: currentProjectId,
        MaterialRequisitionId: 0,
        SystemGeneratedCode: "",
        Uniquekey: "",
        FromDate: "",
        ToDate: "",
        MaterialRequisitionStage: "",
        MaterialRequisitionStatus: "",
    };
}

type Ctx = {
    listState: MaterialRequisitionListState;
    updateListState: (newState: Partial<MaterialRequisitionListState>) => void;
    resetFilters: () => void;
    clearMaterialRequisitionContext: () => void;
    selectedColumnKeys: string[];
    setSelectedColumnKeys: (keys: string[]) => void;
    detailData: MaterialRequisitionDetailItem[];
    setDetailData: (data: MaterialRequisitionDetailItem[]) => void;
};

const MaterialRequisitionListStateContext = createContext<Ctx | null>(null);

export const MaterialRequisitionListStateProvider = ({ children }: { children: ReactNode }) => {
    const { projectId: currentProjectId } = useProject();
    const [listState, setListState] = useState<MaterialRequisitionListState>(() => getInitialState(currentProjectId));
    const [detailData, setDetailData] = useState<MaterialRequisitionDetailItem[]>([]);
    const allColumns = useMemo<TableColumn[]>(
        () => getMaterialRequisitionTableColumns(),
        []
    );
    const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>(() => {
        try {
            const stored = LocalStorageHelper.getMaterialRequisitionTableColumns();
            if (stored) {
                const parsed = JSON.parse(stored) as string[];
                const withRequired = Array.from(new Set([...parsed, ...REQUIRED_COLUMN_KEYS]));
                return withRequired.filter(k => allColumns.some(col => col.key === k));
            }
        } catch (error) {
            console.error('Error loading selected columns:', error);
        }

        return Array.from(
            new Set([
                ...allColumns.map(col => col.key),
                ...REQUIRED_COLUMN_KEYS
            ])
        );
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
                console.error('Error saving Material Requisition list state:', error);
            }
        }
    }, [listState, currentProjectId]);

    const updateListState = useCallback((newState: Partial<MaterialRequisitionListState>) => {
        setListState(prev => {
            const updated = { ...prev, ...newState };
            if (updated.projectId !== currentProjectId) {
                updated.projectId = currentProjectId;
            }
            return updated;
        });
    }, [currentProjectId]);

    const handleSetSelectedColumnKeys = useCallback((keys: string[]) => {

        const withRequired = Array.from(new Set([...keys, ...REQUIRED_COLUMN_KEYS]));
        setSelectedColumnKeys(withRequired);

        try {
            LocalStorageHelper.storeMaterialRequisitionTableColumns?.(JSON.stringify(withRequired));
        } catch (error) {
            console.error('Error saving selected columns:', error);
        }
    }, []);

    const resetFilters = useCallback(() => {
        updateListState({
            page: 1,
            searchTerm: '',
            filters: {},
            sortInfo: undefined,
            MaterialRequisitionId: 0,
            SystemGeneratedCode: "",
            Uniquekey: "",
            FromDate: "",
            ToDate: "",
            MaterialRequisitionStage: "",
            MaterialRequisitionStatus: "",
        });
    }, [updateListState]);

    const clearMaterialRequisitionContext = useCallback(() => {
        setListState(getInitialState(currentProjectId));
    }, [currentProjectId]);

    const contextValue = useMemo(() => ({
        listState,
        updateListState,
        resetFilters,
        clearMaterialRequisitionContext,
        selectedColumnKeys,
        setSelectedColumnKeys: handleSetSelectedColumnKeys,
        detailData,
        setDetailData,
    }), [listState, updateListState, resetFilters, clearMaterialRequisitionContext, selectedColumnKeys, handleSetSelectedColumnKeys, detailData, setDetailData]);

    return (
        <MaterialRequisitionListStateContext.Provider value={contextValue}>
            {children}
        </MaterialRequisitionListStateContext.Provider>
    );
};

export const useMaterialRequisitionListState = () => {
    const ctx = useContext(MaterialRequisitionListStateContext);
    if (!ctx) throw new Error("use Material Requisition ListState must be used inside Material Requisition ListState Provider");
    return ctx;
};

export const getMaterialRequisitionRequiredColumnKeys = (): string[] => REQUIRED_COLUMN_KEYS;



