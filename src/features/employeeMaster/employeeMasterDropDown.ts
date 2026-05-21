import * as E from "fp-ts/Either";
import { employeeMasterService } from "@/features/employeeMaster/services/EmployeeMasterService";
import { ticketService } from "@/features/ticket/services/TicketService";

export const fetchEmployeeMasterDropdown = async (pageNumber: number, params?: { value?: string; departmentName?: string }) => {
  try {
    const responseEither = await employeeMasterService.apiCallPullEmployeeMaster({
      PageSize: 20,
      PageNumber: pageNumber,
      EmployeeName: params?.value || "",
      DepartmentName: params?.departmentName || "",
      IsCheckPermission: false,
    });

    if (E.isLeft(responseEither)) {
      return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }

    const apiResponse = responseEither.right;

    const itemList = (apiResponse?.Data || []).map((d: any) => ({
      label: d.FullName,
      value: String(d.EmployeeId),
      Department: d.Department,
      Designation: d.Designation,
      Branch: d.Branch,
      ReportPersonName: d.ReportPersonName,
      EmailId: d.EmailId,
      PersonalMobileNumber: d.PersonalMobileNumber,
      JoiningDate: d.JoiningDate,
    }));

    return {
      totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
      itemList,
    };
  } catch (err) {
    console.error("FETCH EMPLOYEE MASTER DROPDOWN ERROR", err);
    return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
  }
};

export const fetchEmployeeMasterById = async (employeeId: number) => {
  const responseEither = await employeeMasterService.apiCallPullEmployeeMaster({
    PageSize: 1,
    PageNumber: 1,
    EmployeeId: employeeId,
    IsCheckPermission: false,
  });

  if (E.isLeft(responseEither)) return null;

  return responseEither.right.Data?.[0] || null;
};

export const formatEmployeeLabelWithTickets = (d: any) => {
  const name = d.EmployeeName;
  const ticketCount = d.ActiveTickets ?? 0;

  return `${name} - ${ticketCount}`;
};

export const fetchCollaboratorWithTicketsDropdown = async (pageNumber: number, params?: { value?: string, employeeId?: number }) => {
  try {
    const responseEither = await ticketService.apiCallPullAssignedActiveTickets({
      PageSize: 20,
      PageNumber: pageNumber,
      EmployeeName: params?.value || "",
      EmployeeId: params?.employeeId ?? 0,
      SortBy: "DESC",

    });

    if (E.isLeft(responseEither)) {
      return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }

    const apiResponse = responseEither.right;

    const itemList = (apiResponse?.Data || []).map((d: any) => ({
      label: formatEmployeeLabelWithTickets(d),
      value: String(d.EmployeeId),
    }));


    return {
      totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
      itemList,
    };
  } catch (err) {
    console.error("FETCH COLLABORATOR DROPDOWN ERROR", err);
    return { totalNumberOfRecord: 0, itemList: [] };
  }
};




