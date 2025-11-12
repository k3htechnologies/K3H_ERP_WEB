import React, { useState, useEffect } from "react";
import { DepartmentMasterApi } from "@/features/departmentMaster/api/DepartmentMasterApi";
import type {
  FilterWithPaginationDepartmentMasterRequest,
  DepartmentMasterListResponse,
} from "@/features/departmentMaster/models/DepartmentMasterModel";
import baseClient from "@/core/config/baseClient";
import { MultiSelectDropdown } from "@/ui/components/DropDown/MultiSelectDropdown";

export const Test2: React.FC = () => {
  const [departments, setDepartments] = useState<{ label: string; value: string | number }[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDepartments = async (searchTerm: string = "") => {
    setLoading(true);
    try {
      const params: FilterWithPaginationDepartmentMasterRequest = {
        PageSize: 100,
        PageNumber: 1,
        DepartmentName: searchTerm,
        IsCheckPermission: true,
      };

      const queryParams = new URLSearchParams({
        PageSize: params.PageSize.toString(),
        PageNumber: params.PageNumber.toString(),
        IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
      });

      if (params.DepartmentName?.trim()) {
        queryParams.append("DepartmentName", params.DepartmentName.trim());
      }

      const response: DepartmentMasterListResponse =
        await baseClient.getRequestWithAuthentication(
          `${DepartmentMasterApi.PULL}?${queryParams.toString()}`
        );

      console.log("🧩 API Raw Response:", response);

      const departmentOptions =
        Array.isArray(response?.Data)
          ? response.Data.map((d: any) => ({
              label: d.DepartmentName ?? "",
              value: d.DepartmentMasterId ?? "",
            }))
          : [];

      console.log("✅ Department Options:", departmentOptions);
      setDepartments(departmentOptions);
    } catch (error) {
      console.error("❌ Error fetching departments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments(); // initial load
  }, []);

  const handleSelection = (selectedItems: { label: string; value: string | number }[]) => {
    console.log("✅ Selected Departments:", selectedItems);
  };

  const handleSearch = (searchValue: string) => {
    console.log("🔍 Searching:", searchValue);
    fetchDepartments(searchValue);
  };

  return (
    <div>
   <div >
  <MultiSelectDropdown
    title="Select Departments"
    dataList={departments}
    size='lg'
    onSelected={handleSelection}
    onSearch={handleSearch}  // 👈 dynamic API-based search
    initialValues={[]}
    loading={loading}
    noDataText="No departments found"
  />
</div>

    </div>
  );
};
