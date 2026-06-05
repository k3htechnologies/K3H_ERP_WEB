import React, { useMemo } from "react";
import type { Table4 } from "@/features/inventoryDashboard/models/InventoryDashboardModel";
import { CustomTable } from "@/ui/components/DataTable/CustomTable";

interface Props {
    wingData: Table4[];
    onOpenModal: (type: string, cardName: string, status: string, count: number, row: Table4) => void;
    canInventoryAction: boolean;
    canParkingAction: boolean;
}

const WingDetails: React.FC<Props> = ({ wingData, onOpenModal, canInventoryAction, canParkingAction }) => {
    const wingColumns = useMemo<any[]>(
        () => [
            {
                key: "Building",
                label: "Building",
                align: "left",
                render: (value: string) => (
                    <span className="font-medium text-black">
                        {(value || '')}
                    </span>
                )
            },
            {
                key: "Wing",
                label: "Wing",
                align: "center",
                render: (value: string) => (
                    <span className="font-medium text-black">
                        {(value || '')}
                    </span>
                )
            },
            {
                key: "Floors",
                label: "Floors",
                align: "center",
                render: (value: any) => (
                    <span className="font-medium text-black">
                        {(Number(value || 0))}
                    </span>
                )
            },
            {
                key: "Units",
                label: "Total Units",
                align: "center",
                render: (value: number, data: any) => {

                    const isClickable = canInventoryAction && (value ?? 0) > 0;

                    return (
                        <span
                            className={
                                isClickable
                                    ? "cursor-pointer text-blue-600 hover:underline"
                                    : "text-gray-400 cursor-not-allowed"
                            }
                            onClick={() => {
                                if (!isClickable) return;
                                onOpenModal("Inventory", "Total Units", "", data.Units || 0, data)
                            }}
                        >
                            {value ?? "0"}
                        </span>
                    );
                }
            },
            {
                key: "Units",
                label: "Units",
                align: "center",
                children: [
                    {
                        key: "AvailableFlats",
                        label: "Available",
                        align: "center",
                        render: (value: number, data: any) => {

                           const isClickable = canInventoryAction && (value ?? 0) > 0;

                            return (
                                <span
                                    className={
                                        isClickable
                                            ? "cursor-pointer text-blue-600 hover:underline"
                                            : "text-gray-400 cursor-not-allowed"
                                    }
                                    onClick={() => {
                                        if (!isClickable) return;
                                        onOpenModal("Inventory", "Available Units", "Available", data.AvailableFlats || 0, data)
                                    }}
                                >
                                    {value ?? "0"}
                                </span>
                            );
                        }

                    },
                    {
                        key: "BlockedFlats",
                        label: "Blocked",
                        align: "center",

                        render: (value: number, data: any) => {

                           const isClickable = canInventoryAction && (value ?? 0) > 0;

                            return (
                                <span
                                    className={
                                        isClickable
                                            ? "cursor-pointer text-blue-600 hover:underline"
                                            : "text-gray-400 cursor-not-allowed"
                                    }
                                    onClick={() => {
                                        if (!isClickable) return;
                                        onOpenModal("Inventory", "Blocked Units", "Blocked", data.BlockedFlats || 0, data)
                                    }}
                                >
                                    {value ?? "0"}
                                </span>
                            );
                        }
                    },
                    {
                        key: "HoldFlats",
                        label: "Hold",
                        align: "center",
                        render: (value: number, data: any) => {

                           const isClickable = canInventoryAction && (value ?? 0) > 0;

                            return (
                                <span
                                    className={
                                        isClickable
                                            ? "cursor-pointer text-blue-600 hover:underline"
                                            : "text-gray-400 cursor-not-allowed"
                                    }
                                    onClick={() => {
                                        if (!isClickable) return;
                                        onOpenModal("Inventory", "Hold Units", "Hold", data.HoldFlats || 0, data)
                                    }}
                                >
                                    {value ?? "0"}
                                </span>
                            );
                        }
                    },
                    {
                        key: "AllotedFlats",
                        label: "Alloted",
                        align: "center",
                        render: (value: number, data: any) => {

                            const isClickable = canInventoryAction && (value ?? 0) > 0;

                            return (
                                <span
                                    className={
                                        isClickable
                                            ? "cursor-pointer text-blue-600 hover:underline"
                                            : "text-gray-400 cursor-not-allowed"
                                    }
                                    onClick={() => {
                                        if (!isClickable) return;
                                        onOpenModal("Inventory", "Alloted Units", "Alloted", data.AllotedFlats || 0, data)
                                    }}
                                >
                                    {value ?? "0"}
                                </span>
                            );
                        }
                    },
                    {
                        key: "BookedFlats",
                        label: "Booked",
                        align: "center",
                        render: (value: number, data: any) => {

                            const isClickable = canInventoryAction && (value ?? 0) > 0;

                            return (
                                <span
                                    className={
                                        isClickable
                                            ? "cursor-pointer text-blue-600 hover:underline"
                                            : "text-gray-400 cursor-not-allowed"
                                    }
                                    onClick={() => {
                                        if (!isClickable) return;
                                        onOpenModal("Inventory", "Booked Units", "Booked", data.BookedFlats || 0, data)
                                    }}
                                >
                                    {value ?? "0"}
                                </span>
                            );
                        }
                    },

                ]
            },
            {
                key: "TotalParking",
                label: "Total Parking",
                align: "center",
                render: (value: number, data: any) => {

                    const isClickable = canParkingAction && (value ?? 0) > 0;

                    return (
                        <span
                            className={
                                isClickable
                                    ? "cursor-pointer text-blue-600 hover:underline"
                                    : "text-gray-400 cursor-not-allowed"
                            }
                            onClick={() => {
                                if (!isClickable) return;
                                onOpenModal("Parking", "Total Parking", "", data.TotalParking || 0, data)
                            }}
                        >
                            {value ?? "0"}
                        </span>
                    );
                }
            },
            {
                key: "Parking",
                label: "Parking",
                align: "center",
                children: [
                    {
                        key: "AvailableParking",
                        label: "Available",
                        align: "center",
                        render: (value: number, data: any) => {

                            const isClickable = canParkingAction && (value ?? 0) > 0;

                            return (
                                <span
                                    className={
                                        isClickable
                                            ? "cursor-pointer text-blue-600 hover:underline"
                                            : "text-gray-400 cursor-not-allowed"
                                    }
                                    onClick={() => {
                                        if (!isClickable) return;
                                        onOpenModal("Parking", "Available Parking", "Available", data.AvailableParking || 0, data)
                                    }}
                                >
                                    {value ?? "0"}
                                </span>
                            );
                        }
                    },
                    {
                        key: "BlockedParking",
                        label: "Blocked",
                        align: "center",
                        render: (value: number, data: any) => {

                            const isClickable = canParkingAction && (value ?? 0) > 0;

                            return (
                                <span
                                    className={
                                        isClickable
                                            ? "cursor-pointer text-blue-600 hover:underline"
                                            : "text-gray-400 cursor-not-allowed"
                                    }
                                    onClick={() => {
                                        if (!isClickable) return;
                                        onOpenModal("Parking", "Blocked Parking", "Blocked", data.BlockedParking || 0, data)
                                    }}
                                >
                                    {value ?? "0"}
                                </span>
                            );
                        }
                    },
                    {
                        key: "HoldParking",
                        label: "Hold",
                        align: "center",
                        render: (value: number, data: any) => {

                            const isClickable = canParkingAction && (value ?? 0) > 0;

                            return (
                                <span
                                    className={
                                        isClickable
                                            ? "cursor-pointer text-blue-600 hover:underline"
                                            : "text-gray-400 cursor-not-allowed"
                                    }
                                    onClick={() => {
                                        if (!isClickable) return;
                                        onOpenModal("Parking", "Hold Parking", "Hold", data.HoldParking || 0, data)
                                    }}
                                >
                                    {value ?? "0"}
                                </span>
                            );
                        }
                    },
                    {
                        key: "BookedParking",
                        label: "Booked",
                        align: "center",
                        render: (value: number, data: any) => {

                            const isClickable = canParkingAction && (value ?? 0) > 0;

                            return (
                                <span
                                    className={
                                        isClickable
                                            ? "cursor-pointer text-blue-600 hover:underline"
                                            : "text-gray-400 cursor-not-allowed"
                                    }
                                    onClick={() => {
                                        if (!isClickable) return;
                                        onOpenModal("Parking", "Booked Parking", "Booked", data.BookedParking || 0, data)
                                    }}
                                >
                                    {value ?? "0"}
                                </span>
                            );
                        }
                    },
                    {
                        key: "MemberParking",
                        label: "Member",
                        align: "center",
                        render: (value: number, data: any) => {

                            const isClickable = canParkingAction && (value ?? 0) > 0;

                            return (
                                <span
                                    className={
                                        isClickable
                                            ? "cursor-pointer text-blue-600 hover:underline"
                                            : "text-gray-400 cursor-not-allowed"
                                    }
                                    onClick={() => {
                                        if (!isClickable) return;
                                        onOpenModal("Parking", "Member Parking", "Member", data.MemberParking || 0, data)
                                    }}
                                >
                                    {value ?? "0"}
                                </span>
                            );
                        }
                    },
                ]
            },
        ],
        []
    );

    return (
        <div className="space-y-3 ">
            <h2 className="text-lg font-semibold text-gray-800 pt-4">
                Wing Details
            </h2>

            <div className="bg-white rounded-xl p-4 h-[290px] md:h-[290px] shadow-sm flex flex-col">
                <CustomTable
                    data={wingData}
                    columns={wingColumns}
                    emptyMessage="No Wing Data Found"
                    fixedHeight={true}
                    className="flex-1 overflow-y-auto"
                />
            </div>
        </div>
    );
};

export default WingDetails;
