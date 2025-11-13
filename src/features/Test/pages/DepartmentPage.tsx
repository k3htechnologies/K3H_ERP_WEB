import React, { useState, useEffect } from "react";
import { DepartmentMasterDatasourceImpl } from "@/features/departmentMaster/datasources/DepartmentMasterDatasource";
import type { DepartmentMasterData } from "@/features/departmentMaster/models/DepartmentMasterModel";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";

//  Create datasource instance
const datasource = new DepartmentMasterDatasourceImpl();

const DepartmentPage: React.FC = () => {
  const [departments, setDepartments] = useState<DepartmentMasterData[]>([]);
  const [filteredData, setFilteredData] = useState<DepartmentMasterData[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch departments from API
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await datasource.pullDepartmentMaster({
        PageNumber: 1,
        PageSize: 100,
        IsCheckPermission: false,
      });
      const data = (response?.Data || response || []).sort(
        (a, b) => a.DepartmentMasterId - b.DepartmentMasterId
      );

      setDepartments(data);
      setFilteredData(data);
    } catch (err: any) {
      console.error("Error fetching departments:", err);
      setError("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleDepartmentChange = (value: string | number) => {
    const deptName = String(value);
    setSelectedDept(deptName);

    if (deptName) {
      const filtered = departments.filter((d) => d.DepartmentName === deptName);
      setFilteredData(filtered);
      localStorage.setItem("selectedDepartmentName", deptName);
    } else {
      setFilteredData(departments);
      localStorage.removeItem("selectedDepartmentName");
    }
  };

  const dropdownOptions = [
    { DepartmentName: "All Departments", value: "" },
    ...departments.map((d) => ({
      DepartmentName: d.DepartmentName,
      value: d.DepartmentName,
      DepartmentCode: d.DepartmentCode ?? "—",
      LastModifiedBy: d.LastModifiedBy ?? "Unknown",
      LastModifiedDate: d.LastModifiedDate ?? null,
    })),
  ];

  return (
    <div style={{ padding: "24px" }}>
      <h2 style={{ fontSize: "22px", fontWeight: 600, marginBottom: "20px" }}>
        Department Details
      </h2>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <>
          <div style={{ maxWidth: "350px", marginBottom: "24px" }}>
            <SinglePageSelection
              label="Select Department"
              options={dropdownOptions}
              value={selectedDept}
              onChange={handleDepartmentChange}
            />
          </div>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid #ccc",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f3f4f6", color: "#222" }}>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                  Department Name
                </th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                  Department Code
                </th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                  Last Modified By
                </th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                  Last Modified Date
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((dept) => (
                  <tr key={dept.DepartmentMasterId}>
                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                      {dept.DepartmentName}
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                      {dept.DepartmentCode}
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                      {dept.LastModifiedBy || "—"}
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                      {dept.LastModifiedDate
                        ? new Date(dept.LastModifiedDate).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "12px" }}>
                    No departments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default DepartmentPage;
