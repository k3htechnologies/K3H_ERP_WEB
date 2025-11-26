import useToast from "@/core/hooks/useToast";
import { DataTable } from "@/ui/components/DataTable/DataTable";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { ToastContainer } from "@/ui/components/Toast";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { useEffect, useRef, useState } from "react"
import type { AddUpdateMaterialMasterRequest, FilterWithPaginationMaterialMaster, MaterialMasterData } from "../models/MaterialMasterModel";
import { MaterialMasterService } from "../services/MaterialMasterService";
import * as E from 'fp-ts/Either';
import { Modal } from "@/ui/components/Modal/Modal";
import { Input } from "@/ui/components/forms";


export const MaterialMaster: React.FC = () => {

    const [isLoading, setIsLoading] = useState(false)
    const [materialList, setMaterialList] = useState<MaterialMasterData[]>([])
    const [searchText, setSearchText] = useState('')
    const [showingDialogToAddEdit, setDialogToAddEdit] = useState(false)



    const isUIRendered = useRef(false)

    const { toasts, removeToast, addToast } = useToast()


    useEffect(() => {
        if (isUIRendered.current) {
            return;
        }
        isUIRendered.current = true;
        loadMaterials()
    })

    const loadMaterials = async (searchValue?: string) => {
        const searchParam = searchValue !== undefined ? searchValue : searchText

        const params: FilterWithPaginationMaterialMaster = {
            PageNumber: 1,
            PageSize: 30,
            MaterialName: searchParam?.trim() || "",
            sortBy: "",
            exportType: "Excel"
        }

        const apiResponse = await MaterialMasterService.apiCallPullMaterialMaster(params,)

        if (E.isRight(apiResponse)) {
            setMaterialList(apiResponse.right.Data)
        } else {
            addToast({ type: 'error', title: "Error Fetching material list" })
        }
    }

    const onSearch = (value: string) => {
        setSearchText(value)
        setMaterialList([])
        loadMaterials(value)
    }

    const onSearchFieldCleared = () => {
        setSearchText('')
        setMaterialList([])
        loadMaterials()
    }

    const [formData, setFormData] = useState<AddUpdateMaterialMasterRequest>(
        {
            MaterialName: "",
            MaterialCode: '',
            MaterialMasterId: 0,
            Uniquekey: ""
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
        
        setIsLoading(true)
        apiCallToAddUpdateMaterial(formData)

    }

    const apiCallToAddUpdateMaterial =  async (formData : AddUpdateMaterialMasterRequest) => {
        try{
            const apiResponse = await MaterialMasterService.apiCallToAddUpdateMaterialMaster(formData)
            setMaterialList([])
            setDialogToAddEdit(false)
            loadMaterials()
        } catch(error : any){
            addToast({ type: 'error', title: "Error Adding or Updating material" })
        }
    }

    const handleFieldChange = (field: keyof AddUpdateMaterialMasterRequest, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }


    return <>
        <div>
            <ToastContainer toasts={toasts} onRemoveToast={removeToast}></ToastContainer>
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

            ></TableActionToolbar>
            <DataTable data={materialList} columns={[
                {
                    key: 'MaterialName',
                    label: "Material Name",
                    render: (value) => (
                        <TooltipText
                            text={value || '-'}
                            maxWidth="180px"
                            tooltipThreshold={18}
                        />
                    )
                },

                {
                    key: 'MaterialCode',
                    label: "Material Code",
                    render: (value) => (
                        <TooltipText text={value} >

                        </TooltipText>
                    )
                },


            ]} ></DataTable>

            <Modal
                size="small-half"
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
                        onChange={(e) => handleFieldChange("MaterialCode",e.target.value)}
                    ></Input></div>
                </div>

            </Modal>
        </div>
    </>



}