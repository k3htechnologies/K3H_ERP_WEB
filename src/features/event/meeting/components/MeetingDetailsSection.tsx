import React, { useEffect, useState } from "react";
import type { DropdownItem } from "@/core/types/DropdownItem";
import { X } from "lucide-react";
import {
  convert_dd_mm_yyyy_To_Yyyy_mm_dd,
  formatDate_dd_mm_yyyy,
} from "@/core/utils/dateFormat";
import { filterEmail, filterMobile } from "@/core/utils/fileValidation";
import { fetchDepartmentMasterDropdown } from "@/features/departmentMaster/departmentMasterDropdown";
import { fetchDesignationMasterDropdown } from "@/features/designationMaster/designationMasterDropDown";
import { fetchEmployeeMasterDropdown } from "@/features/employeeMaster/employeeMasterDropDown";
import { Button, Input } from "@/ui/components/forms";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import RadioPill from "@/ui/components/forms/RadioPill";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import MultiSelectPagination from "@/ui/components/DropDown/Multiselectpagination";
import Tabs from "@/ui/components/Tab/Tab";
import type { AddUpdateEventRequest } from "@/features/event/event/models/EventModel";
import MeetingSection from "./MeetingSection";
import type {
  ExternalParticipantDetails,
  MeetingMetadata,
  MeetingMode,
  MeetingType,
} from "@/features/event/meeting/models/MeetingModel";

const MEETING_TYPES: Array<{
  id: MeetingType;
  description: string;
}> = [
  {
    id: "Department",
    description:
      "Meeting held for a specific department, with employees attending from it.",
  },
  {
    id: "Employees",
    description:
      "Meeting organised around a hand-picked list of employees, any department.",
  },
  {
    id: "External Participant",
    description:
      "Meeting with external participants - clients, vendors, contractors, consultants.",
  },
];

const MEETING_MODES: MeetingMode[] = ["Online", "Physical", "Onsite"];

interface ExternalParticipantDetailsErrors {
  ParticipantName?: string;
  CompanyName?: string;
  DesignationId?: string;
  MobileNumber?: string;
  Email?: string;
  Remark?: string;
}

export interface MeetingDetailsErrors {
  Title?: string;
  DepartmentId?: string;
  EmployeeId?: string;
  ExternalParticipants?: string;
  ExternalParticipantDetails?: ExternalParticipantDetailsErrors;
  Date?: string;
  StartTime?: string;
  EndTime?: string;
  Room?: string;
}

interface MeetingDetailsSectionProps {
  formData: AddUpdateEventRequest;
  metadata: MeetingMetadata;
  disabled?: boolean;
  allowEmployeeSelection?: boolean;
  errors?: MeetingDetailsErrors;
  departmentValues: (string | number)[];
  departmentOptions?: Array<{
    label: string;
    value: string | number;
  }>;
  employeeValues: (string | number)[];
  employeeOptions?: Array<{
    label: string;
    value: string | number;
    EmployeeCode?: string;
    Department?: string;
    Designation?: string;
  }>;
  conferenceRoomOptions?: Array<{
    label: string;
    value: string | number;
  }>;
  isLoadingConferenceRooms?: boolean;
  onFieldChange: (
    field: keyof AddUpdateEventRequest,
    value: AddUpdateEventRequest[keyof AddUpdateEventRequest],
  ) => void;
  onMetadataChange: <K extends keyof MeetingMetadata>(
    field: K,
    value: MeetingMetadata[K],
  ) => boolean | void;
  onDepartmentsChange: (values: (string | number)[]) => void;
  onEmployeesChange: (values: (string | number)[]) => void;
}

export const MeetingDetailsSection: React.FC<MeetingDetailsSectionProps> = ({
  formData,
  metadata,
  disabled = false,
  allowEmployeeSelection = false,
  errors = {},
  departmentValues,
  departmentOptions = [],
  employeeValues,
  employeeOptions = [],
  conferenceRoomOptions = [],
  isLoadingConferenceRooms = false,
  onFieldChange,
  onMetadataChange,
  onDepartmentsChange,
  onEmployeesChange,
}) => {
  const [showAllDepartments, setShowAllDepartments] = useState(false);
  const [showAllEmployees, setShowAllEmployees] = useState(false);
  const [departmentOptionCache, setDepartmentOptionCache] =
    useState(departmentOptions);
  const [employeeOptionCache, setEmployeeOptionCache] = useState(employeeOptions);
  const employeeControlsDisabled = disabled && !allowEmployeeSelection;

  useEffect(() => {
    setDepartmentOptionCache((current) => {
      const merged = [...current];
      departmentOptions.forEach((option) => {
        const existingIndex = merged.findIndex(
          (item) => String(item.value) === String(option.value),
        );
        if (existingIndex >= 0) merged[existingIndex] = option;
        else merged.push(option);
      });
      return merged;
    });
  }, [departmentOptions]);

  useEffect(() => {
    setEmployeeOptionCache((current) => {
      const merged = [...current];
      employeeOptions.forEach((option) => {
        const existingIndex = merged.findIndex(
          (item) => String(item.value) === String(option.value),
        );
        if (existingIndex >= 0) merged[existingIndex] = option;
        else merged.push(option);
      });
      return merged;
    });
  }, [employeeOptions]);
  const participantDetails = metadata.ExternalParticipantDetails;
  const selectedDepartments = departmentValues.map((departmentId) => {
    const department = departmentOptionCache.find(
      (option) => String(option.value) === String(departmentId),
    );
    return (
      department || {
        label: String(departmentId),
        value: departmentId,
      }
    );
  });
  const visibleDepartments = showAllDepartments
    ? selectedDepartments
    : selectedDepartments.slice(0, 4);
  const selectedEmployees = employeeValues.map((employeeId) => {
    const employee = employeeOptionCache.find(
      (option) => String(option.value) === String(employeeId),
    );

    return (
      employee || {
        label: String(employeeId),
        value: employeeId,
      }
    );
  });
  const visibleEmployees = showAllEmployees
    ? selectedEmployees
    : selectedEmployees.slice(0, 4);
  const designationInitialValue: DropdownItem | null =
    participantDetails.DesignationId || participantDetails.DesignationName
      ? {
          value:
            participantDetails.DesignationId ||
            participantDetails.DesignationName,
          label:
            participantDetails.DesignationName ||
            participantDetails.DesignationId,
        }
      : null;

  const updateParticipantField = <
    K extends keyof ExternalParticipantDetails,
  >(
    field: K,
    value: ExternalParticipantDetails[K],
  ) => {
    const updatedDetails = {
      ...participantDetails,
      [field]: value,
    };
    onMetadataChange("ExternalParticipantDetails", updatedDetails);
    if (field === "ParticipantName") {
      onMetadataChange("ExternalParticipants", String(value));
    }
  };

  const updateMeetingMode = (mode: MeetingMode) => {
    if (mode === metadata.MeetingMode) return;
    const isModeChanged = onMetadataChange("MeetingMode", mode);
    if (isModeChanged !== false) onFieldChange("Room", "");
  };

  return (
    <>
      <MeetingSection
        title="Meeting Details"
        contentClassName="rounded-lg bg-white p-3"
      >
          <Tabs
            tabs={MEETING_TYPES.map((meetingType) => ({
              id: meetingType.id,
              label: meetingType.id,
              description: meetingType.description,
              disabled,
            }))}
            activeTab={metadata.MeetingType}
            onTabChange={(tab) =>
              onMetadataChange("MeetingType", tab.id as MeetingType)
            }
            ariaLabel="Meeting type"
            isDescriptionCards
          />

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Input
              label="Meeting Subject"
              required={!disabled}
              disabled={disabled}
              value={formData.Title || ""}
              onChange={(event) =>
                onFieldChange("Title", event.target.value)
              }
              placeholder="Enter meeting subject"
              error={errors.Title}
            />

            <DatePickerInput
              label="Meeting Date"
              required={!disabled}
              disabled={disabled}
              value={formatDate_dd_mm_yyyy(formData.Date)}
              onChange={(value) =>
                onFieldChange(
                  "Date",
                  convert_dd_mm_yyyy_To_Yyyy_mm_dd(value) || "",
                )
              }
              error={errors.Date}
            />

            <Input
              type="time"
              label="Meeting Start Time"
              required={!disabled}
              disabled={disabled}
              value={formData.StartTime || ""}
              onChange={(event) =>
                onFieldChange("StartTime", event.target.value)
              }
              error={errors.StartTime}
            />

            <Input
              type="time"
              label="Meeting End Time"
              required={!disabled}
              disabled={disabled}
              value={formData.EndTime || ""}
              onChange={(event) =>
                onFieldChange("EndTime", event.target.value)
              }
              error={errors.EndTime}
            />

            <div>
              <span className="mb-2 block text-sm font-medium text-[#202229]">
                Meeting Mode
              </span>
              <div className="grid h-11 grid-cols-3 rounded-lg border border-[#B8CBFA] p-0.5">
                {MEETING_MODES.map((mode) => (
                  <RadioPill
                    key={mode}
                    name="meeting-mode"
                    label={mode}
                    checked={metadata.MeetingMode === mode}
                    disabled={disabled}
                    onChange={() => updateMeetingMode(mode)}
                    variant="segmented"
                  />
                ))}
              </div>
            </div>

            {metadata.MeetingMode === "Online" ? (
              <Input
                type="url"
                label="Meeting Link"
                required={!disabled}
                disabled={disabled}
                value={formData.Room || ""}
                onChange={(event) => onFieldChange("Room", event.target.value)}
                placeholder="Enter meeting link"
                error={errors.Room}
              />
            ) : metadata.MeetingMode === "Onsite" ? (
              <Input
                type="text"
                label="Meeting Location"
                required={!disabled}
                disabled={disabled}
                value={formData.Room || ""}
                onChange={(event) => onFieldChange("Room", event.target.value)}
                placeholder="Enter meeting location"
                error={errors.Room}
              />
            ) : (
              <SinglePageSelection
                label="Meeting Location"
                required={!disabled}
                disabled={disabled || isLoadingConferenceRooms}
                value={formData.Room || ""}
                onChange={(value) => onFieldChange("Room", String(value))}
                options={conferenceRoomOptions}
                placeholder={isLoadingConferenceRooms ? "Loading locations..." : "Select location"}
                error={errors.Room}
              />
            )}

            <Input
              label="Remark"
              disabled={disabled}
              value={metadata.Remark}
              onChange={(event) =>
                onMetadataChange("Remark", event.target.value)
              }
              placeholder="Enter remark"
            />
          </div>
      </MeetingSection>

      {metadata.MeetingType === "Department" && (
        <MeetingSection
          className="mt-6"
          title="Employee Details"
          contentClassName="rounded-lg bg-white p-3"
        >
          <MultiSelectPagination
            label="Select Department Attending Meeting"
            title="Select Department"
            required={!disabled}
            disabled={disabled}
            dataFetchCallBack={fetchDepartmentMasterDropdown}
            selectedValues={departmentValues}
            options={departmentOptions}
            onChange={onDepartmentsChange}
            onSelectedOptionsChange={(selectedOptions) =>
              setDepartmentOptionCache((current) => {
                const merged = [...current];
                selectedOptions.forEach((option) => {
                  const existingIndex = merged.findIndex(
                    (item) => String(item.value) === String(option.value),
                  );
                  if (existingIndex >= 0) merged[existingIndex] = option;
                  else merged.push(option);
                });
                return merged;
              })
            }
            error={errors.DepartmentId}
          />

          {selectedDepartments.length > 0 && (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {visibleDepartments.map((department) => (
                <div
                  key={String(department.value)}
                  className="relative min-h-[76px] rounded-md border border-[#D8E0EE] bg-[#F7F9FD] p-3 pr-8"
                >
                  {!disabled && (
                    <div className="absolute right-1 top-1">
                      <Button
                        color="transparent"
                        size="sm"
                        isborderRadius
                        aria-label={`Remove ${department.label}`}
                        onClick={() =>
                          onDepartmentsChange(
                            departmentValues.filter(
                              (value) =>
                                String(value) !== String(department.value),
                            ),
                          )
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <FieldItem label="Department" value={department.label} />
                  <div className="mt-2">
                    <FieldItem label="Department ID" value={department.value} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedDepartments.length > 4 && (
            <div className="mt-3 flex justify-end">
              <Button
                color="blue"
                size="sm"
                onClick={() => setShowAllDepartments((current) => !current)}
              >
                {showAllDepartments ? "Show Less" : "View All"}
              </Button>
            </div>
          )}
        </MeetingSection>
      )}

      {metadata.MeetingType === "External Participant" && (
        <MeetingSection
          className="mt-6"
          title="Participant Details"
          contentClassName="rounded-lg bg-white p-3"
        >
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Input
              label="Participant Name"
              required={!disabled}
              disabled={disabled}
              value={participantDetails.ParticipantName}
              onChange={(event) =>
                updateParticipantField(
                  "ParticipantName",
                  event.target.value,
                )
              }
              placeholder="Enter participant name"
              error={errors.ExternalParticipantDetails?.ParticipantName}
            />

            <Input
              label="Company Name"
              disabled={disabled}
              value={participantDetails.CompanyName}
              onChange={(event) =>
                updateParticipantField("CompanyName", event.target.value)
              }
              placeholder="Enter company name"
              error={errors.ExternalParticipantDetails?.CompanyName}
            />

            <SingleSelectDropdownWithPagination
              label="Designation"
              title="Select Designation"
              disabled={disabled}
              dataFetchCallBack={fetchDesignationMasterDropdown}
              initialValue={designationInitialValue}
              onSelected={(item) =>
                onMetadataChange("ExternalParticipantDetails", {
                  ...participantDetails,
                  DesignationId: item ? String(item.value) : "",
                  DesignationName: item?.label || "",
                })
              }
              error={errors.ExternalParticipantDetails?.DesignationId}
            />

            <Input
              label="Mobile Number"
              disabled={disabled}
              value={participantDetails.MobileNumber}
              onChange={(event) =>
                updateParticipantField(
                  "MobileNumber",
                  filterMobile(event.target.value),
                )
              }
              placeholder="Enter mobile number"
              error={errors.ExternalParticipantDetails?.MobileNumber}
            />

            <Input
              type="email"
              label="E-mail"
              disabled={disabled}
              value={participantDetails.Email}
              onChange={(event) =>
                updateParticipantField(
                  "Email",
                  filterEmail(event.target.value),
                )
              }
              placeholder="Enter e-mail"
              error={errors.ExternalParticipantDetails?.Email}
            />

            <Input
              label="Remark"
              disabled={disabled}
              value={participantDetails.Remark}
              onChange={(event) =>
                updateParticipantField("Remark", event.target.value)
              }
              placeholder="Enter remark"
              error={errors.ExternalParticipantDetails?.Remark}
            />
          </div>
        </MeetingSection>
      )}

      {metadata.MeetingType === "Employees" && (
        <MeetingSection
          className="mt-6"
          title="Employee Details"
          contentClassName="rounded-lg bg-white p-3"
        >
          <MultiSelectPagination
            label="Select Employees Attending Meeting"
            title="Select Employees"
            required={!employeeControlsDisabled}
            disabled={employeeControlsDisabled}
            dataFetchCallBack={fetchEmployeeMasterDropdown}
            selectedValues={employeeValues}
            options={employeeOptions}
            onChange={onEmployeesChange}
            onSelectedOptionsChange={(selectedOptions) =>
              setEmployeeOptionCache((current) => {
                const merged = [...current];
                selectedOptions.forEach((option) => {
                  const existingIndex = merged.findIndex(
                    (item) => String(item.value) === String(option.value),
                  );
                  if (existingIndex >= 0) {
                    merged[existingIndex] = option;
                  } else {
                    merged.push(option);
                  }
                });
                return merged;
              })
            }
            error={errors.EmployeeId}
          />

          {selectedEmployees.length > 0 && (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {visibleEmployees.map((employee) => (
                <div
                  key={String(employee.value)}
                  className="relative min-h-[76px] rounded-md border border-[#D8E0EE] bg-[#F7F9FD] p-3 pr-8"
                >
                  {!employeeControlsDisabled && (
                    <div className="absolute right-1 top-1">
                      <Button
                        color="transparent"
                        size="sm"
                        isborderRadius
                        aria-label={`Remove ${employee.label}`}
                        onClick={() =>
                          onEmployeesChange(
                            employeeValues.filter(
                              (value) =>
                                String(value) !== String(employee.value),
                            ),
                          )
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <FieldItem label="Employee" value={employee.label} />
                    <FieldItem label="Employee Code" value={employee.EmployeeCode} />
                    <FieldItem label="Designation" value={employee.Designation} />
                    <FieldItem label="Department" value={employee.Department} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedEmployees.length > 4 && (
            <div className="mt-3 flex justify-end">
              <Button
                color="blue"
                size="sm"
                onClick={() => setShowAllEmployees((current) => !current)}
              >
                {showAllEmployees ? "Show Less" : "View All"}
              </Button>
            </div>
          )}
        </MeetingSection>
      )}
    </>
  );
};

export default MeetingDetailsSection;
