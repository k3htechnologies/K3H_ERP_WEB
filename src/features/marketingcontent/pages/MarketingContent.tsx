import { Loader } from "@/core/utils/loader";
import { useCallback, useEffect, useMemo, useState } from "react";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import useDebouncedCallback from "@/core/hooks/useDebouncedCallback";
import * as E from 'fp-ts/Either';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useLocation, useNavigate } from "react-router-dom";
import { Modal } from "@/ui/components/Modal/Modal";
import { Button, Input } from "@/ui/components/forms";
import ConfirmationDialogBox from "@/core/utils/confirmationDialogBox";
import usePagination from "@/core/hooks/usePagination";
import { runApiWithLoader } from "@/core/utils";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import useToast from "@/core/hooks/useToast";
import { Edit, Trash2 } from "lucide-react";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import type { AddUpdateMarketingContentRequest, DeleteMarketingContentRequest, FilterWithPaginationMarketingContentRequest, MarketingContentData } from "../models/MarketingContentModel";
import { marketingContentService } from "../services/MarketingContentService";
import { TextArea } from "@/ui/components/forms/Textarea";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import { hasAnyDocumentFile } from "@/core/utils/fileValidation";


const initialFormState = (): AddUpdateMarketingContentRequest => ({
    MarketingContentFolderId: 0,
    Title: '',
    MarketingContentId: 0,
    Remark: '',
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    MarketingContentURL: null,
    ProjectId: 0,
    RemoveMarketingContentURL: '',
})

export const MarketingContent: React.FC = () => {

    //#region STATE MANAGEMENT
    const [MarketingContentList, setMarketingContentList] = useState<MarketingContentData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMessage, setIsLoadingMessage] = useState('');

    // USE NAVIGATE
    const navigate = useNavigate();

    // PAGINATION STATE
    const { pagination, setPagination } = usePagination(20);

    //TABLE SORT INFO
    const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

    const { projectId } = useProject();

    // TOAST
    const { addToast } = useToast();

    //SET ADD AND REMOVE URL FILE
    const [marketingContentFiles, setMarketingContentFiles] = useState<(File | string)[]>([]);
    const [removeMarketingContentUrls, setRemoveMarketingContentUrls] = useState<string[]>([]);
    const [marketingContentURL, setMarketingContentURL] = useState<string>();

    // SINGLE SEARCH TEXT BOX
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebouncedCallback((value: string) => {
        searchMarketingContent(value)
    }, 350);

    //FILTER STATES
    const [filters, setFilters] = useState<FilterInfo>({});

    // ADD EDIT MARKETING CONTENT 
    const [editingMarketingContentData, setEditingMarketingContentData] = useState<MarketingContentData | null>(null);
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

    //DELETE MARKETING CONTENT 
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
    const [deleteMarketingContentData, setDeleteMarketingContentData] = useState<MarketingContentData | null>(null)

    //ERROR SET UP
    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const [formData, setFormData] = useState<AddUpdateMarketingContentRequest>(() => initialFormState());

    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions();
    //#endregion

    const location = useLocation();

    const marketingContentFolderId = location?.state?.MarketingContentData?.MarketingContentFolderId ?? 0;
    //#endregion

    //#region DATA LOADING | FETCH |  LOAD | SEARCH 
    const fetchMarketingContentList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
        return await loadMarketingContent(page, filters, sort);
    }

    const loadMarketingContent = useCallback(async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo) => {

        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {
                let sortByParam = undefined;

                if (sortInfo) {

                    const column = MarketingContentColumns.find(col => col.key === sortInfo.column);
                    if (column) {
                        sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
                    }
                }
                const params: FilterWithPaginationMarketingContentRequest = {

                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    MarketingContentFolderId: filterParams.MarketingContentFolderId ? Number(filterParams.MarketingContentFolderId) : undefined,
                    MarketingContentId: filterParams.MarketingContentId ? Number(filterParams.MarketingContentId) : undefined,
                    Title: filterParams.Title?.trim() || undefined,
                    SortBy: sortByParam
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
            'Loading  Content '
        )
    }, [pagination.pageSize, marketingContentFolderId, projectId, addToast])
    //#endregion

    //#region INIT
    useEffect(() => {

        if (!projectId || !marketingContentFolderId) return;

        loadMarketingContent(1, {
            MarketingContentFolderId: marketingContentFolderId
        });

    }, [projectId, marketingContentFolderId]);

    //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
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
    //#endregion

    //#region SEARCH & CLEAR
    const searchMarketingContent = async (searchValue: string) => {

        setSearchTerm(searchValue);

        if (searchValue.trim() === '') {
            await loadMarketingContent(1, { MarketingContentFolderId: marketingContentFolderId });
            return
        }
        const filterParams: FilterInfo = {
            Title: searchValue.trim(),
            MarketingContentFolderId: marketingContentFolderId,
        };
        await loadMarketingContent(1, filterParams);
    };
    //#endregion

    //#region CLEAR 
    const clearSearchMarketingContent = () => {
        setSearchTerm('');

        debouncedSearch.cancel?.();
        setFilters({});
        setPagination({ currentPage: 1 });

        loadMarketingContent(1, { MarketingContentFolderId: marketingContentFolderId });
        try {
            navigate(location.pathname, { replace: true, state: {} });
        } catch {
        }
    };
    //#endregion

    // RESET FORM DATA
    const handleResetForm = () => {
        setFormData(initialFormState());
        setErrors({});
    };
    //#region HANDLE PAGE CHNAGE EVENT
    const handlePageChange = useCallback((page: number) => {
        fetchMarketingContentList(page);
    }, []);

    //#region TABLE SORT COLUMN
    const handleSortColumn = useCallback((sort: SortInfo) => {

        setSortInfo(sort);
        loadMarketingContent(1, filters, sort);

    }, [filters]);
    //#endregion

    //#region EDIT MARKETING CONTENT 
    const handleEditMarketingContent = useCallback((row: MarketingContentData) => {
        setEditingMarketingContentData({
            ...row,
            Title: row.Title
        })
        setIsAddUpdateModalOpen(true);
    }, [])
    //#endregion

    //#region CONFIRMATION DIALOG BOX
    const handleConfirmationDialogBoxOpen = useCallback((row: MarketingContentData) => {
        setDeleteMarketingContentData(row)
        setIsConfirmationDialogBoxOpen(true)
    }, [])
    //#endregion

    //#region TABLE PAGINATION INFO
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
    const MarketingContentForTable = useMemo(() => MarketingContentList, [MarketingContentList]);

    //#region TABLE COLUMNS
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
                    <div className="flex items-center justify-between w-full">
                        <MultiImageViewer
                            images={parseDocumentUrls(row.MarketingContentURL)}
                            title="Document"
                            triggerLabel={value || '-'}
                        />
                    </div>
                );
            }
        },
        {
            key: 'Remark',
            label: 'Remark',
            width: '33',
            sortable: true,
            align: 'center',
            render: (value) => value || 'N/A'
        },
        {
            key: 'CreatedBy',
            label: 'Last Modified By',
            width: '33',
            sortable: true,
            align: 'center',
            render: (value) => value || 'N/A'
        },
        {
            key: 'CreatedDate',
            label: 'Last Modified Date',
            width: '33',
            sortable: true,
            align: 'center',
            render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
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
                                    color: '#0B3251',
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

    // ============================================================= [VALIDATION FUNCTION] =============================================================================================

    const validationAddUpdateMarketingContentForm = (): {
        isValid: boolean

        errors: { [key: string]: string }

    } => {
        const newErrors: { [key: string]: string } = {}

        if (!formData.Title || formData.Title.trim() === '') {
            newErrors.Title = "Title is required"
        }

        if (!formData.Remark || formData.Remark.trim() === '') {
            newErrors.Remark = "Remark is required"
        }

        if (!hasAnyDocumentFile(marketingContentFiles, marketingContentURL, removeMarketingContentUrls)) {
            newErrors.MarketingContentURL = "File is required.";
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        }
    }

    //#region PUSH FORM DATA
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

    //#region ADD UPDATE MARKETING CONTENT 
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

            setIsLoadingMessage,
            async () => {

                const payload = PushMarketingContentFormData();

                const response = await marketingContentService.apiCallAddUpdateMarketingContent(payload);

                if (E.isRight(response)) {

                    setIsAddUpdateModalOpen(false);

                    const isAdd = formData.MarketingContentId === null || formData.MarketingContentId === 0;

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
    //#endregion

    //#region DELETE CONTENT 
    const handleDeleteMarketingContent = async () => {

        setIsConfirmationDialogBoxOpen(false);

        if (!deleteMarketingContentData) return

        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,

            async () => {

                const params: DeleteMarketingContentRequest = {
                    MarketingContentId: deleteMarketingContentData.MarketingContentId || 0,
                    Uniquekey: deleteMarketingContentData.Uniquekey || '',
                    MarketingContentFolderId: deleteMarketingContentData.MarketingContentFolderId || 0,
                    ProjectId: deleteMarketingContentData.ProjectId || 0
                }

                const response = await marketingContentService.apiCallDeleteMarketingContent(params);

                if (E.isRight(response)) {

                    setMarketingContentList(prevData => prevData.filter(item => item.MarketingContentId !== deleteMarketingContentData.MarketingContentId));

                    setPagination({
                        currentPage: pagination.currentPage,
                        totalRecords: pagination.totalRecords - 1,
                        totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
                    });

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
    //#endregion

    //#region BACK MARKETING CONTENT FOLDER PAGE
    const handleBackToListApprovedBankFolder = () => {
        navigate('/content');
    };
    //#endregion

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

            {/* LOADER */}

            <Loader loading={isLoading} title={isLoadingMessage} > <div></div> </Loader>

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
                
                //ADD
                isShowAddButton={canAction}
                addTitle="Add"
                onAdd={handleAddMarketingContentModal}
            />

            <div className="flex items-center gap-3 mb-6 border-b border-gray-300 pb-3">

                <HeaderActionBar
                    titleText={"Content Document "}
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
                maxHeight="calc(100vh - 255px)"
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
                loading={isLoading}
            />

            {/* ADD CONTENT  MODAL */}

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
                title={editingMarketingContentData ? 'Update' : 'Add'}
                onSubmit={handleAddUpdateMarketingContent}
                saveText={'Save'}
                resetText='Reset'
                onreset={handleResetForm}
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
                                maxSizeMB={10}
                                onRemoveExisting={(url) => {
                                    setRemoveMarketingContentUrls((prev) => [...prev, url])
                                }}
                            />
                        </div>

                        <div>
                            <TextArea
                                label="Remark"
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
            < ConfirmationDialogBox
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => {
                    setIsConfirmationDialogBoxOpen(false)
                    setDeleteMarketingContentData(null)
                }}
                onConfirm={handleDeleteMarketingContent}
                title="You are about to delete a Content ?"
                message="Deleting this Content  will permanently remove its contents."
                confirmText="Delete"
                cancelText="Cancel"
                loading={isLoading}
                variant="danger"
            />

        </div >
    )
}

export default MarketingContent;