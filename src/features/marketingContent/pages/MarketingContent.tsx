import { Loader } from "@/core/utils/loader";
import { useCallback, useEffect, useMemo, useState } from "react";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import useDebouncedCallback from "@/core/hooks/useDebouncedCallback";
import * as E from 'fp-ts/Either';
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useNavigate, useParams } from "react-router-dom";
import { Modal } from "@/ui/components/Modal/Modal";
import { Button, Input } from "@/ui/components/forms";
import usePagination from "@/core/hooks/usePagination";
import { runApiWithLoader } from "@/core/utils";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import useToast from "@/core/hooks/useToast";
import { Edit, Trash2 } from "lucide-react";
import { formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import type { AddUpdateMarketingContentRequest, DeleteMarketingContentRequest, FilterWithPaginationMarketingContentRequest, MarketingContentData } from "@/features/marketingContent/models/MarketingContentModel";
import { marketingContentService } from "@/features/marketingContent/services/MarketingContentService";
import { TextArea } from "@/ui/components/forms/Textarea";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import { hasAnyDocumentFile } from "@/core/utils/fileValidation";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { useMarketingContentListState } from "@/features/marketingContent/context/MarketingContentListStateContext";
import FieldInfoTooltip from "@/ui/components/forms/FieldInfoTooltip";


const initialFormState = (): AddUpdateMarketingContentRequest => ({
    MarketingContentFolderId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    Title: '',
    MarketingContentId: 0,
    Remark: '',
    MarketingContentURL: null,
    ProjectId: 0,
    RemoveMarketingContentURL: '',
})

export const MarketingContent: React.FC = () => {
    const [marketingContentList, setMarketingContentList] = useState<MarketingContentData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const navigate = useNavigate();
    const { pagination, setPagination } = usePagination(20);
    const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
    const { projectId } = useProject();
    const { addToast } = useToast();
    const [marketingContentFiles, setMarketingContentFiles] = useState<(File | string)[]>([]);
    const [removeMarketingContentUrls, setRemoveMarketingContentUrls] = useState<string[]>([]);
    const [marketingContentURL, setMarketingContentURL] = useState<string>();
    const [editingMarketingContentData, setEditingMarketingContentData] = useState<MarketingContentData | null>(null);
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
    const [deleteMarketingContentData, setDeleteMarketingContentData] = useState<MarketingContentData | null>(null)
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebouncedCallback((value: string) => {
        searchMarketingContent(value)
    }, 350);
    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const [formData, setFormData] = useState<AddUpdateMarketingContentRequest>(() => initialFormState());
    const { canAction } = useMenuPermissions();

    const { MarketingContentFolderId } = useParams<{ MarketingContentFolderId?: string }>();
    const { listState } = useMarketingContentListState();
    const marketingContentFolderId = MarketingContentFolderId ? Number(MarketingContentFolderId) : listState.MarketingContentFolderId;

    const loadMarketingContent = useCallback(async (page: number, sortInfo?: SortInfo, searchtext?: string) => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationMarketingContentRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    MarketingContentFolderId: marketingContentFolderId,
                    Title: searchtext?.trim() || undefined,
                    SortBy: getSortByParam(sortInfo ?? null, MarketingContentColumns)
                };

                const response = await marketingContentService.apiCallPullMarketingContent(params);

                if (E.isRight(response)) {

                    setMarketingContentList(response.right.Data);
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
            (error: any) => addToast({ type: 'error', title: error.message }),
            undefined,
            'Loading Marketing Content '
        )
    }, [pagination.pageSize, marketingContentFolderId, projectId, addToast])
    
    useEffect(() => {
        if (!projectId || !marketingContentFolderId) return;

        loadMarketingContent(1, sortInfo, searchTerm);

    }, [projectId, marketingContentFolderId, sortInfo]);

    useEffect(() => {
        return () => {

            debouncedSearch.cancel?.()
        }
    }, [debouncedSearch])

    useEffect(() => {
        if (isAddUpdateModalOpen) {
            if (editingMarketingContentData) {
                setFormData({
                    MarketingContentId: editingMarketingContentData.MarketingContentId || 0,
                    Uniquekey: editingMarketingContentData.Uniquekey || initialFormState().Uniquekey,
                    MarketingContentFolderId: editingMarketingContentData.MarketingContentFolderId || 0,
                    ProjectId: editingMarketingContentData.ProjectId || 0,
                    Title: editingMarketingContentData.Title || null,
                    Remark: editingMarketingContentData.Remark || null,
                    MarketingContentURL: null,
                    RemoveMarketingContentURL: ''
                });
                setMarketingContentFiles([]);
                setMarketingContentURL(editingMarketingContentData.MarketingContentURL || '');
                setRemoveMarketingContentUrls([]);
            } else {
                setFormData({
                    ...initialFormState(),
                    ProjectId: Number(projectId),
                });
                setMarketingContentFiles([]);
                setMarketingContentURL('');
                setRemoveMarketingContentUrls([]);
            }
            setErrors({});
        }
    }, [isAddUpdateModalOpen, editingMarketingContentData, projectId]);
    const searchMarketingContent = async (searchValue: string) => {
        setSearchTerm(searchValue);
        await loadMarketingContent(1, sortInfo, searchValue);
    };
    const clearSearchMarketingContent = () => {
        setSearchTerm('');
        debouncedSearch.cancel?.();
        setPagination({ currentPage: 1 });

        loadMarketingContent(1, sortInfo, '');

    };
    const handlePageChange = useCallback((page: number) => {
        loadMarketingContent(page, sortInfo, searchTerm);
    }, [sortInfo, searchTerm]);

    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort);
        loadMarketingContent(1, sort, searchTerm);
    }, [searchTerm]);

    const handleEditMarketingContent = useCallback((row: MarketingContentData) => {
        setEditingMarketingContentData({
            ...row,
            Title: row.Title || ''
        })
        setIsAddUpdateModalOpen(true);
    }, [])

    const handleConfirmationDialogBoxOpen = useCallback((row: MarketingContentData) => {
        setDeleteMarketingContentData(row)
        setIsConfirmationDialogBoxOpen(true)
    }, [])

    const MarketingContentPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    );

    const MarketingContentForTable = useMemo(() => marketingContentList, [marketingContentList]);

    const MarketingContentColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'Title',
            label: 'Title',
            width: '20',
            sortable: true,
            fixed: 'left',
            align: 'left',
            render: (value: string, row: any) => {
                return (
                    <div className="flex items-center justify-between gap-2 w-full">
                        <MultiImageViewer
                            images={parseDocumentUrls(row.MarketingContentURL)}
                            title={row.Title}
                            triggerLabel={
                                <TooltipText
                                    text={value || '-'}
                                    maxWidth="400px"
                                    tooltipThreshold={25}
                                />
                            } />
                    </div>
                );
            }
        },
        {
            key: 'Remark',
            label: 'Remark',
            width: '20',
            sortable: false,
            align: 'center',
            render: (value) => (
                <FieldInfoTooltip value={value} />
            )
        },
        {
            key: 'ModifiedBy',
            label: 'Last Modified By',
            width: '20',
            sortable: false,
            align: 'left',
            render: (value, row) => (
                <TooltipText
                    text={value || row.CreatedBy || '-'}
                    maxWidth="180px"
                    tooltipThreshold={18}
                />
            )
        },
        {
            key: 'ModifiedDate',
            label: 'Last Modified Date',
            width: '20',
            sortable: false,
            align: 'center',
            render: (value, row) =>
                value
                    ? formatDate_dd_MonthName_yy_hh_mm(value)
                    : row.CreatedDate
                        ? formatDate_dd_MonthName_yy_hh_mm(row.CreatedDate)
                        : '-'
        },
        {
            key: 'actions',
            label: 'Actions',
            width: '12',
            fixed: 'right',
            align: 'center',
            render: (_value, row) => (
                <div className="flex items-center justify-center">
                    {canAction && (
                        <>
                            <Button
                                color="transparent"
                                size="sm"
                                style={{
                                    color: 'blue',
                                    padding: '0px 8px'

                                }}
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleEditMarketingContent(row)
                                }}
                                leftIcon={<Edit className="h-4 w-4" />}
                            />

                            <Button
                                color="transparent"
                                size="sm"
                                style={{
                                    color: 'red',
                                    padding: '0px 8px'

                                }}
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleConfirmationDialogBoxOpen(row)

                                }}
                                leftIcon={<Trash2 className="h-4 w-4" />}
                            />
                        </>
                    )}
                </div>
            )
        },

    ], [canAction, handleEditMarketingContent, handleConfirmationDialogBoxOpen])

    const handleFieldChange = (field: keyof AddUpdateMarketingContentRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };
    const handleAddMarketingContentModal = () => {
        setEditingMarketingContentData(null);
        setFormData({
            ...initialFormState(),
            ProjectId: Number(projectId),
            MarketingContentFolderId: marketingContentFolderId
        });
        setErrors({});
        setMarketingContentFiles([]);
        setMarketingContentURL('');
        setRemoveMarketingContentUrls([]);
        setIsAddUpdateModalOpen(true);
    }

    const validationAddUpdateMarketingContentForm = (): {
        isValid: boolean
        errors: { [key: string]: string }

    } => {
        const newErrors: { [key: string]: string } = {}

        if (!formData.Title || formData.Title.trim() === '') {
            newErrors.Title = "Title is required."
        } else if (formData.Title.trim().length < 3) {
            newErrors.Title = "Title must be at least 3 characters long."
        }

        if (!formData.Remark || formData.Remark.trim() === '') {
            newErrors.Remark = "Remark is required."
        }

        if (!hasAnyDocumentFile(marketingContentFiles, marketingContentURL, removeMarketingContentUrls)) {
            newErrors.MarketingContentURL = "File is required.";
        }
        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        }
    }
    const PushMarketingContentFormData = (): FormData => {

        const fd = new FormData();
        fd.append('MarketingContentId', String(formData.MarketingContentId ?? 0));
        fd.append('MarketingContentFolderId', String(marketingContentFolderId));
        fd.append('Uniquekey', formData.Uniquekey ?? '');
        fd.append('ProjectId', String(projectId));
        fd.append('Title', formData.Title ?? '');
        fd.append('Remark', formData.Remark ?? '');

        marketingContentFiles.forEach(file => {
            if (file instanceof File) {
                fd.append('MarketingContentURL', file);
            }
        });

        fd.append('RemoveMarketingContentURL', removeMarketingContentUrls.join(','));
        return fd;
    };
    const handleAddUpdateMarketingContent = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({})

        const validation = validationAddUpdateMarketingContentForm()

        if (!validation.isValid) {
            setErrors(validation.errors)
            return
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushMarketingContentFormData();

                const response = await marketingContentService.apiCallAddUpdateMarketingContent(payload);

                if (E.isRight(response)) {

                    setIsAddUpdateModalOpen(false);

                    const isAdd = formData.MarketingContentId === 0;

                    if (isAdd) {

                        const newRecord = response.right.Data[0] as MarketingContentData
                        setMarketingContentList(prevData => [newRecord, ...prevData]);

                        setPagination({
                            currentPage: pagination.currentPage,
                            totalRecords: pagination.totalRecords + 1,
                            totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
                        });
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })

                    } else {

                        const updatedRecord = response.right.Data[0] as MarketingContentData;
                        setMarketingContentList(prevData =>
                            prevData.map(item =>
                                item.MarketingContentId === formData.MarketingContentId
                                    ? updatedRecord
                                    : item
                            )
                        )
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    }
                    setEditingMarketingContentData(null)
                    setMarketingContentFiles([])
                    setMarketingContentURL('')
                    setRemoveMarketingContentUrls([])

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
            'Add Content '
        )
    };
    const handleDeleteMarketingContent = async () => {

        setIsConfirmationDialogBoxOpen(false);

        if (!deleteMarketingContentData) return

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: DeleteMarketingContentRequest = {
                    MarketingContentId: deleteMarketingContentData.MarketingContentId || 0,
                    Uniquekey: deleteMarketingContentData.Uniquekey || '',
                    MarketingContentFolderId: deleteMarketingContentData.MarketingContentFolderId || 0,
                    ProjectId: deleteMarketingContentData.ProjectId || 0
                }

                const response = await marketingContentService.apiCallDeleteMarketingContent(params);

                if (E.isRight(response)) {

                    const newTotalRecords = pagination.totalRecords - 1;

                    const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

                    let pageToShow = pagination.currentPage;

                    if (pagination.currentPage > newTotalPages) {
                        pageToShow = newTotalPages;
                    }
                    else if (marketingContentList.length === 1 && pagination.currentPage > 1) {
                        pageToShow = pagination.currentPage - 1;
                    }
                    setPagination({
                        currentPage: pageToShow,
                        totalRecords: newTotalRecords,
                        totalPages: newTotalPages
                    });
                    await loadMarketingContent(pageToShow, sortInfo);

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    setIsConfirmationDialogBoxOpen(false);
                    setDeleteMarketingContentData(null);

                } else {
                    addToast({ type: 'error', title: response.left.message });
                    setIsConfirmationDialogBoxOpen(false);
                }
                return response
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message })
            },
            undefined,
            'Delete Content '
        )
    }
    const handleBackToListApprovedBankFolder = () => {
        navigate('/content');
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

            {/* LOADER */}

            <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

            {/* ACTION TOOLBAR */}

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Title"
                onSearchChange={v => {
                    setSearchTerm(v);
                    debouncedSearch(v);
                }}
                onClearSearch={clearSearchMarketingContent}
                isShowAddButton={canAction}
                addTitle="Add"
                onAdd={handleAddMarketingContentModal}
            />

            <div className="flex items-center gap-3 mb-6 border-b border-gray-300 pb-3">

                <HeaderActionBar
                    titleText={"Content Document : "}
                    subTitleText={listState.MarketingContentFolderName}
                    cancelText="Cancel"
                    onCancel={() => handleBackToListApprovedBankFolder()}
                    canAction={false}
                    isLoading={isLoading}
                />
            </div>

            {/* DATA TABLE CONTENT  */}

            <DataTable
                columns={MarketingContentColumns}
                data={MarketingContentForTable}
                pagination={MarketingContentPaginationInfo}
                emptyMessage="No Content Data Found"
                fixedHeight={true}
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
            />

            {/* ADD CONTENT MODAL */}

            <Modal
                isOpen={isAddUpdateModalOpen}
                onClose={() => {
                    setIsAddUpdateModalOpen(false);
                    setEditingMarketingContentData(null);
                    setFormData(initialFormState());
                    setErrors({});
                    setMarketingContentFiles([]);
                    setMarketingContentURL('');
                    setRemoveMarketingContentUrls([])
                }}
                onCancel={() => {
                    setIsAddUpdateModalOpen(false)
                    setEditingMarketingContentData(null)
                    setFormData(initialFormState());
                    setErrors({})
                    setMarketingContentFiles([]);
                    setMarketingContentURL('');
                    setRemoveMarketingContentUrls([])
                }}
                title={editingMarketingContentData ? 'Update Content Document' : 'Add Content Document'}
                onSubmit={handleAddUpdateMarketingContent}
                saveText={editingMarketingContentData ? 'Update' : 'Add'}
                loading={isLoading}
                size='xl'
            >
                <div className="space-y-10 p-6 bg-blue-100">
                    <div className="space-y-4" >

                        <div>
                            <Input
                                label='Title'
                                required
                                type="text"
                                value={formData.Title ?? ''}
                                onChange={(e) => handleFieldChange("Title", e.target.value)}
                                error={errors.Title}
                                maxLength={250}
                                placeholder="Enter Title"
                            />
                        </div>

                        <div>

                            <MultiFilePicker
                                label="Files"
                                placeholder='Select Files'
                                required
                                value={marketingContentFiles}
                                onChange={setMarketingContentFiles}
                                availableFilesURL={marketingContentURL ?? ""}
                                error={errors.MarketingContentURL}
                                allowedTypes={["image/jpeg", "image/png", "image/jpg", "application/pdf"]}
                                maxFiles={5}
                                onRemoveExisting={(url) => {
                                    setRemoveMarketingContentUrls((prev) => [...prev, url])
                                }}
                            />
                        </div>

                        <div>
                            <TextArea
                                label="Remark"
                                required
                                rows={3}
                                className='thin-scroll'
                                value={formData.Remark ?? ""}
                                placeholder="Enter Remark"
                                onChange={(e) => handleFieldChange("Remark", e.target.value)}
                                error={errors.Remark} />
                        </div>
                    </div>
                </div>

            </Modal >

            {/* DELETE CONFIRMATION MODAL */}
            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => {
                    setIsConfirmationDialogBoxOpen(false);
                    setDeleteMarketingContentData(null);
                }}
                onConfirm={handleDeleteMarketingContent}
                loading={isLoading}
                pageName='Content Document'
            />
        </div >
    )
}

export default MarketingContent;