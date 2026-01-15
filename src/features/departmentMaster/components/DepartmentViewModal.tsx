import { Modal } from '@/ui/components/Modal/Modal'

export const DepartmentViewModal = ({ showView, setShowView, editingData }: any) => {
  if (!editingData) return null

  return (
    <Modal isOpen={showView} onClose={() => setShowView(false)} title="Department Details">
      <p><b>Code:</b> {editingData.DepartmentCode}</p>
      <p><b>Name:</b> {editingData.DepartmentName}</p>
      <p><b>Employees:</b> {editingData.NumberOfEmployee}</p>
    </Modal>
  )
}
