import React, { useCallback, useEffect, useMemo, useState } from "react";
import OverviewCards from "@/features/inventoryDashboard/components/OverviewCards";
import BuildingOverview from "@/features/inventoryDashboard/components/BuildingOverview";
import AlertsPanel from "@/features/inventoryDashboard/components/Alert";
import InventoryHeader from "@/features/inventoryDashboard/components/InventoryHeader";
import { inventoryDashboardService } from "@/features/inventoryDashboard/services/InventoryDashboardService";
import UnitStatusDistribution from "@/features/inventoryDashboard/components/UnitStatusDistribution";
import ParkingDistribution from "@/features/inventoryDashboard/components/ParkingDistribution";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { runApiWithLoader } from "@/core/utils";
import { Loader } from "@/core/utils/loader";
import useToast from "@/core/hooks/useToast";
import * as E from "fp-ts/Either";
import { type Table0, type Table1, type Table2, type Table3, type Table4 } from "@/features/inventoryDashboard/models/InventoryDashboardModel";
import WingDetails from "@/features/inventoryDashboard/components/WingDetails";
import { Modal } from "@/ui/components/Modal/Modal";
import { inventoryService } from "@/features/inventory/services/InventoryServices";
import { type TableColumn } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { DataTable, type PaginationInfo } from "@/ui/components/DataTable/DataTable";
import { formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import type { InventoryFlatData } from "@/features/inventory/models/InventoryMasterModel";
import type { ParkingData } from "@/features/parking/models/ParkingModel";
import { parkingService } from "@/features/parking/services/ParkingService";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";

const InventoryDashboard: React.FC = () => {

  const { addToast } = useToast();
  const { projectId } = useProject();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [overViewData, setOverViewData] = useState<Table0[]>([]);
  const [parkingData, setParkingData] = useState<Table1[]>([]);
  const [buildingOverviewData, setBuildingOverviewData] = useState<Table2[]>([]);
  const [alertsData, setAlertsData] = useState<Table3[]>([]);
  const [wingData, setWingData] = useState<Table4[]>([]);
  const [selectedCard, setSelectedcard] = useState<any>(null);
  const [inventoryModalData, setInventoryModalData] = useState<InventoryFlatData[]>([]);
  const [parkingModalData, setParkingModalData] = useState<ParkingData[]>([]);

  const { canAction: canInventoryAction } = useMenuPermissions("/inventory");
  const { canAction: canParkingAction } = useMenuPermissions("/parking");

  useEffect(() => {
    if (!projectId) return;
    fetchInventory();
  }, [projectId]);

  const fetchInventory = useCallback(async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const response = await inventoryDashboardService.apiCallPullInventoryDashboard(Number(projectId));

        if (E.isRight(response)) {

          const e = response.right.Data;
          setOverViewData(e.Table0 || []);
          setParkingData(e.Table1 || []);
          setBuildingOverviewData(e.Table2 || []);
          setAlertsData(e.Table3 || []);
          setWingData(e.Table4 || []);
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
      "Loading Data"
    );
  }, [projectId, addToast]);

  // --============================== Modal Handling ==============================--

  const handleOpenModal = useCallback(async (type: string, cardName: string, status: string, count: number, row?: Table4) => {

    setSelectedcard({
      type: type ?? "",
      cardName: cardName ?? "",
      data: count ?? 0,
      buildingNumber: row?.Building ?? "",
      wing: row?.Wing ?? ""
    });

    if (type === "Inventory") {
      setInventoryModalData([]);

      const params = {
        PageSize: count > 0 ? count : 10,
        PageNumber: 1,
        ProjectId: Number(row?.ProjectId || projectId),
        BuildingNumber: row?.Building ?? "",
        Wing: row?.Wing ?? "",
        FlatStatus: status
      };

      await runApiWithLoader(
        setIsLoading,
        setLoadingMessage,
        async () => {

          const response = await inventoryService.apiCallPullPaginatedFlats(params);

          if (E.isRight(response)) {

            setInventoryModalData(response.right.Data || []);

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
        "Loading Units"
      );

    } else {
      setParkingModalData([]);

      const params = {
        PageSize: count > 0 ? count : 10,
        PageNumber: 1,
        ProjectId: Number(row?.ProjectId || projectId),
        Building: row?.Building ?? "",
        Wing: row?.Wing ?? "",
        ParkingStatus: status,
        IsAcessOnlyApprovedParking:false
      };

      await runApiWithLoader(
        setIsLoading,
        setLoadingMessage,
        async () => {

          const response = await parkingService.apiCallPullParkingWithPagination(params);

          if (E.isRight(response)) {

            setParkingModalData(response.right.Data || []);

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
        "Loading Parking"
      );
    }
  }, [projectId, addToast]);

  const inventoryTableColumns: TableColumn[] = useMemo(() => [
    {
      key: 'Floor',
      label: 'Floor',
      width: '120px',
      sortable: false,
    },
    {
      key: 'Flat',
      label: 'Unit Number',
      width: '150px',
      sortable: false,
    },
    {
      key: 'FlatType',
      label: 'Unit Type',
      width: '120px',
      sortable: false,
    },
    {
      key: 'RERACarpetAreaSqFt',
      label: 'RERA Carpet Area (SqFt)',
      width: '130px',
      sortable: false,
      align: 'right',
      render: (value: number) => value || 0,
    },
    {
      key: 'FlatConfiguration',
      label: 'Unit Configuration',
      width: '150px',
      sortable: false,
    },
    {
      key: 'FlatFacing',
      label: 'Unit Facing',
      width: '120px',
      sortable: false,
    },
    {
      key: 'OwnerName',
      label: 'Owner / Alloted / Blocked / Hold By',
      width: '600px',
      sortable: false,
      render: (value: string, row: InventoryFlatData) => {

        if (row?.FlatStatus?.toUpperCase() === 'BLOCKED' || row?.FlatStatus?.toUpperCase() === 'HOLD') {
          return `${row?.FlatStatus} BY ${row?.ModifiedBy || '-'} on ${formatDate_dd_MonthName_yy_hh_mm(row?.ModifiedDate ?? "-")}`;
        }

        return value?.trim() || '-';
      }
    },

  ], []);

  const ParkingTableColumns: TableColumn[] = useMemo(
    () => [
      {
        key: "ParkingNumber",
        label: "Parking Number",
        width: "150px",
        sortable: false,
      },
      {
        key: "ParkingCategory",
        label: "Category",
        width: "150px",
        sortable: false,
      },
      {
        key: "ParkingType",
        label: "Type",
        width: "150px",
        sortable: false,
      },
      {
        key: "ParkingSubType",
        label: "Size",
        width: "120px",
        sortable: false,
      },
      {
        key: "ParkingDimensions",
        label: "Dimensions",
        width: "130px",
        sortable: false,
      },
      {
        key: "ParkingStatus",
        label: "Status",
        width: "120px",
        sortable: false,
      },
      {
        key: "IsEVChargingAvailable",
        label: "EV Charging",
        width: "120px",
        sortable: false,
        render: (value: boolean) => (value ? "Yes" : "No"),
      },
      {
        key: "OwnerName",
        label: 'Owner / Alloted / Blocked / Hold By',
        width: '600px',
        sortable: false,
        render: (value: string, row: ParkingData) => {

        if (row?.ParkingStatus?.toUpperCase() === 'BLOCKED' || row?.ParkingStatus?.toUpperCase() === 'HOLD') {
          return `${row?.ParkingStatus} BY ${row?.ModifiedBy || '-'} on ${formatDate_dd_MonthName_yy_hh_mm(row?.ModifiedDate ?? "-")}`;
        }

        return value?.trim() || '-';
      }
      },

    ],
    [],
  );

  const inventorypaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: 1,
      totalPages: 1,
      totalRecords: inventoryModalData.length,
      pageSize: inventoryModalData.length,
      onPageChange: () => { }
    }),
    [inventoryModalData]
  );

  const parkingpaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: 1,
      totalPages: 1,
      totalRecords: parkingModalData.length,
      pageSize: parkingModalData.length,
      onPageChange: () => { }
    }),
    [parkingModalData]
  );

  return (
    <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-5">
      <Loader loading={isLoading} title={loadingMessage}><div /></Loader>

      {overViewData.length > 0 ? (
        <>
          <InventoryHeader />

          <OverviewCards overViewData={overViewData} />

          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
            <UnitStatusDistribution overViewData={overViewData} onOpenModal={handleOpenModal} />
            <ParkingDistribution parkingData={parkingData} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-5">
            <div className="md:col-span-12 lg:col-span-8">
              <BuildingOverview buildingOverviewData={buildingOverviewData} />
            </div>

            <div className="md:col-span-12 lg:col-span-4">
              <AlertsPanel alertsData={alertsData} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
            <WingDetails wingData={wingData} onOpenModal={handleOpenModal} canInventoryAction={canInventoryAction} canParkingAction={canParkingAction} />
          </div>
        </>
      ) :
        <div className="flex items-center justify-center text-gray-400">
          {projectId ? "No inventory data found" : "Please select a project"}
        </div>
      }

      {selectedCard && (
        <Modal
          isOpen={!!selectedCard}
          onClose={() => setSelectedcard(null)}
          title={

            <div className="flex flex-col">

              <span className="font-semibold text-base">
                {selectedCard.cardName || ""} ({selectedCard.data ?? 0})
              </span>

              <span className="text-sm text-gray-500">
                {selectedCard.buildingNumber ? ` Bldg: ${selectedCard.buildingNumber}` : ""}
                {selectedCard.wing ? ` | Wing: ${selectedCard.wing}` : ""}
              </span>

            </div>
          }
          size="large-half"
        >
          <DataTable
            data={selectedCard?.type === "Inventory" ? inventoryModalData : parkingModalData}
            columns={selectedCard?.type === "Inventory" ? inventoryTableColumns : ParkingTableColumns}
            recordsPerPage={selectedCard?.type === "Inventory" ? inventoryModalData.length : parkingModalData.length}
            loading={isLoading}
            fixedHeight
            className="flex-1"
            pagination={selectedCard?.type === "Inventory" ? inventorypaginationInfo : parkingpaginationInfo}
          />

        </Modal>
      )}
    </div>
  );
};

export default InventoryDashboard;
