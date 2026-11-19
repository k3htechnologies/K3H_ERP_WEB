import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";
import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants";

export type MaterialRequisitionListState = {
    page: number;
    pageSize: number;
    searchTerm: string;
    filters: FilterInfo;
    sortInfo: SortInfo | undefined;
    projectId: number;
    materialRequisitionId: number;
    systemGeneratedCode: string;
    uniquekey: string;
    fromDate: string;
    toDate: string;
    companyGSTNumber: string;
    materialRequisitionStatus: string;
    approvalStatus: string;
    departmentMasterId: number;
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.MATERIAL_REQUISITION;

// ================= INITIAL STATE =================

const getInitialState = (): MaterialRequisitionListState => {

    try {

        const stored = localStorage.getItem(STORAGE_KEY);

        if (stored) {

            const parsed = JSON.parse(stored) as Partial<MaterialRequisitionListState>;

            return {
                page: parsed.page || 1,
                pageSize: parsed.pageSize || 20,
                searchTerm: parsed.searchTerm || "",
                filters: parsed.filters || {},
                sortInfo: parsed.sortInfo,

                projectId: parsed.projectId ?? 0,

                materialRequisitionId: parsed.materialRequisitionId || 0,
                systemGeneratedCode: parsed.systemGeneratedCode || "",
                uniquekey: parsed.uniquekey || "",
                fromDate: parsed.fromDate || "",
                toDate: parsed.toDate || "",
                companyGSTNumber: parsed.companyGSTNumber || "",
                materialRequisitionStatus: parsed.materialRequisitionStatus || "",
                approvalStatus: parsed.approvalStatus || "",
                departmentMasterId:parsed.departmentMasterId || 0,
            };
        }

    } catch (error) {

        console.error("Error loading Material Requisition list state:", error);
    }

    return {
        page: 1,
        pageSize: 20,
        searchTerm: "",
        filters: {},
        sortInfo: undefined,
        projectId: 0,
        materialRequisitionId: 0,
        systemGeneratedCode: "",
        uniquekey: "",
        fromDate: "",
        toDate: "",
        companyGSTNumber: "",
        materialRequisitionStatus: "",
        approvalStatus: "",
        departmentMasterId:0,
    };
};

type Ctx = {
    listState: MaterialRequisitionListState;

    updateListState: (newState: Partial<MaterialRequisitionListState>) => void;

    resetFilters: () => void;

    resetToDefault: () => void;

    clearMaterialRequisitionContext: () => void;
};


const MaterialRequisitionListStateContext = createContext<Ctx | null>(null);

export const MaterialRequisitionListStateProvider = ({ children }: { children: ReactNode }) => {

    const [listState, setListState] = useState<MaterialRequisitionListState>(() => getInitialState());

    useEffect(() => {

        try {

            localStorage.setItem(STORAGE_KEY, JSON.stringify(listState));

        } catch (error) {

            console.error("Error saving Material Requisition list state:", error);
        }

    }, [listState]);

    const updateListState = useCallback((updates: Partial<MaterialRequisitionListState>) => {

            setListState(prev => ({
                ...prev,
                ...updates
            }));

        },
        []
    );

    const resetFilters = useCallback(() => {

        setListState(prev => ({
            ...prev,
            filters: {},
            searchTerm: "",
            sortInfo: undefined,
            page: 1
        }));

    }, []);

    const resetToDefault = useCallback(() => {

        const defaultState: MaterialRequisitionListState = {
            page: 1,
            pageSize: 20,
            searchTerm: "",
            filters: {},
            sortInfo: undefined,
            projectId: 0,

            materialRequisitionId: 0,
            systemGeneratedCode: "",
            uniquekey: "",
            fromDate: "",
            toDate: "",
            companyGSTNumber: "",
            materialRequisitionStatus: "",
            approvalStatus: "",
            departmentMasterId:0,
        };

        setListState(defaultState);

    }, []);

    const clearMaterialRequisitionContext = useCallback(() => {

        setListState(prev => ({
            ...prev,
            materialRequisitionId: 0,
            systemGeneratedCode: "",
            uniquekey: "",
            fromDate: "",
            toDate: "",
            companyGSTNumber: "",
            materialRequisitionStatus: "",
            approvalStatus: "",
            departmentMasterId:0,
        }));

    }, []);


    const contextValue = useMemo(() => ({
        listState,
        updateListState,
        resetFilters,
        resetToDefault,
        clearMaterialRequisitionContext
    }), [
        listState,
        updateListState,
        resetFilters,
        resetToDefault,
        clearMaterialRequisitionContext
    ]);

    return (
        <MaterialRequisitionListStateContext.Provider value={contextValue}>
            {children}
        </MaterialRequisitionListStateContext.Provider>
    );
};

export const useMaterialRequisitionListState = () => {

    const ctx = useContext(MaterialRequisitionListStateContext);

    if (!ctx) {
        throw new Error(
            "use Material Requisition ListState must be used inside Material Requisition ListState Provider"
        );
    }

    return ctx;
};
