import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";
import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants";

export type CostToCompanyListState = {
    page: number;
    pageSize: number;
    searchTerm: string;
    filters: FilterInfo;
    sortInfo: SortInfo | undefined;
    CostToCompanyId: number;
    EmployeeName: string;
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.COST_TO_COMPANY;

const getInitialState = (): CostToCompanyListState => {

    try {

        const stored = localStorage.getItem(STORAGE_KEY);

        if (stored) {

            const parsed = JSON.parse(stored) as CostToCompanyListState;

            return {
                ...parsed,
                CostToCompanyId: parsed.CostToCompanyId || 0,
                EmployeeName: parsed.EmployeeName || "",
            };
        }
    } catch (error) {

        console.error('Error loading Cost To Company list state:', error);
    }

    return {
        page: 1,
        pageSize: 20,
        searchTerm: "",
        filters: {},
        sortInfo: undefined,
        CostToCompanyId: 0,
        EmployeeName: '',
    };
};


type Ctx = {
    listState: CostToCompanyListState;
    updateListState: (newState: Partial<CostToCompanyListState>) => void;
    resetFilters: () => void;
    resetToDefault: () => void;
    clearCostToCompanyContext: () => void;
};

const CostToCompanyListStateContext = createContext<Ctx | null>(null);

export const CostToCompanyListStateProvider = ({ children }: { children: ReactNode }) => {

    const [listState, setListState] = useState<CostToCompanyListState>(() => getInitialState());

    useEffect(() => {

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(listState));
        } catch (error) {
            console.error('Error saving Cost To Company  list state:', error);
        }

    }, [listState]);

    const updateListState = useCallback((updates: Partial<CostToCompanyListState>) => {
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
        const defaultState: CostToCompanyListState = {
            page: 1,
            pageSize: 20,
            searchTerm: "",
            filters: {},
            sortInfo: undefined,
            CostToCompanyId: 0,
            EmployeeName: "",
        };
        setListState(defaultState);
    }, []);

    const clearCostToCompanyContext = useCallback(() => {
        setListState((prev) => ({
            ...prev,
            CostToCompanyId: 0,
            EmployeeName: "",
        }));
    }, []);

    const contextValue = useMemo(() => ({
        listState,
        updateListState,
        resetFilters,
        resetToDefault,
        clearCostToCompanyContext
    }), [listState, updateListState, resetFilters, resetToDefault, clearCostToCompanyContext]);

    return (
        <CostToCompanyListStateContext.Provider value={contextValue}> {children} </CostToCompanyListStateContext.Provider>
    );
};

export const useCostToCompanyListState = () => {
    const ctx = useContext(CostToCompanyListStateContext);
    if (!ctx) throw new Error("use CostToCompany ListState must be used inside CostToCompany ListState Provider");
    return ctx;
};



