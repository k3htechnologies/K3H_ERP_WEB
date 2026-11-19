import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";
import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants";

export type ProcessSalaryListState = {
    page: number;
    pageSize: number;
    searchTerm: string;
    filters: FilterInfo;
    sortInfo: SortInfo | undefined;
    ProcessSalaryId: number;
    SalaryProcessMonthYear: string;
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.PROCESS_SALARY;

const getInitialState = (): ProcessSalaryListState => {

    try {

        const stored = localStorage.getItem(STORAGE_KEY);

        if (stored) {

            const parsed = JSON.parse(stored) as ProcessSalaryListState;

            return {
                ...parsed,
                ProcessSalaryId: parsed.ProcessSalaryId || 0,
                SalaryProcessMonthYear: parsed.SalaryProcessMonthYear || "",
            };
        }
    } catch (error) {

        console.error('Error loading Process Salary list state:', error);
    }

    return {
        page: 1,
        pageSize: 20,
        searchTerm: "",
        filters: {},
        sortInfo: undefined,
        ProcessSalaryId: 0,
        SalaryProcessMonthYear: '',
    };
};

type Ctx = {
    listState: ProcessSalaryListState;
    updateListState: (newState: Partial<ProcessSalaryListState>) => void;
    resetFilters: () => void;
    resetToDefault: () => void;
    clearProcessSalaryContext: () => void;
};

const ProcessSalaryListStateContext = createContext<Ctx | null>(null);

export const ProcessSalaryListStateProvider = ({ children }: { children: ReactNode }) => {

    const [listState, setListState] = useState<ProcessSalaryListState>(() => getInitialState());

    useEffect(() => {

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(listState));
        } catch (error) {
            console.error('Error saving Process Salary list state:', error);
        }

    }, [listState]);

    const updateListState = useCallback((updates: Partial<ProcessSalaryListState>) => {
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
        const defaultState: ProcessSalaryListState = {
            page: 1,
            pageSize: 20,
            searchTerm: "",
            filters: {},
            sortInfo: undefined,
            ProcessSalaryId: 0,
            SalaryProcessMonthYear: "",
        };
        setListState(defaultState);
    }, []);

    const clearProcessSalaryContext = useCallback(() => {
        setListState((prev) => ({
            ...prev,
            ProcessSalaryId: 0,
            SalaryProcessMonthYear: "",
        }));
    }, []);

    const contextValue = useMemo(() => ({
        listState,
        updateListState,
        resetFilters,
        resetToDefault,
        clearProcessSalaryContext
    }), [listState, updateListState, resetFilters, resetToDefault, clearProcessSalaryContext]);

    return (
        <ProcessSalaryListStateContext.Provider value={contextValue}> {children} </ProcessSalaryListStateContext.Provider>
    );
};

export const useProcessSalaryListState = () => {
    const ctx = useContext(ProcessSalaryListStateContext);
    if (!ctx) throw new Error("use ProcessSalary ListState must be used inside ProcessSalary ListState Provider");
    return ctx;
};



