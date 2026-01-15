import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox'

export const DepartmentDeleteDialog = ({
  showDelete,
  setShowDelete,
  handleDelete
}: any) => {
  return (
    <ConfirmationDialogBox
      isOpen={showDelete}
      onClose={() => setShowDelete(false)}
      onConfirm={handleDelete}
      title="Delete Department?"
      message="This action cannot be undone."
      confirmText="Delete"
      cancelText="Cancel"
      variant="danger"
    />
  )
}
