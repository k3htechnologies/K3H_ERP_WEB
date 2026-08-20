import React from 'react'
import { CONFERENCE_ROOM_NAME, EVENT_TYPE } from '@/core/constants'
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from '@/core/utils/dateFormat'
import { fetchEmployeeMasterDropdown } from '@/features/employeeMaster/employeeMasterDropDown'
import { fetchProjectDropdown } from '@/features/projectMaster/projectDropdown'
import type { AddUpdateEventRequest } from '@/features/event/event/models/EventModel'
import { Modal } from '@/ui/components/Modal/Modal'
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection'
import MultiSelectPagination from '@/ui/components/DropDown/Multiselectpagination'
import DatePickerInput from '@/ui/components/forms/Datepicker'
import { Input } from '@/ui/components/forms'
import { TextArea } from '@/ui/components/forms/Textarea'
import { TimePicker } from '@/ui/components/TimePicker/TimePicker'
import MultiFilePicker from '@/ui/components/ImagePicker/MultiFilePicker'

interface AddUpdateEventModalProps {
  isOpen: boolean
  isLoading: boolean
  isEditMode: boolean
  formData: AddUpdateEventRequest
  errors: { [k: string]: string }
  lockedEventType: string | null
  documentFiles: (File | string)[]
  documentURL: string | null
  employeeSelectedValues: any
  employeeOptions: any
  projectSelectedValues: any
  projectOptions: any
  onClose: () => void
  onSubmit: (event: React.FormEvent) => void
  onFieldChange: (field: keyof AddUpdateEventRequest, value: AddUpdateEventRequest[keyof AddUpdateEventRequest]) => void
  onEmployeesChange: (values: any) => void
  onProjectsChange: (values: any) => void
  onDocumentFilesChange: (files: (File | string)[]) => void
  onRemoveExistingDocument: (url: string) => void
}

export const AddUpdateEventModal = React.memo<AddUpdateEventModalProps>(({
  isOpen,
  isLoading,
  isEditMode,
  formData,
  errors,
  lockedEventType,
  documentFiles,
  documentURL,
  employeeSelectedValues,
  employeeOptions,
  projectSelectedValues,
  projectOptions,
  onClose,
  onSubmit,
  onFieldChange,
  onEmployeesChange,
  onProjectsChange,
  onDocumentFilesChange,
  onRemoveExistingDocument,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    onCancel={onClose}
    title={isEditMode ? 'Update' : 'Add'}
    onSubmit={onSubmit}
    saveText="Save"
    loading={isLoading}
    size="md"
  >
    <div className="space-y-10 p-6 bg-blue-100">
      <div className="space-y-4">
        <div>
          <SinglePageSelection
            label="Type"
            required
            disabled={lockedEventType !== null}
            value={formData.Type}
            onChange={(e) => onFieldChange('Type', String(e))}
            options={EVENT_TYPE
              .filter((opt) => !String(opt.name).toUpperCase().includes('CONFERENCE'))
              .map((opt) => ({ label: opt.name, value: opt.id }))}
            error={errors.Type}
          />
        </div>
        <div>
          <Input
            label="Title"
            required
            error={errors.Title}
            value={formData.Title}
            maxLength={50}
            onChange={(e) => onFieldChange('Title', e.target.value)}
            placeholder="Enter Title"
          />
        </div>
        {formData.Type?.toUpperCase() === 'TASK' ? (
          <div>
            <DatePickerInput
              label="Deadline Date"
              value={formatDate_dd_mm_yyyy(formData.DeadlineDate)}
              onChange={(val) => onFieldChange('DeadlineDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
              required
              error={errors.DeadlineDate}
            />
          </div>
        ) : ''}
        {formData.Type?.toUpperCase() !== 'TASK' ? (
          <>
            <div>
              <DatePickerInput
                label="Date"
                value={formatDate_dd_mm_yyyy(formData.Date)}
                onChange={(val) => onFieldChange('Date', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                required
                error={errors.Date}
              />
            </div>
            <div>
              <TimePicker
                label="Start Time"
                required
                size="sm"
                format={24}
                value={formData.StartTime || ''}
                onChange={(val) => onFieldChange('StartTime', val)}
                error={errors.StartTime}
              />
            </div>
            <div>
              <TimePicker
                label="End Time"
                required
                size="sm"
                format={24}
                value={formData.EndTime || ''}
                onChange={(val) => onFieldChange('EndTime', val)}
                error={errors.EndTime}
              />
            </div>
          </>
        ) : ''}
        <div>
          <MultiSelectPagination
            label="Add Employee"
            dataFetchCallBack={fetchEmployeeMasterDropdown}
            selectedValues={employeeSelectedValues}
            options={employeeOptions}
            onChange={onEmployeesChange}
          />
        </div>
        {formData.Type?.toUpperCase() !== 'TASK' ? (
          <div>
            <SinglePageSelection
              label="Room"
              required
              value={formData.Room}
              onChange={(e) => onFieldChange('Room', String(e))}
              options={CONFERENCE_ROOM_NAME.map((option) => ({ label: option.name, value: option.id }))}
              error={errors.Room}
            />
          </div>
        ) : ''}
        <div>
          <MultiSelectPagination
            label="Add Project"
            dataFetchCallBack={fetchProjectDropdown}
            selectedValues={projectSelectedValues}
            options={projectOptions}
            onChange={onProjectsChange}
          />
        </div>
        <div>
          <MultiFilePicker
            label="Document"
            required
            error={errors.DocumentURL}
            value={documentFiles}
            onChange={onDocumentFilesChange}
            availableFilesURL={documentURL ?? ''}
            allowedTypes={['image/jpeg', 'image/png', 'image/jpg']}
            maxFiles={5}
            onRemoveExisting={onRemoveExistingDocument}
          />
        </div>
        <div>
          <TextArea
            label="Remark"
            value={formData.Description}
            onChange={(e) => onFieldChange('Description', e.target.value)}
            error={errors.Description}
          />
        </div>
      </div>
    </div>
  </Modal>
))

AddUpdateEventModal.displayName = 'AddUpdateEventModal'
