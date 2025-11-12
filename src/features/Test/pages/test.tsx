import React from "react";
import { SingleSelectWithPagination } from "@/ui/components/forms/SingleSelectWithPagination";
import type {
  FilterWithPaginationDepartmentMasterRequest,
  DepartmentMasterListResponse,
} from "@/features/departmentMaster/models/DepartmentMasterModel";
import { DepartmentMasterApi } from "@/features/departmentMaster/api/DepartmentMasterApi";
import baseClient from "@/core/config/baseClient";

export const Test: React.FC = () => {
  // ✅ API call to fetch paginated departments
  const pullDepartmentMaster = async (
    params: FilterWithPaginationDepartmentMasterRequest
  ): Promise<DepartmentMasterListResponse> => {
    try {
      const queryParams = new URLSearchParams({
        PageSize: (params.PageSize ?? 10).toString(),
        PageNumber: (params.PageNumber ?? 1).toString(),
        IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
      });

      if (params.DepartmentMasterId)
        queryParams.append("DepartmentMasterId", params.DepartmentMasterId.toString());
      if (params.DepartmentName?.trim())
        queryParams.append("DepartmentName", params.DepartmentName.trim());
      if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
      if (params.ExportType) queryParams.append("ExportType", params.ExportType);


      const response = await baseClient.getRequestWithAuthentication(
        `${DepartmentMasterApi.PULL}?${queryParams.toString()}`
      );

      return response;
    } catch (error) {
      console.error("❌ Error: Pull Department Master:", error);
      throw error;
    }
  };

  const fetchOptions = async (
    pageNumber: number,
    params?: { value?: string }
  ): Promise<{
    totalNumberOfRecord: number;
    itemList: { label: string; value: string | number }[];
  }> => {
    const apiResponse = await pullDepartmentMaster({
      PageSize: 10,
      PageNumber: pageNumber,
      DepartmentName: params?.value || "",
      IsCheckPermission: true,
    });

    const departmentList =
      apiResponse?.Data?.map((item: any) => ({
        label: item.DepartmentName,
        value: item.DepartmentMasterId,
      })) || [];

    return {
      totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? departmentList.length,
      itemList: departmentList,
    };
  };

  return (
    <div>
      <SingleSelectWithPagination 
        title="Select Department"
        dataFetchCallBack={fetchOptions}
        onSelected={(item) => console.log("Selected Department:", item)}
        initialValue={null}
        dataList={[]} 
        options={[]}      />
    </div>
  );
};
// import React from "react";
// import { SingleSelectWithPagination } from "@/ui/components/forms/SingleSelectWithPagination";

// export const Test: React.FC = () => {
//   // ✅ Static data for testing
//   const staticDepartments = [
//     { label: "HR", value: 1 },
//     { label: "Finance", value: 2 },
//     { label: "IT", value: 3 },
//     { label: "Marketing", value: 4 },
//     { label: "Operations", value: 5 },
//     { label: "Legal", value: 6 },
//     { label: "Admin", value: 7 },
//     { label: "Sales", value: 8 },
//     { label: "Support", value: 9 },
//     { label: "R&D", value: 10 },
//         { label: "aa", value: 11},
//     { label: "vv", value: 12 },
//     { label: "aaa", value: 13 },
//     { label: "sss", value: 14 },
//     { label: "zzzz", value: 15 },
//     { label: "es&D", value: 16 },
//   ];
  

//   const fetchOptions = async (
//     pageNumber: number,
//     params?: { value?: string }
//   ): Promise<{
//     totalNumberOfRecord: number;
//     itemList: { label: string; value: string | number }[];
//   }> => {
//     // simulate filter by search text
//     const filtered = staticDepartments.filter((d) =>
//       params?.value ? d.label.toLowerCase().includes(params.value.toLowerCase()) : true
//     );

//     const pageSize = 5; // pagination size
//     const startIndex = (pageNumber - 1) * pageSize;
//     const paginated = filtered.slice(startIndex, startIndex + pageSize);

//     return {
//       totalNumberOfRecord: filtered.length,
//       itemList: paginated,
//     };
//   };

//   return (
//     <div>
//       <SingleSelectWithPagination
//         title="Select Department"
//         size="lg"
//         dataFetchCallBack={fetchOptions}
//         onSelected={(item) => console.log("✅ Selected Department:", item)}
//         initialValue={null}
//         dataList={[]} 
//         options={[]} 
//       />
//     </div>
//   );
// };
