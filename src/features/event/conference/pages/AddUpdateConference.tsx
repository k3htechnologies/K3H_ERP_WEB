import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import * as E from 'fp-ts/Either'
import { CONFERENCE_ROOM_NAME } from '@/core/constants'
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from '@/core/utils/dateFormat'
import { runApiWithLoader } from '@/core/utils'
import { Loader } from '@/core/utils/loader'
import useToast from '@/core/hooks/useToast'
import { useMultiSelectDropdown } from '@/core/hooks/useMultiSelectDropdown'
import { fetchEmployeeMasterDropdown } from '@/features/employeeMaster/employeeMasterDropDown'
import { CONFERENCE_EVENT_TYPE } from '@/features/event/conference/constants/conferenceConstants'
import { getInitialEventFormState } from '@/features/event/event/constants/eventConstants'
import type { AddUpdateEventRequest } from '@/features/event/event/models/EventModel'
import { EventService } from '@/features/event/event/services/EventService'
import MultiSelectPagination from '@/ui/components/DropDown/Multiselectpagination'
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection'
import DatePickerInput from '@/ui/components/forms/Datepicker'
import { Button, Input } from '@/ui/components/forms'
import { TimePicker } from '@/ui/components/TimePicker/TimePicker'

const AddUpdateConference: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { addToast } = useToast()
  const [formData, setFormData] = useState<AddUpdateEventRequest>(() => ({
    ...getInitialEventFormState(),
    Type: CONFERENCE_EVENT_TYPE,
    Room: searchParams.get('room') ?? '',
  }))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const employeeDropdown = useMultiSelectDropdown({
    value: null,
    fetchCallback: fetchEmployeeMasterDropdown,
    autoFetchOptions: true,
  })

  const updateField = (field: keyof AddUpdateEventRequest, value: AddUpdateEventRequest[keyof AddUpdateEventRequest]) => {
    setFormData((current) => ({ ...current, [field]: value }))
    if (errors[field]) setErrors((current) => ({ ...current, [field]: '' }))
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    if (!formData.Title?.trim()) nextErrors.Title = 'Meeting title is required'
    if (!formData.Date) nextErrors.Date = 'Meeting date is required'
    if (!formData.StartTime || formData.StartTime === '00:00') nextErrors.StartTime = 'Start time is required'
    if (!formData.EndTime || formData.EndTime === '00:00') nextErrors.EndTime = 'End time is required'
    if (!formData.Room) nextErrors.Room = 'Conference room is required'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validate()) return

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = new FormData()
        payload.append('EventId', String(formData.EventId ?? 0))
        payload.append('Uniquekey', formData.Uniquekey ?? '')
        payload.append('Type', CONFERENCE_EVENT_TYPE)
        payload.append('Title', formData.Title?.trim() ?? '')
        payload.append('ProjectId', '')
        payload.append('DepartmentId', '')
        payload.append('EmployeeId', employeeDropdown.selectedValues.join(','))
        payload.append('Date', formData.Date ?? '')
        payload.append('DeadlineDate', '')
        payload.append('StartTime', formData.StartTime ?? '')
        payload.append('EndTime', formData.EndTime ?? '')
        payload.append('Room', formData.Room ?? '')
        payload.append('Priority', '')
        payload.append('Description', '')
        payload.append('RemoveDocumentURL', '')

        const response = await EventService.apiCallAddUpdateEvent(payload)
        if (E.isRight(response)) {
          addToast({ type: 'success', title: response.right.SuccessMessage[0] ?? 'Conference scheduled successfully' })
          navigate('/conference')
        } else {
          addToast({ type: 'error', title: response.left.message })
        }
        return response
      },
      undefined,
      (error: unknown) => addToast({ type: 'error', title: (error as Error).message }),
      undefined,
      'Schedule Conference',
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl rounded-xl border border-[#E8EBF0] bg-white shadow-sm">
      <Loader loading={isLoading} title={loadingMessage}><div /></Loader>
      <form onSubmit={handleSubmit} className="p-5 sm:p-7">
        <div className="mb-6 border-b border-[#E3E7ED] pb-4">
          <h1 className="text-lg font-semibold text-[#202B3C]">Schedule Conference</h1>
          <p className="mt-1 text-sm text-[#657084]">Reserve a room and invite the meeting participants.</p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <DatePickerInput label="Meeting Date" value={formatDate_dd_mm_yyyy(formData.Date)} onChange={(value) => updateField('Date', convert_dd_mm_yyyy_To_Yyyy_mm_dd(value))} required error={errors.Date} />
          <TimePicker label="Meeting Start Time" required size="sm" format={24} value={formData.StartTime || ''} onChange={(value) => updateField('StartTime', value)} error={errors.StartTime} />
          <TimePicker label="Meeting End Time" required size="sm" format={24} value={formData.EndTime || ''} onChange={(value) => updateField('EndTime', value)} error={errors.EndTime} />
          <div className="md:col-span-3">
            <Input label="Meeting Title" required value={formData.Title} maxLength={50} onChange={(event) => updateField('Title', event.target.value)} placeholder="Enter meeting title" error={errors.Title} />
          </div>
          <div className="md:col-span-2">
            <MultiSelectPagination label="Select Team Member" dataFetchCallBack={fetchEmployeeMasterDropdown} selectedValues={employeeDropdown.selectedValues} options={employeeDropdown.initialOptions} onChange={(values) => employeeDropdown.handleChange(values)} />
          </div>
          <SinglePageSelection label="Conference Room" required value={formData.Room} onChange={(value) => updateField('Room', String(value))} options={CONFERENCE_ROOM_NAME.map((room) => ({ label: room.name, value: room.id }))} placeholder="Select conference room" error={errors.Room} />
        </div>
        <div className="mt-7 flex justify-end gap-3">
          <Button type="button" color="gray" variant="outline" onClick={() => navigate('/conference')}>Cancel</Button>
          <Button type="submit" color="blue" loading={isLoading}>Schedule Conference</Button>
        </div>
      </form>
    </div>
  )
}

export default AddUpdateConference
