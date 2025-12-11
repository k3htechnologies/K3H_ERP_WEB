
import { useEffect, useRef, useState } from "react"
import { type InventoryModel, type InventoryFlatData, type InventoryFlatFloorBasementPodiumWingDatum } from "../models/InventoryMasterModel"
import { Eye, Loader, Plus } from "lucide-react"
import { InventoryService } from "../services/InventoryServices"
import * as E from 'fp-ts/Either'
import useToast from "@/core/hooks/useToast"
import { ToastContainer } from "@/ui/components/Toast"
import { ExpandableCard } from "@/ui/components/Card/ExpandableCard"
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar"
import { DataTable } from "@/ui/components/DataTable/DataTable"
import { handleExportFile } from "@/core/utils/exportFile"
import { Button } from "@/ui/components/forms"
import { useNavigate } from 'react-router-dom';


const Inventory = () => {

    const [currentTab, setCurrentTab] = useState("Grid")
    const [inventory, setInventory] = useState<InventoryModel[]>([])
    const [selectedBuilding, setSelectedBuilding] = useState<InventoryFlatFloorBasementPodiumWingDatum[] | undefined>(undefined)
    const [selectedBuildingIndex, setSelectedBuildingIndex] = useState<number | null>(null)
    const [selectedWing, setSelectedWing] = useState<InventoryFlatFloorBasementPodiumWingDatum | undefined>(undefined);
    const isApiCalled = useRef(false)
    const { toasts, addToast, removeToast } = useToast()


    useEffect(() => {
        if (isApiCalled.current === false) {
            apiCallToGetInventory();
            isApiCalled.current = true
        }
    }, [])

    const apiCallToGetInventory = async () => {
        const response = await InventoryService.apiCallPullInventory(2)
        if (E.isRight(response)) {
            setInventory(response.right.Data)
        } else {

        }
    }

    // Set default selected building when inventory loads
    useEffect(() => {
        if (inventory.length > 0 && selectedBuildingIndex === null) {
            setSelectedBuilding(inventory[0].InventoryFlatFloorBasementPodiumWingData)
            setSelectedBuildingIndex(0)
            setSelectedWing(inventory[0].InventoryFlatFloorBasementPodiumWingData[0])
        }
    }, [inventory]) // Only depend on inventory, not selectedBuildingIndex

    return inventory.length == 0 ? <Loader></Loader> :

        <div className="flex flex-col gap-5">
            <ToastContainer toasts={toasts} onRemoveToast={removeToast}></ToastContainer>
            <div className="flex flex-col justify-evenly w-full h-[210px] rounded-[15px] border-[1px] border-gray-300 shadow-[0_1px_2px_1px_rgba(0,0,0,0.15)] bg-[#F9FAFB] px-4 py-1">
                <div className="flex justify-between">
                    <div className="flex pt-1">
                        <div className=" w-[250px] h-[40px] bg-[#F1F1F1] rounded-[6px] border-[0.3px] border-[rgba(0,0,0,0.5)]">
                            <div className="flex h-full justify-evenly items-center  p-1 ">
                                <div onClick={() => { setCurrentTab("Grid") }} className={`flex cursor-pointer ${currentTab === "Grid" ? "bg-[#FFFFFF]" : ""} ${currentTab === "Grid" ? "text-[#135BEC]" : "text-black/50"} flex-1 justify-center h-[32px] items-center rounded-[2px] font-medium`}>Grid</div>

                                <div onClick={() => { setCurrentTab("Table") }} className={`flex cursor-pointer ${currentTab === "Table" ? "bg-[#FFFFFF]" : ""} ${currentTab === "Table" ? "text-[#135BEC]" : "text-black/50"} flex-1 justify-center h-[32px] items-center rounded-[2px] font-medium`}>Table</div>
                            </div>
                        </div>
                    </div>
                    <TableActionToolbar isShowSearchBar={false} isShowExportButton={true} onExportExcel={async () => {
                        const apiResponse = await InventoryService.apiCallToExportPdfExcel(2, "Excel");
                        handleExportFile(apiResponse, "Excel", 'Inventory', addToast)
                    }} onExportPdf={async () => {
                        const apiResponse = await InventoryService.apiCallToExportPdfExcel(2, "PDF");
                        handleExportFile(apiResponse, "PDF", 'Inventory', addToast)
                    }}
                        isShowAddButton
                        onAdd={() => { }}
                        isShowImportButton
                        onUploadExcel={() => { }}
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
                    ></TableActionToolbar>
                </div>

                <div className="h-[0.3px] bg-[#000000]/50 w-full"></div>

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
                                className={`cursor-pointer px-3 py-1 rounded ${selectedBuildingIndex === index
                                    ? 'bg-[#135BEC] text-white font-semibold'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {i.BuildingNumber}
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-5">
                        <ColorDotWithDataComponent data={33} color={"#22C55E"}></ColorDotWithDataComponent>
                        <ColorDotWithDataComponent data={21} color={"#C4C41D"}></ColorDotWithDataComponent>
                        <ColorDotWithDataComponent data={11} color={"#8A38F5"}></ColorDotWithDataComponent>
                        <ColorDotWithDataComponent data={5} color={"#FF0000"}></ColorDotWithDataComponent>
                        <ColorDotWithDataComponent data={5} color={"#1D1D1D"}></ColorDotWithDataComponent>
                    </div>
                </div>
                <div className="h-[0.3px] bg-[#000000]/50 w-full"></div>

                <div className="flex justify-between">
                    <div className="flex gap-3">
                        {selectedBuilding && selectedBuilding.length > 0 ? (
                            selectedBuilding.map((e, index) => (
                                <WingComponent
                                    key={index}
                                    wingName={e.Wing}
                                    isActive={selectedWing?.Wing == e.Wing}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        setSelectedWing(inventory[selectedBuildingIndex!].InventoryFlatFloorBasementPodiumWingData[index])
                                    }}
                                />
                            ))
                        ) : (
                            <span className="text-gray-400">No wings available</span>
                        )}
                    </div>
                    <div className="flex gap-5">
                        <ColorDotWithDataComponent data={-1} color={"#22C55E"}></ColorDotWithDataComponent>
                        <ColorDotWithDataComponent data={21} color={"#C4C41D"}></ColorDotWithDataComponent>
                        <ColorDotWithDataComponent data={11} color={"#8A38F5"}></ColorDotWithDataComponent>
                        <ColorDotWithDataComponent data={5} color={"#FF0000"}></ColorDotWithDataComponent>
                        <ColorDotWithDataComponent data={5} color={"#1D1D1D"}></ColorDotWithDataComponent>
                    </div>
                </div>
            </div>

            {
                currentTab == "Table" ?
                    <DataTable

                        data={
                            selectedWing!.InventoryFloorData

                                .flatMap(floor => floor.InventoryFlatData)
                        }
                        columns={[
                            {
                                key: 'Floor',
                                label: 'Floor',
                                width: '30',
                                sortable: false,
                                align: 'center',
                                render: (value) => value || ''
                            },
                            {
                                key: 'Flat',
                                label: 'Flat',
                                width: '30',
                                sortable: false,
                                align: 'center',
                                render: (value) => value || '',
                            },
                            {
                                key: 'RERACarpetAreaSqFt',
                                label: 'Rera',
                                width: '30',
                                sortable: false,
                                align: 'center',
                                render: (value) => value || '',
                            },
                            {
                                key: 'FlatType',
                                label: 'Property Type',
                                width: '30',
                                sortable: false,
                                align: 'center',
                                render: (value) => value || '',
                            },
                            {
                                key: 'FlatStatus',
                                label: 'Status',
                                width: '30',
                                sortable: false,
                                align: 'center',
                                render: (value) => <div className={`flex items-center justify-center h-8 rounded-[16px] bg-[${value == "Available" ? "#22C55E26" : value == "Hold" ? "#FBFF0026" : ""}]`}> {value} </div>
                            },
                            {
                                key: 'Owner',
                                label: 'Buyer/Tenant',
                                width: '30',
                                sortable: false,
                                align: 'center',
                                render: (value) => value || '',
                            },


                        ]}></DataTable> :
                    selectedWing != undefined ?
                        selectedWing.InventoryFloorData.map((floor, floorIndex) => (
                            <ExpandableCard key={floorIndex} title={floor.Floor} showline={true} customizedIcon={<Plus className="p-1.5" size={28} />}
                                child={
                                    <div className="flex flex-1 w-screen gap-5 overflow-y-auto scroll-smooth">
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
                        ))
                        : (
                            <div className="text-center text-gray-400 py-8">No floors available</div>
                        )}
        </div>
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

type WingProps = {
    wingName: string,
    isActive: boolean,
    onClick: React.MouseEventHandler<HTMLDivElement>,
}

const WingComponent = (wingProps: WingProps) => {
    return <div onClick={wingProps.onClick} className={`flex justify-center items-center cursor-pointer w-[120px] h-[26px] text-sm text-${wingProps.isActive ? "[#135BEC]" : "[#000000]/50"} rounded-[4px] border-[0.5px] border border-${wingProps.isActive ? "[#135BEC]" : "[#000000]/50"} ${wingProps.isActive ? "bg-[#135BEC]/30" : "bg-transparent"}`}>{wingProps.wingName}</div>
}

const FlatComponent = (flat: InventoryFlatData) => {

    const navigate = useNavigate();

    // Use inline style for gradient since colors are dynamic
    // Convert hex to rgba for proper gradient with opacity
    const hexToRgba = (hex: string, alpha: number = 0.12) => {
        // Remove # if present
        const cleanHex = hex.replace('#', '');
        // Handle hex with alpha (8 chars) or without (6 chars)
        const r = parseInt(cleanHex.substring(0, 2), 16);
        const g = parseInt(cleanHex.substring(2, 4), 16);
        const b = parseInt(cleanHex.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const bgColor = colors[flat.FlatStatus].Background.replace('#', '');
    const fromColor = hexToRgba(`#${bgColor.substring(0, 6)}`, 0.12); // 12% opacity
    const toColor = 'rgba(51, 51, 51, 0.067)'; // #33333311 = ~4% opacity

    const gradientStyle = {
        background: `linear-gradient(to bottom, ${fromColor}, ${toColor})`
    };

    return (
        <div
        onClick={() => {navigate('/inventorySpecification', {
            state : {flat}
        })}}
            className={`
          flex flex-col justify-evenly 
          h-[215px] w-[266px] 
          rounded-[8px] 
          border ${colors[flat.FlatStatus].Border} border-[0.3px]
          px-2
        `}
            style={gradientStyle}
        >
            <span className="flex justify-between">
                <p className="font-medium text-[14px] text-[#000000]/50">Unit No :</p>
                <p>{flat.Flat}</p>
            </span>

            <span className="flex justify-between">
                <p className="font-medium text-[14px] text-[#000000]/50">Type :</p>
                <p>{flat.FlatType}</p>
            </span>

            <span className="flex justify-between">
                <p className="font-medium text-[14px] text-[#000000]/50">Area (sq.ft) :</p>
                <p>{flat.RERACarpetAreaSqFt}</p>
            </span>

            <span className="flex justify-between">
                <p className="font-medium text-[14px] text-[#000000]/50">Configuration :</p>
                <p>{flat.FlatConfiguration}</p>
            </span>

            <div className="flex items-center justify-evenly">
                <div
                    className={`
              flex h-[30px] w-[207px]
              ${colors[flat.FlatStatus].Button}
              ${colors[flat.FlatStatus].buttonText}
              rounded-[6px]
              items-center justify-center
            `}
                >
                    {flat.FlatStatus}
                </div>
                <Eye size={16} />
            </div>

            <p className="text-center text-[#135BEC] font-semibold">
                Owner : {flat.OwnerName}
            </p>
        </div>
    );
};

const colors = {
    Sale: {
        Border: "border-[#FF0000]",
        Background: "#FF00001E",        // base hex
        Button: "bg-[#FF0000]/15",
        buttonText: "text-[#FF0000]",
    },
    Available: {
        Border: "border-[#60D669]",
        Background: "#60D669",
        Button: "bg-[#60D669]/15",
        buttonText: "text-[#60D669]",
    },
    Member: {
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
};



