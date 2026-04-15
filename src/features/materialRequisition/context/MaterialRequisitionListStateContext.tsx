import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";

export type MaterialRequisitionListState = {
    page: number;
    pageSize: number;
    searchTerm: string;
    filters: FilterInfo;
    sortInfo: SortInfo | undefined;
    projectId: number | null;
    MaterialRequisitionId?: number;
    SystemGeneratedCode?: string;
    Uniquekey?: string;
    FromDate?: string;
    ToDate?: string;
    MaterialRequisitionStage?: string;
    MaterialRequisitionStatus?: string;
};

const STORAGE_KEY = 'MaterialRequisition.listState';

const getInitialState = (currentProjectId: number | null): MaterialRequisitionListState => {
    if (!currentProjectId) {
        return {
            page: 1,
            pageSize: 20,
            searchTerm: "",
            filters: {},
            sortInfo: undefined,
            projectId: currentProjectId,
            MaterialRequisitionId: undefined,
            SystemGeneratedCode: undefined,
            Uniquekey: undefined,
            FromDate: undefined,
            ToDate: undefined,
            MaterialRequisitionStage: undefined,
            MaterialRequisitionStatus: undefined,
        };
    }

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored) as { projectId: number; state: MaterialRequisitionListState };
            if (parsed.projectId === currentProjectId) {
                return {
                    ...parsed.state,
                    projectId: currentProjectId,
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
        MaterialRequisitionId: undefined,
        SystemGeneratedCode: "",
        Uniquekey: "",
        FromDate: undefined,
        ToDate: undefined,
        MaterialRequisitionStage: undefined,
        MaterialRequisitionStatus: undefined,
    };
};

type Ctx = {
    listState: MaterialRequisitionListState;
    updateListState: (newState: Partial<MaterialRequisitionListState>) => void;
    resetFilters: () => void;
    clearMaterialRequisitionContext: () => void;
};

const MaterialRequisitionListStateContext = createContext<Ctx | null>(null);

export const MaterialRequisitionListStateProvider = ({ children }: { children: ReactNode }) => {
    const { projectId: currentProjectId } = useProject();
    const [listState, setListState] = useState<MaterialRequisitionListState>(() => getInitialState(currentProjectId));

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

    const resetFilters = useCallback(() => {
        updateListState({
            page: 1,
            searchTerm: '',
            filters: {},
            sortInfo: undefined,
            MaterialRequisitionId: undefined,
            SystemGeneratedCode: undefined,
            Uniquekey: undefined,
            FromDate: undefined,
            ToDate: undefined,
            MaterialRequisitionStage: undefined,
            MaterialRequisitionStatus: undefined,
        });
    }, [updateListState]);

    const clearMaterialRequisitionContext = useCallback(() => {
        setListState(getInitialState(currentProjectId));
    }, [currentProjectId]);

    const contextValue = useMemo(() => ({
        listState,
        updateListState,
        resetFilters,
        clearMaterialRequisitionContext
    }), [listState, updateListState, resetFilters, clearMaterialRequisitionContext]);

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



