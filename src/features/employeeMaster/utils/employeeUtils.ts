import type { EmployeeMasterData } from "@/features/employeeMaster/models/EmployeeMasterModel";

export const isEmployeeComplete = (employee: EmployeeMasterData): boolean => {
  const requiredFields: (keyof EmployeeMasterData)[] = [
    "EmployeeCode",
    "FullName",
    "PersonalMobileNumber",
    "EmailId",
     "Gender",
     "MaritalStatus",
    "ReportPersonName",
    "JoiningDate",
    "CompanyName",
    "BankName",
    "BankBranchName",
    "AccountNo",
    "IFSCCode",
    "CommunicationAddress",
    "StateName"
  ];

  return requiredFields.every((field) => {
    const value = employee[field];

    return (
      value !== null &&
      value !== undefined &&
      value.toString().trim() !== ""
    );
  });
};