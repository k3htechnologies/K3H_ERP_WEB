import { useEffect, useMemo, useState } from "react";
import * as E from "fp-ts/Either";

import type { TableColumn } from "@/ui/components/DataTable/DataTable";
import { LevelTree, type LevelTreeConfig, type RowId } from "@/ui/components/DataTable/Leveltree";
import { runApiWithLoader } from "@/core/utils";
import type { AddUpdateContractRequisitionBoqRequest, ContractBoqData, FilterWithPaginationContractRequisitionBoq } from "../models/ContractRequisitionBoqModel";
import useToast from "@/core/hooks/useToast";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { contractRequisitionBoqService } from "@/features/contractRequisition/services/ContractRequisitionBoqService";
import { useContractRequisitionListState } from "@/features/contractRequisition/context/ContractRequisitionListStateContext";

const budgetConfig = {
  idKey: "BudgetId",
  levels: [
    { idKey: "LevelId1", nameKey: "Level1Name" },
    { idKey: "LevelId2", nameKey: "Level2Name" },
    { idKey: "LevelId3", nameKey: "Level3Name" },
    { idKey: "LevelId4", nameKey: "Level4Name" },
  ],
  titleKey: (row) => `${row.WBSCode} ${row.CategoryName}`
} satisfies LevelTreeConfig<ContractBoqData>

export default function ContractBOQSelectionScreen() {

  const [, setLoadingMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [contractRequisitionBoqResponse, setContractRequisitionBoqResponse] = useState<ContractBoqData[]>();
  const [initialSelectedIds, setInitialSelectedIds] = useState<RowId[]>([]);
  const [isSelectionLocked, setIsSelectionLocked] = useState(false);

  const { listState } = useContractRequisitionListState();
  const { ContractRequisitionId, IsLockAndKeyContract } = listState;
  const { addToast } = useToast();
  const { projectId } = useProject();

  const loadDetailsdata = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationContractRequisitionBoq = {
          PageNumber: 1,
          PageSize: 10000,
          ProjectId: Number(projectId),
          ContractRequisitionId: ContractRequisitionId
        };

        const response = await contractRequisitionBoqService.apiCallPullContractRequisitionBoq(params);

        if (E.isRight(response)) {

          const boqData = response.right.Data ?? [];

          const selectedIds: RowId[] = boqData
            .filter((item) => item.IsSelected === true)
            .map((item) => item.BudgetId);
            
          setContractRequisitionBoqResponse(boqData);
          setInitialSelectedIds(selectedIds);
          setIsSelectionLocked(selectedIds.length > 0);

        } else {
          addToast({ type: "error", title: response.left.message });
        }
        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: "error", title: error.message });
      },
      undefined,
      "Loading Contract Requisition BOQ Details",
    );
  };

  useEffect(() => {
    if (!projectId) return;
    setInitialSelectedIds([]);
    setIsSelectionLocked(false);
    loadDetailsdata()
  }, [projectId]);

  const handleSave = async (selectedBudgetIds: RowId[]) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: AddUpdateContractRequisitionBoqRequest = {
          ContractRequisitionBOQId: 0,
          UniqueKey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          ContractRequisitionId: Number(ContractRequisitionId),
          SelectedBOQId: selectedBudgetIds.join(",")
        };

        const response = await contractRequisitionBoqService.apiCallToAddContractRequisitionBoq(params);

        if (E.isRight(response)) {
          setIsSelectionLocked(true);
        } else {
          addToast({ type: "error", title: response.left.message });
        }
        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: "error", title: error.message });
      },
      undefined,
      "Saving Contract Requisition BOQ Details",
    );
  };

  const ContractRequisitionBoqColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: "WBSCode",
        label: "WBS Code",
        render: (value) => value || "-",
      },
      {
        key: "CategoryName",
        label: "Category Name",
        render: (value) => value || "—",
      },
      {
        key: "Uom",
        label: "UOM",
        render: (value) => value || "—",
      },
      {
        key: "Quantity",
        label: "Quantity",
        render: (value, row: any) => (row.LevelId3 !== 0 && value ? value : "—"),
      }
    ],
    [IsLockAndKeyContract]
  );

  const ContractRequisitionLockAndKeyBoqColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: "WBSCode",
        label: "WBS Code",
        render: (value) => value || "-",
      },
      {
        key: "CategoryName",
        label: "Category Name",
        render: (value) => value || "—",
      },
      {
        key: "Sq",
        label: "Sq",
        render: (value) => value || "—",
      },
    ],
    [IsLockAndKeyContract]
  );

  return (
    <LevelTree
      loading={isLoading}
      response={contractRequisitionBoqResponse}
      config={budgetConfig}
      columns={IsLockAndKeyContract ? ContractRequisitionLockAndKeyBoqColumns : ContractRequisitionBoqColumns}
      selectable
      initialSelectedIds={initialSelectedIds}
      disabled={isSelectionLocked}
      onSave={handleSave}
    />
  );
}