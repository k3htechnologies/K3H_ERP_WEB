import { Modal } from '@/ui/components/Modal/Modal'
import { Input } from '@/ui/components/forms'

export const DepartmentFormModal = ({
  showAddEdit,
  setShowAddEdit,
  formData,
  setFormData,
  editingData,
  handleAddUpdateDepartment,
  errors,
  setErrors,
  isLoading
}: any) => {

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev: any) => ({ ...prev, [field]: '' }))
  }

  return (
    <Modal
      isOpen={showAddEdit}
      onClose={() => {
        setShowAddEdit(false)
        setErrors({})
      }}
      title={editingData ? 'Update Department' : 'Add Department'}
      onSubmit={handleAddUpdateDepartment}
      saveText={editingData ? 'Update' : 'Add'}
      resetText="Reset"
      loading={isLoading}
      size="xl"
    >
      <Input
        label="Department Code"
        required
        error={errors?.DepartmentCode}
        value={formData.DepartmentCode.toUpperCase()}
        maxLength={4}
        onChange={(e) => handleFieldChange('DepartmentCode', e.target.value)}
      />

      <Input
        label="Department Name"
        required
        error={errors?.DepartmentName}
        value={formData.DepartmentName}
        maxLength={100}
        onChange={(e) => handleFieldChange('DepartmentName', e.target.value)}
      />
    </Modal>
  )
}
