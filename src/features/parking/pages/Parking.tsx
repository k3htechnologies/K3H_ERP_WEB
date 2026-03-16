import { useEffect, useState, useMemo, useCallback } from "react";
import { type FilterParkingRequest, type ParkingData, type UpdateParkingRequest } from "@/features/parking/models/ParkingModel";

import * as E from "fp-ts/Either";
import useToast from "@/core/hooks/useToast";
import { runApiWithLoader } from "@/core/utils";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { Loader } from "@/core/utils/loader";
import { parkingService } from "@/features/parking/services/ParkingService";
import { Modal } from "@/ui/components/Modal/Modal";
import { Input } from "@/ui/components/forms";
import { StatusCounters } from "@/features/inventory/components/StatusCounters";
import { ParkingHeader } from "@/features/parking/component/ParkingHeader";
import { handleExportFile } from "@/core/utils/exportFile";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import ExportImport from "@/ui/components/ExcelImport/ExcelImport";
import { technicalService } from "@/features/technical/services/TechnicalService";
import Checkbox from "@/ui/components/forms/Checkbox";
import { ParkingCard } from "@/features/parking/component/ParkingCard";
import {
  PARKING_CATEGORY,
  PARKING_SIZE,
  PARKING_STATUS,
  PARKING_SUBCATEGORY_CANTILEVER,
  PARKING_SUBCATEGORY_PIT_PUZZLE,
  PARKING_SUBCATEGORY_PIT_STACK,
  PARKING_SUBCATEGORY_PODIUM,
  PARKING_SUBCATEGORY_PUZZLE,
  PARKING_SUBCATEGORY_STACK,
  PARKING_SUBCATEGORY_SURFACE,
  PARKING_SUBCATEGORY_TANDEM,
  PARKING_SUBCATEGORY_TOWER,
} from "@/core/constants";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { DataTable } from "@/ui/components/DataTable/DataTable";
import type { TableColumn } from "@/ui/components/DataTable/DataTable";
import { Edit, Eye } from "lucide-react";
import { colorsForParkingComponent } from "@/features/parking/utils/parkingColors";
import type {
  ModulesApprovalStatusRequest,
  UpdateModulesWorkflowApprovalRequest,
} from "@/features/modulesWorkflowApproval/models/ModulesWorkflowApprovalModel";
import { modulesWorkflowApprovalService } from "@/features/modulesWorkflowApproval/services/ModulesWorkflowApprovalService";
import { ApprovalLogModal } from "@/features/modulesWorkflowApproval/components/ApprovalLogModal";
import ApprovalActionModal from "@/features/modulesWorkflowApproval/components/ApprovalActionModal";

interface ParkingGroupedByBuilding {
  BuildingNumber: string;
  InventoryBuildingId: number;
  Floors: ParkingGroupedByFloor[];
}

interface ParkingGroupedByFloor {
  Floor: string;
  InventoryFloorId: number;
  InventoryFlatFloorBasementPodiumWingId: number;
  Wing: string;
  ParkingData: ParkingData[];

  IsApproval?: boolean;
  ApprovalStatus?: string;
}

const Parking = () => {
  //#region STATE MANAGEMENT

  const [parkingData, setParkingData] = useState<ParkingData[]>([]);
  const [groupedParking, setGroupedParking] = useState<ParkingGroupedByBuilding[]>([]);
  const [selectedBuildingIndex, setSelectedBuildingIndex] = useState<number | null>(null);
  const [selectedFloorIndex, setSelectedFloorIndex] = useState<number | null>(null);

  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const [showImportModal, setShowImportModal] = useState(false);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // UPDATE PARKING MODAL
  const [isUpdateParkingModalOpen, setIsUpdateParkingModalOpen] = useState(false);
  const [formData, setFormData] = useState<UpdateParkingRequest>({
    ParkingId: null,
    Uniquekey: null,
    ProjectId: null,
    ParkingNumber: null,
    ParkingCategory: null,
    ParkingType: null,
    ParkingSubType: null,
    ParkingDimensions: null,
    IsEVChargingAvailable: false,
    ParkingStatus: null,
    InventoryBuildingId: 0,
    InventoryFlatFloorBasementPodiumWingId: 0,
    InventoryFloorId: 0,
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    const savedTab = localStorage.getItem("parkingActiveTab");
    return savedTab || "Grid";
  });

  // SEARCH STATE
  const [searchTerm, setSearchTerm] = useState<string>("");

  // APPROVAL LOG MODAL
  const [isApprovalLogModalOpen, setIsApprovalLogModalOpen] = useState(false);
  const [approvalLogRequest, setApprovalLogRequest] = useState<ModulesApprovalStatusRequest | null>(null);
  const [buildingName, setBuildingName] = useState<string | null>("");
  const [floor, setFloor] = useState<string | null>("");

  // APPROVAL ACTION MODAL
  const [isApprovalActionModalOpen, setIsApprovalActionModalOpen] = useState(false);
  const [approvalActionType, setApprovalActionType] = useState<"approve" | "reject">("approve");

  // Save tab state when it changes
  useEffect(() => {
    localStorage.setItem("parkingActiveTab", activeTab);
  }, [activeTab]);

  const { projectId } = useProject();

  const { canAction, canExport } = useMenuPermissions();
  const { canAction: canBookingAction } = useMenuPermissions("/booking");

  //#region INIT

  // Clear all state when project changes
  useEffect(() => {
    if (!projectId) {
      setParkingData([]);
      setGroupedParking([]);
      setSelectedBuildingIndex(null);
      setSelectedFloorIndex(null);
      setIsUpdateParkingModalOpen(false);
      setErrors({});
      setSearchTerm("");
      return;
    }

    // Clear all state when project changes
    setParkingData([]);
    setGroupedParking([]);
    setSelectedBuildingIndex(null);
    setSelectedFloorIndex(null);
    setIsUpdateParkingModalOpen(false);
    setErrors({});
    setSearchTerm("");
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;

    fetchParking();
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;

    if (groupedParking.length > 0 && selectedBuildingIndex === null) {
      setSelectedBuildingIndex(0);
      if (groupedParking[0].Floors.length > 0) {
        setSelectedFloorIndex(0);
      }
    }
  }, [projectId, groupedParking.length]);

  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH

  const groupParkingData = useCallback((data: ParkingData[]): ParkingGroupedByBuilding[] => {
    const grouped: { [key: string]: ParkingGroupedByBuilding } = {};

    data.forEach((parking) => {
      const buildingKey = parking.BuildingNumber || "Unknown";
      const floorKey = parking.Floor || "Unknown";

      if (!grouped[buildingKey]) {
        grouped[buildingKey] = {
          BuildingNumber: buildingKey,
          InventoryBuildingId: parking.InventoryBuildingId,
          Floors: [],
        };
      }

      const building = grouped[buildingKey];
      let floor = building.Floors.find((f) => f.Floor === floorKey);

      if (!floor) {
        floor = {
          Floor: floorKey,
          InventoryFloorId: parking.InventoryFloorId,
          InventoryFlatFloorBasementPodiumWingId: parking.InventoryFlatFloorBasementPodiumWingId,
          Wing: parking.Wing || "",
          IsApproval: parking.IsApproval,
          ApprovalStatus: parking.ApprovalStatus || "Pending",
          ParkingData: [],
        };
        building.Floors.push(floor);
      }

      floor.ParkingData.push(parking);
    });

    return Object.values(grouped);
  }, []);

  const fetchParking = useCallback(async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterParkingRequest = {
          ProjectId: Number(projectId),
        };

        const response = await parkingService.apiCallPullParking(params);

        if (E.isRight(response)) {

          setParkingData(response.right.Data || []);

          const grouped = groupParkingData(response.right.Data || []);

          setGroupedParking(grouped);

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
      "Loading Parking",
    );
  }, [projectId, groupParkingData, addToast]);

  //#endregion

  //#region STATUS COUNTERS

  const parkingStatusCounts = useMemo(() => {
    const counts = {
      available: 0,
      hold: 0,
      booked: 0,
      blocked: 0,
      member: 0,
    };

    parkingData.forEach((parking) => {
      const status = parking.ParkingStatus?.toLowerCase() || "";
      if (status === "available") counts.available++;
      else if (status === "hold") counts.hold++;
      else if (status === "booked") counts.booked++;
      else if (status === "blocked") counts.blocked++;
      else if (status === "member") counts.member++;
    });

    return counts;
  }, [parkingData]);

  const selectedFloorParkingCounts = useMemo(() => {
    if (selectedBuildingIndex === null || selectedFloorIndex === null || !groupedParking[selectedBuildingIndex]) {
      return { available: 0, hold: 0, booked: 0, blocked: 0, member: 0 };
    }

    const floor = groupedParking[selectedBuildingIndex].Floors[selectedFloorIndex];
    if (!floor) {
      return { available: 0, hold: 0, booked: 0, blocked: 0, member: 0 };
    }

    const counts = {
      available: 0,
      hold: 0,
      booked: 0,
      blocked: 0,
      member: 0,
    };

    floor.ParkingData.forEach((parking) => {
      const status = parking.ParkingStatus?.toLowerCase() || "";
      if (status === "available") counts.available++;
      else if (status === "hold") counts.hold++;
      else if (status === "booked") counts.booked++;
      else if (status === "blocked") counts.blocked++;
      else if (status === "member") counts.member++;
    });

    return counts;
  }, [groupedParking, selectedBuildingIndex, selectedFloorIndex]);

  //#endregion

  //#region SEARCH HANDLERS

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  // Filter parking data based on search term for selected floor
  const getFilteredParkingData = useMemo(() => {
    if (selectedBuildingIndex === null || selectedFloorIndex === null || !groupedParking[selectedBuildingIndex]) {
      return [];
    }

    const floor = groupedParking[selectedBuildingIndex].Floors[selectedFloorIndex];
    if (!floor) {
      return [];
    }

    if (!searchTerm.trim()) {
      return floor.ParkingData || [];
    }

    const searchLower = searchTerm.toLowerCase().trim();
    return floor.ParkingData.filter((parking) => {
      const parkingNumber = parking.ParkingNumber?.toLowerCase() || "";
      return parkingNumber.includes(searchLower);
    });
  }, [groupedParking, selectedBuildingIndex, selectedFloorIndex, searchTerm]);

  //#endregion

  //#region UPDATE PARKING HANDLERS

  const handleEditParking = (parking: ParkingData) => {
    setFormData({
      ParkingId: parking.ParkingId || null,
      Uniquekey: parking.Uniquekey || null,
      ProjectId: parking.ProjectId || null,
      ParkingNumber: parking.ParkingNumber || null,
      ParkingCategory: parking.ParkingCategory || null,
      ParkingType: parking.ParkingType || null,
      ParkingSubType: parking.ParkingSubType || null,
      ParkingDimensions: parking.ParkingDimensions || null,
      IsEVChargingAvailable: parking.IsEVChargingAvailable || false,
      ParkingStatus: parking.ParkingStatus || null,
      InventoryBuildingId: parking.InventoryBuildingId,
      InventoryFlatFloorBasementPodiumWingId: parking.InventoryFlatFloorBasementPodiumWingId,
      InventoryFloorId: parking.InventoryFloorId,
    });
    setIsUpdateParkingModalOpen(true);
    setErrors({});
  };

  const handleFieldChange = (field: keyof UpdateParkingRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): {
    isValid: boolean;
    errors: { [key: string]: string };
  } => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.ParkingNumber) {
      newErrors.ParkingNumber = "Parking Number is required";
    }

    if (!formData.ParkingCategory) {
      newErrors.ParkingCategory = "Parking Category is required";
    }

    if (!formData.ParkingType) {
      newErrors.ParkingType = "Parking Type is required";
    }

    if (!formData.ParkingDimensions) {
      newErrors.ParkingDimensions = "Parking Dimensions is required";
    }

    if (!formData.ParkingSubType) {
      newErrors.ParkingSubType = "Parking Size is required";
    }

    if (!formData.ParkingStatus) {
      newErrors.ParkingStatus = "Parking Status is required";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  const handleUpdateParking = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});

    const validation = validateForm();

    if (!validation.isValid) {
      setErrors(validation.errors);

      return;
    }

    const params: UpdateParkingRequest = {
      ...formData,
      ProjectId: projectId,
    };

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const response = await parkingService.apiCallUpdateParking(params);

        if (E.isRight(response)) {
          setIsUpdateParkingModalOpen(false);

          addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

          await fetchParking();
        } else {
          addToast({ type: "error", title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: "error", title: error?.message });
      },
      undefined,
      "Updating Parking",
    );
  };

  //#endregion

  const handleExportParking = async (exportType: "Excel" | "PDF") => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterParkingRequest = {
          ProjectId: Number(projectId),
          ExportType: exportType,
        };

        const response = await parkingService.apiCallPullParking(params);

        handleExportFile(response, exportType, "Parking", addToast);

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: "error", title: error.message || "Export failed" });
      },
      undefined,
      "Preparing Export",
    );
  };
  const handleExportParkingExcel = () => handleExportParking("Excel");
  const handleExportParkingPdf = () => handleExportParking("PDF");

  const downloadExcelSampleInventory = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterParkingRequest = {
          ProjectId: Number(projectId),
          ExportType: "Excel",
        };

        const response = await parkingService.apiCallPullParking(params);

        handleExportFile(response, "Excel", "Parking", addToast, "Sample file download successfully");

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: "error", title: error.message || "Export failed" });
      },
      undefined,
      "Preparing Downloading",
    );
  };

  const handleDownloadExcelSampleInventory = () => downloadExcelSampleInventory();

  const uploadExcel = async (file: File, mergeExisting: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const fd = new FormData();

        fd.append("ExcelFile", file);
        fd.append("IsAllDelete", mergeExisting);
        fd.append("TableName", "PARKING");
        fd.append("ProjectId", String(projectId));

        const response = await technicalService.apiCallExcelImport(fd);

        if (E.isRight(response)) {
          addToast({ type: "success", title: "Excel imported sucessfully" });

          fetchParking();
        } else {
          addToast({ type: "error", title: response.left.message });
        }

        return response;
      },
      undefined,
      (err: any) => addToast({ type: "error", title: err.message }),
      undefined,
      "Importing Excel",
    );
  };

  //#region TABLE DATA AND COLUMNS

  // Table columns definition
  const tableColumns: TableColumn[] = useMemo(
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
        render: (value: string) => {
          const statusColors =
            colorsForParkingComponent[value as keyof typeof colorsForParkingComponent] || colorsForParkingComponent.Available;
          return <span className={`px-3 py-1 rounded text-sm font-medium ${statusColors.Button} ${statusColors.buttonText}`}>{value}</span>;
        },
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
        label: "Owner",
        width: "200px",
        sortable: false,
        render: (value: string) => {
          if (!value) return "-";
          return <span className="text-[#135BEC] font-semibold">{value}</span>;
        },
      },
      {
        key: "actions",
        label: "Actions",
        width: "150px",
        fixed: "right",
        render: (_value: any, row: any) => {
          const parking = row as ParkingData;

          return (
            <div className="flex items-center gap-2">
              {approvalStatus?.toUpperCase() === "APPROVED" && (
                <div title="View Details">
                  <Eye size={16} className="cursor-pointer text-blue-600 hover:text-blue-800" onClick={() => handleEditParking(parking)} />
                </div>
              )}
              {approvalStatus?.toUpperCase() !== "APPROVED" &&
                canAction && (
                  <div title="Edit">
                    <Edit
                      className="cursor-pointer text-blue-600 hover:text-blue-800"
                      onClick={() => handleEditParking(parking)}
                      size={16}
                    />
                  </div>
                )}
            </div>
          );
        },
      },
    ],
    [canAction, handleEditParking],
  );

  //#endregion

  //#region APPROVAL LOG HISTORY

  const handleApprovalLog = () => {
    if (selectedBuildingIndex === null || selectedFloorIndex === null) return;

    const building = groupedParking[selectedBuildingIndex];
    const floor = building?.Floors[selectedFloorIndex];

    if (!building || !floor) return;

    const request: ModulesApprovalStatusRequest = {
      ModuleName: "PARKING APPROVAL",
      Id: building.InventoryBuildingId,
      SubId: floor.InventoryFlatFloorBasementPodiumWingId,
      SubSubId: floor.InventoryFloorId,
      ProjectId: Number(projectId),
    };

    setBuildingName(building.BuildingNumber);
    setFloor(floor.Floor)

    setApprovalLogRequest(request);
    setIsApprovalLogModalOpen(true);
  };

  const handleApproveRejectDocument = (type: "approve" | "reject") => {
    setApprovalActionType(type);

    if (selectedBuildingIndex === null || selectedFloorIndex === null) return;

    const building = groupedParking[selectedBuildingIndex];
    const floor = building?.Floors[selectedFloorIndex];

    if (!building || !floor) return;

    setBuildingName(building.BuildingNumber);
    setFloor(floor.Floor)

    setIsApprovalActionModalOpen(true);
  };

  const handleApprovalSubmit = async (remark: string) => {
    if (selectedBuildingIndex === null || selectedFloorIndex === null) return;

    const building = groupedParking[selectedBuildingIndex];
    const floor = building?.Floors[selectedFloorIndex];

    if (!building || !floor) return;

    const payload: UpdateModulesWorkflowApprovalRequest = {
      ModuleName: "PARKING APPROVAL",
      Id: building.InventoryBuildingId,
      SubId: floor.InventoryFlatFloorBasementPodiumWingId,
      SubSubId: floor.InventoryFloorId,
      ProjectId: Number(projectId),
      IsApproved: approvalActionType === "approve",
      Remarks: remark ?? null,
    };

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const response = await modulesWorkflowApprovalService.apiCallupdateModulesWorkflowApproval(payload);

        if (E.isRight(response)) {
          addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

          setIsApprovalActionModalOpen(false);

          await fetchParking();
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
      approvalActionType === "approve" ? "Approving Parking" : "Rejecting Parking",
    );
  };

  //#endregion
  const isChange = formData.ParkingStatus === "Member" || formData.ParkingStatus === "Booked" ? false : true;
  const disabled = formData.ParkingStatus === "Member" || formData.ParkingStatus === "Booked" ? true : false;

  const approvalStatus = selectedBuildingIndex !== null && selectedFloorIndex !== null
    ? groupedParking[selectedBuildingIndex]?.Floors[selectedFloorIndex]?.ApprovalStatus
    : undefined

  return (
    <>
      <Loader loading={isLoading} title={loadingMessage}>{" "}<div></div></Loader>

      <ParkingHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onExportExcel={handleExportParkingExcel}
        onExportPdf={handleExportParkingPdf}
        onUploadExcel={() => setShowImportModal(true)}
        onDownloadSampleExcel={handleDownloadExcelSampleInventory}
        canExport={canExport && Number(projectId) > 0 && parkingData.length > 0}
        exportLoading={isLoading}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        canAction={canAction && Number(projectId) > 0 && parkingData.length > 0}
        approvalStatus={
          selectedBuildingIndex !== null && selectedFloorIndex !== null
            ? groupedParking[selectedBuildingIndex]?.Floors[selectedFloorIndex]?.ApprovalStatus
            : undefined
        }
        showApprovalActions={
          selectedBuildingIndex !== null &&
          selectedFloorIndex !== null &&
          groupedParking[selectedBuildingIndex]?.Floors[selectedFloorIndex]?.IsApproval === true
        }
        onApprovalLog={handleApprovalLog}
        onApprove={() => handleApproveRejectDocument("approve")}
        onReject={() => handleApproveRejectDocument("reject")}
      />

      <ExportImport
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        onUpload={(file, mergeExisting) => {
          setShowImportModal(false);
          uploadExcel(file, mergeExisting);
        }}
      />

      <div className="flex flex-col w-full h-[120px] rounded-br-[15px] rounded-bl-[15px] border-[1px] border-gray-300 shadow-[0_1px_2px_1px_rgba(0,0,0,0.15)] bg-[#F9FAFB] px-4 py-1">
        <div className="flex justify-between items-center">
          <div className="flex gap-5">
            {groupedParking.map((building, index) => (

              <span
                key={index}
                onClick={() => {
                  setSelectedBuildingIndex(index);
                  if (building.Floors.length > 0) {
                    setSelectedFloorIndex(0);
                  } else {
                    setSelectedFloorIndex(null);
                  }
                }}
                className={`relative pb-2 text-sm font-medium transition-all duration-200 flex items-center gap-2 ${selectedBuildingIndex === index
                  ? "text-blue-600 font-medium text-[16px] leading-[140%] tracking-[0.01em]"
                  : "text-gray-400 font-normal text-[14px] leading-[140%] tracking-[0.01em] hover:text-blue-500"
                  }`}
              >
                {building.BuildingNumber}
                {selectedBuildingIndex === index && <span className="absolute left-0 bottom-0 w-full h-[2px] bg-blue-600 rounded-full" />}
              </span>
            ))}
          </div>

          <div className="pt-5">
            <StatusCounters
              availableCount={parkingStatusCounts.available}
              holdCount={parkingStatusCounts.hold}
              memberCount={parkingStatusCounts.member}
              bookedCount={parkingStatusCounts.booked}
              blockedCount={parkingStatusCounts.blocked}
            />
          </div>
        </div>

        <div className="border-b border-gray-200" />

        <div className="flex justify-between items-center pt-2 pb-2">
          {selectedBuildingIndex !== null &&
            groupedParking[selectedBuildingIndex] &&
            groupedParking[selectedBuildingIndex].Floors.length > 0 && (
              <>
                <div className="flex-1 flex gap-2">
                  {groupedParking[selectedBuildingIndex].Floors.map((floor, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedFloorIndex(index)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedFloorIndex === index
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-300"
                        }`}
                    >
                      {floor.Wing} / {floor.Floor}
                    </button>
                  ))}
                </div>

                {/* FLOOR STATUS */}
                <div className="ml-auto">
                  <StatusCounters
                    availableCount={selectedFloorParkingCounts.available}
                    holdCount={selectedFloorParkingCounts.hold}
                    memberCount={selectedFloorParkingCounts.member}
                    bookedCount={selectedFloorParkingCounts.booked}
                    blockedCount={selectedFloorParkingCounts.blocked}
                  />
                </div>
              </>
            )}
        </div>
      </div>

      {/* Parking Cards or Table */}
      {selectedBuildingIndex !== null &&
        selectedFloorIndex !== null &&
        groupedParking[selectedBuildingIndex]?.Floors[selectedFloorIndex] &&
        (activeTab === "Grid" ? (
          <div className="flex flex-wrap gap-4 p-4 mt-5 shadow-[0_1px_2px_1px_rgba(0,0,0,0.15)] bg-[#F9FAFB] rounded-[15px]">
            {getFilteredParkingData.map((parking, index) => (
              <ParkingCard
                key={parking.ParkingId || index}
                parking={parking}
                onEdit={handleEditParking}
                canAction={canAction}
                canBookingAction={canBookingAction}
                approvalStatus={
                  selectedBuildingIndex !== null && selectedFloorIndex !== null
                    ? groupedParking[selectedBuildingIndex]?.Floors[selectedFloorIndex]?.ApprovalStatus
                    : undefined
                }
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-4">
            <DataTable
              data={getFilteredParkingData}
              columns={tableColumns}
              emptyMessage="No parking found"
              loading={isLoading}
              fixedHeight={false}
            />
          </div>
        ))}

      {/* Update Parking Modal */}
      <Modal
        isOpen={isUpdateParkingModalOpen}
        onClose={() => {
          setIsUpdateParkingModalOpen(false);
        }}
        title="Update Parking"
        onSubmit={handleUpdateParking}
        saveText={canAction === true && approvalStatus?.toUpperCase() !== "APPROVED" && isChange ? "Update" : ""}
        onCancel={() => {
          setIsUpdateParkingModalOpen(false);
        }}
        size="lg"
        loading={isLoading}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Parking Number"
              value={formData.ParkingNumber || ""}
              onChange={(e) => handleFieldChange("ParkingNumber", e.target.value)}
              placeholder="Enter Parking Number"
              required
              error={errors.ParkingNumber}
              disabled={disabled}
            />

            <SinglePageSelection
              label="Parking Category"
              placeholder="Select Parking Category"
              value={formData.ParkingCategory || ""}
              onChange={(e) => {
                handleFieldChange("ParkingCategory", String(e));
                handleFieldChange("ParkingType", "");
              }}
              options={PARKING_CATEGORY.map((opt) => ({ label: opt.name, value: opt.id }))}
              error={errors.ParkingCategory}
              required
              disabled={disabled}
            />

            <SinglePageSelection
              label="Parking Type"
              placeholder="Select Parking Type"
              value={formData.ParkingType || ""}
              onChange={(val) => handleFieldChange("ParkingType", String(val))}
              options={
                formData.ParkingCategory === "Stack Parking"
                  ? PARKING_SUBCATEGORY_STACK.map((opt) => ({ label: opt.name, value: opt.id }))
                  : formData.ParkingCategory === "Surface Parking"
                    ? PARKING_SUBCATEGORY_SURFACE.map((opt) => ({ label: opt.name, value: opt.id }))
                    : formData.ParkingCategory === "Puzzle Parking"
                      ? PARKING_SUBCATEGORY_PUZZLE.map((opt) => ({ label: opt.name, value: opt.id }))
                      : formData.ParkingCategory === "Tower Parking"
                        ? PARKING_SUBCATEGORY_TOWER.map((opt) => ({ label: opt.name, value: opt.id }))
                        : formData.ParkingCategory === "Pit Puzzle Parking"
                          ? PARKING_SUBCATEGORY_PIT_PUZZLE.map((opt) => ({ label: opt.name, value: opt.id }))
                          : formData.ParkingCategory === "Cantilever Parking"
                            ? PARKING_SUBCATEGORY_CANTILEVER.map((opt) => ({ label: opt.name, value: opt.id }))
                            : formData.ParkingCategory === "Tandem Parking"
                              ? PARKING_SUBCATEGORY_TANDEM.map((opt) => ({ label: opt.name, value: opt.id }))
                              : formData.ParkingCategory === "Podium Parking"
                                ? PARKING_SUBCATEGORY_PODIUM.map((opt) => ({ label: opt.name, value: opt.id }))
                                : formData.ParkingCategory === "Pit + Stack"
                                  ? PARKING_SUBCATEGORY_PIT_STACK.map((opt) => ({ label: opt.name, value: opt.id }))
                                  : []
              }
              error={errors.ParkingType}
              required
              disabled={disabled}
            />

            <SinglePageSelection
              label="Parking Size"
              placeholder="Select Size"
              value={formData.ParkingSubType || ""}
              onChange={(val) => handleFieldChange("ParkingSubType", String(val))}
              options={PARKING_SIZE.map((opt) => ({ label: opt.name, value: opt.id }))}
              error={errors.ParkingSubType}
              required
              disabled={disabled}
            />
            <Input
              label="Dimensions"
              value={formData.ParkingDimensions || ""}
              maxLength={15}
              onChange={(e) => handleFieldChange("ParkingDimensions", e.target.value)}
              placeholder="Enter Dimensions"
              required
              error={errors.ParkingDimensions}
              disabled={disabled}
            />
            <SinglePageSelection
              label="Parking Status"
              required
              placeholder="Select Status"
              value={formData.ParkingStatus || ""}
              onChange={(val) => handleFieldChange("ParkingStatus", String(val))}
              options={PARKING_STATUS.map((opt) => ({ label: opt.name, value: opt.id }))}
              error={errors.ParkingStatus}
              disabled={disabled}
            />

            <Checkbox
              label="Ev Charging Available?"
              checked={formData.IsEVChargingAvailable === true}
              disabled={disabled}
              onChange={(e) => handleFieldChange("IsEVChargingAvailable", e.target.checked ? true : false)}
            />
          </div>
        </div>
      </Modal>

      {/* Approval Log History */}
      <ApprovalLogModal
        isOpen={isApprovalLogModalOpen}
        title="Parking"
        titleText={buildingName ?? ""}
        subTitleText={floor ?? ""}
        onClose={() => setIsApprovalLogModalOpen(false)}
        request={approvalLogRequest}
      />

      {/* Approval Action Modal */}
      <ApprovalActionModal
        title="Parking"
        isOpen={isApprovalActionModalOpen}
        onClose={() => setIsApprovalActionModalOpen(false)}
        actionType={approvalActionType}
        titleText={buildingName ?? ""}
        subTitleText={floor ?? ""}
        onSubmit={handleApprovalSubmit}
        loading={isLoading}
      />
    </>
  );
};

export default Parking;
