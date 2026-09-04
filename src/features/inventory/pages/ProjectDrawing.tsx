import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader } from "@/core/utils/loader";
import Tabs, { type TabItem } from "@/ui/components/Tab/Tab";
import { runApiWithLoader } from "@/core/utils";
import * as E from "fp-ts/Either";
import useToast from "@/core/hooks/useToast";
import { drawingDocumentService } from "@/features/drawingDocument/services/DrawingDocumentService";
import type { InventoryFlatData } from "../models/InventoryMasterModel";
import type { FilterWithPaginationInventoryDrawingDocument } from "@/features/drawingDocument/models/DrawingDocumentModel";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import type { TableColumn } from "@/ui/components/DataTable/DataTable";
import { DataTableWithHeaderRowDivider } from "@/ui/components/DataTable/DataTableWithHeaderRowDivider";
import ApprovalActions from "@/features/modulesWorkflowApproval/components/ApprovalActionsButton";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { getDocumentStatusColor } from "@/features/drawingDocument/pages/DrawingDocumentStatus";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import FieldInfoTooltip from "@/ui/components/forms/FieldInfoTooltip";

const ProjectDrawing: React.FC = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const { addToast } = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    const [drawingDocumentList, setDrawingDocumentList] = useState<any[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>("");

    const flatData = (location.state as { flat?: InventoryFlatData; projectId?: number; approvalStatus?: string; })?.flat;

    const projectId = (location.state as { flat?: InventoryFlatData; projectId?: number; approvalStatus?: string; })?.projectId;


    const loadInventoryDrawingDocument = async () => {
        if (!projectId) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,

            async () => {

                const params: FilterWithPaginationInventoryDrawingDocument = {
                    ProjectId: Number(projectId),
                    InventoryFloorId: Number((flatData as any)?.InventoryFloorId || 0),
                    Floor: flatData?.Floor || "",
                };

                const response = await drawingDocumentService.apiCallPullInventoryDrawingDocument(params);

                if (E.isRight(response)) {

                    const data = Array.isArray(response.right?.Data) ? response.right.Data : [];

                    setDrawingDocumentList(data);

                    if (data.length > 0) {

                        const firstCategory = data.find((x: any) => x.DrawingDocumentCategory)?.DrawingDocumentCategory || "";

                        setActiveCategory(firstCategory);

                    } else {
                        setActiveCategory("");
                    }

                } else {

                    setDrawingDocumentList([]);
                    setActiveCategory("");

                    addToast({ type: "error", title: response.left?.message });
                }

                return response;
            },

            undefined,

            (error: any) => {
                addToast({ type: "error", title: error.message, });
            },

            undefined,

            "Loading Drawing Documents"
        );
    };

    useEffect(() => {
        loadInventoryDrawingDocument();

    }, [projectId, flatData?.Floor]);


    const drawingCategoryTabs = useMemo<TabItem[]>(() => {

        const categories = Array.from(new Set(drawingDocumentList.map((item: any) => item.DrawingDocumentCategory).filter(Boolean)));

        return categories.map((category) => {

            const count = drawingDocumentList.filter((item: any) => String(item.DrawingDocumentCategory).toUpperCase() === String(category).toUpperCase()).length;

            return {
                id: String(category),
                label: String(category),
                count: count,
            };
        });

    }, [drawingDocumentList]);

    const activeCategoryDocuments = useMemo(() => {

        if (!activeCategory) {
            return [];
        }

        return drawingDocumentList.filter((item: any) => String(item.DrawingDocumentCategory).toUpperCase() === String(activeCategory).toUpperCase());

    }, [drawingDocumentList, activeCategory]);

    const drawingColumns: TableColumn[] = [
        {
            key: "DrawingDocumentName",
            label: "Drawing Name",
            width: "30",
            sortable: false,
            align: "left",
            fixed: "left",
            render: (value) => (
                <span className="text-sm font-medium text-gray-800">
                    {value ? String(value).split("~")[0].trim() : "-"}
                </span>
            ),
        },

        {
            key: "DrawingDocumentURL",
            label: "Type",
            width: "20",
            sortable: false,
            align: "left",
            render: (value, row) => (
                <div className="flex items-center gap-2">

                    {value && (

                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                            PDF <MultiImageViewer
                                images={parseDocumentUrls(value)}
                                title={`PDF Document: ${row.DrawingDocumentName || "-"}`}
                                isIcon={false}
                                triggerLabel="PDF"
                            />
                        </span>
                    )}

                    {row.DrawingDocumentDWGURL && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
                            DWG <MultiImageViewer
                                images={parseDocumentUrls(row.DrawingDocumentDWGURL)}
                                title={`DWG Document: ${row.DrawingDocumentName || "-"}`}
                                isIcon={false}
                                triggerLabel="DWG"
                            />
                        </span>
                    )}

                </div>
            ),
        },

        {
            key: "DrawingDocumentName",
            label: "Version",
            width: "15",
            sortable: false,
            align: "left",
            render: (value) => (
                <span className="text-sm font-medium text-gray-800">
                    {value ? String(value).split("~")[1].trim() : "-"}
                </span>
            ),
        },

        {
            key: "DrawingDocumentRevisionDate",
            label: "Revision Date",
            width: "15",
            sortable: false,
            align: "left",
            render: (value) => (value ? formatDate_dd_MonthName_yy(value) : "-"),
        },
        {
            key: "DrawingDocumentStatus",
            label: "Status",
            width: "15",
            sortable: false,
            align: "left",
            render: (value) => {
                const statusClass = getDocumentStatusColor(value);

                return (
                    <TooltipText
                        text={value || "-"}
                        maxWidth="220px"
                        tooltipThreshold={27}
                        isApplyBgTextColor
                        tooltipClassName={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusClass} overflow-hidden text-ellipsis whitespace-nowrap`}
                    />
                );
            },
        },
        {
            key: "DrawingDocumentRemark",
            label: "Remark",
            width: "18",
            sortable: false,
            align: "center",
            render: (value) => (

                <FieldInfoTooltip value={value} />
            )
        },

        {
            key: "ApprovalStatus",
            label: "Approval Status",
            width: "18",
            sortable: false,
            align: "center",
            render: (value, row) => (

                <ApprovalActions
                    approvalStatus={value || "-"}
                    showApproval={row.IsApproval}
                    isIcons={true}
                />

            )
        },
        {
            key: "ModifiedBy",
            label: "Last Modified By",
            width: "15",
            sortable: false,
            align: "left",
            render: (value, row) => <TooltipText text={value || row.CreatedBy || "-"} maxWidth="180px" tooltipThreshold={18} />,
        },
        {
            key: "ModifiedDate",
            label: "Last Modified Date",
            width: "15",
            sortable: false,
            align: "left",
            render: (value, row) =>
                value ? formatDate_dd_MonthName_yy(value) : row.CreatedDate ? formatDate_dd_MonthName_yy(row.CreatedDate) : "-",
        },
    ];


    return (
        <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage} > <div></div>  </Loader>


            <HeaderActionBar
                titleText={`Project Drawing Details : ${flatData?.BuildingNumber || "-"} :`}
                subTitleText={flatData?.Wing}
                subSubSubTitleText={flatData?.Floor}
                cancelText="Cancel"
                onCancel={() => {
                    navigate(-1);
                }}
                EditText="Edit"
                isLoading={isLoading}
            />
            
            <div className="flex gap-5 items-start pt-5">

                {drawingCategoryTabs.length > 0 && (
                    <div className="w-100 shrink-0 flex flex-col gap-2 bg-white">

                        <div className="px-7 py-4">
                            <h2 className="text-[15px] font-semibold text-slate-800">
                                Drawing Category
                            </h2>
                        </div>

                        <div className="pr-3 pl-3">

                            <Tabs
                                tabs={drawingCategoryTabs}
                                defaultActive={activeCategory}
                                isvertical
                                onTabChange={(tab) => {
                                    setActiveCategory(tab.id);
                                }}
                            />

                        </div>
                    </div>
                )}

                <div className="flex-1 min-w-0 border border-gray-200 rounded-lg overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-[15px] font-semibold text-slate-800">
                            Latest Drawing
                        </h2>
                    </div>

                    <DataTableWithHeaderRowDivider
                        columns={drawingColumns}
                        data={activeCategoryDocuments}
                        emptyMessage="No Drawing Documents Found"
                        fixedHeight={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProjectDrawing;