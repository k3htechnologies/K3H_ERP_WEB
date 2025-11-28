import useToast from "@/core/hooks/useToast";
import { DataTable, type PaginationInfo } from "@/ui/components/DataTable/DataTable";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { ToastContainer } from "@/ui/components/Toast";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { AddUpdateMaterialMasterRequest, FilterWithPaginationMaterialMaster, MaterialMasterData } from "../models/MaterialMasterModel";
import { MaterialMasterService } from "../services/MaterialMasterService";
import * as E from 'fp-ts/Either';
import { Modal } from "@/ui/components/Modal/Modal";
import { Button, Input } from "@/ui/components/forms";
import { Loader } from "@/core/utils/loader";
import { runApiWithLoader } from "@/core/utils";
import { usePagination } from '@/core/hooks/usePagination';
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { Field } from "fp-ts/lib/number";
import ConfirmationDialogBox from "@/core/utils/confirmationDialogBox";



export const MaterialMaster: React.FC = () => {

    const [isLoading, setIsLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState('')
    const [materialList, setMaterialList] = useState<MaterialMasterData[]>([])
    const [searchText, setSearchText] = useState('')
    const [showingDialogToAddEdit, setDialogToAddEdit] = useState(false)
    const [showDialogForMaterialDetails, setShowDialogForDetails] = useState(false)
    const [showDeleteMaterialConfirmationBox,setDeleteMaterialConfirmationBox] = useState(false)
    const [materialData, setMaterialData] = useState<MaterialMasterData | null>(null)
    const { pagination, setPagination } = usePagination(20);

    const isUIRendered = useRef(false)

    const { toasts, removeToast, addToast } = useToast()

    // PAGINATION HANDLED
    const handlePageChange = (pageNumber: number) => {
        loadMaterials(pageNumber)
    }

    const materialMasterPaginationInfo: PaginationInfo = useMemo(() => (
        {
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }
    ),
        [pagination.currentPage, pagination.totalPages, pagination.totalRecords, handlePageChange, pagination.pageSize]
    )

    // TALBE CUSTOMIZATION VARIABLES

    const [showCustomizeTable, setShowCustomizeTable] = useState(false)

    const requiredMaterialMasterColumns: string[] = [
        'MaterialName'
    ]

    useEffect(() => {
        if (isUIRendered.current) {
            return;
        }
        isUIRendered.current = true;
        loadMaterials(pagination.currentPage)
    })

    const loadMaterials = async (pageNumber: number, searchValue?: string,) => {
        const searchParam = searchValue !== undefined ? searchValue : searchText

        const params: FilterWithPaginationMaterialMaster = {
            PageNumber: pageNumber,
            PageSize: 20,
            MaterialName: searchParam?.trim() || "",
            sortBy: "",
            exportType: "Excel"
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const apiResponse = await MaterialMasterService.apiCallPullMaterialMaster(params,)

                if (E.isRight(apiResponse)) {
                    setMaterialList(apiResponse.right.Data)
                    setPagination({
                        currentPage: pageNumber,
                        totalRecords: apiResponse.right.TotalNumberOfRecord,
                        totalPages: pagination.totalRecords / pagination.pageSize,
                    })
                } else {
                    addToast({ type: 'error', title: "Error Fetching material list" })
                }

                return apiResponse
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message || "Error Fetching material list" })
            },
            undefined,
            'Loading Material Data...'
        )
    }

    const onSearch = (value: string) => {
        setSearchText(value)
        setMaterialList([])
        loadMaterials(pagination.currentPage, value)
    }

    const onSearchFieldCleared = () => {
        setSearchText('')
        setMaterialList([])
        loadMaterials(pagination.currentPage)
    }

    const [formData, setFormData] = useState<AddUpdateMaterialMasterRequest>(
        {
            MaterialName: "",
            MaterialCode: '',
            MaterialMasterId: 0,
            Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
        }
    )

    const handleAddEditMaterialFormSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (formData.MaterialName.trim() == "") {
            addToast({
                type: 'error',
                title: "Material Name is required"
            })
            return;
        }
        if (formData.MaterialCode.trim() == "") {
            addToast({
                type: 'error',
                title: "Material Code is required"
            })
            return;
        }

        apiCallToAddUpdateMaterial(formData)
    }

    const apiCallToAddUpdateMaterial = async (formData: AddUpdateMaterialMasterRequest) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const apiResponse = await MaterialMasterService.apiCallToAddUpdateMaterialMaster(formData)

                if (E.isRight(apiResponse)) {
                    setMaterialList([])
                    setDialogToAddEdit(false)
                    loadMaterials(pagination.currentPage)
                    addToast({ type: 'success', title: apiResponse.right.SuccessMessage[0] })
                } else {
                    addToast({ type: 'error', title: apiResponse.left.message })
                }

                return apiResponse
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message || 'Operation failed' })
            },
            undefined,
            formData.MaterialMasterId === 0 ? 'Adding Material...' : 'Updating Material...'
        )
    }

    const handleFieldChange = (field: keyof AddUpdateMaterialMasterRequest, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleMaterialDeleteMaster = () => {

    }

    interface ViewMaterialDetailsProps {
        isOpen: boolean,
        onClosed: () => void
        data: MaterialMasterData | null
    }

    const ViewMaterialDetailsPopUp: React.FC<ViewMaterialDetailsProps> = (
        {
            isOpen,
            onClosed,
            data,
        }

    ) => {
        return <Modal isOpen={isOpen} onClose={onClosed} title={"Material Details"} size="xl">
           
            <div className="space-y-6" >
            <div className="  space-y-4">
             
                    <FieldItem label="Material Name" value={data?.MaterialName} isRow withBorder={true}></FieldItem>
                    <FieldItem label={"Material Code"} value={data?.MaterialCode} isRow withBorder={true}></FieldItem>
            
                    <div className="flex justify-evenly items-center px-2 pt-2">
                <Button color="red" onClick={
                    (e) => {
                        e.preventDefault()
                        setShowDialogForDetails(false)
                        setDeleteMaterialConfirmationBox(true)
                    }
                }>
                    Delete
                </Button>
                <Button  >
                    Edit
                </Button>
                </div>
            </div>
            </div>
        </Modal>
    }

    return <>
        <div>
            <ToastContainer toasts={toasts} onRemoveToast={removeToast}></ToastContainer>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <Loader loading={isLoading} title={loadingMessage} children={<div></div>}></Loader>
                <TableActionToolbar
                    isShowSearchBar
                    searchTerm={searchText}
                    onSearchChange={onSearch}
                    searchPlaceholder="Search by Material Name..."
                    onClearSearch=
                    {onSearchFieldCleared}
                    isShowAddButton
                    addTitle="Add Material"
                    onAdd={() => {
                        setDialogToAddEdit(true)
                    }}
                    onCustomize={() => { }}
                    isShowExportButton
                    onExportExcel={() => { }}
                    onExportPdf={() => { }}

                ></TableActionToolbar>
                <DataTable data={materialList}
                    columns={[
                        {
                            key: 'MaterialName',
                            label: "Material Name",
                            render(value, row) {
                                return <TooltipText text={value} maxWidth="180px"
                                    tooltipThreshold={18}
                                    onClick={() => {
                                        setShowDialogForDetails(true)
                                        setMaterialData(row)
                                    }}
                                ></TooltipText>
                            },
                        },

                        {
                            key: 'MaterialCode',
                            label: "Material Code",
                            render: (value) => (
                                <TooltipText text={value} >

                                </TooltipText>
                            )
                        },


                    ]}
                    emptyMessage="No Materials found"
                    recordsPerPage={20}
                    pagination={materialMasterPaginationInfo}
                    fixedHeight={true}
                    maxHeight="calc(100vh - 255px)"
                    className="flex-1"
                ></DataTable>

                <CustomizeColumnsModal isOpen={showCustomizeTable} onClose={function (): void {
                    throw new Error("Function not implemented.");
                }} onApply={function (keys: string[]): void {
                    throw new Error("Function not implemented.");
                }} columns={[]} selectedKeys={[]}></CustomizeColumnsModal>

                {/* POP UP FOR ADDING EDITING A NEW MATERIAL */}
                <Modal
                    size="xl"
                    isOpen={showingDialogToAddEdit} onClose={() => {
                        setDialogToAddEdit(false)
                    }} title={"Add Material"}
                    onSubmit={handleAddEditMaterialFormSubmit}
                    saveText="Add Material"

                >  <div className="space-y-6 bg-[#E4F0FF] p-6 rounded-[12px] " >
                        <div> <Input label="Material Name" required
                            value={formData.MaterialName}
                            onChange={(e) => handleFieldChange('MaterialName', e.target.value)}
                        ></Input></div>
                        <div>  <Input label="Material Code" required
                            value={formData.MaterialCode}
                            onChange={(e) => handleFieldChange("MaterialCode", e.target.value)}
                        ></Input></div>
                    </div>

                </Modal>

                {/* POPUP FOR SHOWING MATERIAL DETAILS */}
                <ViewMaterialDetailsPopUp isOpen={showDialogForMaterialDetails} onClosed={
                    () => {
                        setShowDialogForDetails(false)
                        setMaterialData(null)
                    }
                } data={materialData} />

                {/* DELETE CONFIRMATION BOX */}
                <ConfirmationDialogBox isOpen={showDeleteMaterialConfirmationBox} onClose={
                    () => {
                        setDeleteMaterialConfirmationBox(false)
                    }
                } onConfirm={
                       handleMaterialDeleteMaster
                } title={"You are about to delete a Material."}
                 message={"Deleting this material will permanently remove its content"}/>
            </div>
        </div>
    </>
}