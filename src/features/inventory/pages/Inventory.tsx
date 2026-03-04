import { useEffect, useState, useMemo, useCallback } from "react"
import { type FilterInventoryRequest, type InventoryData, type InventoryFlatFloorBasementPodiumWingData, type InventoryFlatData, type DeleteInventoryFlatRequest, type AddInventoryRequest, type AddInventoryWingRequest, type AddInventoryFloorRequest, type DeleteInventoryWingRequest, type DeleteInventoryBuildingRequest, type DeleteInventoryFloorRequest, type InventoryFloorData } from "../models/InventoryMasterModel"

import * as E from 'fp-ts/Either'
import useToast from "@/core/hooks/useToast"
import { handleExportFile } from "@/core/utils/exportFile"
import { runApiWithLoader } from "@/core/utils"
import { useProject } from "@/features/projectMaster/context/ProjectContext"
import { Loader } from "@/core/utils/loader"
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions"
import ExportImport from "@/ui/components/ExcelImport/ExcelImport"
import { technicalService } from "@/features/technical/services/TechnicalService"
import { inventoryService } from "@/features/inventory/services/InventoryServices"
import { Modal } from "@/ui/components/Modal/Modal"
import { Input } from "@/ui/components/forms"

// Components
import { InventoryHeader } from "@/features/inventory/components/InventoryHeader"
import { BuildingTabs } from "@/features/inventory/components/BuildingTabs"
import { WingTabs } from "@/features/inventory/components/WingTabs"
import { StatusCounters } from "@/features/inventory/components/StatusCounters"
import { FloorCard } from "@/features/inventory/components/FloorCard"
import { DataTable } from "@/ui/components/DataTable/DataTable"
import type { TableColumn } from "@/ui/components/DataTable/DataTable"

// Utils
import { countFlatsByStatus, countWingWiseFlatStatus } from "@/features/inventory/utils/inventoryHelpers"
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog"
import { Edit, Eye, Trash } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { colorsForFlatComponent } from "@/features/inventory/utils/flatColors"


const Inventory = () => {
    //#region STATE MANAGEMENT

    const navigate = useNavigate();
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
    const [, setIsDeleting] = useState(false);

    // DELETE WING CONFIRMATION DIALOG
    const [isDeleteWingDialogOpen, setIsDeleteWingDialogOpen] = useState(false);
    const [wingToDelete, setWingToDelete] = useState<InventoryFlatFloorBasementPodiumWingData | null>(null);

    // DELETE BUILDING CONFIRMATION DIALOG
    const [isDeleteBuildingDialogOpen, setIsDeleteBuildingDialogOpen] = useState(false);
    const [buildingToDelete, setBuildingToDelete] = useState<InventoryData | null>(null);

    // DELETE FLOOR CONFIRMATION DIALOG
    const [isDeleteFloorDialogOpen, setIsDeleteFloorDialogOpen] = useState(false);
    const [floorToDelete, setFloorToDelete] = useState<{ floor: import("@/features/inventory/models/InventoryMasterModel").InventoryFloorData; wing: InventoryFlatFloorBasementPodiumWingData; building: InventoryData } | null>(null);

    // ADD BUILDING MODAL
    const [isAddBuildingModalOpen, setIsAddBuildingModalOpen] = useState(false);
    const [buildingNumber, setBuildingNumber] = useState<string>('');
    const [noOfBasement, setNoOfBasement] = useState<string>('');
    const [noOfPodium, setNoOfPodium] = useState<string>('');
    const [noOfWings, setNoOfWings] = useState<string>('');
    const [wingData, setWingData] = useState<Array<{ Wing: string; MaxNoOfFlatPerFloor: string; NoOfFloorExcludingPodium: string }>>([]);

    // ADD WING MODAL
    const [isAddWingModalOpen, setIsAddWingModalOpen] = useState(false);
    const [wingNoOfFloor, setWingNoOfFloor] = useState<string>('');
    const [wingMaxNoOfFlatsPerFloor, setWingMaxNoOfFlatsPerFloor] = useState<string>('');

    // SEARCH STATE
    const [searchTerm, setSearchTerm] = useState<string>('');

    //#region TAB ACTIVITY
    // Preserve tab state in localStorage
    const [activeTab, setActiveTab] = useState<string>(() => {
        const savedTab = localStorage.getItem('inventoryActiveTab');
        return savedTab || "Grid";
    });

    // Save tab state when it changes
    useEffect(() => {
        localStorage.setItem('inventoryActiveTab', activeTab);
    }, [activeTab]);
    //#endregion

    //#endregion

    //#region PROJECT SELECTION GET ID

    const { projectId } = useProject()

    //#endregion

    //#region MENU PERMISSIONS
    const { canAction, canExport } = useMenuPermissions();
    const { canAction: canBookingAction } = useMenuPermissions('/booking');
    //#endregion

    //#region INIT

    // Clear all state when project changes
    useEffect(() => {

        if (!projectId) {

            setInventory([]);
            setSelectedBuilding(undefined);
            setSelectedBuildingIndex(null);
            setSelectedWing(undefined);
            setActiveWingTab('0');

            // Close all modals and dialogs
            setIsAddBuildingModalOpen(false);
            setIsAddWingModalOpen(false);
            setIsConfirmationDialogOpen(false);
            setIsDeleteWingDialogOpen(false);
            setIsDeleteBuildingDialogOpen(false);
            setIsDeleteFloorDialogOpen(false);

            // Clear form data
            setBuildingNumber('');
            setNoOfBasement('');
            setNoOfPodium('');
            setNoOfWings('');
            setWingData([]);
            setWingNoOfFloor('');
            setWingMaxNoOfFlatsPerFloor('');

            // Clear delete selections
            setSelectedFlatToDelete(null);
            setWingToDelete(null);
            setBuildingToDelete(null);
            setFloorToDelete(null);

            // Clear search
            setSearchTerm('');
            // Reset tab to Grid when project is cleared
            setActiveTab('Grid');
            localStorage.removeItem('inventoryActiveTab');
            return;
        }

        // Clear all state when project changes
        setInventory([]);
        setSelectedBuilding(undefined);
        setSelectedBuildingIndex(null);
        setSelectedWing(undefined);
        setActiveWingTab('0');

        // Close all modals and dialogs
        setIsAddBuildingModalOpen(false);
        setIsAddWingModalOpen(false);
        setIsConfirmationDialogOpen(false);
        setIsDeleteWingDialogOpen(false);
        setIsDeleteBuildingDialogOpen(false);
        setIsDeleteFloorDialogOpen(false);

        // Clear form data
        setBuildingNumber('');
        setNoOfBasement('');
        setNoOfPodium('');
        setNoOfWings('');
        setWingData([]);
        setWingNoOfFloor('');
        setWingMaxNoOfFlatsPerFloor('');

        // Clear delete selections
        setSelectedFlatToDelete(null);
        setWingToDelete(null);
        setBuildingToDelete(null);
        setFloorToDelete(null);

        // Clear search
        setSearchTerm('');

    }, [projectId])

    useEffect(() => {

        if (!projectId) return;

        fetchInventory();

    }, [projectId,])

    useEffect(() => {
        if (!projectId) return;

        if (inventory.length > 0 && selectedBuildingIndex === null) {

            setSelectedBuilding(inventory[0].InventoryFlatFloorBasementPodiumWingData);
            setSelectedBuildingIndex(0);

            // Try to restore saved wing selection
            const savedWingName = localStorage.getItem(`inventorySelectedWing_${projectId}`);
            if (savedWingName && inventory[0].InventoryFlatFloorBasementPodiumWingData) {
                const savedWing = inventory[0].InventoryFlatFloorBasementPodiumWingData.find(
                    w => w.Wing === savedWingName
                );
                if (savedWing) {
                    const wingIndex = inventory[0].InventoryFlatFloorBasementPodiumWingData.findIndex(
                        w => w.Wing === savedWingName
                    );
                    setSelectedWing(savedWing);
                    setActiveWingTab(String(wingIndex));
                } else {
                    setSelectedWing(inventory[0].InventoryFlatFloorBasementPodiumWingData[0]);
                }
            } else {
                setSelectedWing(inventory[0].InventoryFlatFloorBasementPodiumWingData[0]);
            }

        }
    }, [projectId, inventory.length]);

    // Update selected building data when inventory changes (for refresh after delete)
    // Maintains the currently selected wing after any operations
    useEffect(() => {

        if (inventory.length > 0 && selectedBuildingIndex !== null && projectId) {

            const currentBuilding = inventory[selectedBuildingIndex];

            if (currentBuilding && currentBuilding.InventoryFlatFloorBasementPodiumWingData.length > 0) {

                setSelectedBuilding(currentBuilding.InventoryFlatFloorBasementPodiumWingData);

                // Always try to restore saved wing selection first (this preserves selection after navigation)
                const savedWingName = localStorage.getItem(`inventorySelectedWing_${projectId}`);
                if (savedWingName) {
                    const savedWingIndex = currentBuilding.InventoryFlatFloorBasementPodiumWingData.findIndex(
                        w => w.Wing === savedWingName
                    );
                    if (savedWingIndex >= 0) {
                        // Saved wing exists, restore it
                        setSelectedWing(currentBuilding.InventoryFlatFloorBasementPodiumWingData[savedWingIndex]);
                        setActiveWingTab(String(savedWingIndex));
                        return;
                    }
                }

                // If no saved wing or saved wing doesn't exist, try to maintain current selection
                if (selectedWing) {
                    const wingIndex = currentBuilding.InventoryFlatFloorBasementPodiumWingData.findIndex(
                        w => w.Wing === selectedWing.Wing
                    );

                    if (wingIndex >= 0) {
                        // Current wing still exists, keep it selected and save to localStorage
                        setSelectedWing(currentBuilding.InventoryFlatFloorBasementPodiumWingData[wingIndex]);
                        setActiveWingTab(String(wingIndex));
                        localStorage.setItem(`inventorySelectedWing_${projectId}`, selectedWing.Wing);
                    } else {
                        // Current wing no longer exists, fallback to first wing
                        const firstWing = currentBuilding.InventoryFlatFloorBasementPodiumWingData[0];
                        setSelectedWing(firstWing);
                        setActiveWingTab('0');
                        if (firstWing?.Wing) {
                            localStorage.setItem(`inventorySelectedWing_${projectId}`, firstWing.Wing);
                        }
                    }
                } else {
                    // No wing selected, select first one
                    const firstWing = currentBuilding.InventoryFlatFloorBasementPodiumWingData[0];
                    setSelectedWing(firstWing);
                    setActiveWingTab('0');
                    if (firstWing?.Wing) {
                        localStorage.setItem(`inventorySelectedWing_${projectId}`, firstWing.Wing);
                    }
                }
            }
        }
    }, [inventory, selectedBuildingIndex, projectId]);



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
    const saleFlatsCount = useMemo(() => countFlatsByStatus(inventory, "Booked"), [inventory]);
    const memberFlatsCount = useMemo(() => countFlatsByStatus(inventory, "Member"), [inventory]);
    const blockedFlatsCount = useMemo(() => countFlatsByStatus(inventory, "Blocked"), [inventory]);
    const holdFlatsCount = useMemo(() => countFlatsByStatus(inventory, "Hold"), [inventory]);
    //#endregion

    //#region COUNT WING WISE FLAT STATUS
    const selectedWingAvailableCount = useMemo(() => countWingWiseFlatStatus(selectedWing, "Available"), [selectedWing]);
    const selectedWingBookedCount = useMemo(() => countWingWiseFlatStatus(selectedWing, "Booked"), [selectedWing]);
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
                    addToast({ type: 'error', title: error?.message });
                },
                undefined,
                'Deleting Inventory Flat'
            );

            if (response && E.isRight(response)) {

                setIsConfirmationDialogOpen(false);
                setSelectedFlatToDelete(null);


                addToast({
                    type: 'success',
                    title: response.right.SuccessMessage?.[0]
                });


                await fetchInventory();

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
                const params: FilterInventoryRequest = {
                    ProjectId: Number(projectId),
                    ExportType: "Excel"
                }

                const response = await inventoryService.apiCallpullInventory(params);
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
                fd.append("TableName", 'INVENTORY');
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

    //#region ADD BUILDING HANDLERS

    const getNextBuildingNumber = useCallback(() => {
        if (inventory.length === 0) {
            return 'Building 1';
        }

        // Extract building numbers and find the highest
        const buildingNumbers = inventory
            .map(b => b.BuildingNumber)
            .filter(bn => bn && bn.match(/^Building \d+$/i))
            .map(bn => {
                const match = bn.match(/\d+/);
                return match ? parseInt(match[0], 10) : 0;
            });

        const maxNumber = buildingNumbers.length > 0 ? Math.max(...buildingNumbers) : 0;
        return `Building ${maxNumber + 1}`;
    }, [inventory]);

    const handleOpenAddBuildingModal = () => {
        const nextBuilding = getNextBuildingNumber();
        setBuildingNumber(nextBuilding);
        setNoOfBasement('');
        setNoOfPodium('');
        setNoOfWings('');
        setWingData([]);
        setIsAddBuildingModalOpen(true);
    };

    const getNextAvailableWingLetter = useCallback(() => {
        // Get all existing wing letters from all buildings
        const existingWingLetters = new Set<string>();

        inventory.forEach(building => {
            building.InventoryFlatFloorBasementPodiumWingData?.forEach(wing => {
                if (wing.Wing && wing.Wing.length === 1) {
                    existingWingLetters.add(wing.Wing.toUpperCase());
                }
            });
        });

        // Find the highest wing letter (A=65, B=66, etc.)
        let maxCharCode = 64; // Start before 'A' (65)

        existingWingLetters.forEach(letter => {
            const charCode = letter.charCodeAt(0);
            if (charCode > maxCharCode) {
                maxCharCode = charCode;
            }
        });

        // Return the next available letter
        return maxCharCode + 1;
    }, [inventory]);

    const handleNoOfWingsChange = (value: string) => {

        setNoOfWings(value);

        const numWings = parseInt(value, 10) || 0;

        if (numWings > 0) {
            // Get the starting letter for this building
            const startCharCode = getNextAvailableWingLetter();

            // Generate wing letters starting from the next available letter
            const wings = Array.from({ length: numWings }, (_, i) => {
                const wingLetter = String.fromCharCode(startCharCode + i);
                return {
                    Wing: wingLetter,
                    MaxNoOfFlatPerFloor: wingData[i]?.MaxNoOfFlatPerFloor || '',
                    NoOfFloorExcludingPodium: wingData[i]?.NoOfFloorExcludingPodium || '',
                };
            });
            setWingData(wings);
        } else {
            setWingData([]);
        }
    };

    const handleWingDataChange = (index: number, field: 'MaxNoOfFlatPerFloor' | 'NoOfFloorExcludingPodium', value: string) => {
        const updatedWings = [...wingData];
        updatedWings[index] = {
            ...updatedWings[index],
            [field]: value,
        };
        setWingData(updatedWings);
    };

    const validateAddBuildingForm = (): boolean => {
        if (!noOfBasement || parseInt(noOfBasement, 10) < 0) {
            addToast({ type: 'error', title: 'No Of Basement is required' });
            return false;
        }
        if (!noOfPodium || parseInt(noOfPodium, 10) < 0) {
            addToast({ type: 'error', title: 'No Of Podium is required' });
            return false;
        }
        if (!noOfWings || parseInt(noOfWings, 10) <= 0) {
            addToast({ type: 'error', title: 'No Of Wings is required' });
            return false;
        }

        // Validate all wing data
        for (let i = 0; i < wingData.length; i++) {
            const wing = wingData[i];
            if (!wing.MaxNoOfFlatPerFloor || parseInt(wing.MaxNoOfFlatPerFloor, 10) <= 0) {
                addToast({ type: 'error', title: `Please enter valid Max No Of Flats Per Floor for Wing ${wing.Wing}` });
                return false;
            }
            if (!wing.NoOfFloorExcludingPodium || parseInt(wing.NoOfFloorExcludingPodium, 10) <= 0) {
                addToast({ type: 'error', title: `Please enter valid No Of Floor Excluding Podium for Wing ${wing.Wing}` });
                return false;
            }
        }

        return true;
    };

    const handleSaveBuilding = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateAddBuildingForm()) {
            return;
        }

        // Format data as JSON
        const inventoryData = [{
            Type: buildingNumber,
            NoOfBasement: noOfBasement,
            NoOfPodium: noOfPodium,
            NoOfWings: noOfWings,
            Wing: wingData.map(wing => ({
                Wing: wing.Wing,
                MaxNoOfFlatPerFloor: wing.MaxNoOfFlatPerFloor,
                NoOfFloorExcludingPodium: wing.NoOfFloorExcludingPodium,
            })),
        }];

        const inventoryJSON = JSON.stringify(inventoryData);

        if (!projectId) {
            addToast({ type: 'error', title: 'Project is required' });
            return;
        }

        const params: AddInventoryRequest = {
            ProjectId: projectId,
            InventoryJSON: inventoryJSON,
        };

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const response = await inventoryService.apiCallAddInventoryBuilding(params);

                if (E.isRight(response)) {
                    setIsAddBuildingModalOpen(false);

                    addToast({ type: 'success', title: response.right.SuccessMessage?.[0] });

                    await fetchInventory();

                } else {

                    addToast({ type: 'error', title: response.left.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error?.message });
            },
            undefined,
            'Adding Building'
        );
    };

    //#endregion

    //#region ADD WING HANDLERS

    const getNextAvailableWingLetterForBuilding = useCallback((buildingId: number) => {
        // Find the selected building
        const building = inventory.find(b => b.InventoryBuildingId === buildingId);
        if (!building) {
            return 'A'; // Default to A if building not found
        }

        // Get all existing wing letters for this building
        const existingWingLetters = new Set<string>();
        building.InventoryFlatFloorBasementPodiumWingData?.forEach(wing => {
            if (wing.Wing && wing.Wing.length === 1) {
                existingWingLetters.add(wing.Wing.toUpperCase());
            }
        });

        // Find the highest wing letter for this building
        let maxCharCode = 64; // Start before 'A' (65)
        existingWingLetters.forEach(letter => {
            const charCode = letter.charCodeAt(0);
            if (charCode > maxCharCode) {
                maxCharCode = charCode;
            }
        });

        // Return the next available letter for this building
        return String.fromCharCode(maxCharCode + 1);
    }, [inventory]);

    const handleOpenAddWingModal = () => {
        if (selectedBuildingIndex === null || !inventory[selectedBuildingIndex]) {
            addToast({ type: 'error', title: 'Please select a building first' });
            return;
        }

        setWingNoOfFloor('');
        setWingMaxNoOfFlatsPerFloor('');
        setIsAddWingModalOpen(true);
    };

    const validateAddWingForm = (): boolean => {
        if (!wingNoOfFloor || parseInt(wingNoOfFloor, 10) <= 0) {
            addToast({ type: 'error', title: 'No Of Floor is required' });
            return false;
        }
        if (!wingMaxNoOfFlatsPerFloor || parseInt(wingMaxNoOfFlatsPerFloor, 10) <= 0) {
            addToast({ type: 'error', title: 'Max No Of Flats Per Floor is required' });
            return false;
        }
        return true;
    };

    const handleSaveWing = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateAddWingForm()) {
            return;
        }

        if (selectedBuildingIndex === null || !inventory[selectedBuildingIndex]) {
            addToast({ type: 'error', title: 'Please select a building first' });
            return;
        }

        if (!projectId) {
            addToast({ type: 'error', title: 'Project is required' });
            return;
        }

        const selectedBuildingData = inventory[selectedBuildingIndex];
        const nextWingLetter = getNextAvailableWingLetterForBuilding(selectedBuildingData.InventoryBuildingId);

        const params: AddInventoryWingRequest = {
            ProjectId: projectId,
            InventoryBuildingId: selectedBuildingData.InventoryBuildingId,
            MaxNoOfFlatPerFloor: parseInt(wingMaxNoOfFlatsPerFloor, 10),
            NoOfFloorExcludingPodium: parseInt(wingNoOfFloor, 10),
            Wing: nextWingLetter,
        };

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const response = await inventoryService.apiCallAddInventoryWing(params);

                if (E.isRight(response)) {
                    setIsAddWingModalOpen(false);
                    setWingNoOfFloor('');
                    setWingMaxNoOfFlatsPerFloor('');

                    addToast({ type: 'success', title: response.right.SuccessMessage?.[0] });

                    await fetchInventory();
                } else {
                    addToast({ type: 'error', title: response.left.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error?.message });
            },
            undefined,
            'Adding Wing'
        );
    };

    //#endregion

    //#region ADD FLOOR HANDLER

    const handleAddFloor = async () => {
        if (selectedBuildingIndex === null || !inventory[selectedBuildingIndex]) {
            addToast({ type: 'error', title: 'Please select a building first' });
            return;
        }

        if (!selectedWing) {
            addToast({ type: 'error', title: 'Please select a wing first' });
            return;
        }

        if (!projectId) {
            addToast({ type: 'error', title: 'Project is required' });
            return;
        }

        const selectedBuildingData = inventory[selectedBuildingIndex];

        const params: AddInventoryFloorRequest = {
            ProjectId: projectId,
            InventoryBuildingId: selectedBuildingData.InventoryBuildingId,
            InventoryFlatFloorBasementPodiumWingId: selectedWing.InventoryFlatFloorBasementPodiumWingId,
        };

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const response = await inventoryService.apiCallAddInventoryFloor(params);

                if (E.isRight(response)) {
                    addToast({ type: 'success', title: response.right.SuccessMessage?.[0] });

                    await fetchInventory();
                } else {
                    addToast({ type: 'error', title: response.left.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error?.message });
            },
            undefined,
            'Adding Floor'
        );
    };

    //#endregion

    //#region DELETE HANDLERS

    const handleDeleteWing = (wing: InventoryFlatFloorBasementPodiumWingData) => {
        setWingToDelete(wing);
        setIsDeleteWingDialogOpen(true);
    };

    const handleConfirmDeleteWing = async () => {
        if (!wingToDelete || !projectId || selectedBuildingIndex === null || !inventory[selectedBuildingIndex]) {
            return;
        }

        const selectedBuildingData = inventory[selectedBuildingIndex];

        const params: DeleteInventoryWingRequest = {
            ProjectId: projectId,
            InventoryBuildingId: selectedBuildingData.InventoryBuildingId,
            InventoryFlatFloorBasementPodiumWingId: wingToDelete.InventoryFlatFloorBasementPodiumWingId,
        };

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const response = await inventoryService.apiCallDeleteInventoryWing(params);

                if (E.isRight(response)) {
                    setIsDeleteWingDialogOpen(false);
                    setWingToDelete(null);

                    addToast({ type: 'success', title: response.right.SuccessMessage?.[0] });

                    await fetchInventory();
                } else {
                    addToast({ type: 'error', title: response.left.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error?.message });
            },
            undefined,
            'Deleting Wing'
        );
    };

    const handleDeleteBuilding = (building: InventoryData) => {
        setBuildingToDelete(building);
        setIsDeleteBuildingDialogOpen(true);
    };

    const handleConfirmDeleteBuilding = async () => {
        if (!buildingToDelete || !projectId) {
            return;
        }

        const params: DeleteInventoryBuildingRequest = {
            ProjectId: projectId,
            InventoryBuildingId: buildingToDelete.InventoryBuildingId,
        };

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const response = await inventoryService.apiCallDeleteInventoryBuilding(params);

                if (E.isRight(response)) {
                    setIsDeleteBuildingDialogOpen(false);
                    setBuildingToDelete(null);

                    addToast({ type: 'success', title: response.right.SuccessMessage?.[0] });

                    await fetchInventory();
                } else {
                    addToast({ type: 'error', title: response.left.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error?.message });
            },
            undefined,
            'Deleting Building'
        );
    };

    const handleDeleteFloor = (floor: InventoryFloorData, wing: InventoryFlatFloorBasementPodiumWingData, building: InventoryData) => {
        setFloorToDelete({ floor, wing, building });
        setIsDeleteFloorDialogOpen(true);
    };

    const handleConfirmDeleteFloor = async () => {
        if (!floorToDelete || !projectId) {
            return;
        }

        const params: DeleteInventoryFloorRequest = {
            ProjectId: projectId,
            InventoryBuildingId: floorToDelete.building.InventoryBuildingId,
            InventoryFlatFloorBasementPodiumWingId: floorToDelete.wing.InventoryFlatFloorBasementPodiumWingId,
            InventoryFloorId: floorToDelete.floor.InventoryFloorId,
        };

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const response = await inventoryService.apiCallDeleteInventoryFloor(params);

                if (E.isRight(response)) {
                    setIsDeleteFloorDialogOpen(false);
                    setFloorToDelete(null);

                    addToast({ type: 'success', title: response.right.SuccessMessage?.[0] });

                    await fetchInventory();
                } else {
                    addToast({ type: 'error', title: response.left.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error?.message });
            },
            undefined,
            'Deleting Floor'
        );
    };

    //#endregion

    //#region SEARCH HANDLERS

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
    };

    // Filter flats based on search term for selected wing
    const getFilteredFloors = useMemo(() => {
        if (!selectedWing) {
            return [];
        }

        if (!searchTerm.trim()) {
            return selectedWing.InventoryFloorData || [];
        }

        const searchLower = searchTerm.toLowerCase().trim();

        return selectedWing.InventoryFloorData.map(floor => ({
            ...floor,
            InventoryFlatData: floor.InventoryFlatData?.filter(flat => {
                const flatNumber = flat.Flat?.toLowerCase() || '';
                return flatNumber.includes(searchLower);
            }) || []
        }));
    }, [selectedWing, searchTerm]);

    // Flatten floors and flats for table view
    const tableData = useMemo(() => {
        if (!selectedWing) {
            return [];
        }

        const data: Array<{
            Floor: string;
            Flat: string;
            FlatType: string;
            Area: number;
            Configuration: string;
            Status: string;
            Facing: string;
            OwnerName: string;
            flatData: InventoryFlatData;
            floorData: InventoryFloorData;
        }> = [];

        getFilteredFloors.forEach(floor => {
            floor.InventoryFlatData?.forEach(flat => {
                data.push({
                    Floor: floor.Floor,
                    Flat: flat.Flat,
                    FlatType: flat.FlatType || '',
                    Area: flat.RERACarpetAreaSqFt || 0,
                    Configuration: flat.FlatConfiguration || '',
                    Status: flat.FlatStatus,
                    Facing: flat.FlatFacing || '',
                    OwnerName: flat.OwnerName || '',
                    flatData: flat,
                    floorData: floor,
                });
            });
        });

        return data;
    }, [getFilteredFloors, selectedWing]);

    // Table columns definition
    const tableColumns: TableColumn[] = useMemo(() => [
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
            label: 'Type',
            width: '120px',
            sortable: false,
        },
        {
            key: 'Area',
            label: 'Area (SqFt)',
            width: '130px',
            sortable: false,
            align: 'right',
            render: (value: number) => value || 0,
        },
        {
            key: 'Configuration',
            label: 'Configuration',
            width: '150px',
            sortable: false,
        },
        {
            key: 'Status',
            label: 'Status',
            width: '120px',
            sortable: false,
            render: (value: string) => {

                const statusColors = colorsForFlatComponent[value as keyof typeof colorsForFlatComponent] || colorsForFlatComponent.Available;

                return (
                    <span className={`px-3 py-1 rounded text-sm font-medium ${statusColors.Button} ${statusColors.buttonText}`}>
                        {value}
                    </span>
                );
            },
        },
        {
            key: 'Facing',
            label: 'Facing',
            width: '120px',
            sortable: false,
        },
        {
            key: 'OwnerName',
            label: 'Owner/Alloted',
            width: '200px',
            sortable: false,
            render: (value: string) => {
                if (!value) return '-';
                return (
                    <span className="text-[#135BEC] font-semibold">
                        {value}
                    </span>
                );
            },
        },
        {
            key: 'actions',
            label: 'Actions',
            width: '150px',
            fixed: 'right',
            render: (_value: any, row: any) => {
                const flat = row.flatData as InventoryFlatData;
                const projectId = inventory[0]?.ProjectId || 0;

                const handleEdit = () => {
                    navigate('/inventory/inventorySpecification', {
                        state: {
                            flat: flat,
                            projectId: projectId,
                        },
                    });
                };

                return (
                    <div className="flex items-center gap-2">
                        {(flat.FlatStatus === "Booked" || flat.FlatStatus === "Alloted") && (
                            <div title="View Details">
                                <Eye
                                    size={16}
                                    className="cursor-pointer text-blue-600 hover:text-blue-800"
                                    onClick={handleEdit}
                                />
                            </div>
                        )}
                        {(flat.FlatStatus === "Blocked" || flat.FlatStatus === "Available" || flat.FlatStatus === "Hold") && (
                            <div title="Edit">
                                <Edit
                                    className="cursor-pointer text-blue-600 hover:text-blue-800"
                                    onClick={handleEdit}
                                    size={16}
                                />
                            </div>
                        )}
                        {(flat.FlatStatus === "Blocked" || flat.FlatStatus === "Available") && (
                            <div title="Delete">
                                <Trash
                                    onClick={() => handleDeleteFlat(flat)}
                                    color="red"
                                    size={16}
                                    className="cursor-pointer hover:text-red-800"
                                />
                            </div>
                        )}
                    </div>
                );
            },
        },
    ], [inventory, navigate, handleDeleteFlat]);

    //#endregion

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
                canExport={canExport && Number(projectId) > 0}
                canAction={canAction && Number(projectId) > 0}
                exportLoading={isLoading}
                onAddBuilding={handleOpenAddBuildingModal}
                onAddWing={handleOpenAddWingModal}
                onAddFloor={handleAddFloor}
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                onClearSearch={handleClearSearch}
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
                        onDeleteBuilding={handleDeleteBuilding}
                    />

                    <div className="pt-5">

                        <StatusCounters
                            availableCount={availableFlatsCount}
                            holdCount={holdFlatsCount}
                            memberCount={memberFlatsCount}
                            bookedCount={saleFlatsCount}
                            blockedCount={blockedFlatsCount}
                        />
                    </div>
                </div>

                <div className="border-b border-gray-200" />

                <div className="flex justify-between items-center pt-2 pb-2">

                    <div className="flex-1">
                        {selectedBuilding && (
                            <WingTabs
                                wings={selectedBuilding}
                                activeWingTab={activeWingTab}
                                onWingChange={(index) => {

                                    setActiveWingTab(String(index));

                                    const newWing = selectedBuilding[index];
                                    setSelectedWing(newWing);

                                    if (projectId && newWing?.Wing) {

                                        localStorage.setItem(`inventorySelectedWing_${projectId}`, newWing.Wing);
                                    }
                                }}
                                onDeleteWing={handleDeleteWing}
                            />
                        )}
                    </div>

                    <div className="flex justify-end">
                        <StatusCounters
                            availableCount={selectedWingAvailableCount}
                            holdCount={selectedWingHoldCount}
                            memberCount={selectedWingMemberCount}
                            bookedCount={selectedWingBookedCount}
                            blockedCount={selectedWingBlockedCount}
                        />
                    </div>

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


            {activeTab === "Grid" ? (
                
                selectedWing && getFilteredFloors.map((floor) => {

                    const originalFloorIndex = selectedWing.InventoryFloorData.findIndex(f => f.InventoryFloorId === floor.InventoryFloorId);

                    const isLastFloor = originalFloorIndex === (selectedWing.InventoryFloorData?.length || 0) - 1;

                    return (
                        <FloorCard
                            key={floor.InventoryFloorId}
                            floor={floor}
                            projectId={inventory[0]?.ProjectId || 0}
                            building={inventory[selectedBuildingIndex || 0]}
                            wing={selectedWing}
                            onDelete={handleDeleteFlat}
                            onParkingUpdate={fetchInventory}
                            onDeleteFloor={handleDeleteFloor}
                            isLastFloor={isLastFloor}
                            canAction={canAction}
                            canBookingAction={canBookingAction}
                        />
                    );
                })
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-4">
                    <DataTable
                        data={tableData}
                        columns={tableColumns}
                        emptyMessage="No flats found"
                        loading={isLoading}
                        fixedHeight={false}
                    />
                </div>
            )}

            <DeleteDialog
                isOpen={isConfirmationDialogOpen}
                onClose={() => {
                    setIsConfirmationDialogOpen(false);
                    setSelectedFlatToDelete(null);
                }}
                onConfirm={handleConfirmDeleteFlat}
                loading={isLoading}
                pageName="inventory unit"
                message={`Are you sure you want to delete unit "${selectedFlatToDelete?.Flat}"? This action cannot be undone.`}
            />

            {/* Add Building Modal */}
            <Modal
                isOpen={isAddBuildingModalOpen}
                onClose={() => {
                    setIsAddBuildingModalOpen(false);
                    setBuildingNumber('');
                    setNoOfBasement('');
                    setNoOfPodium('');
                    setNoOfWings('');
                    setWingData([]);
                }}
                title="Add Building"
                onSubmit={handleSaveBuilding}
                saveText="Add Building"
                onCancel={() => {
                    setIsAddBuildingModalOpen(false);
                    setBuildingNumber('');
                    setNoOfBasement('');
                    setNoOfPodium('');
                    setNoOfWings('');
                    setWingData([]);
                }}
                size="xl"
                loading={isLoading}
            >
                <div className="space-y-4">
                    <div>
                        <Input
                            label="Building Number"
                            value={buildingNumber}
                            onChange={(e) => setBuildingNumber(e.target.value)}
                            placeholder="Building Number"
                            required
                            disabled
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <Input
                            label="No Of Basement"
                            value={noOfBasement}
                            onChange={(e) => {
                                const digits = e.target.value.replace(/\D/g, '');
                                setNoOfBasement(digits)
                            }}
                            placeholder="Enter No Of Basement"
                            required
                            maxLength={2}
                        />
                        <Input
                            label="No Of Podium"
                            value={noOfPodium}
                            onChange={(e) => {
                                const digits = e.target.value.replace(/\D/g, '');
                                setNoOfPodium(digits)
                            }}
                            placeholder="Enter No Of Podium"
                            required
                            maxLength={2}
                        />
                        <Input
                            label="No Of Wings"
                            value={noOfWings}
                            onChange={(e) => {
                                const digits = e.target.value.replace(/\D/g, '');
                                handleNoOfWingsChange(digits)
                            }}
                            placeholder="Enter No Of Wings"
                            required
                            maxLength={2}
                        />
                    </div>

                    {wingData.length > 0 && (
                        <div className="mt-6 space-y-4">

                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Wing Details</h3>

                            {wingData.map((wing, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                                    <h4 className="font-medium text-gray-800">Wing {wing.Wing}</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="No Of Floor"
                                            value={wing.NoOfFloorExcludingPodium}
                                            onChange={(e) => {
                                                const digits = e.target.value.replace(/\D/g, '');
                                                handleWingDataChange(index, 'NoOfFloorExcludingPodium', digits)
                                            }}
                                            placeholder="Enter No Of Floor"
                                            required
                                            maxLength={2}
                                        />
                                        <Input
                                            label="Max No Of Flats Per Floor"
                                            value={wing.MaxNoOfFlatPerFloor}
                                            onChange={(e) => {
                                                const digits = e.target.value.replace(/\D/g, '');
                                                handleWingDataChange(index, 'MaxNoOfFlatPerFloor', digits)
                                            }}
                                            placeholder="Enter Max No Of Flats Per Floor"
                                            required
                                            maxLength={2}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Modal>

            {/* Add Wing Modal */}
            <Modal
                isOpen={isAddWingModalOpen}
                onClose={() => {
                    setIsAddWingModalOpen(false);
                    setWingNoOfFloor('');
                    setWingMaxNoOfFlatsPerFloor('');
                }}
                title="Add Wing"
                onSubmit={handleSaveWing}
                saveText="Add Wing"
                onCancel={() => {
                    setIsAddWingModalOpen(false);
                    setWingNoOfFloor('');
                    setWingMaxNoOfFlatsPerFloor('');
                }}
                size="md"
                loading={isLoading}
            >
                <div className="space-y-4">
                    <div>
                        <Input
                            label="Selected Building"
                            value={selectedBuildingIndex !== null && inventory[selectedBuildingIndex]
                                ? inventory[selectedBuildingIndex].BuildingNumber
                                : 'No building selected'}
                            placeholder="Building Number"
                            required
                            disabled
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="No Of Floor"
                            value={wingNoOfFloor}
                            onChange={(e) => {
                                const digits = e.target.value.replace(/\D/g, '');
                                setWingNoOfFloor(digits)
                            }}
                            placeholder="Enter No Of Floor"
                            required
                            maxLength={2}

                        />
                        <Input
                            label="Max No Of Flats Per Floor"
                            value={wingMaxNoOfFlatsPerFloor}
                            onChange={(e) => {
                                const digits = e.target.value.replace(/\D/g, '');
                                setWingMaxNoOfFlatsPerFloor(digits)
                            }}
                            placeholder="Enter Max No Of Flats Per Floor"
                            required
                            maxLength={2}

                        />
                    </div>
                </div>
            </Modal>

            {/* Delete Wing Confirmation Dialog */}
            <DeleteDialog
                isOpen={isDeleteWingDialogOpen}
                onClose={() => {
                    setIsDeleteWingDialogOpen(false);
                    setWingToDelete(null);
                }}
                onConfirm={handleConfirmDeleteWing}
                loading={isLoading}
                pageName="wing"
                message={`Are you sure you want to delete wing "${wingToDelete?.Wing}"? This action cannot be undone.`}
            />

            {/* Delete Building Confirmation Dialog */}
            <DeleteDialog
                isOpen={isDeleteBuildingDialogOpen}
                onClose={() => {
                    setIsDeleteBuildingDialogOpen(false);
                    setBuildingToDelete(null);
                }}
                onConfirm={handleConfirmDeleteBuilding}
                loading={isLoading}
                pageName="building"
                message={`Are you sure you want to delete building "${buildingToDelete?.BuildingNumber}"? This action cannot be undone.`}
            />

            {/* Delete Floor Confirmation Dialog */}
            <DeleteDialog
                isOpen={isDeleteFloorDialogOpen}
                onClose={() => {
                    setIsDeleteFloorDialogOpen(false);
                    setFloorToDelete(null);
                }}
                onConfirm={handleConfirmDeleteFloor}
                loading={isLoading}
                pageName="floor"
                message={`Are you sure you want to delete floor "${floorToDelete?.floor.Floor}"? This action cannot be undone.`}
            />
        </>
    )
}

export default Inventory



