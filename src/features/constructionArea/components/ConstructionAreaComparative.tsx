import { runApiWithLoader } from "@/core/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ConstructionAreaComparativeData, FilterWithConstructionAreaComparativeRequest } from "@/features/constructionArea/models/ConstructionAreaComparativeModel";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import usePagination from "@/core/hooks/usePagination";
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import useToast from "@/core/hooks/useToast";
import { handleExportFile } from "@/core/utils/exportFile";
import { Modal } from "@/ui/components/Modal/Modal";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { Loader } from "@/core/utils/loader";
import { constructionAreaComparativeService } from "@/features/constructionArea/services/ConstructionAreaComparativeService";
import * as E from 'fp-ts/Either';
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { Button, Input } from "@/ui/components/forms";
import type { AddUpdateConstructionAreaComparativeRequest } from "@/features/constructionArea/models/ConstructionAreaComparativeModel";
import { Edit } from "lucide-react";
import { filterNumbersWithDecimal } from "@/core/utils/fileValidation";
import FieldInfoTooltip from "@/ui/components/forms/FieldInfoTooltip";
import { TextArea } from "@/ui/components/forms/Textarea";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";

export const ConstructionAreaComparative: React.FC = () => {

    const initialFormStateForConstructionAreaComparativeData = (): AddUpdateConstructionAreaComparativeRequest => ({
        ConstructionAreaComparativeId: 0,
        Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        ProjectId: 0,
        AreaByPLLineSqMt: 0,
        AnnexureURL: null,
        RemoveAnnexureURL: "",
        Remark: "",
    })

    const [ConstructionAreaComparativeList, setConstructionAreaComparativeDataList] = useState<ConstructionAreaComparativeData[]>([]);
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [sortInfo, setSortInfo] = useState<SortInfo>();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isAddUpdateConstructionAreaComparativeModalOpen, setIsAddUpdateConstructionAreaComparativeModalOpen] = useState(false);
    const [formData, setFormData] = useState<AddUpdateConstructionAreaComparativeRequest>(() => initialFormStateForConstructionAreaComparativeData());
    const [editingConstructionAreaComparative, setEditingConstructionAreaComparative] = useState<ConstructionAreaComparativeData | null>(null);
    const { canExport, canAction } = useMenuPermissions();
    const { pagination, setPagination } = usePagination(20);
    const { projectId } = useProject();
    const { addToast } = useToast();

    const [annexureFiles, setAnnexureFiles] = useState<(File | string)[]>([]);
    const [removedAnnexureUrls, setRemovedAnnexureUrls] = useState<string[]>([]);
    const [annexureURL, setAnnexureURL] = useState<string>();

    const loadConstructionAreaComparative = useCallback(async (page: number = pagination.currentPage, _sort?: SortInfo, searchText?: string) => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithConstructionAreaComparativeRequest = {
                    ProjectId: Number(projectId),
                    Type: searchText ?? undefined,
                };

                const response = await constructionAreaComparativeService.apiCallPullConstructionAreaComparative(params);

                if (E.isRight(response)) {
                    setConstructionAreaComparativeDataList(response.right.Data);
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
            'Loading Comparative Data'
        );
    },
        [projectId, pagination.currentPage, pagination.pageSize, addToast, setPagination,]);

    useEffect(() => {
        if (!projectId) return;

        setPagination({ currentPage: 1 });
        loadConstructionAreaComparative(1, sortInfo, searchTerm);
    }, [projectId]);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setPagination({ currentPage: 1 });
        loadConstructionAreaComparative(1, sortInfo, value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setPagination({ currentPage: 1 });
        loadConstructionAreaComparative(1, sortInfo, '');
    };


    const handlePageChange = (page: number) => {
        setPagination({ currentPage: page });
        loadConstructionAreaComparative(page, sortInfo, searchTerm);
    };

    const handleSortColumn = useCallback((sort: SortInfo) => {

        setSortInfo(sort);
        setPagination({ currentPage: 1 });
        loadConstructionAreaComparative(1, sort, searchTerm);

    }, [searchTerm]);


    const handleFieldChange = (field: keyof AddUpdateConstructionAreaComparativeRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleEditConstructionAreaComparativeData = useCallback((row: ConstructionAreaComparativeData) => {
        setEditingConstructionAreaComparative({
            ...row,
        })
        setIsAddUpdateConstructionAreaComparativeModalOpen(true);
    }, [])


    useEffect(() => {
        if (isAddUpdateConstructionAreaComparativeModalOpen) {
            if (editingConstructionAreaComparative) {
                setFormData({
                    ConstructionAreaComparativeId: editingConstructionAreaComparative.ConstructionAreaComparativeId ?? 0,
                    Uniquekey: editingConstructionAreaComparative.Uniquekey ?? initialFormStateForConstructionAreaComparativeData().Uniquekey,
                    ProjectId: Number(projectId) || 0,
                    AreaByPLLineSqMt: editingConstructionAreaComparative.AreaByPLLineSqMt ?? 0,
                    Remark: editingConstructionAreaComparative.Remark ?? "",
                    AnnexureURL: null,
                    RemoveAnnexureURL: '',
                });

                setAnnexureFiles([]);
                setAnnexureURL(editingConstructionAreaComparative.AnnexureURL)
                setRemovedAnnexureUrls([]);

            } else {
                setFormData(initialFormStateForConstructionAreaComparativeData());

                setAnnexureFiles([]);
                setAnnexureURL("")
                setRemovedAnnexureUrls([]);
            }
            setErrors({});
        }
    }, [isAddUpdateConstructionAreaComparativeModalOpen, editingConstructionAreaComparative, projectId]);

    const PushConstructionAreaComparativeRequest = (): FormData => {

        const fd = new FormData();
        fd.append('ConstructionAreaComparativeId', String(formData.ConstructionAreaComparativeId ?? 0));
        fd.append('Uniquekey', formData.Uniquekey ?? '');
        fd.append('ProjectId', String(projectId ?? 0));
        fd.append('AreaByPLLineSqMt', String(Number(formData.AreaByPLLineSqMt) ?? 0));
        fd.append('Remark', formData.Remark ?? '');

        annexureFiles.forEach(file => {
            if (file instanceof File) {
                fd.append('AnnexureURL', file);
            }
        });

        fd.append('RemoveAnnexureURL', removedAnnexureUrls.join(','));

        return fd;
    }

    const validationAddUpdateConstructionAreaComparative = (): {
        isValid: boolean
        errors: { [key: string]: string }
    } => {
        const newErrors: { [key: string]: string } = {}



        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        }
    }

    const handleAddConstructionAreaComparative = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({})

        const validation = validationAddUpdateConstructionAreaComparative();

        if (!validation.isValid) {
            setErrors(validation.errors)
            return
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushConstructionAreaComparativeRequest();

                const response = await constructionAreaComparativeService.apiCallAddUpdateConstructionAreaComparative(payload);

                if (E.isRight(response)) {

                    setIsAddUpdateConstructionAreaComparativeModalOpen(false);

                    const isAdd = formData.ConstructionAreaComparativeId === 0;

                    if (isAdd) {

                        const newRecord = response.right.Data?.[0] as ConstructionAreaComparativeData

                        setConstructionAreaComparativeDataList(prevData => [newRecord, ...prevData]);

                        setPagination({
                            currentPage: pagination.currentPage,
                            totalRecords: pagination.totalRecords + 1,
                            totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
                        });
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })

                    }
                    else {
                        const updatedRecord = response.right.Data[0] as ConstructionAreaComparativeData;

                        setConstructionAreaComparativeDataList(prevData =>
                            prevData.map(item =>
                                item.ConstructionAreaComparativeId === formData.ConstructionAreaComparativeId
                                    ? updatedRecord
                                    : item
                            )
                        )
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    }
                    setFormData(initialFormStateForConstructionAreaComparativeData())
                    setEditingConstructionAreaComparative(null);
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

    const handleExportConstructionAreaComparativeData = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithConstructionAreaComparativeRequest = {
                    ProjectId: Number(projectId),
                    Type: searchTerm.trim() ?? undefined,
                    ExportType: exportType
                };

                const response = await constructionAreaComparativeService.apiCallPullConstructionAreaComparative(params);

                handleExportFile(response, exportType, 'Construction Area Comparative', addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const handleExportConstructionAreaComparativeDataExcel = () => handleExportConstructionAreaComparativeData('Excel')
    const handleExportConstructionAreaComparativeDataPdf = () => handleExportConstructionAreaComparativeData('PDF');

    const ConstructionAreaComparativeDataColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'Type',
            label: 'Type',
            width: '15',
            sortable: false,
            fixed: 'left',
            align: 'left',
            render: value => value || '-',
        },

        {
            key: 'AreaByPLLineSqMt',
            label: 'Area By PL Line (SqMt)',
            width: '15',
            sortable: false,
            align: 'left',
           render: value => `${value || 0} SqMt`
        },
        {
            key: 'VariationInPercentage',
            label: 'Variation (%)',
            width: '15',
            sortable: false,
            align: 'left',
           render: value => `${value || 0} %`
        },
        {
            key: 'AnnexureURL',
            label: 'Annexure',
            width: '15',
            sortable: false,
            align: 'center',
            render: (value: string, row: any) => {
                return (
                    <div className="flex items-center justify-between w-full">
                        <MultiImageViewer
                            images={parseDocumentUrls(row.AnnexureURL)}
                            title="Annexure Document"
                            isIcon={false}
                            triggerLabel={value === '' || 'Annexure'}
                        />

                    </div>
                );
            }
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
            width: "33",
            sortable: false,
            align: "left",
            render: (value) => value || "",
        },
        {
            key: "ModifiedDate",
            label: "Last Modified Date",
            width: "33",
            sortable: false,
            align: "left",
            render: (value) =>  formatDate_dd_MonthName_yy(value),
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
                                handleEditConstructionAreaComparativeData(row)
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
    ], [handleEditConstructionAreaComparativeData]);

    const handleAddConstructionAreaComparativeModal = () => {
        setIsAddUpdateConstructionAreaComparativeModalOpen(true);
        setFormData(initialFormStateForConstructionAreaComparativeData());
    }

    const ConstructionAreaComparativeDataPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    )
    const ConstructionAreaComparativeDataForTable = useMemo(() => ConstructionAreaComparativeList, [ConstructionAreaComparativeList]);

    return (
        <div>

            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Type"
                onSearchChange={handleSearchChange}
                onClearSearch={handleClearSearch}

                isShowFilterButton={false}
                isShowAddButton={false}
                addTitle="Add"
                onAdd={handleAddConstructionAreaComparativeModal}

                isShowCustomizeButton={false}

                isShowExportButton={canExport && ConstructionAreaComparativeDataForTable.length > 0}
                onExportExcel={handleExportConstructionAreaComparativeDataExcel}
                onExportPdf={handleExportConstructionAreaComparativeDataPdf}
                exportLoading={isLoading}
            />


            <DataTable
                data={ConstructionAreaComparativeDataForTable}
                columns={ConstructionAreaComparativeDataColumns}
                pagination={ConstructionAreaComparativeDataPaginationInfo}
                emptyMessage="No Comparative Data Found"
                fixedHeight={true}
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
            />

            <Modal
                isOpen={isAddUpdateConstructionAreaComparativeModalOpen}
                onClose={() => {
                    setIsAddUpdateConstructionAreaComparativeModalOpen(false);
                    setEditingConstructionAreaComparative(null);
                    setFormData(initialFormStateForConstructionAreaComparativeData());
                    setErrors({});
                }}
                onCancel={() => {
                    setIsAddUpdateConstructionAreaComparativeModalOpen(false);
                    setFormData(initialFormStateForConstructionAreaComparativeData());
                    setErrors({});
                }}
                title="Add Construction Area Comparative Data"
                saveText="Add"
                onSubmit={handleAddConstructionAreaComparative}
                size='xl'
            >
                <div className="space-y-4 p-6 bg-blue-100">
                    <div>
                        <Input
                            label="Area By PL Line (SqMt)"
                            type="text"
                            disabled={editingConstructionAreaComparative?.Type === "Project Area"}
                            value={formData.AreaByPLLineSqMt || ''}
                            onChange={(e) => handleFieldChange('AreaByPLLineSqMt', filterNumbersWithDecimal(e.target.value) || 0)}
                            placeholder="Enter Area By PL Line"
                            rightIcon="SqMt"
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

                    <div>
                        <MultiFilePicker
                            label="Annexure"
                            placeholder="Select Annexure"
                            error={errors.AnnexureURL}
                            value={annexureFiles}
                            onChange={setAnnexureFiles}
                            availableFilesURL={annexureURL ?? ""}
                            allowedTypes={["image/jpeg", "image/png", "image/jpg", 'application/pdf']}
                            maxFiles={10}
                            onRemoveExisting={(url) => {
                                setRemovedAnnexureUrls((prev) => [...prev, url])
                            }}
                        />
                    </div>

                </div>
            </Modal>
        </div>
    );
}
export default ConstructionAreaComparative;