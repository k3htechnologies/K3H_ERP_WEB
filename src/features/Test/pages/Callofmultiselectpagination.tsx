import React, { useEffect, useState } from "react";
import MultiSelectPagination from "@/ui/components/DropDown/Multiselectpagination";
import { departmentMasterService } from "@/features/departmentMaster/services/DepartmentMasterService";
import * as E from "fp-ts/Either";

interface Department {
  id: number;
  departmentName: string;
  departmentCode: string;
  employeeCount: number;
  lastModifiedBy: string;
  lastModifiedDate: string;
}

const DepartmentPageMultiSelect: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredData, setFilteredData] = useState<Department[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<(string | number)[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const params = { PageNumber: 1, PageSize: 100, searchTerm: "", filters: [] };
      const result = await departmentMasterService.apiCallPullDepartmentMaster(params);

      if (E.isRight(result)) {
        const response = result.right;
        if (response?.Data && Array.isArray(response.Data)) {
          const formatted = response.Data.map((item: any, index: number) => ({
            id: item.DepartmentMasterId ?? index + 1,
            departmentName: item.DepartmentName ?? "Unnamed Department",
            departmentCode: item.DepartmentCode ?? "-",
            employeeCount: item.NumberOfEmployee ?? 0,
            lastModifiedBy: item.LastModifiedBy || item.ModifiedBy || "N/A",
            lastModifiedDate:
              item.LastModifiedDate || item.ModifiedDate
                ? new Date(item.LastModifiedDate || item.ModifiedDate!).toLocaleString()
                : "-",
          }));
          setDepartments(formatted);
          setFilteredData(formatted);
        } else {
          setDepartments([]);
        }
      } else {
        setDepartments([]);
      }
    } finally {
      setLoading(false);
    }
  };

   useEffect(() => {
    localStorage.removeItem("selectedDepartments");
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleDepartmentChange = (values: (string | number)[]) => {
    setSelectedDepartments(values);
    if (values.length > 0) {
      setFilteredData(departments.filter((d) => values.includes(d.departmentName)));
      localStorage.setItem("selectedDepartments", JSON.stringify(values));
    } else {
      setFilteredData(departments);
      localStorage.removeItem("selectedDepartments");
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("selectedDepartments");
    if (saved && departments.length > 0) {
      const parsed = JSON.parse(saved);
      setSelectedDepartments(parsed);
      setFilteredData(departments.filter((d) => parsed.includes(d.departmentName)));
    }
  }, [departments]);

  const headerStyle: React.CSSProperties = {
    border: "1px solid #ccc",
    padding: "10px",
    whiteSpace: "nowrap",
    textAlign: "left",
    backgroundColor: "#f3f4f6",
    fontWeight: 600,
    color: "#222",
  };

  return (
    <div style={{ padding: "24px" }}>
      <h2 style={{ fontSize: "22px", fontWeight: 600, marginBottom: "20px" }}>
        Department Master MultiSelect
      </h2>

      <div style={{ maxWidth: "380px", marginBottom: "24px" }}>
        <MultiSelectPagination
          label="Select Departments"
          options={departments.map((dept) => ({
            label: dept.departmentName,
            value: dept.departmentName,
          }))}
          selectedValues={selectedDepartments}
          onChange={handleDepartmentChange}
        />
      </div>

      {loading ? (
        <p>Loading departments...</p>
      ) : filteredData.length === 0 ? (
        <p style={{ color: "#888" }}>No departments found.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #ccc",
            fontSize: "14px",
          }}
        >
          <thead>
            <tr>
              <th style={headerStyle}>Department Name</th>
              <th style={headerStyle}>Department Code</th>
              <th style={headerStyle}>Employee Count</th>
              <th style={headerStyle}>Last Modified By</th>
              <th style={headerStyle}>Last Modified Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((dept) => (
              <tr key={dept.id}>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {dept.departmentName}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {dept.departmentCode}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px", textAlign: "center" }}>
                  {dept.employeeCount}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {dept.lastModifiedBy}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {dept.lastModifiedDate}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DepartmentPageMultiSelect;
