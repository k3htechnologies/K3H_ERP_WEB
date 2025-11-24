// // import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { Input } from "@/ui/components/forms/Input";
// import { TextArea } from "@/ui/components/forms/Textarea";
// import { DatePicker } from "@/ui/components/forms/Datepicker";
// import { SingleSelectDropdownWithPagination } from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
// import * as E from "fp-ts/Either";
// import { departmentMasterService } from "@/features/departmentMaster/services/DepartmentMasterService";
// import { runApiWithLoader } from "@/core/utils";
// import { employeeMasterService } from "@/features/employeeMaster/services/EmployeeMasterService";
// import useToast from "@/core/hooks/useToast";
// import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
// import {
//   BLOOD_GROUP_OPTIONS,
//   EMERGENCY_RELATION_OPTIONS,
//   EMPLOYEE_TYPE_OPTIONS,
//   GENDER_OPTIONS,
//   MARITAL_STATUS_OPTIONS,
// } from "@/core/constants/staticData";
// import { CompanyMasterService } from "@/features/companyMaster/services/CompanyMasterService";
// import { BranchMasterService } from "@/features/branchMaster/services/BranchMasteService";
// import { DesignationMasterService } from "@/features/designationMaster/services/DesignationMasterService";
// import { useEffect, useMemo, useState } from "react";
// import { BankListMasterService } from "@/features/bankListMaster/services/BankListMasterService";

// type NullableNumber = number | null;

// /**
//  * Frontend model mapped to the backend sample you provided
//  */
// export interface AddUpdateEmployeeMasterRequest {
//   EmployeeId: number;
//   UniqueKey: string | null;
//   FirstName: string;
//   MiddleName: string;
//   LastName: string;
//   DepartmentMasterId: NullableNumber;
//   DesignationMasterId: NullableNumber;
//   BranchMasterId: NullableNumber;
//   Gender: string;
//   MaritalStatus: string;
//   DateOfBirth: string | null;
//   JoiningDate: string | null;
//   IsGeoFenceLocation: boolean;
//   EmailId: string;
//   OfficeEmailId: string;
//   ReportPersonId: NullableNumber;
//   PersonalMobileNumber: string;
//   OfficeMobileNumber: string;
//   BankListMasterId: NullableNumber;
//   BankBranchName: string;
//   IFSCCode: string;
//   AccountNo: string;
//   EmployeeType: string;
//   EmergencyMobileNumber: string;
//   EmergencyContactPersonRelationship: string;
//   CommunicationAddress: string;
//   PermanentAddress: string;
//   BloodGroup: string;
//   CompanyId: NullableNumber;
//   CountryMasterId: NullableNumber;
//   StateMasterId: NullableNumber;
//   DistrictMasterId: NullableNumber;
//   CityMasterId: NullableNumber;
// }

// /**
//  * Single row type as appears in Data.CountryStateCityDistrictVillageData
//  * (keys taken from the sample you pasted)
//  */
// type LocationRow = {
//   CountryMasterId?: number;
//   CountryName?: string;
//   StateMasterId?: number;
//   StateName?: string;
//   DistrictMasterId?: number;
//   DistrictName?: string;
//   CityMasterId?: number;
//   CityName?: string;
//   VillageMasterId?: number;
//   VillageName?: string;
//   // there were some "Ref" fields in sample; we ignore them for filtering
// };

// const initialFormState = (): AddUpdateEmployeeMasterRequest => ({
//   EmployeeId: 0,
//   UniqueKey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//   FirstName: "",
//   MiddleName: "",
//   LastName: "",
//   DepartmentMasterId: null,
//   DesignationMasterId: null,
//   BranchMasterId: null,
//   Gender: "",
//   MaritalStatus: "",
//   DateOfBirth: null,
//   JoiningDate: null,
//   IsGeoFenceLocation: false,
//   EmailId: "",
//   OfficeEmailId: "",
//   ReportPersonId: null,
//   PersonalMobileNumber: "",
//   OfficeMobileNumber: "",
//   BankListMasterId: null,
//   BankBranchName: "",
//   IFSCCode: "",
//   AccountNo: "",
//   EmployeeType: "",
//   EmergencyMobileNumber: "",
//   EmergencyContactPersonRelationship: "",
//   CommunicationAddress: "",
//   PermanentAddress: "",
//   BloodGroup: "",
//   CompanyId: null,
//   CountryMasterId: null,
//   StateMasterId: null,
//   DistrictMasterId: null,
//   CityMasterId: null,
// });

// const AddUpdateEmployeePage: React.FC = () => {
//   const navigate = useNavigate();
//   const { id } = useParams<{ id?: string }>();
//   const { addToast } = useToast();

//   const [formData, setFormData] = useState<AddUpdateEmployeeMasterRequest>(initialFormState());
//   const [errors, setErrors] = useState<{ [k: string]: string }>({});
//   const [loading, setLoading] = useState(false);

//   // Location cache: load once from apiCallPullLocationHierarchy() and reuse
//   const [locationRows, setLocationRows] = useState<LocationRow[] | null>(null);
//   const [locationLoading, setLocationLoading] = useState(false);

//   // memoized states list (no pagination required)
//   const statesList = useMemo(() => {
//     if (!locationRows) return [];
//     const map = new Map<number, string>();
//     locationRows.forEach((r) => {
//       if (r.StateMasterId && !map.has(r.StateMasterId)) map.set(r.StateMasterId, r.StateName || "");
//     });
//     return [...map.entries()].map(([id, name]) => ({ label: name, value: String(id) }));
//   }, [locationRows]);

//   // helper to extract unique districts for a given state id
//   const getDistrictsFromCache = (stateId: NullableNumber) => {
//     if (!locationRows || !stateId) return [];
//     const map = new Map<number, string>();
//     locationRows
//       .filter((r) => r.StateMasterId === stateId)
//       .forEach((r) => {
//         if (r.DistrictMasterId && !map.has(r.DistrictMasterId)) map.set(r.DistrictMasterId, r.DistrictName || "");
//       });
//     return [...map.entries()].map(([id, name]) => ({ label: name, value: String(id) }));
//   };

//   // helper to extract unique cities for a given district id
//   const getCitiesFromCache = (districtId: NullableNumber) => {
//     if (!locationRows || !districtId) return [];
//     const map = new Map<number, string>();
//     locationRows
//       .filter((r) => r.DistrictMasterId === districtId)
//       .forEach((r) => {
//         if (r.CityMasterId && !map.has(r.CityMasterId)) map.set(r.CityMasterId, r.CityName || "");
//       });
//     return [...map.entries()].map(([id, name]) => ({ label: name, value: String(id) }));
//   };

//   // Generic helper to set field and clear error for that field
//   const handleFieldChange = (field: keyof AddUpdateEmployeeMasterRequest, value: any) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//     setErrors((prev) => ({ ...prev, [field]: "" }));
//   };

//   const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

//   // -------------------------
//   // Load location hierarchy (lazy)
//   // -------------------------
//   const loadLocationHierarchy = async () => {
//     if (locationRows || locationLoading) return;
//     setLocationLoading(true);
//     try {
//       const resp = await employeeMasterService.apiCallPullLocationHierarchy();
//       if (E.isLeft(resp)) {
//         console.error("Failed to load locations:", resp.left);
//         setLocationRows([]);
//       } else {
//         const apiResp = resp.right;
//         const rows = (apiResp?.Data?.CountryStateCityDistrictVillageData || []) as LocationRow[];
//         setLocationRows(rows);
//       }
//     } catch (err) {
//       console.error("Error loading locations:", err);
//       setLocationRows([]);
//     } finally {
//       setLocationLoading(false);
//     }
//   };

//   // -------------------------
//   // Dropdown callbacks (shape: { totalNumberOfRecord, itemList })
//   // -------------------------
//   const fetchStates = async () => {
//     await loadLocationHierarchy();
//     return {
//       totalNumberOfRecord: statesList.length,
//       itemList: statesList,
//     };
//   };

//   const fetchDistricts = async () => {
//     if (!formData.StateMasterId) return { totalNumberOfRecord: 0, itemList: [] };
//     await loadLocationHierarchy();
//     const list = getDistrictsFromCache(formData.StateMasterId);
//     return { totalNumberOfRecord: list.length, itemList: list };
//   };

//   const fetchCities = async () => {
//     if (!formData.DistrictMasterId) return { totalNumberOfRecord: 0, itemList: [] };
//     await loadLocationHierarchy();
//     const list = getCitiesFromCache(formData.DistrictMasterId);
//     return { totalNumberOfRecord: list.length, itemList: list };
//   };

//   // -------------------------
//   // Other server-backed dropdowns (company, department, branch, designation, reporting)
//   // -------------------------
//   const fetchCompanyOptions = async (pageNumber: number, params?: { value?: string }) => {
//     const responseEither = await CompanyMasterService.apiCallPullCompanyMaster({
//       PageSize: 10,
//       PageNumber: pageNumber,
//       CompanyName: params?.value || "",
//       IsCheckPermission: true,
//     });
//     if (E.isLeft(responseEither)) return { totalNumberOfRecord: 0, itemList: [] };
//     const apiResponse = responseEither.right;
//     const companyList = apiResponse?.Data?.map((item: any) => ({ label: item.CompanyName, value: String(item.CompanyId) })) || [];
//     return { totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? companyList.length, itemList: companyList };
//   };

// const fetchBanks = async (pageNumber: number,params?: { value?: string }) => {
//   try {
//     const resp = await BankListMasterService.apiCallPullBankListMaster({
//       PageNumber: pageNumber,
//       PageSize: 10,
//       BankName:params?.value || "",
//     });

//     if (E.isLeft(resp)) {
//       console.error("Bank list API failed", resp.left);
//       return { totalNumberOfRecord: 0, itemList: [] };
//     }

//     const api = resp.right;

//     const rows = api?.Data ?? [];

//     const bankDropdown = rows.map((b) => ({
//       label: b.BankNameWithCode,
//       value: String(b.BankListMasterId),
//     }));

//     return {
//       totalNumberOfRecord: api.TotalNumberOfRecord ?? bankDropdown.length,
//       itemList: bankDropdown,
//     };
//   } catch (error) {
//     console.error("Error fetching bank list:", error);
//     return { totalNumberOfRecord: 0, itemList: [] };
//   }
// };

  

//   const fetchDepartmentOptions = async (pageNumber: number, params?: { value?: string }) => {
//     const responseEither = await departmentMasterService.apiCallPullDepartmentMaster({
//       PageSize: 10,
//       PageNumber: pageNumber,
//       DepartmentName: params?.value || "",
//       IsCheckPermission: true,
//     });
//     if (E.isLeft(responseEither)) return { totalNumberOfRecord: 0, itemList: [] };
//     const apiResponse = responseEither.right;
//     const departmentList = apiResponse?.Data?.map((item: any) => ({ label: item.DepartmentName, value: String(item.DepartmentMasterId) })) || [];
//     return { totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? departmentList.length, itemList: departmentList };
//   };

//   const fetchBranchOptions = async (pageNumber: number, params?: { value?: string }) => {
//     const responseEither = await BranchMasterService.apiCallPullBranchMaster({
//       PageSize: 10,
//       PageNumber: pageNumber,
//       BranchName: params?.value || "",
//       IsCheckPermission: true,
//     });
//     if (E.isLeft(responseEither)) return { totalNumberOfRecord: 0, itemList: [] };
//     const apiResponse = responseEither.right;
//     const branchList = apiResponse?.Data?.map((item: any) => ({ label: item.BranchName, value: String(item.BranchMasterId) })) || [];
//     return { totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? branchList.length, itemList: branchList };
//   };

//   const fetchDesignationOptions = async (pageNumber: number, params?: { value?: string }) => {
//     const responseEither = await DesignationMasterService.apiCallPullDesignationMaster({
//       PageSize: 10,
//       PageNumber: pageNumber,
//       DesignationName: params?.value || "",
//       IsCheckPermission: true,
//     });
//     if (E.isLeft(responseEither)) return { totalNumberOfRecord: 0, itemList: [] };
//     const apiResponse = responseEither.right;
//     const designationList = apiResponse?.Data?.map((item: any) => ({ label: item.DesignationName, value: String(item.DesignationMasterId) })) || [];
//     return { totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? designationList.length, itemList: designationList };
//   };

//   const fetchReportingOptions = async (pageNumber: number, params?: { value?: string }) => {
//     const responseEither = await employeeMasterService.apiCallPullEmployeeMaster({
//       PageSize: 10,
//       PageNumber: pageNumber,
//       EmployeeName: params?.value || "",
//       IsCheckPermission: true,
//     });
//     if (E.isLeft(responseEither)) return { totalNumberOfRecord: 0, itemList: [] };
//     const apiResponse = responseEither.right;
//     const EmployeeList = apiResponse?.Data?.map((item: any) => ({ label: item.FullName, value: String(item.EmployeeId) })) || [];
//     return { totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? EmployeeList.length, itemList: EmployeeList };
//   };

//   // -------------------------
//   // Auto-fill when editing
//   // -------------------------
//   // useEffect(() => {
//   //   if (!id) return;
//   //   const loadEmployee = async () => {
//   //     setLoading(true);
//   //     try {
//   //       // reuse PullEmployeeMaster to fetch single record (if your API supports a dedicated getById replace this)
//   //       const resp = await employeeMasterService.apiCallPullEmployeeMaster({
//   //         PageSize: 1,
//   //         PageNumber: 1,
//   //         EmployeeId: Number(id),
//   //       });
//   //       if (E.isRight(resp)) {
//   //         const e = resp.right?.Data?.[0];
//   //         if (e) {
//   //           setFormData((prev) => ({
//   //             ...prev,
//   //             EmployeeId: e.EmployeeId ?? prev.EmployeeId,
//   //             UniqueKey: e.UniqueKey ?? prev.UniqueKey,
//   //             FirstName: e.FirstName ?? "",
//   //             MiddleName: e.MiddleName ?? "",
//   //             LastName: e.LastName ?? "",
//   //             DepartmentMasterId: (e.DepartmentMasterId ?? null),
//   //             DesignationMasterId: (e.DesignationMasterId ?? null),
//   //             BranchMasterId: (e.BranchMasterId ?? null),
//   //             Gender: e.Gender ?? "",
//   //             MaritalStatus: e.MaritalStatus ?? "",
//   //             DateOfBirth: e.DateOfBirth ?? null,
//   //             JoiningDate: e.JoiningDate ?? null,
//   //             IsGeoFenceLocation: !!e.IsGeoFenceLocation,
//   //             EmailId: e.EmailId ?? "",
//   //             OfficeEmailId: e.OfficeEmailId ?? "",
//   //             ReportPersonId: (e.ReportPersonId ?? null),
//   //             PersonalMobileNumber: e.PersonalMobileNumber ?? "",
//   //             OfficeMobileNumber: e.OfficeMobileNumber ?? "",
//   //             BankListMasterId: (e.BankListMasterId ?? null),
//   //             BankBranchName: e.BankBranchName ?? "",
//   //             IFSCCode: e.IFSCCode ?? "",
//   //             AccountNo: e.AccountNo ?? "",
//   //             EmployeeType: e.EmployeeType ?? "",
//   //             EmergencyMobileNumber: e.EmergencyMobileNumber ?? "",
//   //             EmergencyContactPersonRelationship: e.EmergencyContactPersonRelationship ?? "",
//   //             CommunicationAddress: e.CommunicationAddress ?? "",
//   //             PermanentAddress: e.PermanentAddress ?? "",
//   //             BloodGroup: e.BloodGroup ?? "",
//   //             CompanyId: (e.CompanyId ?? null),
//   //             CountryMasterId: (e.CountryMasterId ?? null),
//   //             StateMasterId: (e.StateMasterId ?? null),
//   //             DistrictMasterId: (e.DistrictMasterId ?? null),
//   //             CityMasterId: (e.CityMasterId ?? null),
//   //           }));
//   //           // ensure locationRows loaded so dropdowns show selected text
//   //           loadLocationHierarchy();
//   //         }
//   //       } else {
//   //         console.error("Failed to fetch employee:", resp.left);
//   //         addToast({ type: "error", title: "Failed to load employee details" });
//   //       }
//   //     } catch (err) {
//   //       console.error("Error loading employee:", err);
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   };
//   //   loadEmployee();
//   //   // eslint-disable-next-line react-hooks/exhaustive-deps
//   // }, [id]);
// useEffect(() => {
//   if (!id) return;

//   const loadEmployeeAndLocation = async () => {
//     setLoading(true);

//     try {
//       // 1) Load employee
//       const resp = await employeeMasterService.apiCallPullEmployeeMaster({
//         PageSize: 1,
//         PageNumber: 1,
//         EmployeeId: Number(id),
//       });

//       if (E.isRight(resp)) {
//         const e = resp.right?.Data?.[0];
//         if (e) {
//           setFormData(prev => ({
//             ...prev,
//             EmployeeId: e.EmployeeId ?? prev.EmployeeId,
//             UniqueKey: e.UniqueKey ?? prev.UniqueKey,

//             FirstName: e.FirstName ?? "",
//             MiddleName: e.MiddleName ?? "",
//             LastName: e.LastName ?? "",

//             DepartmentMasterId: e.DepartmentMasterId ?? null,
//             DesignationMasterId: e.DesignationMasterId ?? null,
//             BranchMasterId: e.BranchMasterId ?? null,

//             Gender: e.Gender ?? "",
//             MaritalStatus: e.MaritalStatus ?? "",

//             DateOfBirth: e.DateOfBirth ?? null,
//             JoiningDate: e.JoiningDate ?? null,

//             IsGeoFenceLocation: !!e.IsGeoFenceLocation,

//             EmailId: e.EmailId ?? "",
//             OfficeEmailId: e.OfficeEmailId ?? "",
//             ReportPersonId: e.ReportPersonId ?? null,

//             PersonalMobileNumber: e.PersonalMobileNumber ?? "",
//             OfficeMobileNumber: e.OfficeMobileNumber ?? "",

//             BankListMasterId: e.BankListMasterId ?? null,
//             BankBranchName: e.BankBranchName ?? "",
//             IFSCCode: e.IFSCCode ?? "",
//             AccountNo: e.AccountNo ?? "",

//             EmployeeType: e.EmployeeType ?? "",
//             EmergencyMobileNumber: e.EmergencyMobileNumber ?? "",
//             EmergencyContactPersonRelationship: e.EmergencyContactPersonRelationship ?? "",

//             CommunicationAddress: e.CommunicationAddress ?? "",
//             PermanentAddress: e.PermanentAddress ?? "",
//             BloodGroup: e.BloodGroup ?? "",

//             CompanyId: e.CompanyId ?? null,

//             CountryMasterId:1,
//             StateMasterId: e.StateMasterId ?? null,
//             DistrictMasterId: e.DistrictMasterId ?? null,
//             CityMasterId: e.CityMasterId ?? null,
//           }));
//         }
//       } else {
//         console.error("Failed to fetch employee:", resp.left);
//         addToast({ type: "error", title: "Failed to load employee details" });
//       }

//       // 2) Load location hierarchy
//       await loadLocationHierarchy();

//     } catch (error) {
//       console.error("Error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   loadEmployeeAndLocation();

//   // eslint-disable-next-line react-hooks/exhaustive-deps
// }, [id]);

//   // -------------------------
//   // Validation
//   // -------------------------
//   const validateForm = () => {
//     const e: { [k: string]: string } = {};
//     if (!formData.FirstName || formData.FirstName.trim().length < 2) e.FirstName = "First name required (min 2 chars)";
//     if (!formData.LastName || formData.LastName.trim().length < 2) e.LastName = "Last name required (min 2 chars)";
//     if (formData.EmailId && !validateEmail(formData.EmailId)) e.EmailId = "Invalid email";
//     if (!formData.PersonalMobileNumber || formData.PersonalMobileNumber.trim().length < 6) e.PersonalMobileNumber = "Enter a valid mobile number";
//     if (!formData.CompanyId) e.CompanyId = "Select company";
//     if (!formData.DepartmentMasterId) e.DepartmentMasterId = "Select department";
//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   // -------------------------
//   // Submit
//   // -------------------------
//   const handleSubmit = async (ev?: React.FormEvent) => {
//     if (ev) ev.preventDefault();
//     if (!validateForm()) return;

//     setLoading(true);
//     try {
//       const payload = {
//         EmployeeId: formData.EmployeeId,
//         UniqueKey: formData.UniqueKey,
//         FirstName: formData.FirstName,
//         MiddleName: formData.MiddleName,
//         LastName: formData.LastName,
//         DepartmentMasterId: formData.DepartmentMasterId ?? 0,
//         DesignationMasterId: formData.DesignationMasterId ?? 0,
//         BranchMasterId: formData.BranchMasterId ?? 0,
//         Gender: formData.Gender,
//         MaritalStatus: formData.MaritalStatus,
//         DateOfBirth: formData.DateOfBirth,
//         JoiningDate: formData.JoiningDate,
//         IsGeoFenceLocation: formData.IsGeoFenceLocation,
//         EmailId: formData.EmailId,
//         OfficeEmailId: formData.OfficeEmailId,
//         ReportPersonId: formData.ReportPersonId ?? 0,
//         PersonalMobileNumber: formData.PersonalMobileNumber,
//         OfficeMobileNumber: formData.OfficeMobileNumber,
//         BankListMasterId: formData.BankListMasterId ?? 0,
//         BankBranchName: formData.BankBranchName,
//         IFSCCode: formData.IFSCCode,
//         AccountNo: formData.AccountNo,
//         EmployeeType: formData.EmployeeType,
//         EmergencyMobileNumber: formData.EmergencyMobileNumber,
//         EmergencyContactPersonRelationship: formData.EmergencyContactPersonRelationship,
//         CommunicationAddress: formData.CommunicationAddress,
//         PermanentAddress: formData.PermanentAddress,
//         BloodGroup: formData.BloodGroup,
//         CompanyId: formData.CompanyId ?? 0,
//         CountryMasterId: 1 ,
//         StateMasterId: formData.StateMasterId ?? 0,
//         DistrictMasterId: formData.DistrictMasterId ?? 0,
//         CityMasterId: formData.CityMasterId ?? 0,
//       };

//       await runApiWithLoader(
//         setLoading,
//         () => {},
//         async () => {
//           const response = await employeeMasterService.apiCallAddUpdateEmployeeMaster(payload);
//           if (E.isRight(response)) {
//             addToast({ type: "success", title: formData.EmployeeId ? "Employee updated" : "Employee added" });
//             navigate("/employee");
//           } else {
//             addToast({ type: "error", title: response.left?.message || "Operation failed" });
//           }
//           return response;
//         },
//         () => {},
//         (err: any) => addToast({ type: "error", title: err?.message || "Operation failed" }),
//         () => {},
//         formData.EmployeeId === 0 ? "Add Employee" : "Update Employee..."
//       );
//     } catch (err) {
//       console.error("Submit error:", err);
//       addToast({ type: "error", title: "Submit failed" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // -------------------------
//   // Small helper to convert numeric id to dropdown value (string)
//   // -------------------------
//   const toDropdownValue = (v: NullableNumber) => (v ? String(v) : "");

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col p-8">
//       <h1 className="text-3xl font-bold mb-6">{formData.EmployeeId ? "Edit Employee" : "Add Employee"}</h1>

//       <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-8 overflow-auto">
//         {/* Basic Employee Details */}
//         <section className="flex flex-col gap-4">
//           <h2 className="text-xl font-semibold text-gray-700">Basic Employee Details</h2>
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//             <Input label="First Name*" value={formData.FirstName} onChange={(e) => handleFieldChange("FirstName", e.target.value)} error={errors.FirstName} />
//             <Input label="Middle Name" value={formData.MiddleName} onChange={(e) => handleFieldChange("MiddleName", e.target.value)} />
//             <Input label="Last Name*" value={formData.LastName} onChange={(e) => handleFieldChange("LastName", e.target.value)} error={errors.LastName} />
//             <SinglePageSelection label="Gender*" value={formData.Gender} onChange={(val) => handleFieldChange("Gender", String(val))} options={GENDER_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))} />
//             <SinglePageSelection label="Marital Status*" value={formData.MaritalStatus} onChange={(val) => handleFieldChange("MaritalStatus", String(val))} options={MARITAL_STATUS_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))} />
//             <SinglePageSelection label="Blood Group*" value={formData.BloodGroup} onChange={(val) => handleFieldChange("BloodGroup", String(val))} options={BLOOD_GROUP_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))} />
//             <DatePicker label="DOB" value={formData.DateOfBirth ?? ""} onChange={(e) => handleFieldChange("DateOfBirth", e.target.value)} />
//             <Input label="Office Email Id" value={formData.OfficeEmailId} onChange={(e) => handleFieldChange("OfficeEmailId", e.target.value)} />
//             <Input label="Email Id" value={formData.EmailId} onChange={(e) => handleFieldChange("EmailId", e.target.value)} error={errors.EmailId} />
//             <Input label="Personal Mobile Number" prefix="+91" value={formData.PersonalMobileNumber} onChange={(e) => handleFieldChange("PersonalMobileNumber", e.target.value)} error={errors.PersonalMobileNumber} />
//             <Input label="Office Mobile Number" value={formData.OfficeMobileNumber} onChange={(e) => handleFieldChange("OfficeMobileNumber", e.target.value)} />
//             <SinglePageSelection label="Employee Type" value={formData.EmployeeType} onChange={(val) => handleFieldChange("EmployeeType", String(val))} options={EMPLOYEE_TYPE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))} />
//             <SinglePageSelection label="Relation to Emergency Contact" value={formData.EmergencyContactPersonRelationship} onChange={(val) => handleFieldChange("EmergencyContactPersonRelationship", String(val))} options={EMERGENCY_RELATION_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))} />
//             <Input label="Emergency Contact Number" prefix="+91" value={formData.EmergencyMobileNumber} onChange={(e) => handleFieldChange("EmergencyMobileNumber", e.target.value)} />
//           </div>
//         </section>

//         {/* Employee Info Sheet */}
//         <section className="flex flex-col gap-4">
//           <h2 className="text-xl font-semibold text-gray-700">Employee Info Sheet</h2>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
//             <SingleSelectDropdownWithPagination
//               title="Select..."
//               label="Company"
//               size="lg"
//               dataFetchCallBack={fetchCompanyOptions}
//               onSelected={(item) => handleFieldChange("CompanyId", Number(item.value))}
//               value={toDropdownValue(formData.CompanyId)}
//             />
//             <SingleSelectDropdownWithPagination
//               title="Select..."
//               label="Department"
//               size="lg"
//               dataFetchCallBack={fetchDepartmentOptions}
//               onSelected={(item) => handleFieldChange("DepartmentMasterId", Number(item.value))}
//               value={toDropdownValue(formData.DepartmentMasterId)}
//             />
//             <SingleSelectDropdownWithPagination
//               title="Select..."
//               label="Branch"
//               size="lg"
//               dataFetchCallBack={fetchBranchOptions}
//               onSelected={(item) => handleFieldChange("BranchMasterId", Number(item.value))}
//               value={toDropdownValue(formData.BranchMasterId)}
//             />
//             <SingleSelectDropdownWithPagination
//               title="Select..."
//               label="Designation"
//               size="lg"
//               dataFetchCallBack={fetchDesignationOptions}
//               onSelected={(item) => handleFieldChange("DesignationMasterId", Number(item.value))}
//               value={toDropdownValue(formData.DesignationMasterId)}
//             />
//             <DatePicker className="py-1" label="Joining Date" size="lg" value={formData.JoiningDate ?? ""} onChange={(e) => handleFieldChange("JoiningDate", e.target.value)} />
//             <SingleSelectDropdownWithPagination
//               title="Select..."
//               label="Reporting Person"
//               size="lg"
//               dataFetchCallBack={fetchReportingOptions}
//               onSelected={(item) => handleFieldChange("ReportPersonId", Number(item.value))}
//               value={toDropdownValue(formData.ReportPersonId)}
//             />
//           </div>
//         </section>

//         {/* Address */}
//         <section className="flex flex-col gap-4">
//           <h2 className="text-xl font-semibold text-gray-700">Address</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <TextArea label="Communication Address" value={formData.CommunicationAddress} onChange={(e) => handleFieldChange("CommunicationAddress", e.target.value)} />
//             <TextArea label="Permanent Address" value={formData.PermanentAddress} onChange={(e) => handleFieldChange("PermanentAddress", e.target.value)} />
//            <SingleSelectDropdownWithPagination
//   title="Select..."
//   label="State"
//   size="lg"
//   dataFetchCallBack={fetchStates}  // From cached data
//   onSelected={(item) => {
//     const num = Number(item.value);
//     handleFieldChange("StateMasterId", num);
//     // reset dependent fields
//     handleFieldChange("DistrictMasterId", null);
//     handleFieldChange("CityMasterId", null);
//   }}
//   value={toDropdownValue(formData.StateMasterId)}
// />

//             <SingleSelectDropdownWithPagination
//               title="Select..."
//               label="District"
//               size="lg"
//               dataFetchCallBack={fetchDistricts}
//               onSelected={(item) => {
//                 const num = Number(item.value);
//                 handleFieldChange("DistrictMasterId", num);
//                 // reset city when district changes
//                 handleFieldChange("CityMasterId", null);
//               }}
//               value={toDropdownValue(formData.DistrictMasterId)}
//             />
//             <SingleSelectDropdownWithPagination
//               title="Select..."
//               label="City"
//               size="lg"
//               dataFetchCallBack={fetchCities}
//               onSelected={(item) => handleFieldChange("CityMasterId", Number(item.value))}
//               value={toDropdownValue(formData.CityMasterId)}
//             />
//           </div>
//         </section>

//         {/* Bank Details */}
//         <section className="flex flex-col gap-4 mt-6">
//           <h2 className="text-xl font-semibold text-gray-700">Bank Details</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <SingleSelectDropdownWithPagination
//   title="Select..."
//   label="Bank"
//   size="lg"
//   dataFetchCallBack={fetchBanks}
//   onSelected={(item) => {
//     handleFieldChange("BankListMasterId", Number(item?.value || 0));
//   }}
//   value={toDropdownValue(formData.BankListMasterId)}
// />

//             <Input label="Bank Branch Name" value={formData.BankBranchName} onChange={(e) => handleFieldChange("BankBranchName", e.target.value)} />
//             <Input label="Account Number" value={formData.AccountNo} onChange={(e) => handleFieldChange("AccountNo", e.target.value)} />
//             <Input label="IFSC Code" value={formData.IFSCCode} onChange={(e) => handleFieldChange("IFSCCode", e.target.value)} />
//           </div>
//         </section>

//         <div className="flex justify-end mt-4">
//           <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
//             {formData.EmployeeId ? "Update Employee" : "Add Employee"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default AddUpdateEmployeePage;
// import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/ui/components/forms/Input";
import { TextArea } from "@/ui/components/forms/Textarea";
import { DatePicker } from "@/ui/components/forms/Datepicker";
import { SingleSelectDropdownWithPagination } from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import * as E from "fp-ts/Either";
import { departmentMasterService } from "@/features/departmentMaster/services/DepartmentMasterService";
import { runApiWithLoader } from "@/core/utils";
import { employeeMasterService } from "@/features/employeeMaster/services/EmployeeMasterService";
import useToast from "@/core/hooks/useToast";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { Button } from "@/ui/components/forms/Button";
import { Loader } from "@/core/utils/loader";
import ToastContainer from "@/ui/components/Toast/ToastContainer";
import {
  BLOOD_GROUP_OPTIONS,
  EMERGENCY_RELATION_OPTIONS,
  EMPLOYEE_TYPE_OPTIONS,
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS,
} from "@/core/constants/staticData";
import { CompanyMasterService } from "@/features/companyMaster/services/CompanyMasterService";
import { BranchMasterService } from "@/features/branchMaster/services/BranchMasteService";
import { DesignationMasterService } from "@/features/designationMaster/services/DesignationMasterService";
import { useEffect, useMemo, useState } from "react";
import { BankListMasterService } from "@/features/bankListMaster/services/BankListMasterService";
import { useCountryStateCityDistrictVillageData } from "@/core/hooks/useCountryStateCityDistrictVillage";
import React from "react";

type NullableNumber = number | null;

export interface AddUpdateEmployeeMasterRequest {
  EmployeeId: number;
  UniqueKey: string | null;
  FirstName: string;
  MiddleName: string;
  LastName: string;
  DepartmentMasterId: NullableNumber;
  DesignationMasterId: NullableNumber;
  BranchMasterId: NullableNumber;
  Gender: string;
  MaritalStatus: string;
  DateOfBirth: string | null;
  JoiningDate: string | null;
  IsGeoFenceLocation: boolean;
  EmailId: string;
  OfficeEmailId: string;
  ReportPersonId: NullableNumber;
  PersonalMobileNumber: string;
  OfficeMobileNumber: string;
  BankListMasterId: NullableNumber;
  BankBranchName: string;
  IFSCCode: string;
  AccountNo: string;
  EmployeeType: string;
  EmergencyMobileNumber: string;
  EmergencyContactPersonRelationship: string;
  CommunicationAddress: string;
  PermanentAddress: string;
  BloodGroup: string;
  CompanyId: NullableNumber;
  CountryMasterId: NullableNumber;
  StateMasterId: NullableNumber;
  DistrictMasterId: NullableNumber;
  CityMasterId: NullableNumber;
}

type LocationRow = {
  CountryMasterId?: number;
  CountryName?: string;
  StateMasterId?: number;
  StateName?: string;
  DistrictMasterId?: number;
  DistrictName?: string;
  CityMasterId?: number;
  CityName?: string;
  VillageMasterId?: number;
  VillageName?: string;
  // there were some "Ref" fields in sample; we ignore them for filtering
};

const initialFormState = (): AddUpdateEmployeeMasterRequest => ({
  EmployeeId: 0,
  UniqueKey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  FirstName: "",
  MiddleName: "",
  LastName: "",
  DepartmentMasterId: null,
  DesignationMasterId: null,
  BranchMasterId: null,
  Gender: "",
  MaritalStatus: "",
  DateOfBirth: null,
  JoiningDate: null,
  IsGeoFenceLocation: false,
  EmailId: "",
  OfficeEmailId: "",
  ReportPersonId: null,
  PersonalMobileNumber: "",
  OfficeMobileNumber: "",
  BankListMasterId: null,
  BankBranchName: "",
  IFSCCode: "",
  AccountNo: "",
  EmployeeType: "",
  EmergencyMobileNumber: "",
  EmergencyContactPersonRelationship: "",
  CommunicationAddress: "",
  PermanentAddress: "",
  BloodGroup: "",
  CompanyId: null,
  CountryMasterId: 1,
  StateMasterId: null,
  DistrictMasterId: null,
  CityMasterId: null,
});

const AddUpdateEmployeePage: React.FC = () => {
  const navigate = useNavigate();
  const { employeeId } = useParams<{ employeeId?: string }>();
  const { toasts, removeToast, addToast } = useToast();
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [formData, setFormData] = useState<AddUpdateEmployeeMasterRequest>(initialFormState());
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [locationRows, setLocationRows] = useState<LocationRow[] | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  
  //#region COUNTRY STATE CITY DISTRICT 
    const {
      isLoading: isLocationLoading,
      countries,
      statesByCountryId,
      districtsByStateId,
      citiesByDistrictId,
      villagesByCityId,
    } = useCountryStateCityDistrictVillageData()
  
    const [selectedCountryId, setSelectedCountryId] = React.useState<number | null>(1)
    const [selectedStateId, setSelectedStateId] = React.useState<number | null>(null)
    const [selectedDistrictId, setSelectedDistrictId] = React.useState<number | null>(null)
    const [selectedCityId, setSelectedCityId] = React.useState<number | null>(null)
  
    const countryOptions = countries.map(c => ({ label: c.name, value: c.id }))
  
    const stateOptions =
      selectedCountryId != null
        ? (statesByCountryId[selectedCountryId] || []).map(s => ({
          label: s.name,
          value: s.id,
        }))
        : []
  
    const districtOptions =
      selectedStateId != null
        ? (districtsByStateId[selectedStateId] || []).map(d => ({
          label: d.name,
          value: d.id,
        }))
        : []
  
    const cityOptions =
      selectedDistrictId != null
        ? (citiesByDistrictId[selectedDistrictId] || []).map(c => ({
          label: c.name,
          value: c.id,
        }))
        : []
  
    const villageOptions =
      selectedCityId != null
        ? (villagesByCityId[selectedCityId] || []).map(v => ({
          label: v.name,
          value: v.id,
        }))
        : []
  
    //#endregion
  
  const [dropdownLabels, setDropdownLabels] = useState<{
    companyName?: string;
    departmentName?: string;
    branchName?: string;
    designationName?: string;
    reportPersonName?: string;
    stateName?: string;
    districtName?: string;
    cityName?: string;
    bankName?: string;
  }>({});

  // const statesList = useMemo(() => {
  //   if (!locationRows) return [];
  //   const map = new Map<number, string>();
  //   locationRows.forEach((r) => {
  //     if (r.StateMasterId && !map.has(r.StateMasterId)) map.set(r.StateMasterId, r.StateName || "");
  //   });
  //   return [...map.entries()].map(([id, name]) => ({ label: name, value: String(id) }));
  // }, [locationRows]);

  // const getDistrictsFromCache = (stateId: NullableNumber) => {
  //   if (!locationRows || !stateId) return [];
  //   const map = new Map<number, string>();
  //   locationRows
  //     .filter((r) => r.StateMasterId === stateId)
  //     .forEach((r) => {
  //       if (r.DistrictMasterId && !map.has(r.DistrictMasterId)) map.set(r.DistrictMasterId, r.DistrictName || "");
  //     });
  //   return [...map.entries()].map(([id, name]) => ({ label: name, value: String(id) }));
  // };

  // const getCitiesFromCache = (districtId: NullableNumber) => {
  //   if (!locationRows || !districtId) return [];
  //   const map = new Map<number, string>();
  //   locationRows
  //     .filter((r) => r.DistrictMasterId === districtId)
  //     .forEach((r) => {
  //       if (r.CityMasterId && !map.has(r.CityMasterId)) map.set(r.CityMasterId, r.CityName || "");
  //     });
  //   return [...map.entries()].map(([id, name]) => ({ label: name, value: String(id) }));
  // };

  const handleFieldChange = (field: keyof AddUpdateEmployeeMasterRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);


  const loadLocationHierarchy = async () => {
    if (locationRows || locationLoading) return;
    setLocationLoading(true);
    try {
      const resp = await employeeMasterService.apiCallPullLocationHierarchy();
      if (E.isLeft(resp)) {
        console.error("Failed to load locations:", resp.left);
        setLocationRows([]);
      } else {
        const apiResp = resp.right;
        const rows = (apiResp?.Data?.CountryStateCityDistrictVillageData || []) as LocationRow[];
        setLocationRows(rows);
      }
    } catch (err) {
      console.error("Error loading locations:", err);
      setLocationRows([]);
    } finally {
      setLocationLoading(false);
    }
  };

  // const fetchStates = async () => {
  //   await loadLocationHierarchy();
  //   return {
  //     totalNumberOfRecord: statesList.length,
  //     itemList: statesList,
  //   };
  // };

  // const fetchDistricts = async () => {
  //   if (!formData.StateMasterId) return { totalNumberOfRecord: 0, itemList: [] };
  //   await loadLocationHierarchy();
  //   const list = getDistrictsFromCache(formData.StateMasterId);
  //   return { totalNumberOfRecord: list.length, itemList: list };
  // };

  // const fetchCities = async () => {
  //   if (!formData.DistrictMasterId) return { totalNumberOfRecord: 0, itemList: [] };
  //   await loadLocationHierarchy();
  //   const list = getCitiesFromCache(formData.DistrictMasterId);
  //   return { totalNumberOfRecord: list.length, itemList: list };
  // };

  
  const fetchCompanyOptions = async (pageNumber: number, params?: { value?: string }) => {
    const responseEither = await CompanyMasterService.apiCallPullCompanyMaster({
      PageSize: 10,
      PageNumber: pageNumber,
      CompanyName: params?.value || "",
      IsCheckPermission: true,
    });
    if (E.isLeft(responseEither)) return { totalNumberOfRecord: 0, itemList: [] };
    const apiResponse = responseEither.right;
    const companyList = apiResponse?.Data?.map((item: any) => ({ label: item.CompanyName, value: String(item.CompanyId) })) || [];
    return { totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? companyList.length, itemList: companyList };
  };

const fetchBanks = async (pageNumber: number,params?: { value?: string }) => {
  try {
    const resp = await BankListMasterService.apiCallPullBankListMaster({
      PageNumber: pageNumber,
      PageSize: 10,
      BankName:params?.value || "",
    });

    if (E.isLeft(resp)) {
      console.error("Bank list API failed", resp.left);
      return { totalNumberOfRecord: 0, itemList: [] };
    }

    const api = resp.right;

    const rows = api?.Data ?? [];

    const bankDropdown = rows.map((b) => ({
      label: b.BankNameWithCode,
      value: String(b.BankListMasterId),
    }));

    return {
      totalNumberOfRecord: api.TotalNumberOfRecord ?? bankDropdown.length,
      itemList: bankDropdown,
    };
  } catch (error) {
    console.error("Error fetching bank list:", error);
    return { totalNumberOfRecord: 0, itemList: [] };
  }
};

  const fetchDepartmentOptions = async (pageNumber: number, params?: { value?: string }) => {
    const responseEither = await departmentMasterService.apiCallPullDepartmentMaster({
      PageSize: 10,
      PageNumber: pageNumber,
      DepartmentName: params?.value || "",
      IsCheckPermission: true,
    });
    if (E.isLeft(responseEither)) return { totalNumberOfRecord: 0, itemList: [] };
    const apiResponse = responseEither.right;
    const departmentList = apiResponse?.Data?.map((item: any) => ({ label: item.DepartmentName, value: String(item.DepartmentMasterId) })) || [];
    return { totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? departmentList.length, itemList: departmentList };
  };

  const fetchBranchOptions = async (pageNumber: number, params?: { value?: string }) => {
    const responseEither = await BranchMasterService.apiCallPullBranchMaster({
      PageSize: 10,
      PageNumber: pageNumber,
      BranchName: params?.value || "",
      IsCheckPermission: true,
    });
    if (E.isLeft(responseEither)) return { totalNumberOfRecord: 0, itemList: [] };
    const apiResponse = responseEither.right;
    const branchList = apiResponse?.Data?.map((item: any) => ({ label: item.BranchName, value: String(item.BranchMasterId) })) || [];
    return { totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? branchList.length, itemList: branchList };
  };

  const fetchDesignationOptions = async (pageNumber: number, params?: { value?: string }) => {
    const responseEither = await DesignationMasterService.apiCallPullDesignationMaster({
      PageSize: 10,
      PageNumber: pageNumber,
      DesignationName: params?.value || "",
      IsCheckPermission: true,
    });
    if (E.isLeft(responseEither)) return { totalNumberOfRecord: 0, itemList: [] };
    const apiResponse = responseEither.right;
    const designationList = apiResponse?.Data?.map((item: any) => ({ label: item.DesignationName, value: String(item.DesignationMasterId) })) || [];
    return { totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? designationList.length, itemList: designationList };
  };

  const fetchReportingOptions = async (pageNumber: number, params?: { value?: string }) => {
    const responseEither = await employeeMasterService.apiCallPullEmployeeMaster({
      PageSize: 10,
      PageNumber: pageNumber,
      EmployeeName: params?.value || "",
      IsCheckPermission: true,
    });
    if (E.isLeft(responseEither)) return { totalNumberOfRecord: 0, itemList: [] };
    const apiResponse = responseEither.right;
    const EmployeeList = apiResponse?.Data?.map((item: any) => ({ label: item.FullName, value: String(item.EmployeeId) })) || [];
    return { totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? EmployeeList.length, itemList: EmployeeList };
  };

  // -------------------------
  // Auto-fill when editing
  // -------------------------
  // useEffect(() => {
  //   if (!id) return;
  //   const loadEmployee = async () => {
  //     setLoading(true);
  //     try {
  //       // reuse PullEmployeeMaster to fetch single record (if your API supports a dedicated getById replace this)
  //       const resp = await employeeMasterService.apiCallPullEmployeeMaster({
  //         PageSize: 1,
  //         PageNumber: 1,
  //         EmployeeId: Number(id),
  //       });
  //       if (E.isRight(resp)) {
  //         const e = resp.right?.Data?.[0];
  //         if (e) {
  //           setFormData((prev) => ({
  //             ...prev,
  //             EmployeeId: e.EmployeeId ?? prev.EmployeeId,
  //             UniqueKey: e.UniqueKey ?? prev.UniqueKey,
  //             FirstName: e.FirstName ?? "",
  //             MiddleName: e.MiddleName ?? "",
  //             LastName: e.LastName ?? "",
  //             DepartmentMasterId: (e.DepartmentMasterId ?? null),
  //             DesignationMasterId: (e.DesignationMasterId ?? null),
  //             BranchMasterId: (e.BranchMasterId ?? null),
  //             Gender: e.Gender ?? "",
  //             MaritalStatus: e.MaritalStatus ?? "",
  //             DateOfBirth: e.DateOfBirth ?? null,
  //             JoiningDate: e.JoiningDate ?? null,
  //             IsGeoFenceLocation: !!e.IsGeoFenceLocation,
  //             EmailId: e.EmailId ?? "",
  //             OfficeEmailId: e.OfficeEmailId ?? "",
  //             ReportPersonId: (e.ReportPersonId ?? null),
  //             PersonalMobileNumber: e.PersonalMobileNumber ?? "",
  //             OfficeMobileNumber: e.OfficeMobileNumber ?? "",
  //             BankListMasterId: (e.BankListMasterId ?? null),
  //             BankBranchName: e.BankBranchName ?? "",
  //             IFSCCode: e.IFSCCode ?? "",
  //             AccountNo: e.AccountNo ?? "",
  //             EmployeeType: e.EmployeeType ?? "",
  //             EmergencyMobileNumber: e.EmergencyMobileNumber ?? "",
  //             EmergencyContactPersonRelationship: e.EmergencyContactPersonRelationship ?? "",
  //             CommunicationAddress: e.CommunicationAddress ?? "",
  //             PermanentAddress: e.PermanentAddress ?? "",
  //             BloodGroup: e.BloodGroup ?? "",
  //             CompanyId: (e.CompanyId ?? null),
  //             CountryMasterId: (e.CountryMasterId ?? null),
  //             StateMasterId: (e.StateMasterId ?? null),
  //             DistrictMasterId: (e.DistrictMasterId ?? null),
  //             CityMasterId: (e.CityMasterId ?? null),
  //           }));
  //           // ensure locationRows loaded so dropdowns show selected text
  //           loadLocationHierarchy();
  //         }
  //       } else {
  //         console.error("Failed to fetch employee:", resp.left);
  //         addToast({ type: "error", title: "Failed to load employee details" });
  //       }
  //     } catch (err) {
  //       console.error("Error loading employee:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   loadEmployee();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [id]);
  const formatDateForInput = (date?: string | null) => {
  if (!date) return "";
  return date.split("T")[0];
};
useEffect(() => {
  if (!employeeId) return;

  const loadEmployeeAndLocation = async () => {
    setIsLoading(true);
    setLoadingMessage('Loading employee data...');

    try {
      const resp = await employeeMasterService.apiCallPullEmployeeMaster({
        PageSize: 1,
        PageNumber: 1,
        EmployeeId: Number(employeeId),
      });

      if (E.isRight(resp)) {
        const e = resp.right?.Data?.[0];

        if (e) {
          // 1️⃣ UPDATE FORM DATA
          setFormData(prev => ({
            ...prev,

            EmployeeId: e.EmployeeId ?? prev.EmployeeId,
            UniqueKey: e.UniqueKey ?? prev.UniqueKey,

            FirstName: e.FirstName ?? "",
            MiddleName: e.MiddleName ?? "",
            LastName: e.LastName ?? "",

            DepartmentMasterId: e.DepartmentMasterId ?? null,
            DesignationMasterId: e.DesignationMasterId ?? null,
            BranchMasterId: e.BranchMasterId ?? null,

            Gender: e.Gender ?? "",
            MaritalStatus: e.MaritalStatus ?? "",

            DateOfBirth: formatDateForInput(e.DateOfBirth),
            JoiningDate: formatDateForInput(e.JoiningDate),

            IsGeoFenceLocation: !!e.IsGeoFenceLocation,

            EmailId: e.EmailId ?? "",
            OfficeEmailId: e.OfficeEmailId ?? "",
            ReportPersonId: e.ReportPersonId ?? null,

            PersonalMobileNumber: e.PersonalMobileNumber ?? "",
            OfficeMobileNumber: e.OfficeMobileNumber ?? "",

            BankListMasterId: e.BankListMasterId ?? null,
            BankBranchName: e.BankBranchName ?? "",
            IFSCCode: e.IFSCCode ?? "",
            AccountNo: e.AccountNo ?? "",

            EmployeeType: e.EmployeeType ?? "",
            EmergencyMobileNumber: e.EmergencyMobileNumber ?? "",
            EmergencyContactPersonRelationship: e.EmergencyContactPersonRelationship ?? "",

            CommunicationAddress: e.CommunicationAddress ?? "",
            PermanentAddress: e.PermanentAddress ?? "",
            BloodGroup: e.BloodGroup ?? "",
            CompanyId: e.CompanyId ?? null,

            CountryMasterId: e.CountryMasterId ?? null,
            StateMasterId: e.StateMasterId ?? null,
            DistrictMasterId: e.DistrictMasterId ?? null,
            CityMasterId: e.CityMasterId ?? null,
          }));

          // 2️⃣ UPDATE UI DROPDOWNS - Sync cascading dropdown selections
          setSelectedCountryId(e.CountryMasterId ?? null);
          setSelectedStateId(e.StateMasterId ?? null);
          setSelectedDistrictId(e.DistrictMasterId ?? null);
          setSelectedCityId(e.CityMasterId ?? null);
        }
      }
    } catch (error) {
      console.error("Error loading employee", error);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  loadEmployeeAndLocation();
}, [employeeId]);

  // set default country = 1 in form also
  useEffect(() => {
    if (!employeeId) {
      setSelectedCountryId(1);
      handleFieldChange('CountryMasterId', 1);
    }
  }, [employeeId]);


// useEffect(() => {
//   if (!employeeId) return;
  
//   const loadEmployeeAndLocation = async () => {
//     setIsLoading(true);
//     setLoadingMessage('Loading employee data...');

//     try {
//       const resp = await employeeMasterService.apiCallPullEmployeeMaster({
//         PageSize: 1,
//         PageNumber: 1,
//         EmployeeId: Number(employeeId),
//       });

//       if (E.isRight(resp)) {
//         const e = resp.right?.Data?.[0];
//         if (e) {
//           setFormData(prev => ({
//             ...prev,
//             EmployeeId: e.EmployeeId ?? prev.EmployeeId,
//             UniqueKey: e.UniqueKey ?? prev.UniqueKey,

//             FirstName: e.FirstName ?? "",
//             MiddleName: e.MiddleName ?? "",
//             LastName: e.LastName ?? "",

//             DepartmentMasterId: e.DepartmentMasterId ?? null,
//             DesignationMasterId: e.DesignationMasterId ?? null,
//             BranchMasterId: e.BranchMasterId ?? null,

//             Gender: e.Gender ?? "",
//             MaritalStatus: e.MaritalStatus ?? "",

//             DateOfBirth: formatDateForInput(e.DateOfBirth),
//             JoiningDate: formatDateForInput(e.JoiningDate),

//             IsGeoFenceLocation: !!e.IsGeoFenceLocation,

//             EmailId: e.EmailId ?? "",
//             OfficeEmailId: e.OfficeEmailId ?? "",
//             ReportPersonId: e.ReportPersonId ?? null,

//             PersonalMobileNumber: e.PersonalMobileNumber ?? "",
//             OfficeMobileNumber: e.OfficeMobileNumber ?? "",

//             BankListMasterId: e.BankListMasterId ?? null,
//             BankBranchName: e.BankBranchName ?? "",
//             IFSCCode: e.IFSCCode ?? "",
//             AccountNo: e.AccountNo ?? "",

//             EmployeeType: e.EmployeeType ?? "",
//             EmergencyMobileNumber: e.EmergencyMobileNumber ?? "",
//             EmergencyContactPersonRelationship: e.EmergencyContactPersonRelationship ?? "",

//             CommunicationAddress: e.CommunicationAddress ?? "",
//             PermanentAddress: e.PermanentAddress ?? "",
//             BloodGroup: e.BloodGroup ?? "",

//             CompanyId: e.CompanyId ?? null,
            
//             // CountryMasterId:1,
//             // StateMasterId: e.StateMasterId ?? null,
//             // DistrictMasterId: e.DistrictMasterId ?? null,
//             // CityMasterId: e.CityMasterId ?? null,
            
//           }));
          
//           // Store label names for dropdowns
//           setDropdownLabels({
//             companyName: e.CompanyName ?? undefined,
//             departmentName: e.Department ?? undefined,
//             branchName: e.Branch ?? undefined,
//             designationName: e.Designation ?? undefined,
//             reportPersonName: e.ReportPersonName ?? undefined,
//             stateName: e.StateName ?? undefined,
//             districtName: e.DistrictName ?? undefined,
//             cityName: e.CityName ?? undefined,
//             bankName: e.BankName ?? undefined,
//           });
//         }
//       } else {
//         console.error("Failed to fetch employee:", resp.left);
//         addToast({ type: "error", title: "Failed to load employee details" });
//       }

//       // 2) Load location hierarchy
//       await loadLocationHierarchy();

//     } catch (error) {
//       console.error("Error:", error);
//       addToast({ type: "error", title: "Failed to load employee data" });
//     } finally {
//       setIsLoading(false);
//       setLoadingMessage('');
//     }
//   };

//   loadEmployeeAndLocation();

// }, [employeeId]);


  const validateForm = () => {
    const e: { [k: string]: string } = {};
    if (!formData.FirstName || formData.FirstName.trim().length < 2) e.FirstName = "First name is required (min 2 chars)";
    if (!formData.MiddleName || formData.MiddleName.trim().length < 2) e.MiddleName = "Middle name is required (min 2 chars)";
    if (!formData.LastName || formData.LastName.trim().length < 2) e.LastName = "Last name is required (min 2 chars)";
    if (!formData.Gender) e.Gender = "Gender is required";
    if (!formData.MaritalStatus) e.MaritalStatus = "Marital status is required";
    if (!formData.BloodGroup) e.BloodGroup = "Blood group is required";
    if (!formData.DateOfBirth) e.DateOfBirth = "Date of birth is required";
    if (!formData.EmailId || !validateEmail(formData.EmailId)) e.EmailId = "Valid email is required";
    if (!formData.PersonalMobileNumber || formData.PersonalMobileNumber.trim().length < 10) e.PersonalMobileNumber = "Valid mobile number is required (min 10 digits)";
    if (!formData.EmployeeType) e.EmployeeType = "Employee type is required";
    if (!formData.EmergencyMobileNumber || formData.EmergencyMobileNumber.trim().length < 10) e.EmergencyMobileNumber = "Emergency contact number is required (min 10 digits)";
    if (!formData.EmergencyContactPersonRelationship) e.EmergencyContactPersonRelationship = "Relation to emergency contact is required";
    if (!formData.CompanyId) e.CompanyId = "Company is required";
    if (!formData.BranchMasterId) e.BranchMasterId = "Branch is required";
    if (!formData.DepartmentMasterId) e.DepartmentMasterId = "Department is required";
    if (!formData.DesignationMasterId) e.DesignationMasterId = "Designation is required";
    if (!formData.JoiningDate) e.JoiningDate = "Joining date is required";
    if (!formData.ReportPersonId) e.ReportPersonId = "Reporting person is required";
    if (!formData.CommunicationAddress || formData.CommunicationAddress.trim().length < 5) e.CommunicationAddress = "Communication address is required (min 5 chars)";
    if (!formData.PermanentAddress || formData.PermanentAddress.trim().length < 5) e.PermanentAddress = "Permanent address is required (min 5 chars)";
    if (!formData.StateMasterId) e.StateMasterId = "State is required";
    if (!formData.DistrictMasterId) e.DistrictMasterId = "District is required";
    if (!formData.CityMasterId) e.CityMasterId = "City is required";
    if (!formData.BankListMasterId) e.BankListMasterId = "Bank name is required";
    if (!formData.BankBranchName || formData.BankBranchName.trim().length < 2) e.BankBranchName = "Bank branch name is required (min 2 chars)";
    if (!formData.AccountNo || formData.AccountNo.trim().length < 5) e.AccountNo = "Account number is required (min 5 chars)";
    if (!formData.IFSCCode || formData.IFSCCode.trim().length < 11) e.IFSCCode = "IFSC code is required (min 11 chars)";
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev?: React.FormEvent) => {
    if (ev) ev.preventDefault();
     setHasSubmitted(true); 
    if (!validateForm()) {
      addToast({ type: "error", title: "Please fix validation errors before submitting" });
      return;
    }

    try {
      const payload = {
        EmployeeId: formData.EmployeeId,
        UniqueKey: formData.UniqueKey,
        FirstName: formData.FirstName,
        MiddleName: formData.MiddleName,
        LastName: formData.LastName,
        DepartmentMasterId: formData.DepartmentMasterId ?? 0,
        DesignationMasterId: formData.DesignationMasterId ?? 0,
        BranchMasterId: formData.BranchMasterId ?? 0,
        Gender: formData.Gender,
        MaritalStatus: formData.MaritalStatus,
        DateOfBirth: formData.DateOfBirth,
        JoiningDate: formData.JoiningDate,
        IsGeoFenceLocation: formData.IsGeoFenceLocation,
        EmailId: formData.EmailId,
        OfficeEmailId: formData.OfficeEmailId,
        ReportPersonId: formData.ReportPersonId ?? 0,
        PersonalMobileNumber: formData.PersonalMobileNumber,
        OfficeMobileNumber: formData.OfficeMobileNumber,
        BankListMasterId: formData.BankListMasterId ?? 0,
        BankBranchName: formData.BankBranchName,
        IFSCCode: formData.IFSCCode,
        AccountNo: formData.AccountNo,
        EmployeeType: formData.EmployeeType,
        EmergencyMobileNumber: formData.EmergencyMobileNumber,
        EmergencyContactPersonRelationship: formData.EmergencyContactPersonRelationship,
        CommunicationAddress: formData.CommunicationAddress,
        PermanentAddress: formData.PermanentAddress,
        BloodGroup: formData.BloodGroup,
        CompanyId: formData.CompanyId ?? 0,
        CountryMasterId: formData.CountryMasterId ?? 1,
        StateMasterId: formData.StateMasterId ?? 0,
        DistrictMasterId: formData.DistrictMasterId ?? 0,
        CityMasterId: formData.CityMasterId ?? 0,
      };

      await runApiWithLoader(
        setIsLoading,
        setLoadingMessage,
        async () => {
          const response = await employeeMasterService.apiCallAddUpdateEmployeeMaster(payload);
          if (E.isRight(response)) {
            addToast({ 
              type: "success", 
              title: formData.EmployeeId ? "Employee updated successfully" : "Employee added successfully" 
            });
            setTimeout(() => {
              navigate("/employeeMaster");
            }, 500);
          } else {
            addToast({ type: "error", title: response.left?.message || "Operation failed" });
          }
          return response;
        },
        () => {},
        (err: any) => {
          console.error("API Error:", err);
          addToast({ type: "error", title: err?.message || "Operation failed" });
        },
        () => {},
        formData.EmployeeId === 0 ? "Adding Employee..." : "Updating Employee..."
      );
    } catch (err) {
      console.error("Submit error:", err);
      addToast({ type: "error", title: "Submit failed. Please try again." });
      setIsLoading(false);
      setLoadingMessage('');
    }
  };
  const toDropdownInitialValue = (
    id: NullableNumber,
    label?: string
  ): { label: string; value: string | number } | null => {
    if (!id) return null;
    return {
      label: label || String(id),
      value: String(id),
    };
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      <div className="flex flex-col h-screen overflow-hidden">

        <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>
        {/* ✅ Fixed HEADER */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-md h-16 flex items-center justify-between px-6">

          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-gray-900">
              {formData.EmployeeId ? "Edit Employee" : "Add Employee"}
            </h1>

          </div>

        </div>

        <div className="flex-1 space-y-2 px-6 py-3 pt-20 pb-20 overflow-y-auto thin-scroll">
          <form onSubmit={handleSubmit}>
          {/* ============================================================= [BASIC EMPLOYEE DETAILS] ============================================================================================= */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Employee Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <Input value={formData.FirstName} onChange={(e) => handleFieldChange("FirstName", e.target.value)} error={hasSubmitted ? errors.FirstName : undefined} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Middle Name <span className="text-red-500">*</span>
                </label>
                <Input value={formData.MiddleName} onChange={(e) => handleFieldChange("MiddleName", e.target.value)} error={hasSubmitted ? errors.MiddleName : undefined} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <Input value={formData.LastName} onChange={(e) => handleFieldChange("LastName", e.target.value)} error={hasSubmitted ? errors.LastName : undefined} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <SinglePageSelection
                  value={formData.Gender}
                  onChange={(val) => handleFieldChange("Gender", String(val))}
                  options={GENDER_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                  error={hasSubmitted ? errors.Gender : undefined}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marital Status <span className="text-red-500">*</span>
                </label>
                <SinglePageSelection
                  value={formData.MaritalStatus}
                  onChange={(val) => handleFieldChange("MaritalStatus", String(val))}
                  options={MARITAL_STATUS_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                  error={hasSubmitted ? errors.MaritalStatus : undefined}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Group <span className="text-red-500">*</span>
                </label>
                <SinglePageSelection
                  value={formData.BloodGroup}
                  onChange={(val) => handleFieldChange("BloodGroup", String(val))}
                  options={BLOOD_GROUP_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                  error={hasSubmitted ? errors.BloodGroup : undefined}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DOB <span className="text-red-500">*</span>
                </label>
                <DatePicker value={formData.DateOfBirth ?? ""} onChange={(e) => handleFieldChange("DateOfBirth", e.target.value)} error={hasSubmitted ? errors.DateOfBirth : undefined} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Office Email Id
                </label>
                <Input value={formData.OfficeEmailId} onChange={(e) => handleFieldChange("OfficeEmailId", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Id <span className="text-red-500">*</span>
                </label>
                <Input value={formData.EmailId} onChange={(e) => handleFieldChange("EmailId", e.target.value)} error={hasSubmitted ? errors.EmailId : undefined} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Mobile Number <span className="text-red-500">*</span>
                </label>
                <Input prefix="+91" value={formData.PersonalMobileNumber} onChange={(e) => handleFieldChange("PersonalMobileNumber", e.target.value)} error={hasSubmitted ? errors.PersonalMobileNumber : undefined} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Office Mobile Number
                </label>
                <Input value={formData.OfficeMobileNumber} onChange={(e) => handleFieldChange("OfficeMobileNumber", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee Type <span className="text-red-500">*</span>
                </label>
                <SinglePageSelection
                  value={formData.EmployeeType}
                  onChange={(val) => handleFieldChange("EmployeeType", String(val))}
                  options={EMPLOYEE_TYPE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                  error={hasSubmitted ? errors.EmployeeType : undefined}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relation to Emergency Contact <span className="text-red-500">*</span>
                </label>
                <SinglePageSelection
                  value={formData.EmergencyContactPersonRelationship}
                  onChange={(val) => handleFieldChange("EmergencyContactPersonRelationship", String(val))}
                  options={EMERGENCY_RELATION_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                  error={hasSubmitted ? errors.EmergencyContactPersonRelationship : undefined}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact Number <span className="text-red-500">*</span>
                </label>
                <Input prefix="+91" value={formData.EmergencyMobileNumber} onChange={(e) => handleFieldChange("EmergencyMobileNumber", e.target.value)} error={hasSubmitted ? errors.EmergencyMobileNumber : undefined} />
              </div>
            </div>
          </div>
          {/* ============================================================= [EMPLOYEE INFO SHEET] ============================================================================================= */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Employee Info Sheet</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company <span className="text-red-500">*</span>
                </label>
                <SingleSelectDropdownWithPagination
                  title="Select..."
                  size="lg"
                  dataFetchCallBack={fetchCompanyOptions}
                  onSelected={(item) => handleFieldChange("CompanyId", Number(item.value))}
                  initialValue={toDropdownInitialValue(formData.CompanyId, dropdownLabels.companyName)}
                  error={hasSubmitted ? errors.CompanyId : undefined}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <SingleSelectDropdownWithPagination
                  title="Select..."
                  size="lg"
                  dataFetchCallBack={fetchDepartmentOptions}
                  onSelected={(item) => handleFieldChange("DepartmentMasterId", Number(item.value))}
                  initialValue={toDropdownInitialValue(formData.DepartmentMasterId, dropdownLabels.departmentName)}
                  error={hasSubmitted ? errors.DepartmentMasterId : undefined}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch <span className="text-red-500">*</span>
                </label>
                <SingleSelectDropdownWithPagination
                  title="Select..."
                  size="lg"
                  dataFetchCallBack={fetchBranchOptions}
                  onSelected={(item) => handleFieldChange("BranchMasterId", Number(item.value))}
                  initialValue={toDropdownInitialValue(formData.BranchMasterId, dropdownLabels.branchName)}
                  error={hasSubmitted ? errors.BranchMasterId : undefined}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Designation <span className="text-red-500">*</span>
                </label>
                <SingleSelectDropdownWithPagination
                  title="Select..."
                  size="lg"
                  dataFetchCallBack={fetchDesignationOptions}
                  onSelected={(item) => handleFieldChange("DesignationMasterId", Number(item.value))}
                  initialValue={toDropdownInitialValue(formData.DesignationMasterId, dropdownLabels.designationName)}
                  error={hasSubmitted ? errors.DesignationMasterId : undefined}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Joining Date <span className="text-red-500">*</span>
                </label>
                <DatePicker className="py-1" size="lg" value={formData.JoiningDate ?? ""} onChange={(e) => handleFieldChange("JoiningDate", e.target.value)} error={hasSubmitted ? errors.JoiningDate : undefined} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reporting Person <span className="text-red-500">*</span>
                </label>
                <SingleSelectDropdownWithPagination
                  title="Select..."
                  size="lg"
                  dataFetchCallBack={fetchReportingOptions}
                  onSelected={(item) => handleFieldChange("ReportPersonId", Number(item.value))}
                  initialValue={toDropdownInitialValue(formData.ReportPersonId, dropdownLabels.reportPersonName)}
                  error={hasSubmitted ? errors.ReportPersonId : undefined}
                />
              </div>
            </div>
          </div>
          {/* ============================================================= [ADDRESS] ============================================================================================= */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Communication Address <span className="text-red-500">*</span>
                </label>
                <TextArea value={formData.CommunicationAddress} onChange={(e) => handleFieldChange("CommunicationAddress", e.target.value)} error={hasSubmitted ? errors.CommunicationAddress : undefined} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permanent Address <span className="text-red-500">*</span>
                </label>
                <TextArea value={formData.PermanentAddress} onChange={(e) => handleFieldChange("PermanentAddress", e.target.value)} error={hasSubmitted ? errors.PermanentAddress : undefined} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* COUNTRY */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country <span className="text-red-500">*</span>
                </label>

                <SinglePageSelection
                  value={selectedCountryId || ''}
                  onChange={val => {
                    const id = Number(val)
                    setSelectedCountryId(id)
                    setSelectedStateId(null)
                    setSelectedDistrictId(null)
                    setSelectedCityId(null)

                    handleFieldChange('CountryMasterId', id)
                  }}
                  disabled={isLocationLoading}
                  options={countryOptions}
                  error={hasSubmitted ? errors.CountryMasterId : undefined}
                />
              </div>

              {/* STATE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>

                <SinglePageSelection
                  value={selectedStateId ?? ''}
                  onChange={val => {
                    const id = Number(val)
                    setSelectedStateId(id)
                    setSelectedDistrictId(null)
                    setSelectedCityId(null)

                    handleFieldChange('StateMasterId', id)
                  }}
                  disabled={!selectedCountryId || stateOptions.length === 0}
                  options={stateOptions}
                  error={hasSubmitted ? errors.StateMasterId : undefined}
                />
              </div>

              {/* DISTRICT */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District <span className="text-red-500">*</span>
                </label>

                <SinglePageSelection
                  value={selectedDistrictId ?? ''}
                  onChange={val => {
                    const id = Number(val)
                    setSelectedDistrictId(id)
                    setSelectedCityId(null)

                    handleFieldChange('DistrictMasterId', id)
                  }}
                  disabled={!selectedStateId || districtOptions.length === 0}
                  options={districtOptions}
                  error={hasSubmitted ? errors.DistrictMasterId : undefined}
                />
              </div>

              {/* CITY */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>

                <SinglePageSelection
                  value={selectedCityId ?? ''}
                  onChange={val => {
                    const id = Number(val)
                    setSelectedCityId(id)
                    handleFieldChange('CityMasterId', id)
                  }}
                  disabled={!selectedDistrictId || cityOptions.length === 0}
                  options={cityOptions}
                  error={hasSubmitted ? errors.CityMasterId : undefined}
                />
              </div>

            </div>
          </div>
     
          {/* ============================================================= [BANK DETAILS] ============================================================================================= */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Bank Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank <span className="text-red-500">*</span>
                </label>
                <SingleSelectDropdownWithPagination
                  title="Select..."
                  size="lg"
                  dataFetchCallBack={fetchBanks}
                  onSelected={(item) => {handleFieldChange("BankListMasterId", Number(item?.value || 0));}}
                  initialValue={toDropdownInitialValue(formData.BankListMasterId, dropdownLabels.bankName)}
                  error={hasSubmitted ? errors.BankListMasterId : undefined}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Branch Name <span className="text-red-500">*</span>
                </label>
                <Input value={formData.BankBranchName} onChange={(e) => handleFieldChange("BankBranchName", e.target.value)} error={hasSubmitted ? errors.BankBranchName : undefined} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <Input value={formData.AccountNo} onChange={(e) => handleFieldChange("AccountNo", e.target.value)} error={hasSubmitted ? errors.AccountNo : undefined} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IFSC Code <span className="text-red-500">*</span>
                </label>
                <Input value={formData.IFSCCode} onChange={(e) => handleFieldChange("IFSCCode", e.target.value)} error={hasSubmitted ? errors.IFSCCode : undefined} />
              </div>
            </div>
          </div>
          </form>
        </div>
        {/* ✅ Fixed Bottom  */}
        {/* ✅ Fixed Bottom  */}
        <div
          className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-2 flex justify-end items-center gap-3 shadow-md h-16"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <Button
            color="transparent"
            variant='transparent_border'
            size="sm"
            onClick={() => {
              navigate(-1);
            }}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            color="green"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="px-6"
            disabled={isLoading}
            type="button"
          >
            {formData.EmployeeId ? "Update Employee" : "Add Employee"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default AddUpdateEmployeePage;
