import useToast from "@/core/hooks/useToast";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FilterWithPaginationStockManagementHistoryRequest, StockManagementRequestHistoryData } from "@/features/stockManagement/models/StockManagementModel";
import { stockManagementService } from "@/features/stockManagement/services/StockManagementService";
import { runApiWithLoader } from "@/core/utils";
import * as E from 'fp-ts/Either';
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { Loader } from "@/core/utils/loader";
import { useStockManagementListState } from "@/features/stockManagement/context/StockManagementListStateContext";
import { useParams } from "react-router-dom";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import usePagination from "@/core/hooks/usePagination";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { Button } from "@/ui/components/forms/Button";
import { Modal } from "@/ui/components/Modal/Modal";


interface MaterialUsageForm {
    unusedQuantity: string;
}

interface MaterialUsageFormErrors {
    unusedQuantity?: string;
}

export const MaterialOut: React.FC = () => {
    const [materialOutList, setMaterialOutList] = useState<StockManagementRequestHistoryData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [selectedMaterialOut, setSelectedMaterialOut] = useState<StockManagementRequestHistoryData | null>(null);
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

    const openUsageModal = useCallback((row: StockManagementRequestHistoryData) => {
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
            errors.unusedQuantity = 'Unused quantity is required';
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
            addToast({
                type: 'error',
                title: 'No material selected'
            });
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
                    addToast({
                        type: 'error',
                        title: response.left.message
                    });
                    return response;
                }

                return response;
            },
            undefined,
            (error: unknown) => {
                const message = error instanceof Error ? error.message : 'Unable to save usage';
                addToast({
                    type: 'error',
                    title: message
                });
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
                key: 'UsedMaterial',
                label: 'Used Material',
                width: '10',
                sortable: false,
                align: 'left',
                render: (value) => value || '-'
            },
            {
                key: 'UnUsedMaterial',
                label: 'UnUsed Material',
                width: '10',
                sortable: false,
                align: 'left',
                render: (value) => value || '-'
            },
            {
                key: 'Reason',
                label: 'Remark',
                width: '30',
                sortable: false,
                fixed: 'left',
                align: 'left',
                render: (value) => (
                    <TooltipText
                        text={value || '-'}
                        maxWidth='250px'
                        tooltipThreshold={25}
                    />
                ),
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
                    SortBy: getSortByParam(sort ?? null, MaterialOutColumn)
                };

                const response = await stockManagementService.apiCallPullStockManagementHistory(params);

                if (E.isRight(response)) {
                    const filteredData = response.right.Data.filter((item) => item.InwardOutwardType === 'OUTWARD');
                    setMaterialOutList(filteredData);
                    setPagination({
                        currentPage: page,
                        totalRecords: filteredData.length,
                        totalPages: Math.ceil(filteredData.length / pagination.pageSize),
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
        [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange],
    );

    const MaterialOutForTable = useMemo(() => materialOutList, [materialOutList]);

    return (
        <div>
            <Loader loading={isLoading} title={loadingMessage}> {" "} <div></div>{" "}</Loader>

            <DataTable
                data={MaterialOutForTable}
                columns={MaterialOutColumn}
                pagination={MaterialOutPaginationInfo}
                emptyMessage="No Material Out Data found"
                fixedHeight
                recordsPerPage={20}
                className="flex-1"
            />
            {isUsageModalOpen && (
                <Modal
                    isOpen={isUsageModalOpen}
                    onClose={closeUsageModal}
                    title="Material Usage"
                    size="sm"
                >
                    <div className="space-y-4 p-1">

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Total Quantity</label>

                            <div className="rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700">
                                {totalQty} {uomCode}
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Unused Quantity
                                <span className="ml-1 text-red-500">*</span>
                            </label>

                            <div className="relative">
                                <input
                                    type="number"
                                    min={0}
                                    max={totalQty}
                                    placeholder="Enter unused quantity"
                                    value={usageForm.unusedQuantity}
                                    onChange={(e) => {
                                        setUsageForm({
                                            unusedQuantity: e.target.value,
                                        });

                                        if (usageErrors.unusedQuantity) {
                                            setUsageErrors((er) => ({
                                                ...er,
                                                unusedQuantity: undefined,
                                            }));
                                        }
                                    }}
                                    className={`w-full rounded-md border px-3 py-2 pr-14 text-sm focus:outline-none ${usageErrors.unusedQuantity
                                        ? "border-red-400"
                                        : "border-gray-300 focus:border-blue-400"
                                        }`}
                                />

                                {uomCode && (
                                    <span className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500">
                                        {uomCode}
                                    </span>
                                )}
                            </div>

                            {usageErrors.unusedQuantity && (
                                <p className="mt-1 text-xs text-red-500">
                                    {usageErrors.unusedQuantity}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Used Quantity
                            </label>

                            <div className="rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700">
                                {usedQty < 0 ? 0 : usedQty} {uomCode}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">

                            <Button
                                type="button"
                                color="gray"
                                onClick={closeUsageModal}
                                disabled={isSavingUsage}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="button"
                                color="blue"
                                onClick={handleSaveUsage}
                                disabled={isSavingUsage}
                            >
                                {isSavingUsage
                                    ? "Saving..."
                                    : "Save"}
                            </Button>

                        </div>
                    </div>
                </Modal>
            )}
        </div>

    )
}
export default MaterialOut;