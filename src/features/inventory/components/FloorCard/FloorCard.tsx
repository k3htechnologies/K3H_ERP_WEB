import { Plus, Car, Trash, DraftingCompass } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ExpandableCard } from "@/ui/components/Card/ExpandableCard";
import { FlatCard } from "../FlatCard";
import { Modal } from "@/ui/components/Modal/Modal";
import { Button, Input } from "@/ui/components/forms";
import { inventoryService } from "@/features/inventory/services/InventoryServices";
import { runApiWithLoader } from "@/core/utils";
import * as E from 'fp-ts/Either';
import useToast from "@/core/hooks/useToast";
import type {
    InventoryFloorData,
    InventoryFlatFloorBasementPodiumWingData,
    InventoryData,
    AddUpdateInventoryFloorParkingCountRequest
} from "@/features/inventory/models/InventoryMasterModel";

interface FloorCardProps {
    floor: InventoryFloorData;
    slabHeight: number;
    projectId: number;
    building: InventoryData;
    wing: InventoryFlatFloorBasementPodiumWingData;
    onDelete: (flat: import("@/features/inventory/models/InventoryMasterModel").InventoryFlatData) => void;
    onParkingUpdate?: () => void;
    onDeleteFloor?: (floor: InventoryFloorData, wing: InventoryFlatFloorBasementPodiumWingData, building: InventoryData) => void;
    isLastFloor?: boolean;
    canAction?: boolean;
    canBookingAction?: boolean;
    approvalStatus?: string
}

export const FloorCard = ({ floor, slabHeight, projectId, building, wing, onDelete, onParkingUpdate, onDeleteFloor, isLastFloor, canAction, canBookingAction, approvalStatus }: FloorCardProps) => {
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [isParkingModalOpen, setIsParkingModalOpen] = useState(false);
    const [parkingCount, setParkingCount] = useState<string>(floor.ParkingCount?.toString() || '0');
    const [isLoading, setIsLoading] = useState(false);
    const [, setLoadingMessage] = useState('');

    const handleAddFlat = () => {

        sessionStorage.setItem("scrollFloorId", floor.InventoryFloorId.toString());

        const newFlatData = {
            InventoryFlatId: 0,
            Uniquekey: '',
            InventoryBuildingId: building.InventoryBuildingId,
            BuildingNumber: building.BuildingNumber,
            InventoryFlatFloorBasementPodiumWingId: wing.InventoryFlatFloorBasementPodiumWingId,
            Wing: wing.Wing,
            InventoryFloorId: floor.InventoryFloorId,
            Floor: floor.Floor,
            Flat: '',
            RERACarpetAreaSqFt: 0,
            FlatType: '',
            FlatConfiguration: '',
            FlatStatus: 'Available' as const,
            FlatFacing: '',
            InventoryFlatSpecificationData: [],
            OwnerName: '',
            BookingId: 0,
            BookingCreatedById: 0,
            BookingCreatedBy: '',
            BookingCreatedDate: null,
        };

        navigate('/inventory/inventorySpecification', {
            state: {
                flat: newFlatData,
                projectId: projectId,
            },
        });
    };

    const handleViewDrawing = () => {

        sessionStorage.setItem("scrollFloorId", floor.InventoryFloorId.toString());

        const newFlatData = {
            InventoryFlatId: 0,
            Uniquekey: '',
            InventoryBuildingId: building.InventoryBuildingId,
            BuildingNumber: building.BuildingNumber,
            InventoryFlatFloorBasementPodiumWingId: wing.InventoryFlatFloorBasementPodiumWingId,
            Wing: wing.Wing,
            InventoryFloorId: floor.InventoryFloorId,
            Floor: floor.Floor,
            Flat: '',
            RERACarpetAreaSqFt: 0,
            FlatType: '',
            FlatConfiguration: '',
            FlatStatus: 'Available' as const,
            FlatFacing: '',
            InventoryFlatSpecificationData: [],
            OwnerName: '',
            BookingId: 0,
            BookingCreatedById: 0,
            BookingCreatedBy: '',
            BookingCreatedDate: null,
        };

        navigate('/inventory/projectDrawing', {
            state: {
                flat: newFlatData,
                projectId: projectId,
            },
        });
    };


    const handleParkingClick = (e: React.MouseEvent) => {
        sessionStorage.setItem("scrollFloorId", floor.InventoryFloorId.toString());
        e.stopPropagation();
        if (canAction && !approvalStatus?.toUpperCase().includes("APPROVED")) {
            setIsParkingModalOpen(true);
            setParkingCount(floor.ParkingCount?.toString() || '0');
        }
    };

    const handleSaveParkingCount = async (e: React.FormEvent) => {

        e.preventDefault();

        const params: AddUpdateInventoryFloorParkingCountRequest = {
            ProjectId: projectId,
            InventoryBuildingId: building.InventoryBuildingId,
            InventoryFlatFloorBasementPodiumWingId: wing.InventoryFlatFloorBasementPodiumWingId,
            InventoryFloorId: floor.InventoryFloorId,
            ParkingCount: Number(parkingCount) || 0,
        };

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const response = await inventoryService.apiCallAddUpdateInventoryFloorParkingCount(params);

                if (E.isRight(response)) {

                    setIsParkingModalOpen(false);

                    if (onParkingUpdate) {
                        onParkingUpdate();
                    }

                    addToast({ type: 'success', title: response.right.SuccessMessage?.[0] });


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

            'Updating Parking Count'
        );
    };

    return (
        <div className="pt-2">
            <div id={`floor-${floor.InventoryFloorId}`}>
                <ExpandableCard
                    key={floor.InventoryFloorId}
                    title={floor.Floor}
                    subTitle={floor.InventoryFlatData.length > 0 ? floor.InventoryFlatData.length : ""}
                    showline={true}
                    defaultOpen={true}
                    customizedIcon={
                        <div className="flex items-center gap-2">

                            <Button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewDrawing();
                                }}
                                color='transparent'
                                className="!h-8"
                                 disabled={approvalStatus?.trim().toUpperCase() !== "APPROVED" || (floor.DrawingCount ?? 0) === 0 }
                                title={ approvalStatus?.trim().toUpperCase() === "APPROVED"  ? "View Drawing"  : "Your inventory is not approved, so drawing cannot be viewed."}>
                               <DraftingCompass className="text-[#135BEC]" size={20}/> <span className="text-[#135BEC] font-medium text-sm">{floor.DrawingCount || 0}</span>
                            </Button>

                            <span className="text-sm text-gray-600">{`Slab Height: ${slabHeight} ft`}</span>

                            <div className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 transition-colors"
                                onClick={handleParkingClick}
                                title="Update Parking Count">
                                <span className="text-[#135BEC] font-medium text-sm">{floor.ParkingCount || 0}</span>
                                <Car className="text-[#135BEC]" size={20} />
                            </div>

                            {canAction && (
                                <>
                                    {!approvalStatus?.toUpperCase().includes("APPROVED") && (
                                        <Plus
                                            className="p-1.5 cursor-pointer hover:bg-gray-100 rounded transition-colors"
                                            size={28}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAddFlat();
                                            }}
                                        />
                                    )}

                                    {onDeleteFloor && isLastFloor && !approvalStatus?.toUpperCase().includes("APPROVED") && wing.Wing.toUpperCase() !== 'BGP' && (
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteFloor(floor, wing, building);
                                            }}
                                            color='transparent'
                                            title="Delete Floor"

                                        >
                                            <Trash color="red" className="text-red-600" size={20} />
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    }
                    child={
                        <div className="flex flex-1 gap-5 thin-scroll">
                            {floor.InventoryFlatData?.map((flat, flatIndex) => (

                                <FlatCard
                                    key={flatIndex}
                                    flat={flat}
                                    projectId={projectId}
                                    onDelete={onDelete}
                                    wing={wing.Wing}
                                    floor={floor.Floor}
                                    buildingNumber={building?.BuildingNumber ?? ""}
                                    canAction={canAction}
                                    canBookingAction={canBookingAction}
                                    approvalStatus={approvalStatus}
                                />

                            ))}
                        </div>
                    }
                />

                <Modal
                    isOpen={isParkingModalOpen}
                    onClose={() => {
                        setIsParkingModalOpen(false);
                        setParkingCount(floor.ParkingCount?.toString() || '0');
                    }}
                    title="Update Parking Count"
                    onSubmit={handleSaveParkingCount}
                    saveText="Update"
                    onCancel={() => {
                        setIsParkingModalOpen(false);
                        setParkingCount(floor.ParkingCount?.toString() || '0');
                    }}
                    size="md"
                    loading={isLoading}
                >
                    <div className="space-y-4">
                        <Input
                            label="Number of Parking"
                            value={parkingCount}
                            onChange={(e) => {
                                const digits = e.target.value.replace(/\D/g, '');
                                setParkingCount(digits)
                            }}
                            placeholder="Enter Parking Count"
                            required
                            maxLength={3}
                        />
                    </div>
                </Modal>
            </div>
        </div>
    );
};

