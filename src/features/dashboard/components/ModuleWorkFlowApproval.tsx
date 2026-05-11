import { useState } from "react";
import { Modal } from "@/ui/components/Modal/Modal";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import { DataTableWithOutBorder } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { Box, Building2, Car, ClipboardCheck, FileText, Folder } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/ui/components/forms";

interface Props {
    moduleApproval: any[];
}

const ModuleWorkFlowApproval = ({ moduleApproval }: Props) => {

    const navigate = useNavigate();

    const [selectedModule, setSelectedModule] = useState<any>(null);

    // GROUPING
    const groupedData = moduleApproval.reduce((acc: any, item: any) => {
        const key = item.ModuleName || "Unknown";
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});

    const moduleSummary = Object.keys(groupedData).map((key) => ({
        moduleName: key,
        count: groupedData[key].length,
        data: groupedData[key]
    }));


    const getColumnsByModule = (moduleName: string) => {

        const renderText = (value: string) => (
            <span className="font-medium text-black">{value || ''}</span>
        );


        switch (moduleName) {

            // ✅ INVENTORY
            case "Inventory":
                return [
                    { key: "ProjectName", label: "Project", render: renderText },
                    { key: "BuildingNumber", label: "Building", render: renderText },
                    { key: "Wing", label: "Wing", render: renderText },

                ];

            // ✅ PARKING
            case "Parking":
                return [
                    { key: "ProjectName", label: "Project", render: renderText },
                    { key: "BuildingNumber", label: "Building", render: renderText },
                    { key: "Wing", label: "Wing", render: renderText },
                    { key: "Floor", label: "Floor", render: renderText },

                ];

            // ✅ BOOKING
            case "Booking":
                return [
                    { key: "ProjectName", label: "Project", render: renderText },
                    { key: "Flat", label: "Flat", render: renderText },
                    { key: "ApplicantName", label: "Applicant", render: renderText },

                ];

            // ✅ DOCUMENT / RERA / APPROVAL DOCUMENT
            case "Document":
            case "RERA Document":
            case "Approval Document":
                return [
                    { key: "ProjectName", label: "Project", render: renderText },
                    { key: "ProjectDocumentName", label: "Document", render: renderText },
                    { key: "ProjectDocumentCategory", label: "Category", render: renderText },

                ];

            // ✅ DEFAULT FALLBACK
            default:
                return [
                    { key: "ProjectName", label: "Project", render: renderText }
                ];
        }
    };



    // ICON MAP
    const moduleIconMap: any = {
        "Inventory": {
            icon: Box,
            bg: "#EFF6FF",
            color: "#2563EB"
        },
        "Parking": {
            icon: Car,
            bg: "#ECFDF5",
            color: "#059669"
        },
        "Booking": {
            icon: ClipboardCheck,
            bg: "#FEF3C7",
            color: "#D97706"
        },
        "Document": {
            icon: FileText,
            bg: "#F3E8FF",
            color: "#7C3AED"
        },
        "RERA Document": {
            icon: Building2,
            bg: "#E0F2FE",
            color: "#0284C7"
        },
        "Approval Document": {
            icon: Folder,
            bg: "#FDF4FF",
            color: "#A21CAF"
        }
    };

    return (
        <div className="space-y-3 pt-7">
            <div
                className="bg-white rounded-xl p-5 mt-5 flex flex-col border border-gray-100 h-[330px]"
                style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
            >

                <p className="text-md font-semibold text-gray-500 pb-3">
                    Pending Approvals
                </p>

                {/* GRID */}
                {moduleSummary.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto pr-1">

                        {moduleSummary.map((item, index) => {

                            const config = moduleIconMap[item.moduleName] || {
                                icon: Box,
                                bg: "#F3F4F6",
                                color: "#6B7280"
                            };

                            const IconComponent = config.icon;

                            return (
                                <div
                                    key={index}
                                    onClick={() => setSelectedModule(item)}
                                    className="bg-white rounded-2xl p-4 border border-gray-100 cursor-pointer hover:shadow-md transition"
                                    style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
                                >
                                    <div className="flex items-start gap-3">

                                        <div
                                            className="p-3 rounded-xl"
                                            style={{ backgroundColor: config.bg }}
                                        >
                                            <IconComponent size={20} style={{ color: config.color }} />
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-500">
                                                {item.moduleName}
                                            </p>
                                            <p className="text-2xl font-semibold text-gray-900">
                                                {item.count}
                                            </p>
                                        </div>

                                    </div>
                                </div>
                            );
                        })}

                    </div>
                ) : (
                    <div className="flex flex-1 items-center justify-center">
                        <NoDataView message="No module approval data" />
                    </div>
                )}
            </div>

            {/* MODAL */}
            <Modal
                isOpen={!!selectedModule}
                onClose={() => setSelectedModule(null)}
                title={
                    <div className="flex items-center justify-between-r w-full gap-1">
                        <span className="font-semibold text-gray-800">
                            {selectedModule?.moduleName || "Details"}
                        </span>

                        <Button
                            onClick={() => navigate(selectedModule?.data?.[0]?.ModulePath)}
                            type="button"
                            color="transparent"
                            variant="transparent_border_background"
                            size="sm">
                            View
                        </Button>
                    </div>
                }
                size="xl"
            >
                {selectedModule?.data?.length > 0 ? (
                    <DataTableWithOutBorder
                        data={selectedModule.data}
                        columns={getColumnsByModule(selectedModule?.moduleName)}
                        recordsPerPage={5}
                        fixedHeight
                    />
                ) : (
                    <NoDataView message="No data found" />
                )}
            </Modal>
        </div>
    );
};

export default ModuleWorkFlowApproval;