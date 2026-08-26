import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";
import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants";

export type ProjectLandListState = {
    page: number;
    pageSize: number;
    searchTerm: string;
    filters: FilterInfo;
    sortInfo: SortInfo | undefined;
    ProjectLandId: number;
    LandOwnerName: string;
    Uniquekey: string;
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.PROJECT_LAND;

const getInitialState = (): ProjectLandListState => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (stored) {
            const parsed = JSON.parse(stored) as ProjectLandListState;
            return {
                ...parsed,
                ProjectLandId: parsed.ProjectLandId || 0,
                LandOwnerName: parsed.LandOwnerName || "",
                Uniquekey: parsed.Uniquekey || "",
            };
        }
    } catch (error) {
        console.error('Error loading Project Land list state:', error);
    }

    return {
        page: 1,
        pageSize: 20,
        searchTerm: "",
        filters: {},
        sortInfo: undefined,
        ProjectLandId: 0,
        LandOwnerName: "",
        Uniquekey: "",
    };
};

type ProjectLandListStateContextType = {
    listState: ProjectLandListState;
    updateListState: (updates: Partial<ProjectLandListState>) => void;
    resetFilters: () => void;
    resetToDefault: () => void;
    setProjectLandContext: (ProjectLandId: number, LandOwnerName: string, Uniquekey: string) => void;
    clearProjectLandContext: () => void;
};

const ProjectLandListStateContext = createContext<ProjectLandListStateContextType | null>(null);

export const ProjectLandListStateProvider = ({ children }: { children: ReactNode }) => {

    const [listState, setListState] = useState<ProjectLandListState>(() => getInitialState());

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(listState));
        } catch (error) {
            console.error('Error saving Project Land list state:', error);
        }
    }, [listState]);

    const updateListState = useCallback((updates: Partial<ProjectLandListState>) => {
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
        const defaultState: ProjectLandListState = {
            page: 1,
            pageSize: 20,
            searchTerm: "",
            filters: {},
            sortInfo: undefined,
            ProjectLandId: 0,
            LandOwnerName: "",
            Uniquekey: "",
        };
        setListState(defaultState);
    }, []);

    const setProjectLandContext = useCallback((ProjectLandId: number, LandOwnerName: string, Uniquekey: string) => {
        setListState((prev) => ({
            ...prev,
            ProjectLandId,
            LandOwnerName,
            Uniquekey,
        }));
    }, []);

    const clearProjectLandContext = useCallback(() => {
        setListState((prev) => ({
            ...prev,
            ProjectLandId: 0,
            LandOwnerName: "",
            Uniquekey: "",
        }));
    }, []);

    const contextValue = useMemo<ProjectLandListStateContextType>(
        () => ({
            listState,
            updateListState,
            resetFilters,
            resetToDefault,
            setProjectLandContext,
            clearProjectLandContext,
        }),
        [listState, updateListState, resetFilters, resetToDefault, setProjectLandContext, clearProjectLandContext]
    );

    return (
        <ProjectLandListStateContext.Provider value={contextValue}>
            {children}
        </ProjectLandListStateContext.Provider>
    );
};

export const useProjectLandListState = () => {
    const ctx = useContext(ProjectLandListStateContext);
    if (!ctx) {
        throw new Error("useProjectLandListState must be used inside ProjectLandListStateProvider");
    }
    return ctx;
};

