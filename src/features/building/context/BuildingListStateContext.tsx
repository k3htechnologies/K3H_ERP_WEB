import { createContext, useContext, useState, type ReactNode } from "react";

type BuildingListState = {
  page: number;
  pageSize: number;
  searchTerm: string;
  filters: any;
  sortInfo: any;
  projectId: number | null;
  buildingId:number;
  buildingName: string;
};

type Ctx = {
  listState: BuildingListState;
  setListState: React.Dispatch<React.SetStateAction<BuildingListState>>;
};

const BuildingListStateContext = createContext<Ctx | null>(null);

export const BuildingListStateProvider = ({ children }: { children: ReactNode }) => {
  const [listState, setListState] = useState<BuildingListState>({
    page: 1,
    pageSize: 20,
    searchTerm: "",
    filters: {},
    sortInfo: null,
    projectId:0,
    buildingId:0,
    buildingName:' '
  });

  return (
    <BuildingListStateContext.Provider value={{ listState, setListState }}>
      {children}
    </BuildingListStateContext.Provider>
  );
};

export const useBuildingListState = () => {
  const ctx = useContext(BuildingListStateContext);
  if (!ctx) throw new Error("useBuildingListState must be used inside provider");
  return ctx;
};
