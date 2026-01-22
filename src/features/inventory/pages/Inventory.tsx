
import { useEffect, useState, useMemo } from "react"
import { type FilterInventoryRequest, type InventoryData, type InventoryFlatData, type InventoryFlatFloorBasementPodiumWingData } from "../models/InventoryMasterModel"
import { Edit, Eye, Plus, Trash } from "lucide-react"
import { inventoryService } from "../services/InventoryServices"
import * as E from 'fp-ts/Either'
import useToast from "@/core/hooks/useToast"
import { ExpandableCard } from "@/ui/components/Card/ExpandableCard"
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar"
import { handleExportFile } from "@/core/utils/exportFile"
import { Button } from "@/ui/components/forms"
import { useNavigate } from 'react-router-dom';
import { runApiWithLoader } from "@/core/utils"
import { useProject } from "@/features/projectMaster/context/ProjectContext"
import { Loader } from "@/core/utils/loader"
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions"
import Tabs from "@/ui/components/Tab/Tab"
import { FieldItem } from "@/ui/components/forms/FieldItem"
import ExportImport from "@/ui/components/ExcelImport/ExcelImport"
import { technicalService } from "@/features/technical/services/TechnicalService"
import type { FilterPullExcelSample } from "@/features/technical/models/TechnicalModel"


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

    //#regionTAB ACTIVITY
    const inventoryTabList = [
        { id: "Grid", label: "Grid" },
        { id: "Table", label: "Table" },
    ];

    const [activeTab, setActiveTab] = useState<string>(inventoryTabList[0].id);

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

            setSelectedBuilding(inventory[0].InventoryFlatFloorBasementPodiumWingData)

            setSelectedBuildingIndex(0)

            setSelectedWing(inventory[0].InventoryFlatFloorBasementPodiumWingData[0])

        }
    }, [projectId, inventory])


    const wingTabs = useMemo(() => {
        if (!selectedBuilding) return [];

        return selectedBuilding.map((wing, index) => ({

            id: String(index),

            label: wing.Wing,

            data: wing
        }));
    }, [selectedBuilding]);


    useEffect(() => {
        if (wingTabs.length > 0) {
            setActiveWingTab('0');
            setSelectedWing(wingTabs[0].data);
        }
    }, [wingTabs]);



    //#endregion

    //#region DATA LOADING | FETCH |  LOAD | SEARCH 

    const fetchInventory = async () => {

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
    }

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
    const countFlatsByStatus = (status: string) => {

        if (inventory.length === 0) return 0;

        return inventory.reduce((total, building) => {

            const buildingFlats = building.InventoryFlatFloorBasementPodiumWingData.reduce((wingTotal, wing) => {

                const wingFlats = wing.InventoryFloorData.reduce((floorTotal, floor) => {

                    const count = floor.InventoryFlatData.filter(

                        flat => flat.FlatStatus === status

                    ).length;

                    return floorTotal + count;

                }, 0);
                return wingTotal + wingFlats;

            }, 0);
            return total + buildingFlats;

        }, 0);
    };


    const availableFlatsCount = useMemo(() => countFlatsByStatus("Available"), [inventory]);
    const saleFlatsCount = useMemo(() => countFlatsByStatus("Sold"), [inventory]);
    const memberFlatsCount = useMemo(() => countFlatsByStatus("Member"), [inventory]);
    const blockedFlatsCount = useMemo(() => countFlatsByStatus("Blocked"), [inventory]);
    const holdFlatsCount = useMemo(() => countFlatsByStatus("Hold"), [inventory]);

    //#endregion

    //#region COUNT WING WISE FLAT STATUS
    const countWingWiseFlatStatus = (status: string) => {
        if (!selectedWing) return 0;

        return selectedWing.InventoryFloorData.reduce((total, floor) => {
            const count = floor.InventoryFlatData.filter(
                flat => flat.FlatStatus === status
            ).length;
            return total + count;
        }, 0);
    };

    const selectedWingAvailableCount = useMemo(() => countWingWiseFlatStatus("Available"), [selectedWing]);

    const selectedWingSaleCount = useMemo(() => countWingWiseFlatStatus("Sold"), [selectedWing]);

    const selectedWingMemberCount = useMemo(() => countWingWiseFlatStatus("Member"), [selectedWing]);

    const selectedWingBlockedCount = useMemo(() => countWingWiseFlatStatus("Blocked"), [selectedWing]);

    const selectedWingHoldCount = useMemo(() => {
        if (!selectedWing) return 0;
        return selectedWing.InventoryFloorData.reduce((total, floor) => {
            const count = floor.InventoryFlatData.filter(
                flat => flat.FlatStatus === "Hold"
            ).length;
            return total + count;
        }, 0);
    }, [selectedWing]);

    //#endregion

    const FlatComponent = (flat: InventoryFlatData) => {

        const navigate = useNavigate();

        const hexToRgba = (hex: string, alpha: number = 0.12) => {
            const cleanHex = hex.replace('#', '');
            const r = parseInt(cleanHex.substring(0, 2), 16);
            const g = parseInt(cleanHex.substring(2, 4), 16);
            const b = parseInt(cleanHex.substring(4, 6), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        const bgColor = colorsForFlatComponent[flat.FlatStatus].Background.replace('#', '');
        const fromColor = hexToRgba(`#${bgColor.substring(0, 6)}`, 0.12); // 12% opacity
        const toColor = 'rgba(51, 51, 51, 0.067)'; // #33333311 = ~4% opacity

        const gradientStyle = {
            background: `linear-gradient(to bottom, ${fromColor}, ${toColor})`
        };

        return (

            <div className={`flex flex-col justify-evenly h-[200px] w-[250px] rounded-[8px] border ${colorsForFlatComponent[flat.FlatStatus].Border} border-[0.3px] px-2`} style={gradientStyle}>

                <FieldItem label="Unit No " value={flat.Flat} isRow={true} isUsedForInventoryFlat={true} />
                <FieldItem label="Type " value={flat.FlatType} isRow={true} isUsedForInventoryFlat={true} />
                <FieldItem label="Area SqFt " value={flat.RERACarpetAreaSqFt} isRow={true} isUsedForInventoryFlat={true} />
                <FieldItem label="Configuration " value={flat.FlatConfiguration} isRow={true} isUsedForInventoryFlat={true} />
                <div className="flex items-center justify-evenly gap-2">
                    <div
                        className={`
                  flex h-[30px] w-[207px]
                  ${colorsForFlatComponent[flat.FlatStatus].Button}
                  ${colorsForFlatComponent[flat.FlatStatus].buttonText}
                  rounded-[6px]
                  items-center justify-center
                `}
                    >
                        {flat.FlatStatus}
                    </div>
                    {(flat.FlatStatus == "Booked" || flat.FlatStatus == "Alloted") && <Eye size={16} />}
                    {(flat.FlatStatus == "Blocked" || flat.FlatStatus == "Available") && <Edit className="cursor-pointer" onClick={() => {
                        navigate('/inventorySpecification', {
                            state:
                            {
                                "flat": flat,
                                "projectId": inventory[0].ProjectId,
                            },

                        })
                    }} size={16} />}
                    {(flat.FlatStatus == "Blocked" || flat.FlatStatus == "Available") && <Trash onClick={async () => {
                        // const result = await inventoryService.apiCallDeleteInventoryFlat(inventory[0].ProjectId, flat)
                        // if (E.isRight(result)) {

                        // } else {
                        //     addToast({
                        //         type: "error",
                        //         title: "Error Deleting the Inventory Flat",
                        //     })
                        // }
                    }} color="red" size={16} />}
                </div>

                <p className="text-center text-[#135BEC] font-semibold">
                    {flat.FlatStatus == "Booked" ? "Owner : " : flat.FlatStatus == "Alloted" ? "Alloted : " : ""} {flat.OwnerName}
                </p>
            </div>
        );
    };

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

            {/* ============================================================================
                      COMMAN LOADER FOR PAGE
                       ============================================================================ */}

            <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>

            <div className="flex flex-col justify-evenly w-full h-[300px] rounded-[15px] border-[1px] border-gray-300 shadow-[0_1px_2px_1px_rgba(0,0,0,0.15)] bg-[#F9FAFB] px-4 py-1">
                <div className="flex justify-between">
                    <Tabs
                        tabs={inventoryTabList}
                        defaultActive={activeTab}
                        islarge={true}
                        onTabChange={(t) => {
                            setActiveTab(t.id);

                        }}
                    />
                </div>

                <TableActionToolbar
                    isShowSearchBar={true}
                    searchPlaceholder="Search By Unit Number"
                    isShowAddButton
                    onAdd={() => { }}
                    showMoreAddOptions={
                        <div className="flex flex-col w-[150px] bg-white rounded-md border-[1px] border-gray-200 shadow-lg">
                            <Button
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                }}
                                disabled={false}
                                color="transparent"
                                fullWidth
                                isborderRadius
                                size="sm"
                                title="Add Building"
                            >
                                Add Building
                            </Button>
                            <Button
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                }}
                                disabled={false}
                                color="transparent"
                                fullWidth
                                isborderRadius
                                size="sm"
                                title="Add Wing"
                            >
                                Add Wing
                            </Button>
                            <Button
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                }}
                                disabled={false}
                                color="transparent"
                                fullWidth
                                isborderRadius
                                size="sm"
                                title="Add Floor"
                            >
                                Add Floor
                            </Button>
                        </div>
                    }
                    // EXPORT
                    isShowExportButton={canExport}
                    onExportExcel={handleExportInventoryExcel}
                    onExportPdf={handleExportInventoryPdf}

                    // IMPORT
                    isShowImportButton={true}
                    onUploadExcel={() => setShowImportModal(true)}
                    onDownloadSampleExcel={handleDownloadExcelSampleInventory}
                    exportLoading={isLoading}
                />
                <div className="border-b border-gray-200" />

                <div className="flex justify-between items-center">
                    <div className="flex gap-5">
                        {inventory.map((i, index) => (
                            <span
                                key={index}
                                onClick={() => {
                                    setSelectedBuilding(i.InventoryFlatFloorBasementPodiumWingData)
                                    setSelectedBuildingIndex(index)
                                    setSelectedWing(inventory[0].InventoryFlatFloorBasementPodiumWingData[0])
                                }}
                                className={`relative pb-2 text-sm font-medium transition-all duration-200 ${selectedBuildingIndex === index
                                    ? 'text-blue-600 font-medium text-[16px] leading-[140%] tracking-[0.01em]'
                                    : 'text-gray-400  font-normal text-[14px] leading-[140%] tracking-[0.01em] hover:text-blue-500'
                                    }`}
                            >

                                {i.BuildingNumber}
                                
                                {selectedBuildingIndex === index && (
                                    <span className="absolute left-0 bottom-0 w-full h-[2px] bg-blue-600 rounded-full"
                                    />
                                )}
                            </span>
                        ))}
                    </div>

                    <div className="flex gap-5 pt-5">
                        <ColorDotWithDataComponent data={availableFlatsCount} color={"#22C55E"}></ColorDotWithDataComponent>
                        <ColorDotWithDataComponent data={holdFlatsCount} color={"#C4C41D"}></ColorDotWithDataComponent>
                        <ColorDotWithDataComponent data={memberFlatsCount} color={"#8A38F5"}></ColorDotWithDataComponent>
                        <ColorDotWithDataComponent data={saleFlatsCount} color={"#FF0000"}></ColorDotWithDataComponent>
                        <ColorDotWithDataComponent data={blockedFlatsCount} color={"#1D1D1D"}></ColorDotWithDataComponent>
                    </div>
                </div>

                <div className="border-b border-gray-200" />

                <div className="flex justify-between">

                    <Tabs
                        tabs={wingTabs}
                        defaultActive={activeWingTab}
                        islarge={true}
                        onTabChange={(tab) => {
                            const index = Number(tab.id);
                            setActiveWingTab(tab.id);
                            setSelectedWing(selectedBuilding![index]);
                        }}
                    />

                    <div className="flex gap-5">

                        <ColorDotWithDataComponent data={selectedWingAvailableCount} color={"#22C55E"}></ColorDotWithDataComponent>
                        <ColorDotWithDataComponent data={selectedWingHoldCount} color={"#C4C41D"}></ColorDotWithDataComponent>
                        <ColorDotWithDataComponent data={selectedWingMemberCount} color={"#8A38F5"}></ColorDotWithDataComponent>
                        <ColorDotWithDataComponent data={selectedWingSaleCount} color={"#FF0000"}></ColorDotWithDataComponent>
                        <ColorDotWithDataComponent data={selectedWingBlockedCount} color={"#1D1D1D"}></ColorDotWithDataComponent>
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


            {
                selectedWing?.InventoryFloorData.map((floor, floorIndex) => (
                    <div className="pt-2">
                        <ExpandableCard key={floorIndex} title={floor.Floor} showline={true} customizedIcon={<Plus className="p-1.5" size={28} />}

                            child={
                                <div className=" flex flex-1 gap-5 thin-scroll">

                                    {floor.InventoryFlatData?.map((flat, flatIndex) => (

                                        <FlatComponent
                                            key={flatIndex}
                                            InventoryFlatId={flat.InventoryFlatId}
                                            Uniquekey={flat.Uniquekey}
                                            InventoryBuildingId={flat.InventoryBuildingId}
                                            BuildingNumber={flat.BuildingNumber}
                                            InventoryFlatFloorBasementPodiumWingId={flat.InventoryFlatFloorBasementPodiumWingId}
                                            Wing={flat.Wing}
                                            InventoryFloorId={flat.InventoryFloorId}
                                            Floor={flat.Floor}
                                            Flat={flat.Flat}
                                            RERACarpetAreaSqFt={flat.RERACarpetAreaSqFt}
                                            FlatType={flat.FlatType}
                                            FlatConfiguration={flat.FlatConfiguration}
                                            FlatStatus={flat.FlatStatus}
                                            FlatFacing={flat.FlatFacing}
                                            InventoryFlatSpecificationData={flat.InventoryFlatSpecificationData}
                                            OwnerName={flat.OwnerName}
                                            BookingId={flat.BookingId}
                                            BookingCreatedById={flat.BookingCreatedById}
                                            BookingCreatedBy={flat.BookingCreatedBy}
                                            BookingCreatedDate={flat.BookingCreatedDate}

                                        />
                                    ))}
                                </div>
                            }></ExpandableCard>

                    </div>
                ))

            }

        </>
    )
}

export default Inventory

type ColorDotProps = {
    data: number;
    color: string;
}

const ColorDotWithDataComponent = (colorDotProps: ColorDotProps) => {
    return <div className="flex items-center gap-3"> <div style={
        {
            backgroundColor: colorDotProps.color,
            height: 12,
            width: 12,
        }
    } className="rounded-full"></div> <span>{colorDotProps.data}</span></div>
}


const colorsForFlatComponent = {
    Booked: {
        Border: "border-[#FF0000]",
        Background: "#FF00001E",
        Button: "bg-[#FF0000]/15",
        buttonText: "text-[#FF0000]",
    },
    Available: {
        Border: "border-[#60D669]",
        Background: "#60D669",
        Button: "bg-[#60D669]/15",
        buttonText: "text-[#60D669]",
    },
    Alloted: {
        Border: "border-[#8A38F5]",
        Background: "#8A38F5",
        Button: "bg-[#8A38F5]/15",
        buttonText: "text-[#8A38F5]",
    },
    Blocked: {
        Border: "border-[#1D1D1D]",
        Background: "#1D1D1D",
        Button: "bg-[#1D1D1D]/15",
        buttonText: "text-[#1D1D1D]",
    },
    Hold: {
        Border: "border-[#C4C41D]",
        Background: "#C4C41D",
        Button: "bg-[#C4C41D]/15",
        buttonText: "text-[#C4C41D]",
    },
};



