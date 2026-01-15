import { DataTable, type TableColumn } from '@/ui/components/DataTable/DataTable'
import { Button } from '@/ui/components/forms'
import { Eye, Edit, Trash2 } from 'lucide-react'
import type { DepartmentMasterData } from '../models/DepartmentMasterModel'

export const DepartmentTable = (dm: any) => {
  const {
    departmentList,
    isLoading,
    pagination,
    fetchDepartments,
    onView,
    onEdit,
    onDelete,
    canAction
  } = dm

  const columns: TableColumn[] = [
    {
      key: 'srNo',
      label: 'No.',
      render: (_v, _r, i) =>
        (pagination.currentPage - 1) * pagination.pageSize + i + 1
    },
    { key: 'DepartmentName', label: 'Department Name' },
    { key: 'DepartmentCode', label: 'Code', align: 'center' },
    { key: 'NumberOfEmployee', label: 'Employees', align: 'center' },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center',
      render: (_v, row: DepartmentMasterData) => (
        <div className="flex gap-2 justify-center">
          <Button size="sm" onClick={() => onView(row)}>
            <Eye className="h-4 w-4" />
          </Button>

          {canAction && (
            <Button size="sm" onClick={() => onEdit(row)}>
              <Edit className="h-4 w-4" />
            </Button>
          )}

          {canAction && row.NumberOfEmployee === 0 && (
            <Button size="sm" color="red" onClick={() => onDelete(row)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    }
  ]

  return (
    <DataTable
      data={departmentList}
      columns={columns}
      pagination={{ ...pagination, onPageChange: fetchDepartments }}
      loading={isLoading}
      emptyMessage="No Departments Found"
    />
  )
}
