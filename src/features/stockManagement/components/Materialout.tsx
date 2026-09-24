import useToast from "@/core/hooks/useToast";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FilterWithPaginationStockManagementHistoryRequest, StockManagementHistoryData } from "@/features/stockManagement/models/StockManagementModel";
import { stockManagementService } from "@/features/stockManagement/services/StockManagementService";
import { runApiWithLoader } from "@/core/utils";
import * as E from 'fp-ts/Either';
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { Loader } from "@/core/utils/loader";
import { useStockManagementListState } from "@/features/stockManagement/context/StockManagementListStateContext";
import { useParams } from "react-router-dom";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import usePagination from "@/core/hooks/usePagination";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { Button } from "@/ui/components/forms/Button";
import { Modal } from "@/ui/components/Modal/Modal";
import { Input } from "@/ui/components/forms";
import FieldInfoTooltip from "@/ui/components/forms/FieldInfoTooltip";

interface MaterialUsageForm {
    unusedQuantity: string;
}

interface MaterialUsageFormErrors {
    unusedQuantity?: string;
}

export const MaterialOut: React.FC = () => {

    const [materialOutList, setMaterialOutList] = useState<StockManagementHistoryData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [selectedMaterialOut, setSelectedMaterialOut] = useState<StockManagementHistoryData | null>(null);
    const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
    const [usageForm, setUsageForm] = useState<MaterialUsageForm>({ unusedQuantity: '' });
    const [usageErrors, setUsageErrors] = useState<MaterialUsageFormErrors>({});
    const [isSavingUsage, setIsSavingUsage] = useState(false);
    const { addToast } = useToast();
    const { projectId } = useProject();
    const { pagination, setPagination } = usePagination(20);
    const { SubMaterialMasterId } = useParams<{ SubMaterialMasterId?: string }>();
    const { listState } = useStockManagementListState();
    const currentSubMaterialMasterId = SubMaterialMasterId ? Number(SubMaterialMasterId) : listState.SubMaterialMasterId;

    const totalQty = Number(selectedMaterialOut?.MaterialQuantityInwardOutward ?? 0);
    const uomCode = selectedMaterialOut?.UomCode ?? '';
    const usedQty = totalQty - Number(usageForm.unusedQuantity ?? 0);

    const openUsageModal = useCallback((row: StockManagementHistoryData) => {
        setSelectedMaterialOut(row);
        setUsageForm({ unusedQuantity: '' });
        setUsageErrors({});
        setIsUsageModalOpen(true);
    }, []);

    const closeUsageModal = useCallback(() => {
        setIsUsageModalOpen(false);
        setSelectedMaterialOut(null);
        setUsageForm({ unusedQuantity: '' });
        setUsageErrors({});
    }, []);

    const validateUsageForm = (): boolean => {
        const errors: MaterialUsageFormErrors = {};
        const quantity = Number(usageForm.unusedQuantity ?? '');

        if (usageForm.unusedQuantity.trim() === '') {
            errors.unusedQuantity = ' Scrap Quantity is required';
        } else if (Number.isNaN(quantity)) {
            errors.unusedQuantity = 'Enter a valid number';
        } else if (quantity < 0) {
            errors.unusedQuantity = 'Unused quantity cannot be negative';
        } else if (quantity > totalQty) {
            errors.unusedQuantity = 'Unused quantity cannot exceed total quantity';
        }

        setUsageErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveUsage = async () => {

        if (!selectedMaterialOut) {
            addToast({ type: 'error', title: 'No material selected' });
            return;
        }

        if (!validateUsageForm()) {
            return;
        }
        await runApiWithLoader(
            setIsSavingUsage,
            setLoadingMessage,
            async () => {
                const payload = {
                    ProjectId: Number(projectId),
                    MaterialRequisitionGRNStockId: selectedMaterialOut.MaterialRequisitionGRNStockId ?? 0,
                    SubMaterialMasterId: selectedMaterialOut.SubMaterialMasterId ?? 0,
                    TotalQuantity: totalQty,
                    UnusedQuantity: Number(usageForm.unusedQuantity),
                    UsedQuantity: totalQty - Number(usageForm.unusedQuantity),
                };

                const response = await stockManagementService.apiCallAddUpdateStockManagementUsage(payload);

                if (E.isRight(response)) {

                    addToast({ type: 'success', title: response.right.SuccessMessage?.[0] ?? 'Material usage saved successfully' });

                    closeUsageModal();

                    loadMaterialOutData(pagination.currentPage);
                } else {
                    addToast({ type: 'error', title: response.left.message });

                    return response;
                }

                return response;
            },
            undefined,
            (error: unknown) => {
                const message = error instanceof Error ? error.message : 'Unable to save usage';
                addToast({ type: 'error', title: message });
            },
            undefined,
            'Save Material Usage'
        );
    };

    const MaterialOutColumn = useMemo<TableColumn[]>(
        () => [
            {
                key: 'MaterialQuantityInwardOutward',
                label: 'Material Out',
                width: '10',
                sortable: false,
                align: 'left',
                render: (value, row) => {
                    if (!value) return '-';
                    const isInward = row.InwardOutwardType === 'INWARD';
                    return (
                        <span className={isInward ? 'text-green-600' : 'text-red-600'}>
                            {isInward ? '+' : '-'}{value} {row.UomCode}
                        </span>
                    );
                },
            },
            {
                key: "PartyName",
                label: 'Receiver Name',
                width: "20",
                sortable: false,
                align: "left",
                render: (value) => value || "-"
            },
            {
                key: 'UsedMaterial',
                label: 'Used Material',
                width: '10',
                sortable: false,
                align: 'left',
                 render: (value :any, row :any) => (value != null ? `${value} ${row.UomCode || ""}`.trim() : "-"),
            },
            {
                key: 'UnUsedMaterial',
                label: 'Scrap Quantity',
                width: '10',
                sortable: false,
                align: 'left',
                 render: (value :any, row :any) => (value != null ? `${value} ${row.UomCode || ""}`.trim() : "-"),
            },
            {
                key: 'Reason',
                label: 'Remark',
                width: '30',
                sortable: false,
                fixed: 'left',
                align: 'left',
                render: (value) => (
                <FieldInfoTooltip value={value} />
            )
            },
            {
                key: 'CreatedBy',
                label: 'Created By',
                width: '20',
                sortable: false,
                align: 'left',
                render: (value) => value || '-'
            },
            {
                key: 'CreatedDate',
                label: 'Created Date',
                width: '10',
                sortable: false,
                align: 'left',
                render: (value?: string) => (value ? formatDate_dd_MonthName_yy(value) : '-')
            },
            {
                key: 'Actions',
                label: 'Actions',
                width: '10',
                sortable: false,
                align: 'left',
                render: (_value, row) => (
                    <Button
                        type='button'
                        color='blue'
                        size='sm'
                        disabled={Number(row.UsedMaterial ?? 0) > 0}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openUsageModal(row);
                        }}
                    >
                        Material Usage
                    </Button>
                )
            }
        ], [openUsageModal]);

    const loadMaterialOutData = useCallback(async (page: number = pagination.currentPage, sort?: SortInfo) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationStockManagementHistoryRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    SubMaterialMasterId: currentSubMaterialMasterId,
                    type: "OUTWARD",
                    SortBy: getSortByParam(sort ?? null, MaterialOutColumn)
                };

                const response = await stockManagementService.apiCallPullStockManagementHistory(params);

                if (E.isRight(response)) {
                    const filteredData = response.right.Data.filter((item) => item.InwardOutwardType === 'OUTWARD');
                    setMaterialOutList(filteredData);
                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
                    });
                } else {
                    addToast({ type: 'error', title: response.left.message });
                    return response;
                }
            },
            undefined,
            (error: unknown) => {
                const message = error instanceof Error ? error.message : 'Unexpected error';
                addToast({ type: 'error', title: message });
            },
            undefined,
            'Loading Stocks History'
        );
    }, [addToast, currentSubMaterialMasterId, pagination.currentPage, pagination.pageSize, projectId, MaterialOutColumn, setPagination]);

    useEffect(() => {
        if (!projectId) return
        loadMaterialOutData();
    }, [projectId])

    const handlePageChange = useCallback((page: number) => {
        setPagination({ currentPage: page });
        loadMaterialOutData(page);
    }, [loadMaterialOutData, setPagination]);

    const MaterialOutPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange,
        }),
        [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange],);

    const MaterialOutForTable = useMemo(() => materialOutList, [materialOutList]);

    return (
        <div className="pt-5">
            <Loader loading={isLoading} title={loadingMessage}> {" "} <div></div>{" "}</Loader>

            <DataTable
                data={MaterialOutForTable}
                columns={MaterialOutColumn}
                pagination={MaterialOutPaginationInfo}
                emptyMessage="No Material Issued Data found"
                fixedHeight
                recordsPerPage={20}
                className="flex-1"
            />

            {isUsageModalOpen && (
                <Modal
                    isOpen={isUsageModalOpen}
                    onClose={closeUsageModal}
                    onCancel={closeUsageModal}
                    title="Material Usage"
                    size="sm"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveUsage();
                    }}

                    saveText="Save"
                    loading={isSavingUsage}
                >
                    <div className="space-y-10 p-6 bg-blue-100">
                        <div className="space-y-4">
                            <div>
                                <Input
                                    label="Total Quantity"
                                    value={`${totalQty} ${uomCode}`}
                                    disabled
                                />
                            </div>

                            <div>
                                <Input
                                    label="Used Quantity"
                                    value={`${usedQty < 0 ? 0 : usedQty} ${uomCode}`}
                                    disabled
                                />
                            </div>

                            <div>
                                <Input
                                    label="Scrap Quantity"
                                    max={totalQty}
                                    required
                                    placeholder="Enter Scrap Quantity "
                                    value={usageForm.unusedQuantity}
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        if (value === "") {
                                            setUsageForm({
                                                unusedQuantity: "",
                                            });
                                            return;
                                        }

                                        const quantity = Number(value);

                                        if (quantity > Number(totalQty)) {
                                            
                                            return;
                                        }

                                        setUsageForm({
                                            unusedQuantity: value,
                                        });

                                        if (usageErrors.unusedQuantity) {
                                            setUsageErrors((er) => ({
                                                ...er,
                                                unusedQuantity: undefined,
                                            }));
                                        }
                                    }}
                                    rightIcon={uomCode}
                                    error={usageErrors.unusedQuantity}
                                />
                            </div>

                        </div>
                    </div>
                </Modal>
            )}
        </div>

    )
}
export default MaterialOut;