import useToast from "@/core/hooks/useToast";
import { runApiWithLoader } from "@/core/utils";
import { useEffect, useMemo, useState } from "react";
import * as E from 'fp-ts/Either';
import { userModuleApprovalDashboardServices } from "@/features/dashboard/services/UserModuleApprovalService";
import type { FilterWithPaginationUserApprovalRequest, UserApprovalDashboardData } from "@/features/dashboard/models/UserApprovalModel";
import { Loader } from "@/core/utils/loader";
import { Tabs, type TabItem } from "@/ui/components/Tab/Tab";
import { DataTableWithHeaderRowDivider } from "@/ui/components/DataTable/DataTableWithHeaderRowDivider";
import type { TableColumn } from "@/ui/components/DataTable/DataTable";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useNavigate } from "react-router-dom";
import { Download } from "lucide-react";
import { handleExportFile } from "@/core/utils/exportFile";
import { useViewportHeight } from "@/core/utils/useViewportHeight";
import TooltipText from "@/ui/components/Tooltip/TooltipText";

const ViewDashboardApprovals: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const { addToast } = useToast();

    const [moduleApprovalList, setModuleApprovalList] = useState<UserApprovalDashboardData[]>([]);
    const [activeTab, setActiveTab] = useState<string>("");

    const tableHeight = useViewportHeight(200, 350, 900);

    const navigate = useNavigate();

    useEffect(() => {
        loadUserModuleApprovalData();
    }, []);

    //#region DATA LOADING | FETCH 
    const loadUserModuleApprovalData = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const response = await userModuleApprovalDashboardServices.apiCallPullUserModuleApproval();

                if (E.isRight(response)) {
                    const list = response.right.Data || [];
                    setModuleApprovalList(list);

                    const firstModule = list.find((item: any) => item?.ModuleName)?.ModuleName;
                    if (firstModule) {
                        setActiveTab(firstModule);
                    }
                } else {
                    addToast({ type: 'error', title: response.left.message });
                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Loading User Module Approvals'
        );
    };
    //#endregion

    const moduleCategoryTabs = useMemo<TabItem[]>(() => {
        const categoryMap = new Map<string, { label: string; count: number }>();

        for (const item of moduleApprovalList) {
            const rawModule = item?.ModuleName;
            if (!rawModule) continue;

            const normalizedKey = String(rawModule).trim().toUpperCase();
            const existing = categoryMap.get(normalizedKey);

            if (existing) {
                existing.count += 1;
            } else {
                categoryMap.set(normalizedKey, {
                    label: String(rawModule).trim(),
                    count: 1,
                });
            }
        }

        return Array.from(categoryMap.values()).map((data) => ({
            id: data.label,
            label: data.label,
            count: data.count,
        }));
    }, [moduleApprovalList]);

    //#region FILTERED DATA
    const activeModuleDocuments = useMemo(() => {
        if (!activeTab) return [];

        const target = String(activeTab).trim().toUpperCase();

        return moduleApprovalList.filter(
            (item: any) => String(item?.ModuleName).trim().toUpperCase() === target
        );
    }, [moduleApprovalList, activeTab]);
    //#endregion

    //#region DYNAMIC COLUMNS PER MODULE
    const getColumnsByModule = (moduleName: string): TableColumn[] => {
        const renderText = (value: any) => (
            <span className="font-medium text-black">
                {value ? String(value).split("~")[0].trim() : "-"}
            </span>
        );

        switch (moduleName) {
            // INVENTORY
            case "Inventory":
                return [
                     {
                        key: "ProjectName", label: "Project", render: (value) => (
                            <TooltipText
                                text={value || ""}
                                tooltipThreshold={25}
                                maxWidth="250px"
                                tooltipClassName="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap"
                            />
                        )
                    },
                    { key: "BuildingNumber", label: "Building", render: renderText },
                    { key: "Wing", label: "Wing", render: renderText },
                ];

            // PARKING
            case "Parking":
                return [
                    {
                        key: "ProjectName", label: "Project", render: (value) => (
                            <TooltipText
                                text={value || ""}
                                tooltipThreshold={25}
                                maxWidth="250px"
                                tooltipClassName="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap"
                            />
                        )
                    },
                    { key: "BuildingNumber", label: "Building", render: renderText },
                    { key: "Wing", label: "Wing", render: renderText },
                    { key: "Floor", label: "Floor", render: renderText },
                ];

            // BOOKING & CRM
            case "Booking":
            case "CRM Payment Ledger":
            case "Booking Applicant Modification":
            case "Flat Alteration":
            case "Parking Modification":
            case "Refund Payment Ledger":
            case "Flat Handover":
            case "Cancel Booking":
                return [
                    {
                        key: "ProjectName", label: "Project", render: (value) => (
                            <TooltipText
                                text={value || ""}
                                tooltipThreshold={25}
                                maxWidth="250px"
                                tooltipClassName="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap"
                            />
                        )
                    },
                    { key: "Flat", label: "Flat", render: renderText },
                    { key: "ApplicantName", label: "Applicant", render: renderText },
                ];

            // DOCUMENT / RERA / APPROVAL DOCUMENT
            case "Document":
            case "RERA Document":
            case "Approval Document":
                return [
                    {
                        key: "ProjectName", label: "Project", render: (value) => (
                            <TooltipText
                                text={value || ""}
                                tooltipThreshold={25}
                                maxWidth="250px"
                                tooltipClassName="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap"
                            />
                        )
                    },
                    { key: "ProjectDocumentName", label: "Document", render: renderText },
                    { key: "ProjectDocumentCategory", label: "Category", render: renderText },
                ];

            // BUDGET
            case "Budget":
                return [
                     {
                        key: "ProjectName", label: "Project", render: (value) => (
                            <TooltipText
                                text={value || ""}
                                tooltipThreshold={25}
                                maxWidth="250px"
                                tooltipClassName="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap"
                            />
                        )
                    },
                    { key: "Wing", label: "Wing", render: renderText },
                ];

            // TERM SHEET
            case "Term Sheet":
                return [
                     {
                        key: "ProjectName", label: "Project", render: (value) => (
                            <TooltipText
                                text={value || ""}
                                tooltipThreshold={25}
                                maxWidth="250px"
                                tooltipClassName="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap"
                            />
                        )
                    },
                    { key: "NameOfInstitutionBankNBFC", label: "Name Of Institution / Bank / NBFC", render: renderText },
                ];

            // FINALIZED VENDOR / INVOICE APPROVAL
            case "Finalized Vendor":
            case "Invoice Approval":
                return [
                     {
                        key: "ProjectName", label: "Project", render: (value) => (
                            <TooltipText
                                text={value || ""}
                                tooltipThreshold={25}
                                maxWidth="250px"
                                tooltipClassName="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap"
                            />
                        )
                    },
                    { key: "SystemGeneratedCode", label: "MR Code", render: renderText },
                ];

            // DEFAULT FALLBACK
            default:
                return [
                     {
                        key: "ProjectName", label: "Project", render: (value) => (
                            <TooltipText
                                text={value || ""}
                                tooltipThreshold={25}
                                maxWidth="250px"
                                tooltipClassName="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap"
                            />
                        )
                    },
                ];
        }
    };

    const dynamicColumns = useMemo<TableColumn[]>(() => {
        return getColumnsByModule(activeTab);
    }, [activeTab]);

    const handleView = () => {
        const selectedModule = moduleApprovalList.find((item) => String(item?.ModuleName).trim().toUpperCase() === String(activeTab).trim().toUpperCase());

        if (selectedModule?.ModulePath) {
            navigate(`/${selectedModule.ModulePath}`);
        } else {
            addToast({ type: "error", title: "Module path not found" });
        }
    };

    const handleExportApprovals = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationUserApprovalRequest = {

                    ExportType: exportType
                };

                const response = await userModuleApprovalDashboardServices.apiCallPullUserModuleApproval(params);

                handleExportFile(response, exportType, 'My Approvals', addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const handleExportApprovalsExcel = () => handleExportApprovals('Excel');
    const handleExportApprovalsPdf = () => handleExportApprovals('PDF');

    return (
        <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-5 overflow-hidden" >
            <Loader loading={isLoading} title={loadingMessage}><div></div></Loader>

            <HeaderActionBar
                titleText={`My Approvals : `}
                subTitleText={activeTab}
                cancelText="Cancel"
                EditText="View"
                canAction={true}
                onEdit={() => {
                    handleView();
                }}
                onCancel={() => {
                    navigate(-1);
                }}
                isLoading={isLoading}
                ExtraButtontitleTextIcon={Download}
                ExtraButtontitleText="Export"
                ExtraButtonText="Export to Excel"
                canActionExtraButtonText={true}
                onExtraButton={handleExportApprovalsExcel}
                ExtraExtraButtonText="Export to PDF"
                canActionExtraExtraButton={true}
                onExtraExtraButton={handleExportApprovalsPdf}
            />

            <div className="flex gap-5 items-start pt-5">
                {moduleCategoryTabs.length > 0 && (
                    <div className="w-100 shrink-0 flex flex-col gap-2 bg-white">
                        <div className="px-7 py-4">
                            <h2 className="text-[15px] font-semibold text-slate-800">
                                Approvals
                            </h2>
                        </div>

                        <div className="pr-3 pl-3">
                            <Tabs
                                tabs={moduleCategoryTabs}
                                defaultActive={activeTab}
                                isvertical
                                onTabChange={(tab) => {
                                    setActiveTab(tab.id);
                                }}
                            />
                        </div>
                    </div>
                )}

                <div className="flex-1 min-w-0 bg-white border border-gray-200 rounded-lg overflow-hidden" style={{ height: `${tableHeight}px` }}>


                    <DataTableWithHeaderRowDivider
                        columns={dynamicColumns}
                        data={activeModuleDocuments}
                        emptyMessage="No Approvals Found"
                        recordsPerPage={20}
                        fixedHeight={true}
                    />

                </div>
            </div>
        </div>
    );
};

export default ViewDashboardApprovals;