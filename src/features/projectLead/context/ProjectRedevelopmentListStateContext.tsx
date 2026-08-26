import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";
import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants";

export type ProjectRedevelopmentListState = {
    page: number;
    pageSize: number;
    searchTerm: string;
    filters: FilterInfo;
    sortInfo: SortInfo | undefined;
    ProjectRedevelopmentId: number;
    BuildingName: string;
    Uniquekey: string;
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.PROJECT_REDEVELOPMENT;

const getInitialState = (): ProjectRedevelopmentListState => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (stored) {
            const parsed = JSON.parse(stored) as ProjectRedevelopmentListState;
            return {
                ...parsed,
                ProjectRedevelopmentId: parsed.ProjectRedevelopmentId || 0,
                BuildingName: parsed.BuildingName || "",
                Uniquekey: parsed.Uniquekey || "",
            };
        }
    } catch (error) {
        console.error('Error loading Project Redevelopment list state:', error);
    }

    return {
        page: 1,
        pageSize: 20,
        searchTerm: "",
        filters: {},
        sortInfo: undefined,
        ProjectRedevelopmentId: 0,
        BuildingName: "",
        Uniquekey: "",
    };
};

type ProjectRedevelopmentListStateContextType = {
    listState: ProjectRedevelopmentListState;
    updateListState: (updates: Partial<ProjectRedevelopmentListState>) => void;
    resetFilters: () => void;
    resetToDefault: () => void;
    setProjectRedevelopmentContext: (ProjectRedevelopmentId: number, BuildingName: string, Uniquekey: string) => void;
    clearProjectRedevelopmentContext: () => void;
};

const ProjectRedevelopmentListStateContext = createContext<ProjectRedevelopmentListStateContextType | null>(null);

export const ProjectRedevelopmentListStateProvider = ({ children }: { children: ReactNode }) => {

    const [listState, setListState] = useState<ProjectRedevelopmentListState>(() => getInitialState());

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(listState));
        } catch (error) {
            console.error('Error saving Project Redevelopment list state:', error);
        }
    }, [listState]);

    const updateListState = useCallback((updates: Partial<ProjectRedevelopmentListState>) => {
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
        const defaultState: ProjectRedevelopmentListState = {
            page: 1,
            pageSize: 20,
            searchTerm: "",
            filters: {},
            sortInfo: undefined,
            ProjectRedevelopmentId: 0,
            BuildingName: "",
            Uniquekey: "",
        };
        setListState(defaultState);
    }, []);

    const setProjectRedevelopmentContext = useCallback((ProjectRedevelopmentId: number, BuildingName: string, Uniquekey: string) => {
        setListState((prev) => ({
            ...prev,
            ProjectRedevelopmentId,
            BuildingName,
            Uniquekey,
        }));
    }, []);

    const clearProjectRedevelopmentContext = useCallback(() => {
        setListState((prev) => ({
            ...prev,
            ProjectRedevelopmentId: 0,
            BuildingName: "",
            Uniquekey: "",
        }));
    }, []);

    const contextValue = useMemo<ProjectRedevelopmentListStateContextType>(
        () => ({
            listState,
            updateListState,
            resetFilters,
            resetToDefault,
            setProjectRedevelopmentContext,
            clearProjectRedevelopmentContext,
        }),
        [listState, updateListState, resetFilters, resetToDefault, setProjectRedevelopmentContext, clearProjectRedevelopmentContext]
    );

    return (
        <ProjectRedevelopmentListStateContext.Provider value={contextValue}>
            {children}
        </ProjectRedevelopmentListStateContext.Provider>
    );
};

export const useProjectRedevelopmentListState = () => {
    const ctx = useContext(ProjectRedevelopmentListStateContext);
    if (!ctx) {
        throw new Error("useProjectRedevelopmentListState must be used inside ProjectRedevelopmentListStateProvider");
    }
    return ctx;
};

