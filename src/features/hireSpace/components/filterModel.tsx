import React from "react";
import { Modal } from "@/ui/components/Modal/Modal";
import { Input } from "@/ui/components/forms";

interface FilterModalProps {
  onClose: () => void;
  onApply: (filters: JobRoleFilters) => void;
  onReset: () => void;
  value?: JobRoleFilters;
}

export interface JobRoleFilters {
  roleName?: string;
  skills?: string;
  status?: "active" | "inactive";
}

const FilterModal: React.FC<FilterModalProps> = ({
  onClose,
  onApply,
  onReset,
  value,
}) => {
  const [status, setStatus] = React.useState<JobRoleFilters["status"] | "">(
    value?.status ?? "",
  );
  const [roleName, setRoleName] = React.useState(value?.roleName ?? "");
  const [skills, setSkills] = React.useState(value?.skills ?? "");

  const appliedFilters: JobRoleFilters = {
    roleName: roleName.trim() || undefined,
    skills: skills.trim() || undefined,
    status: status || undefined,
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Filter Job Roles"
      onSubmit={(event) => {
        event.preventDefault();
        onApply(appliedFilters);
      }}
      saveText="Apply"
      cancelText="Clear"
      onCancel={onReset}
      size="small-half"
    >
      <div className="space-y-6">
        <Input
          label="Role Name"
          value={roleName}
          onChange={(event) => setRoleName(event.target.value)}
          placeholder="Enter role name"
        />
        <Input
          label="Required Skills"
          value={skills}
          onChange={(event) => setSkills(event.target.value)}
          placeholder="Enter a skill"
        />
        <div>
          <label
            htmlFor="job-role-status-filter"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Status
          </label>
          <select
            id="job-role-status-filter"
            value={status}
            onChange={(event) => setStatus(event.target.value as "" | "active" | "inactive")}
            className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </Modal>
  );
};

export default FilterModal;
