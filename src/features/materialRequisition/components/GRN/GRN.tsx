import { runApiWithLoader } from "@/core/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { type MaterialRequisitionGRNData, type FilterWithPaginationMaterialRequisitionGRN, type MaterialRequisitionDetailGRNData } from "@/features/materialRequisition/models/MaterialRequisitionGRNModel";
import { useMaterialRequisitionListState } from "@/features/materialRequisition/context/MaterialRequisitionListStateContext";
import { useNavigate, useParams } from "react-router-dom";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import useToast from "@/core/hooks/useToast";
import { type TableColumn } from "@/ui/components/DataTable/DataTable";
import { materialRequisitionGRNService } from "@/features/materialRequisition/services/MaterialRequisitionGRNService";
import * as E from "fp-ts/Either";
import { Modal } from "@/ui/components/Modal/Modal";
import { DataTableWithOutBorder } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import DataTableExpandable from "@/ui/components/DataTable/DataTableExpandable";
import { Edit } from "lucide-react";
import { Loader } from "@/core/utils/loader";
import { Button } from "@/ui/components/forms";
import NoDataView from "@/ui/components/NoDataView/NoDataView";

export const GRN: React.FC = () => {

    const [loadingMessage, setLoadingMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { projectId } = useProject();
    const { addToast } = useToast();
    const { MaterialRequisitionId: listMaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>();
    const { listState } = useMaterialRequisitionListState();
    const currentMaterialRequisitionId = listMaterialRequisitionId ? Number(listMaterialRequisitionId) : listState.MaterialRequisitionId;
    const currentUniquekey = listState.Uniquekey
    const [, SetGRNData] = useState<MaterialRequisitionDetailGRNData[]>([]);
    const [GRN, SetGRN] = useState<MaterialRequisitionGRNData[]>([]);
    const [isViewGRNSummaryModalOpen, setIsViewGRNSummaryModalOpen] = useState(false);
    const { canAction } = useMenuPermissions();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!projectId) return;
        loadGRNData()
    }, [projectId, currentMaterialRequisitionId])

    const handleAddGRN = useCallback(() => {
        navigate('/grn/add');
    }, [navigate]);

    const filteredGRN = useMemo(() => {
        if (!searchTerm.trim()) return GRN;

        return GRN.filter(item =>
            item.ChallanNumber?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [GRN, searchTerm]);

    const clearSearchGRN = () => {
        setSearchTerm('');
    };

    const handleGRNEdit = useCallback((row: MaterialRequisitionGRNData) => {
        navigate(`/grn/add/${row.MaterialRequisitionId}/${row.MaterialRequisitionGRNId}`);
    }, [navigate]);

    const loadGRNData = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationMaterialRequisitionGRN = {
                    MaterialRequisitionId: currentMaterialRequisitionId,
                    Uniquekey: currentUniquekey,
                    ProjectId: Number(projectId)
                };

                const response = await materialRequisitionGRNService.apiCallPullMaterialRequisitionGRN(params);

                if (E.isRight(response)) {

                    const data = response.right.Data;

                    SetGRN(data)

                    SetGRNData(data?.[0]?.MaterialRequisitionDetailGRNData ?? []);
                } else {
                    addToast({ type: "error", title: response.left.message });
                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: "error", title: error.message });
            },
            undefined,
            "Loading GRN",
        );
    };

    const MaterialRequisitionGRNColumns = useMemo<TableColumn[]>(() =>
        [
            {
                key: 'MaterialName',
                label: 'Material Name',
                width: '20',
                sortable: false,
                align: 'left',
                render: (value?: string) => value || '-'
            },
            {
                key: 'SubMaterialName',
                label: 'Sub Material',
                width: '20',
                sortable: false,
                align: 'left',
                render: (value?: string) => (
                    <TooltipText
                        text={value || '-'}
                        maxWidth="180px"
                        tooltipThreshold={18}
                    />
                )
            },
            {
                key: 'Uom',
                label: 'UOM',
                width: '20',
                sortable: false,
                align: 'left',
                render: (value?: string) => value || '-'
            },
            {
                key: 'MaterialQuantity',
                label: 'Quantity',
                width: '10',
                sortable: false,
                align: 'left',
                render: (value?: string) => value || '-'
            },
            {
                key: 'TotalReceivedMaterialQuantity',
                label: 'Received Quantity',
                width: '10',
                sortable: false,
                align: 'left',
                render: (value?: string) => value || '-'
            },
            {
                key: 'PendingQuantity',
                label: 'Pending Quantity',
                width: '10',
                sortable: false,
                align: 'left',
                render: (_: any, row: MaterialRequisitionDetailGRNData) =>
                    (row.MaterialQuantity || 0) -
                    (row.TotalReceivedMaterialQuantity || 0)
            },
        ], [])

    const GRNColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'CreatedDate',
            label: 'Date',
            width: '30',
            render: (value?: string) => formatDate_dd_MonthName_yy(value || '')
        },
        {
            key: 'ChallanNumber',
            label: 'Challan No.',
            width: '25',
            render: (value?: string) => value || '-'
        },
        {
            key: 'VehicleNumber',
            label: 'Vehicle No.',
            width: '35',
            render: (value?: string) => value || '-'
        },
        {
            key: 'actions',
            label: 'Actions',
            width: '10',
            align: 'center',
            render: (_: any, row: any) => {
                return (
                    <div className="flex items-center justify-center gap-1">
                        {canAction && (
                            <>
                                <Button
                                    type="button"
                                    color="transparent"
                                    size="sm"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleGRNEdit(row);
                                    }}
                                    leftIcon={<Edit className="h-4 w-4" />}
                                />
                            </>
                        )}
                    </div>
                );
            }
        }
    ], [canAction]);

    const MaterialRequisitionDetailColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'MaterialName',
            label: 'Material Name',
            width: '20',
            sortable: false,
            align: 'left',
            render: (value?: string) => value || '-'
        },
        {
            key: 'SubMaterialName',
            label: 'Sub Material',
            width: '20',
            sortable: false,
            align: 'left',
            render: (value?: string) => (
                <TooltipText
                    text={value || '-'}
                    maxWidth="180px"
                    tooltipThreshold={18}
                />
            )
        },
        {
            key: 'MaterialQuantity',
            label: 'Quantity',
            width: '10',
            sortable: false,
            align: 'left',
            render: (value?: string) => value || '-'
        },
        {
            key: 'TotalReceivedMaterialQuantity',
            label: 'Received Quantity',
            width: '10',
            sortable: false,
            align: 'left',
            render: (value?: string) => value || '-'
        },
    ], []);

    return (
        <div className="pt-2">
            <Loader loading={isLoading} title={loadingMessage}> {" "}<div></div>{" "} </Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Challan Number"
                onSearchChange={v => {
                    setSearchTerm(v);
                }}
                onClearSearch={clearSearchGRN}
                isShowAddButton={canAction}
                addTitle="Add GRN"
                onAdd={handleAddGRN}
                isShowAddExtraButton={true}
                addExtraTitle='View Summary'
                onAddExtra={() => {
                    setIsViewGRNSummaryModalOpen(true);
                    loadGRNData();
                }}
                addExtraWidth={150}
            />

            <DataTableExpandable
                data={filteredGRN}
                columns={GRNColumns}
                expandable={{
                    keyField: "MaterialRequisitionGRNId",
                    fetchRow: async (row: MaterialRequisitionGRNData) => {
                        return row?.MaterialRequisitionDetailGRNData ?? [];
                    },

                    renderRow: (fetchedData) => {
                        const materials = Array.isArray(fetchedData) ? fetchedData : [];

                        if (!materials.length) {
                            return <div className="p-2 text-center text-gray-500">No Materials</div>;
                        }

                        return (
                            <DataTableWithOutBorder
                                data={materials}
                                columns={MaterialRequisitionGRNColumns}
                                fixedHeight={true}
                            />
                        );
                    },
                    expandButton: { openText: "Hide", closeText: "Show" }
                }}
            />

            <Modal
                isOpen={isViewGRNSummaryModalOpen}
                onClose={() => {
                    setIsViewGRNSummaryModalOpen(false);
                }}
                onCancel={() => {
                    setIsViewGRNSummaryModalOpen(false);
                }}
                title={'GRN Summary'}
                loading={isLoading}
                cancelText="cancel"
                size="xl"
            >
                <div className="space-y-4">
                    {GRN.length === 0 ? (
                        <div className="flex flex-col justify-center items-center h-full">
                            <NoDataView
                                message="No Data Available"
                            />
                        </div>
                    ) : (
                        <div>
                            {GRN?.map((item, index) => (
                                <div key={index} className="bg-[#EFF6FF] rounded-lg shadow-sm border border-gray-300 p-4"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-3">
                                        <FieldItem label="Date" value={formatDate_dd_MonthName_yy(item?.CreatedDate ?? '')} />
                                        <FieldItem label="Challan No." value={item?.ChallanNumber || '-'} />
                                        <FieldItem label="Vehicle No." value={item?.VehicleNumber || '-'} />

                                        <div>
                                            <p className="text-gray-500">Document</p>
                                            <MultiImageViewer
                                                images={parseDocumentUrls(item?.UploadChallanURL)}
                                                title="Attachment"
                                                isIcon={false}
                                                triggerLabel="-"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 space-y-4 shadow-sm border border-gray-300 h-[220px]">
                                        <DataTableWithOutBorder
                                            columns={MaterialRequisitionDetailColumns}
                                            data={item?.MaterialRequisitionDetailGRNData ?? []}
                                            emptyMessage="No Material Requisition Found"
                                            fixedHeight={true}
                                            recordsPerPage={3}
                                            className="flex-1"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </Modal>

        </div>
    )
}
export default GRN