import { useEffect, useState, useMemo, useCallback } from "react"
import { type FilterInventoryRequest, type InventoryData, type InventoryFlatFloorBasementPodiumWingData, type InventoryFlatData, type DeleteInventoryFlatRequest } from "../models/InventoryMasterModel"
import { inventoryService } from "../services/InventoryServices"
import * as E from 'fp-ts/Either'
import useToast from "@/core/hooks/useToast"
import { handleExportFile } from "@/core/utils/exportFile"
import { runApiWithLoader } from "@/core/utils"
import { useProject } from "@/features/projectMaster/context/ProjectContext"
import { Loader } from "@/core/utils/loader"
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions"
import ExportImport from "@/ui/components/ExcelImport/ExcelImport"
import { technicalService } from "@/features/technical/services/TechnicalService"
import type { FilterPullExcelSample } from "@/features/technical/models/TechnicalModel"
import ConfirmationDialogBox from "@/core/utils/confirmationDialogBox"

// Components
import { InventoryHeader } from "../components/InventoryHeader"
import { BuildingTabs } from "../components/BuildingTabs"
import { WingTabs } from "../components/WingTabs"
import { StatusCounters } from "../components/StatusCounters"
import { FloorCard } from "../components/FloorCard"

// Utils
import { countFlatsByStatus, countWingWiseFlatStatus } from "../utils/inventoryHelpers"


const Inventory = () => {
    //#region STATE MANAGEMENT

    const [inventory, setInventory] = useState<InventoryData[]>([]);
    const [selectedBuilding, setSelectedBuilding] = useState<InventoryFlatFloorBasementPodiumWingData[] | undefined>(undefined)
    const [selectedBuildingIndex, setSelectedBuildingIndex] = useState<number | null>(null)
    const [selectedWing, setSelectedWing] = useState<InventoryFlatFloorBasementPodiumWingData | undefined>(undefined);

    const [activeWingTab, setActiveWingTab] = useState<string>('0');

    const { addToast } = useToast()
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    //EXCEL IMPORT 
    const [showImportModal, setShowImportModal] = useState(false);

    // DELETE CONFIRMATION DIALOG
    const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
    const [selectedFlatToDelete, setSelectedFlatToDelete] = useState<InventoryFlatData | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    //#region TAB ACTIVITY
    const [activeTab, setActiveTab] = useState<string>("Grid");
    //#endregion

    //#endregion

    //#region PROJECT SELECTION GET ID

    const { projectId } = useProject()

    //#endregion

    //#region MENU PERMISSIONS
    const { canExport } = useMenuPermissions();
    //#endregion

    //#region INIT

    useEffect(() => {

        if (!projectId) return;

        fetchInventory();

    }, [projectId])

    useEffect(() => {
        if (!projectId) return;
        if (inventory.length > 0 && selectedBuildingIndex === null) {
            setSelectedBuilding(inventory[0].InventoryFlatFloorBasementPodiumWingData);
            setSelectedBuildingIndex(0);
            setSelectedWing(inventory[0].InventoryFlatFloorBasementPodiumWingData[0]);
        }
    }, [projectId, inventory.length]);

    // Update selected building data when inventory changes (for refresh after delete)
    useEffect(() => {

        if (inventory.length > 0 && selectedBuildingIndex !== null) {

            const currentBuilding = inventory[selectedBuildingIndex];

            if (currentBuilding) {

                setSelectedBuilding(currentBuilding.InventoryFlatFloorBasementPodiumWingData);

                if (selectedWing && currentBuilding.InventoryFlatFloorBasementPodiumWingData.length > 0) {
                    const wingIndex = currentBuilding.InventoryFlatFloorBasementPodiumWingData.findIndex(
                        w => w.Wing === selectedWing.Wing
                    );

                    if (wingIndex >= 0) {
                        
                        setSelectedWing(currentBuilding.InventoryFlatFloorBasementPodiumWingData[wingIndex]);
                        setActiveWingTab(String(wingIndex));
                    } 
                    else {
                        
                        setSelectedWing(currentBuilding.InventoryFlatFloorBasementPodiumWingData[0]);
                        setActiveWingTab('0');
                    }

                } else if (currentBuilding.InventoryFlatFloorBasementPodiumWingData.length > 0) {
                    setSelectedWing(currentBuilding.InventoryFlatFloorBasementPodiumWingData[0]);
                    setActiveWingTab('0');
                }
            }
        }
    }, [inventory, selectedBuildingIndex]);



    //#endregion

    //#region DATA LOADING | FETCH |  LOAD | SEARCH 

    const fetchInventory = useCallback(async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterInventoryRequest = {
                    ProjectId: Number(projectId)
                }

                const response = await inventoryService.apiCallpullInventory(params);

                if (E.isRight(response)) {
                    setInventory(response.right.Data);
                } else {
                    addToast({ type: 'error', title: response.left.message });
                }

                return response
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message })
            },
            undefined,
            'Loading Inventory'
        )
    }, [projectId, addToast]);

    //#endregion

    //#region EXPORT EXCEL | PDF
    const handleExportInventory = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterInventoryRequest = {
                    ProjectId: Number(projectId),
                    ExportType: exportType
                }

                const response = await inventoryService.apiCallpullInventory(params);

                handleExportFile(response, exportType, 'Inventory', addToast)

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message || 'Export failed' })
            },
            undefined,
            'Preparing Export'
        )
    }

    const handleExportInventoryExcel = () => handleExportInventory('Excel')
    const handleExportInventoryPdf = () => handleExportInventory('PDF')

    //#endregion

    //#region COUNT INVENTORY FLAT STATUS
    const availableFlatsCount = useMemo(() => countFlatsByStatus(inventory, "Available"), [inventory]);
    const saleFlatsCount = useMemo(() => countFlatsByStatus(inventory, "Sold"), [inventory]);
    const memberFlatsCount = useMemo(() => countFlatsByStatus(inventory, "Member"), [inventory]);
    const blockedFlatsCount = useMemo(() => countFlatsByStatus(inventory, "Blocked"), [inventory]);
    const holdFlatsCount = useMemo(() => countFlatsByStatus(inventory, "Hold"), [inventory]);
    //#endregion

    //#region COUNT WING WISE FLAT STATUS
    const selectedWingAvailableCount = useMemo(() => countWingWiseFlatStatus(selectedWing, "Available"), [selectedWing]);
    const selectedWingSaleCount = useMemo(() => countWingWiseFlatStatus(selectedWing, "Sold"), [selectedWing]);
    const selectedWingMemberCount = useMemo(() => countWingWiseFlatStatus(selectedWing, "Member"), [selectedWing]);
    const selectedWingBlockedCount = useMemo(() => countWingWiseFlatStatus(selectedWing, "Blocked"), [selectedWing]);
    const selectedWingHoldCount = useMemo(() => countWingWiseFlatStatus(selectedWing, "Hold"), [selectedWing]);
    //#endregion

    //#region DELETE FLAT
    const handleDeleteFlat = useCallback((flat: InventoryFlatData) => {
        setSelectedFlatToDelete(flat);
        setIsConfirmationDialogOpen(true);
    }, []);

    const handleConfirmDeleteFlat = useCallback(async () => {
        if (!selectedFlatToDelete || !projectId) return;

        setIsDeleting(true);

        const params: DeleteInventoryFlatRequest = {
            ProjectId: Number(projectId),
            InventoryBuildingId: selectedFlatToDelete.InventoryBuildingId,
            InventoryFlatFloorBasementPodiumWingId: selectedFlatToDelete.InventoryFlatFloorBasementPodiumWingId,
            InventoryFloorId: selectedFlatToDelete.InventoryFloorId,
            InventoryFlatId: selectedFlatToDelete.InventoryFlatId,
        };

        try {
            const response = await runApiWithLoader(
                setIsLoading,
                setLoadingMessage,
                async () => {
                    return await inventoryService.apiCallDeleteInventoryFlat(params);
                },
                undefined,
                (error: any) => {
                    addToast({ type: 'error', title: error?.message || 'An error occurred while deleting the flat' });
                },
                undefined,
                'Deleting Inventory Flat'
            );

            if (response && E.isRight(response)) {
                // Check for backend error messages
                if (response.right.ErrorMessage && response.right.ErrorMessage.length > 0) {
                    addToast({ type: 'error', title: response.right.ErrorMessage[0] });
                } else {
                    // Success - close dialog first
                    setIsConfirmationDialogOpen(false);
                    setSelectedFlatToDelete(null);
                    
                    // Show success message
                    addToast({ 
                        type: 'success', 
                        title: response.right.SuccessMessage?.[0] || 'Flat deleted successfully' 
                    });
                    
                    // Refresh inventory after successful delete
                    await fetchInventory();
                }
            } else if (response && E.isLeft(response)) {
                addToast({ type: 'error', title: response.left.message });
            }
        } catch (error: any) {
            addToast({ type: 'error', title: error?.message || 'An error occurred while deleting the flat' });
        } finally {
            setIsDeleting(false);
        }
    }, [selectedFlatToDelete, projectId, addToast, fetchInventory]);

    //#endregion

    //#region IMPORT EXCEL | DOWNLOAD

    const downloadExcelSampleInventory = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                // Find the column label for sorting

                const params: FilterPullExcelSample = {
                    TableName: 'INVENTORY'
                }

                const response = await technicalService.apiCallPullExcelSample(params);

                handleExportFile(response, 'Excel', 'Inventory', addToast, 'Sample file download successfully')

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message || 'Export failed' })
            },
            undefined,
            'Preparing Downloading'
        )
    }

    const handleDownloadExcelSampleInventory = () => downloadExcelSampleInventory();

    const uploadExcel = async (file: File, mergeExisting: string) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const fd = new FormData();

                fd.append("ExcelFile", file);
                fd.append("IsAllDelete", mergeExisting);
                fd.append("TableName", 'Tenant');
                fd.append("ProjectId", String(projectId));

                const response = await technicalService.apiCallExcelImport(fd);

                if (E.isRight(response)) {

                    addToast({ type: 'success', title: "Excel imported sucessfully" })

                    fetchInventory();

                } else {
                    addToast({ type: "error", title: response.left.message });
                }

                return response;
            },
            undefined,
            (err: any) => addToast({ type: "error", title: err.message }),
            undefined,
            "Importing Excel"
        );
    };

    //#endregion
    return (
        <>
            <Loader loading={isLoading} title={loadingMessage}> <div></div></Loader>

            <InventoryHeader
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onExportExcel={handleExportInventoryExcel}
                onExportPdf={handleExportInventoryPdf}
                onUploadExcel={() => setShowImportModal(true)}
                onDownloadSampleExcel={handleDownloadExcelSampleInventory}
                canExport={canExport}
                exportLoading={isLoading}
            />

             <div className="flex flex-col w-full h-[120px] rounded-br-[15px] rounded-bl-[15px] border-[1px] border-gray-300 shadow-[0_1px_2px_1px_rgba(0,0,0,0.15)] bg-[#F9FAFB] px-4 py-1">

            <div className="flex justify-between items-center">

                <BuildingTabs
                    inventory={inventory}
                    selectedBuildingIndex={selectedBuildingIndex}
                    onBuildingSelect={(index) => {
                        setSelectedBuilding(inventory[index].InventoryFlatFloorBasementPodiumWingData);
                        setSelectedBuildingIndex(index);
                        setSelectedWing(inventory[index].InventoryFlatFloorBasementPodiumWingData[0]);
                    }}
                />

                <div className="pt-5">

                    <StatusCounters
                        availableCount={availableFlatsCount}
                        holdCount={holdFlatsCount}
                        memberCount={memberFlatsCount}
                        saleCount={saleFlatsCount}
                        blockedCount={blockedFlatsCount}
                    />
                </div>
            </div>

            <div className="border-b border-gray-200" />

            <div className="flex justify-between pt-2 pb-2">
                {selectedBuilding && (
                    <WingTabs
                        wings={selectedBuilding}
                        activeWingTab={activeWingTab}
                        onWingChange={(index) => {
                            setActiveWingTab(String(index));
                            setSelectedWing(selectedBuilding[index]);
                        }}
                    />
                )}

                <StatusCounters
                    availableCount={selectedWingAvailableCount}
                    holdCount={selectedWingHoldCount}
                    memberCount={selectedWingMemberCount}
                    saleCount={selectedWingSaleCount}
                    blockedCount={selectedWingBlockedCount}
                />
            </div>
            </div>

            <ExportImport
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                onUpload={(file, mergeExisting) => {
                    setShowImportModal(false);
                    uploadExcel(file, mergeExisting);
                }}
            />


            {selectedWing?.InventoryFloorData.map((floor) => (
                <FloorCard
                    key={floor.InventoryFloorId}
                    floor={floor}
                    projectId={inventory[0]?.ProjectId || 0}
                    onDelete={handleDeleteFlat}
                />
            ))}

            <ConfirmationDialogBox
                isOpen={isConfirmationDialogOpen}
                onClose={() => {
                    setIsConfirmationDialogOpen(false);
                    setSelectedFlatToDelete(null);
                }}
                onConfirm={handleConfirmDeleteFlat}
                title="Delete Inventory Flat"
                message={`Are you sure you want to delete flat "${selectedFlatToDelete?.Flat}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                loading={isDeleting}
                variant="danger"
            />

        </>
    )
}

export default Inventory



