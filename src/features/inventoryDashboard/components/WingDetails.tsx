import React, { useMemo } from "react";
import type { Table4 } from "@/features/inventoryDashboard/models/InventoryDashboardModel";
import { CustomTable } from "@/ui/components/DataTable/CustomTable";

interface Props {
    wingData: Table4[];
}

const WingDetails: React.FC<Props> = ({ wingData }) => {
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
                label: "Units",
                align: "center",
                render: (value: any) => (
                    <span className="font-medium text-black">
                        {(Number(value || 0))}
                    </span>
                )
            },
            {
                key: "Flats",
                label: "Flats",
                align: "center",
                children: [
                    { key: "AvailableFlats", label: "Available", align: "center", render: (v: number) => v || 0 },
                    { key: "BlockedFlats", label: "Blocked", align: "center", render: (v: number) => v || 0 },
                    { key: "HoldFlats", label: "Hold", align: "center", render: (v: number) => v || 0 },
                    { key: "AllotedFlats", label: "Alloted", align: "center", render: (v: number) => v || 0 },
                    { key: "BookedFlats", label: "Booked", align: "center", render: (v: number) => v || 0 },

                ]
            },
            {
                key: "TotalParking",
                label: "Total Parking",
                align: "center",
                render: (value: any) => (
                    <span className="font-medium text-black">
                        {(Number(value || 0))}
                    </span>
                )
            },
            {
                key: "Parking",
                label: "Parking",
                align: "center",
                children: [
                    { key: "AvailableParking", label: "Available", align: "center", render: (v: number) => v || 0 },
                    { key: "BlockedParking", label: "Blocked", align: "center", render: (v: number) => v || 0 },
                    { key: "HoldParking", label: "Hold", align: "center", render: (v: number) => v || 0 },
                    { key: "BookedParking", label: "Booked", align: "center", render: (v: number) => v || 0 },
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
