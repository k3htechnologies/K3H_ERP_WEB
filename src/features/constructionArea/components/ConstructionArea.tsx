import { runApiWithLoader } from "@/core/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ConstructionAreaData, FilterWithPaginationConstructionAreaRequest } from "@/features/constructionArea/models/ConstructionAreaModel";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import usePagination from "@/core/hooks/usePagination";
import { type FilterInfo, type PaginationInfo, type SortInfo } from "@/ui/components/DataTable/DataTable";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import useToast from "@/core/hooks/useToast";
import { handleExportFile } from "@/core/utils/exportFile";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import { updateFilter } from "@/core/utils/filterHelper";
import { Modal } from "@/ui/components/Modal/Modal";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { Loader } from "@/core/utils/loader";
import { constructionAreaService } from "@/features/constructionArea/services/ConstructionAreaService";
import * as E from 'fp-ts/Either';
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { Button, Input } from "@/ui/components/forms";
import type { AddUpdateConstructionAreaRequest } from "@/features/constructionArea/models/ConstructionAreaModel";
import { Edit } from "lucide-react";
import { allowPercentage, filterNumbersWithDecimal } from "@/core/utils/fileValidation";
import DataTableRowSpan, { getRowSpan, type TableRowSpanColumn } from "@/ui/components/DataTable/DataTableRowSpan";
import FieldInfoTooltip from "@/ui/components/forms/FieldInfoTooltip";
import { TextArea } from "@/ui/components/forms/Textarea";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { getFloorStatuscolor } from "@/features/constructionArea/utils/Status";
import TooltipText from "@/ui/components/Tooltip/TooltipText";

export const ConstructionArea: React.FC = () => {

    const initialFormStateForConstructionAreaData = (): AddUpdateConstructionAreaRequest => ({
        ConstructionAreaId: 0,
        Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        ProjectId: 0,
        InventoryFlatId: 0,
        AreaByPLLineSqMt: 0,
        MultiplierForAreaPercentage: 0,
        FloorToFloorHeightMt: 0,
        Remark: "",
    })

    // STATE
    const [ConstructionAreaList, setConstructionAreaDataList] = useState<ConstructionAreaData[]>([]);
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [sortInfo, setSortInfo] = useState<SortInfo>();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isAddUpdateConstructionAreaModalOpen, setIsAddUpdateConstructionAreaModalOpen] = useState(false);
    const [formData, setFormData] = useState<AddUpdateConstructionAreaRequest>(() => initialFormStateForConstructionAreaData());
    const [editingConstructionArea, setEditingConstructionArea] = useState<ConstructionAreaData | null>(null);
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});
    const [filters, setFilters] = useState<FilterInfo>({});
    const { canExport, canAction } = useMenuPermissions();
    const { pagination, setPagination } = usePagination(20);
    const { projectId } = useProject();
    const { addToast } = useToast();
    const [isShowCustomizeConstructionAreaColumnsModal, setIsShowCustomizeConstructionAreaColumnsModal] = useState(false);


    const loadConstructionArea = useCallback(async (page: number = pagination.currentPage, filterParams: FilterInfo, sort?: SortInfo, searchText?: string) => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationConstructionAreaRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    BuildingNumber: filterParams.BuildingNumber ?? undefined,
                    Wing: filterParams.Wing ?? undefined,
                    Floor: searchText ?? filterParams.Floor?.trim() ?? undefined,
                    Flat: filterParams.Flat ?? undefined,
                    FlatType: filterParams.FlatType ?? undefined,
                    FlatConfiguration: filterParams.FlatConfiguration ?? undefined,
                    FlatFacing: filterParams.FlatFacing ?? undefined,
                    FlatStatus: filterParams.FlatStatus ?? undefined,
                    SortBy: getSortByParam(sort ?? null, ConstructionAreaDataColumns),
                    ApprovalStatus: "APPROVED",
                };

                const response = await constructionAreaService.apiCallPullConstructionArea(params);

                if (E.isRight(response)) {
                    setConstructionAreaDataList(response.right.Data);
                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
                    });
                } else {
                    addToast({ type: 'error', title: response.left.message });
                }
            },
            undefined,
            (error: any) =>
                addToast({ type: 'error', title: error.message }),
            undefined,
            'Loading Construction Area Data'
        );
    },
        [projectId, pagination.currentPage, pagination.pageSize, addToast, setPagination,]);

    useEffect(() => {
        if (!projectId) return;

        setPagination({ currentPage: 1 });
        loadConstructionArea(1, filters, sortInfo, searchTerm);
    }, [projectId]);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setPagination({ currentPage: 1 });
        loadConstructionArea(1, filters, sortInfo, value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setPagination({ currentPage: 1 });
        loadConstructionArea(1, filters, sortInfo, '');
    };


    const handlePageChange = (page: number) => {
        setPagination({ currentPage: page });
        loadConstructionArea(page, filters, sortInfo, searchTerm);
    };

    const handleSortColumn = useCallback((sort: SortInfo) => {

        setSortInfo(sort);
        setPagination({ currentPage: 1 });
        loadConstructionArea(1, filters, sort, searchTerm);

    }, [searchTerm]);


    const handleFieldChange = (field: keyof AddUpdateConstructionAreaRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleEditConstructionAreaData = useCallback((row: ConstructionAreaData) => {
        setEditingConstructionArea({
            ...row,
            FloorToFloorHeightMt: row.FloorToFloorHeightMt
        })
        setIsAddUpdateConstructionAreaModalOpen(true);
    }, [])


    useEffect(() => {
        if (isAddUpdateConstructionAreaModalOpen) {
            if (editingConstructionArea) {
                setFormData({
                    ConstructionAreaId: editingConstructionArea.ConstructionAreaId ?? 0,
                    Uniquekey: editingConstructionArea.Uniquekey ?? initialFormStateForConstructionAreaData().Uniquekey,
                    ProjectId: Number(projectId) || 0,
                    InventoryFlatId: editingConstructionArea.InventoryFlatId ?? 0,
                    AreaByPLLineSqMt: editingConstructionArea.AreaByPLLineSqMt ?? 0,
                    MultiplierForAreaPercentage: editingConstructionArea.MultiplierForAreaPercentage ?? 0,
                    FloorToFloorHeightMt: editingConstructionArea.FloorToFloorHeightMt ?? 0,
                    Remark: editingConstructionArea.Remark ?? "",

                });

            } else {
                setFormData(initialFormStateForConstructionAreaData());

            }
            setErrors({});
        }
    }, [isAddUpdateConstructionAreaModalOpen, editingConstructionArea, projectId]);

    const PushConstructionAreaRequest = (): AddUpdateConstructionAreaRequest => {
        return {
            ConstructionAreaId: formData.ConstructionAreaId,
            Uniquekey: formData.Uniquekey || '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            ProjectId: projectId || 0,
            InventoryFlatId: formData.InventoryFlatId ?? 0,
            AreaByPLLineSqMt: formData.AreaByPLLineSqMt ?? 0,
            MultiplierForAreaPercentage: formData.MultiplierForAreaPercentage ?? 0,
            FloorToFloorHeightMt: formData.FloorToFloorHeightMt ?? 0,
            Remark: formData.Remark ?? "",
        };
    };

    const validationAddUpdateConstructionArea = (): {
        isValid: boolean
        errors: { [key: string]: string }
    } => {
        const newErrors: { [key: string]: string } = {}



        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        }
    }

    const handleAddConstructionArea = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({})

        const validation = validationAddUpdateConstructionArea();

        if (!validation.isValid) {
            setErrors(validation.errors)
            return
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushConstructionAreaRequest();

                const response = await constructionAreaService.apiCallAddUpdateConstructionArea(payload);

                if (E.isRight(response)) {

                    setIsAddUpdateConstructionAreaModalOpen(false);

                    const isAdd = formData.InventoryFlatId === 0;

                    if (isAdd) {

                        const newRecord = response.right.Data?.[0] as ConstructionAreaData

                        setConstructionAreaDataList(prevData => [newRecord, ...prevData]);

                        setPagination({
                            currentPage: pagination.currentPage,
                            totalRecords: pagination.totalRecords + 1,
                            totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
                        });
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })

                    }
                    else {
                        const updatedRecord = response.right.Data[0] as ConstructionAreaData;

                        setConstructionAreaDataList(prevData =>
                            prevData.map(item =>
                                item.BuildingNumber === updatedRecord.BuildingNumber &&
                                    item.Floor === updatedRecord.Floor &&
                                    item.Wing === updatedRecord.Wing
                                    ? {
                                        ...item,
                                        FloorToFloorHeightMt: updatedRecord.FloorToFloorHeightMt,
                                        CumlativeHeightMt: updatedRecord.CumlativeHeightMt
                                    }
                                    : item
                            )
                        );

                        
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    }
                    setFormData(initialFormStateForConstructionAreaData())
                    setEditingConstructionArea(null);
                } else {

                    addToast({ type: "error", title: response.left?.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message })
            },
            undefined,
            'Construction Area'
        )
    }

    const handleExportConstructionAreaData = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationConstructionAreaRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    ProjectId: Number(projectId),
                    BuildingNumber: filters.BuildingNumber ?? undefined,
                    Wing: filters.Wing ?? undefined,
                    Floor: filters.Floor ?? undefined,
                    Flat: filters.Flat ?? undefined,
                    FlatType: filters.FlatType ?? undefined,
                    FlatConfiguration: filters.FlatConfiguration ?? undefined,
                    FlatFacing: filters.FlatFacing ?? undefined,
                    FlatStatus: filters.FlatStatus ?? undefined,
                    ApprovalStatus: "APPROVED",
                    SortBy: getSortByParam(sortInfo ?? null, ConstructionAreaDataColumns),
                    ExportType: exportType
                };

                const response = await constructionAreaService.apiCallPullConstructionArea(params);

                handleExportFile(response, exportType, 'ConstructionArea Data', addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const handleExportConstructionAreaDataExcel = () => handleExportConstructionAreaData('Excel')
    const handleExportConstructionAreaDataPdf = () => handleExportConstructionAreaData('PDF');



    const ConstructionAreaDataColumns = useMemo<TableRowSpanColumn[]>(() => [
        {
            key: 'BuildingNumber',
            label: 'Building Number',
            width: '15',
            sortable: false,
            fixed: 'left',
            align: 'center',
            render: value => value || '-',
            rowSpan: (_row, index, data) =>
                getRowSpan(data, index, ['BuildingNumber'])
        },
        {
            key: 'Floor',
            label: 'Floor',
            width: '15',
            sortable: false,
            fixed: 'left',
            align: 'center',
            render: (value) => {
                const { bg, text } = getFloorStatuscolor(value);

                return (
                    <span
                        className="inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                        style={{
                            backgroundColor: bg,
                            color: text
                        }}
                    >
                        {value || "-"}
                    </span>
                );
            },
            rowSpan: (_row, index, data) =>
                getRowSpan(data, index, ['BuildingNumber', 'Floor'])
        },

        {
            key: 'Wing',
            label: 'Wing',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '-',
            rowSpan: (_row, index, data) =>
                getRowSpan(
                    data,
                    index,
                    ['BuildingNumber', 'Floor', 'Wing']
                )
        },
        {
            key: 'FlatType',
            label: 'Unit Type',
            width: '15',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'FlatConfiguration',
            label: 'Unit Configuration',
            width: '15',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'Flat',
            label: 'Unit',
            width: '15',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'AreaByPLLineSqMt',
            label: 'Area By PL Line (SqMt)',
            width: '15',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'MultiplierForAreaPercentage',
            label: 'Multiplier For Area (%)',
            width: '15',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'TotalAreaSqMt',
            label: 'Total Area (SqMt)',
            width: '15',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'TotalAreaSqFt',
            label: 'Total Area (SqFt)',
            width: '15',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'FloorToFloorHeightMt',
            label: 'FTF Height (Mt)',
            width: '15',
            sortable: false,
            align: 'left',
            render: value => value || '-',
            rowSpan: (_row, index, data) =>
                getRowSpan(
                    data,
                    index,
                    ['BuildingNumber', 'Floor', 'Wing']
                )
        },
        {
            key: 'CumlativeHeightMt',
            label: 'Cumlative Height (Mt)',
            width: '15',
            sortable: false,
            align: 'left',
            render: value => value || '-',
            rowSpan: (_row, index, data) =>
                getRowSpan(
                    data,
                    index,
                    ['BuildingNumber', 'Floor', 'Wing']
                )
        },
        {
            key: 'Remark',
            label: 'Remark',
            width: '15',
            sortable: false,
            align: "center",
            render: (value) => (
                <FieldInfoTooltip value={value} />
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
        {
            key: 'Actions',
            label: 'Actions',
            width: '12',
            fixed: 'right',
            align: 'center',
            render: (_value, row) => {

                const isCanAction = canAction;


                return (
                    <div className="flex items-center justify-center">

                        <Button
                            color="transparent"
                            size="sm"
                            disabled={!isCanAction}
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                if (!isCanAction) return;
                                handleEditConstructionAreaData(row)
                            }}
                            style={{
                                color: isCanAction ? "blue" : "#9CA3AF",
                                padding: "4px 8px",
                                cursor: isCanAction ? "pointer" : "not-allowed",
                                opacity: isCanAction ? 1 : 0.5
                            }}
                            leftIcon={<Edit className="h-4 w-4" />}
                        />


                    </div>
                )
            }
        },
    ], [handleEditConstructionAreaData]);

    const requiredConstructionAreaDataColumnKeys: string[] = ['Name', 'Actions'];

    const allConstructionAreaDataColumnKeys: string[] = ConstructionAreaDataColumns.map(c => c.key);

    const [selectedConstructionAreaDataColumnKeys, setSelectedConstructionAreaDataColumnKeys] = useState<string[]>(() => {
        try {

            const saved = LocalStorageHelper.getConstructionAreaTableColumns?.();

            if (saved) {

                const parsed = JSON.parse(saved) as string[]

                const withRequired = Array.from(new Set([
                    ...parsed, ...requiredConstructionAreaDataColumnKeys]));

                return withRequired.filter(k => allConstructionAreaDataColumnKeys.includes(k));
            }
        } catch { }
        return allConstructionAreaDataColumnKeys;
    });

    useEffect(() => {
        setSelectedConstructionAreaDataColumnKeys(prev => Array.from(new Set([...prev, ...requiredConstructionAreaDataColumnKeys])).filter(k => allConstructionAreaDataColumnKeys.includes(k)));
    }, [ConstructionAreaDataColumns.length])

    const visibleConstructionAreaDataColumns = useMemo(
        () => ConstructionAreaDataColumns.filter(col => selectedConstructionAreaDataColumnKeys.includes(col.key)),
        [ConstructionAreaDataColumns, selectedConstructionAreaDataColumnKeys]
    );


    const applyFilters = () => {
        setFilters(tempFilters);
        setPagination({ currentPage: 1 });

        loadConstructionArea(1, tempFilters);
        setShowFilterPopup(false);
    };

    const clearFilters = () => {
        setTempFilters({});
        setFilters({});
        setPagination({ currentPage: 1 });

        loadConstructionArea(1, {}, sortInfo, searchTerm);
    };

    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    }

    const handleAddConstructionAreaModal = () => {
        setIsAddUpdateConstructionAreaModalOpen(true);
        setFormData(initialFormStateForConstructionAreaData());
    }

    const ConstructionAreaDataPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    )
    const ConstructionAreaDataForTable = useMemo(() => ConstructionAreaList, [ConstructionAreaList]);

    return (
        <div>

            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Floor"
                onSearchChange={handleSearchChange}
                onClearSearch={handleClearSearch}

                isShowFilterButton
                filters={filters}
                onOpenFilter={() => {
                    setTempFilters(filters);
                    setShowFilterPopup(true);
                }}

                isShowAddButton={canAction && Number(projectId) > 0 ? true : false}
                addTitle="Add"
                onAdd={handleAddConstructionAreaModal}

                isShowCustomizeButton
                onCustomize={() => {
                    setIsShowCustomizeConstructionAreaColumnsModal(true);
                }}
                isShowExportButton={canExport && ConstructionAreaDataForTable.length > 0}
                onExportExcel={handleExportConstructionAreaDataExcel}
                onExportPdf={handleExportConstructionAreaDataPdf}
                exportLoading={isLoading}
            />


            <DataTableRowSpan
                data={ConstructionAreaDataForTable}
                columns={visibleConstructionAreaDataColumns}
                pagination={ConstructionAreaDataPaginationInfo}
                emptyMessage="No Construction Area Data Found"
                fixedHeight={true}
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
            />


            <CustomizeColumnsModal
                isOpen={isShowCustomizeConstructionAreaColumnsModal}
                onClose={() => setIsShowCustomizeConstructionAreaColumnsModal(false)}
                onApply={keys => {
                    const withRequired = Array.from(
                        new Set([...keys, ...requiredConstructionAreaDataColumnKeys])
                    );
                    setSelectedConstructionAreaDataColumnKeys(withRequired);

                    try {
                        LocalStorageHelper.storeConstructionAreaTableColumns?.(
                            JSON.stringify(withRequired)
                        );
                    } catch { }
                }}
                columns={ConstructionAreaDataColumns}
                selectedKeys={selectedConstructionAreaDataColumnKeys}
                requiredKeys={requiredConstructionAreaDataColumnKeys}
                title="Customize Table Columns"
            />



            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title="Filter - Construction Area"
                onSubmit={e => {
                    e.preventDefault();
                    applyFilters();
                }}
                saveText="Apply "
                cancelText="Clear"
                onCancel={() => clearFilters()}
                resetText=""
                size="small-half"
            >
                <div className="space-y-4">

                    <div>
                        <Input
                            type="text"
                            label='Building Number'
                            value={tempFilters.BuildingNumber || ''}
                            onChange={e => handleFilterChange('BuildingNumber', e.target.value)}
                            placeholder="Enter Building Number"
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label='Wing'
                            value={tempFilters.Wing || ''}
                            onChange={e => handleFilterChange('Wing', e.target.value)}
                            placeholder="Enter Wing"
                            maxLength={20}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label='Floor'
                            value={tempFilters.Floor || ''}
                            onChange={e => handleFilterChange('Floor', e.target.value)}
                            placeholder="Enter Floor"
                            maxLength={20}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label='Flat'
                            value={tempFilters.Flat || ''}
                            onChange={e => handleFilterChange('Flat', e.target.value)}
                            placeholder="Enter Flat"
                            maxLength={20}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label='Flat Type'
                            value={tempFilters.FlatType || ''}
                            onChange={e => handleFilterChange('FlatType', e.target.value)}
                            placeholder="Enter Flat Type"
                            maxLength={20}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label='Flat Configuration'
                            value={tempFilters.FlatConfiguration || ''}
                            onChange={e => handleFilterChange('FlatConfiguration', e.target.value)}
                            placeholder="Enter Flat Configuration"
                            maxLength={20}
                        />
                    </div>

                </div>
            </Modal>

            <Modal
                isOpen={isAddUpdateConstructionAreaModalOpen}
                onClose={() => {
                    setIsAddUpdateConstructionAreaModalOpen(false);
                    setEditingConstructionArea(null);
                    setFormData(initialFormStateForConstructionAreaData());
                    setErrors({});
                }}
                onCancel={() => {
                    setIsAddUpdateConstructionAreaModalOpen(false);
                    setFormData(initialFormStateForConstructionAreaData());
                    setErrors({});
                }}
                title="Add Construction Area Data"
                saveText="Add"
                onSubmit={handleAddConstructionArea}
                size='xl'
            >
                <div className="space-y-4 p-6 bg-blue-100">
                    <div>
                        <Input
                            label="Area By PL Line (SqMt)"
                            type="text"
                            value={formData.AreaByPLLineSqMt || ''}
                            onChange={(e) => handleFieldChange('AreaByPLLineSqMt', filterNumbersWithDecimal(e.target.value) || 0)}
                            placeholder="Enter Area By PL Line"
                            rightIcon="SqMt"
                        />
                    </div>
                    <div>
                        <Input
                            label="Multiplier For Area (%)"
                            required
                            type="text"
                            value={formData.MultiplierForAreaPercentage || ''}
                            onChange={(e) => {
                                const val = allowPercentage(e.target.value);
                                if (val !== null) {
                                    handleFieldChange("MultiplierForAreaPercentage", filterNumbersWithDecimal(e.target.value));
                                }
                            }}
                            error={errors.ResidentialExtraCarpetPercent}
                            placeholder="Enter Multiplier For Area"
                            rightIcon="%"
                        />
                    </div>
                    <div>
                        <Input
                            label="Height (Mt)"
                            type="text"
                            value={formData.FloorToFloorHeightMt || ''}
                            onChange={(e) => handleFieldChange('FloorToFloorHeightMt', filterNumbersWithDecimal(e.target.value) || 0)}
                            placeholder="Enter Height"
                            rightIcon="Mt"
                        />
                    </div>
                    <div>
                        <TextArea
                            label="Remark"
                            placeholder="Enter Remark"
                            className='thin-scroll'
                            value={formData?.Remark || ""}
                            onChange={(e) => handleFieldChange("Remark", e.target.value)}
                            rows={3}
                            error={errors.Remark}
                            autoResize={false}
                        />
                    </div>

                </div>
            </Modal>
        </div>
    );
}
export default ConstructionArea;