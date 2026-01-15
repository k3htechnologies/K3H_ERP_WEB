import { useEffect, useRef, useState } from 'react'
import { usePagination } from '@/core/hooks/usePagination'
import { useToast } from '@/core/hooks/useToast'
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions'
import { departmentMasterService } from '../services/DepartmentMasterService'
import * as E from 'fp-ts/Either'
import type {
  DepartmentMasterData,
  AddUpdateDepartmentMasterRequest,
  DeleteDepartmentMasterRequest,
  FilterWithPaginationDepartmentMasterRequest
} from '../models/DepartmentMasterModel'

const initialForm = (): AddUpdateDepartmentMasterRequest => ({
  DepartmentMasterId: 0,
  Uniquekey: crypto.randomUUID(),
  DepartmentCode: '',
  DepartmentName: ''
})

export const useDepartmentMaster = () => {
  const { addToast } = useToast()
  const { canAction, canExport } = useMenuPermissions()
  const { pagination, setPagination } = usePagination(20)

  const [departmentList, setDepartmentList] = useState<DepartmentMasterData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const [formData, setFormData] = useState(initialForm())
  const [editingData, setEditingData] = useState<DepartmentMasterData | null>(null)
  const [deleteData, setDeleteData] = useState<DepartmentMasterData | null>(null)

  const [showAddEdit, setShowAddEdit] = useState(false)
  const [showView, setShowView] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const hasFetched = useRef(false)

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true
      fetchDepartments()
    }
  }, [])

  const fetchDepartments = async (page = pagination.currentPage) => {
    setIsLoading(true)
    setLoadingMessage('Loading Departments...')

    const params: FilterWithPaginationDepartmentMasterRequest = {
      PageNumber: page,
      PageSize: pagination.pageSize,
      DepartmentName: searchTerm || undefined,
      IsCheckPermission: true
    }

    const res = await departmentMasterService.apiCallPullDepartmentMaster(params)

    if (E.isRight(res)) {
      setDepartmentList(res.right.Data)
      setPagination({
        currentPage: page,
        totalRecords: res.right.TotalNumberOfRecord,
        totalPages: Math.ceil(res.right.TotalNumberOfRecord / pagination.pageSize)
      })
    } else {
      addToast({ type: 'error', title: res.left.message })
    }

    setIsLoading(false)
  }

  const onSearch = (v: string) => {
    setSearchTerm(v)
    fetchDepartments(1)
  }

  const clearSearch = () => {
    setSearchTerm('')
    fetchDepartments(1)
  }

  const openAddModal = () => {
    setEditingData(null)
    setFormData(initialForm())
    setErrors({})
    setShowAddEdit(true)
  }

  const onView = (row: DepartmentMasterData) => {
    setEditingData(row)
    setShowView(true)
  }

  const onEdit = (row: DepartmentMasterData) => {
    setEditingData(row)
    setFormData({
      DepartmentMasterId: row.DepartmentMasterId,
      Uniquekey: row.Uniquekey,
      DepartmentCode: row.DepartmentCode,
      DepartmentName: row.DepartmentName
    })
    setShowAddEdit(true)
  }

  const onDelete = (row: DepartmentMasterData) => {
    setDeleteData(row)
    setShowDelete(true)
  }

  const handleDelete = async () => {
    if (!deleteData) return

    const params: DeleteDepartmentMasterRequest = {
      DepartmentMasterId: deleteData.DepartmentMasterId,
      UniqueKey: deleteData.Uniquekey
    }

    const res = await departmentMasterService.apiCallDeleteDepartmentMaster(params)

    if (E.isRight(res)) {
      addToast({ type: 'success', title: 'Deleted successfully' })
      fetchDepartments()
    } else {
      addToast({ type: 'error', title: res.left.message })
    }

    setShowDelete(false)
  }

  const validateForm = () => {
    const newErrors: any = {}

    if (!formData.DepartmentCode.trim()) {
      newErrors.DepartmentCode = 'Department Code is required'
    } else if (formData.DepartmentCode.length !== 4) {
      newErrors.DepartmentCode = 'Code must be 4 characters'
    }

    if (!formData.DepartmentName.trim()) {
      newErrors.DepartmentName = 'Department Name is required'
    } else if (formData.DepartmentName.length < 3) {
      newErrors.DepartmentName = 'Minimum 3 characters required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddUpdateDepartment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    const res = await departmentMasterService.apiCallAddUpdateDepartmentMaster(formData)

    if (E.isRight(res)) {
      addToast({ type: 'success', title: 'Saved successfully' })
      setShowAddEdit(false)
      fetchDepartments()
    } else {
      addToast({ type: 'error', title: res.left.message })
    }
  }

  return {
    departmentList,
    isLoading,
    loadingMessage,
    searchTerm,
    pagination,
    canAction,
    canExport,
    showAddEdit,
    showView,
    showDelete,
    showImportModal,
    formData,
    editingData,
    deleteData,
    errors,
    setShowAddEdit,
    setShowView,
    setShowDelete,
    setShowImportModal,
    setFormData,
    setErrors,
    fetchDepartments,
    onSearch,
    clearSearch,
    openAddModal,
    onView,
    onEdit,
    onDelete,
    handleDelete,
    handleAddUpdateDepartment,
    exportExcel: () => {},
    exportPdf: () => {},
    uploadExcel: async () => {},
    downloadSample: async () => {}
  }
}
