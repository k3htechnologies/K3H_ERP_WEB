import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Button } from '@/ui/components/forms';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import type { ProjectRERADocumentCategoryMasterData } from '@/features/projectRERADocumentCategory/models/ProjectRERADocumentCategoryMasterModel';

interface ProjectRERADocumentCategoryMasterViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ProjectRERADocumentCategoryMasterData | null;
  canAction: boolean;
  onEdit: (data: ProjectRERADocumentCategoryMasterData) => void;
  onDelete: (data: ProjectRERADocumentCategoryMasterData) => void;
}

export const ProjectRERADocumentCategoryMasterViewModal: React.FC<ProjectRERADocumentCategoryMasterViewModalProps> = ({
  isOpen,
  onClose,
  data,
  canAction,
  onEdit,
  onDelete
}) => {
  if (!data) return null;

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
    onEdit(data);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
    onDelete(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Project RERA Document Category Master Details"
      onSubmit={(e) => {
        e.preventDefault();
        onClose();
      }}
      cancelText="Close"
      loading={false}
      size="xl"
    >
      <div className="space-y-6">

        <FieldItem
          label="Document Category"
          value={data.ProjectRERADocumentCategoryName}
          isRow
          withBorder
          className="font-medium text-blue-900 "
        />
        <FieldItem label="Sequence" value={data.OrderBy} isRow withBorder />
        <FieldItem label="Document Count" value={data.DocumentCount ?? 0} isRow withBorder />

        <h4 className="text-lg font-semibold">Action Details</h4>

        <FieldItem
          label="Created By / Date"
          isRow={true}
          value={data.CreatedBy + ' - ' + formatDate_dd_MonthName_yy_hh_mm(data.CreatedDate || '-')}
          withBorder={data.ModifiedBy !== '' ? true : false}
        />

        {data.ModifiedBy !== '' ? (
          <FieldItem
            label="Modified By / Date"
            isRow={true}
            value={data.ModifiedBy + ' - ' + formatDate_dd_MonthName_yy_hh_mm(data.ModifiedDate || '-')}
            withBorder={false}
          />
        ) : (
          ''
        )}


        <div className="flex justify-between items-center">
          {canAction && (
            <>
              {data.DocumentCount === 0 ? (
                <Button
                  color="red"
                  variant="solid"
                  colorMode="light"
                  size="md"
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              ) : <div style={{ width: "120px", height: "44px" }}></div>}

              <Button
                color="blue"
                size="md"
                onClick={handleEdit}
              >
                Edit
              </Button>
            </>
          )}
        </div>


      </div>
    </Modal>
  );
};

