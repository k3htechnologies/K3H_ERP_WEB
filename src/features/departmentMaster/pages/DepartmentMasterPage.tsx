import { Loader } from '@/core/utils/loader'
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar'
import { useDepartmentMaster } from '../hooks/useDepartmentMaster'
import { DepartmentTable } from '../components/DepartmentTable'
import { DepartmentFormModal } from '../components/DepartmentFormModal'
import { DepartmentViewModal } from '../components/DepartmentViewModal'
import { DepartmentDeleteDialog } from '../components/DepartmentDeleteDialog'
import ExportImport from '@/ui/components/ExcelImport/ExcelImport'

export const DepartmentMasterPage = () => {
  const dm = useDepartmentMaster()

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <Loader loading={dm.isLoading} title={dm.loadingMessage}>
        <div />
      </Loader>

      <TableActionToolbar
        isShowSearchBar
        searchTerm={dm.searchTerm}
        searchPlaceholder="Search By Department Name"
        onSearchChange={dm.onSearch}
        onClearSearch={dm.clearSearch}
        isShowAddButton={dm.canAction}
        addTitle="Add"
        onAdd={dm.openAddModal}
        isShowImportButton={dm.canAction}
        onUploadExcel={() => dm.setShowImportModal(true)}
        onDownloadSampleExcel={dm.downloadSample}
        isShowExportButton={dm.canExport && dm.departmentList.length > 0}
        onExportExcel={dm.exportExcel}
        onExportPdf={dm.exportPdf}
      />

      <DepartmentTable {...dm} />
      <DepartmentViewModal {...dm} />
      <DepartmentFormModal {...dm} />
      <DepartmentDeleteDialog {...dm} />

      <ExportImport
        open={dm.showImportModal}
        onClose={() => dm.setShowImportModal(false)}
        onUpload={(file, merge) => {
          dm.setShowImportModal(false)
          dm.uploadExcel(file, merge)
        }}
      />
    </div>
  )
}

export default DepartmentMasterPage
