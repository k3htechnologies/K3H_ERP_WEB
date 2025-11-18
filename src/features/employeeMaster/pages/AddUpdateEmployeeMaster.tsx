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

type NullableNumber = number | null;

/**
 * Frontend model mapped to the backend sample you provided
 */
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

/**
 * Single row type as appears in Data.CountryStateCityDistrictVillageData
 * (keys taken from the sample you pasted)
 */
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
  CountryMasterId: null,
  StateMasterId: null,
  DistrictMasterId: null,
  CityMasterId: null,
});

const AddUpdateEmployeePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { addToast } = useToast();

  const [formData, setFormData] = useState<AddUpdateEmployeeMasterRequest>(initialFormState());
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [, setLoading] = useState(false);
  const { employeeId } = useParams<{ employeeId?: string }>();
// const employeeIdNumber = employeeId ? Number(employeeId) : 0;
  // Location cache: load once from apiCallPullLocationHierarchy() and reuse
  const [locationRows, setLocationRows] = useState<LocationRow[] | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // memoized states list (no pagination required)
  const statesList = useMemo(() => {
    if (!locationRows) return [];
    const map = new Map<number, string>();
    locationRows.forEach((r) => {
      if (r.StateMasterId && !map.has(r.StateMasterId)) map.set(r.StateMasterId, r.StateName || "");
    });
    return [...map.entries()].map(([id, name]) => ({ label: name, value: String(id) }));
  }, [locationRows]);

  // helper to extract unique districts for a given state id
  const getDistrictsFromCache = (stateId: NullableNumber) => {
    if (!locationRows || !stateId) return [];
    const map = new Map<number, string>();
    locationRows
      .filter((r) => r.StateMasterId === stateId)
      .forEach((r) => {
        if (r.DistrictMasterId && !map.has(r.DistrictMasterId)) map.set(r.DistrictMasterId, r.DistrictName || "");
      });
    return [...map.entries()].map(([id, name]) => ({ label: name, value: String(id) }));
  };

  // helper to extract unique cities for a given district id
  const getCitiesFromCache = (districtId: NullableNumber) => {
    if (!locationRows || !districtId) return [];
    const map = new Map<number, string>();
    locationRows
      .filter((r) => r.DistrictMasterId === districtId)
      .forEach((r) => {
        if (r.CityMasterId && !map.has(r.CityMasterId)) map.set(r.CityMasterId, r.CityName || "");
      });
    return [...map.entries()].map(([id, name]) => ({ label: name, value: String(id) }));
  };

  // Generic helper to set field and clear error for that field
  const handleFieldChange = (field: keyof AddUpdateEmployeeMasterRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // -------------------------
  // Load location hierarchy (lazy)
  // -------------------------
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

  // -------------------------
  // Dropdown callbacks (shape: { totalNumberOfRecord, itemList })
  // -------------------------
  const fetchStates = async () => {
    await loadLocationHierarchy();
    return {
      totalNumberOfRecord: statesList.length,
      itemList: statesList,
    };
  };

  const fetchDistricts = async () => {
    if (!formData.StateMasterId) return { totalNumberOfRecord: 0, itemList: [] };
    await loadLocationHierarchy();
    const list = getDistrictsFromCache(formData.StateMasterId);
    return { totalNumberOfRecord: list.length, itemList: list };
  };

  const fetchCities = async () => {
    if (!formData.DistrictMasterId) return { totalNumberOfRecord: 0, itemList: [] };
    await loadLocationHierarchy();
    const list = getCitiesFromCache(formData.DistrictMasterId);
    return { totalNumberOfRecord: list.length, itemList: list };
  };

  // -------------------------
  // Other server-backed dropdowns (company, department, branch, designation, reporting)
  // -------------------------
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
  return date.split("T")[0]; // "2002-02-05"
};

useEffect(() => {
  debugger
  if (!employeeId) return;
debugger
  const loadEmployeeAndLocation = async () => {
    setLoading(true);

    try {
      // 1) Load employee
      const resp = await employeeMasterService.apiCallPullEmployeeMaster({
        PageSize: 1,
        PageNumber: 1,
        EmployeeId: Number(id),
      });

      if (E.isRight(resp)) {
        const e = resp.right?.Data?.[0];
        if (e) {
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

            CountryMasterId:1,
            StateMasterId: e.StateMasterId ?? null,
            DistrictMasterId: e.DistrictMasterId ?? null,
            CityMasterId: e.CityMasterId ?? null,
          }));
        }
      } else {
        console.error("Failed to fetch employee:", resp.left);
        addToast({ type: "error", title: "Failed to load employee details" });
      }

      // 2) Load location hierarchy
      await loadLocationHierarchy();

    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  loadEmployeeAndLocation();

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [id]);

  // -------------------------
  // Validation
  // -------------------------
  const validateForm = () => {
    const e: { [k: string]: string } = {};
    if (!formData.FirstName || formData.FirstName.trim().length < 2) e.FirstName = "First name required (min 2 chars)";
    if (!formData.LastName || formData.LastName.trim().length < 2) e.LastName = "Last name required (min 2 chars)";
    if (formData.EmailId && !validateEmail(formData.EmailId)) e.EmailId = "Invalid email";
    if (!formData.PersonalMobileNumber || formData.PersonalMobileNumber.trim().length < 6) e.PersonalMobileNumber = "Enter a valid mobile number";
    if (!formData.CompanyId) e.CompanyId = "Select company";
    if (!formData.DepartmentMasterId) e.DepartmentMasterId = "Select department";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // -------------------------
  // Submit
  // -------------------------
  const handleSubmit = async (ev?: React.FormEvent) => {
    if (ev) ev.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
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
        CountryMasterId: 1 ,
        StateMasterId: formData.StateMasterId ?? 0,
        DistrictMasterId: formData.DistrictMasterId ?? 0,
        CityMasterId: formData.CityMasterId ?? 0,
      };

      await runApiWithLoader(
        setLoading,
        () => {},
        async () => {
          const response = await employeeMasterService.apiCallAddUpdateEmployeeMaster(payload);
          if (E.isRight(response)) {
            addToast({ type: "success", title: formData.EmployeeId ? "Employee updated" : "Employee added" });
            navigate("/employeMaster");
          } else {
            addToast({ type: "error", title: response.left?.message || "Operation failed" });
          }
          return response;
        },
        () => {},
        (err: any) => addToast({ type: "error", title: err?.message || "Operation failed" }),
        () => {},
        formData.EmployeeId === 0 ? "Add Employee" : "Update Employee..."
      );
    } catch (err) {
      console.error("Submit error:", err);
      addToast({ type: "error", title: "Submit failed" });
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Small helper to convert numeric id to dropdown value (string)
  // -------------------------
  const toDropdownValue = (v: NullableNumber) => (v ? String(v) : "");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-8">
      <h1 className="text-3xl font-bold mb-6">{formData.EmployeeId ? "Edit Employee" : "Add Employee"}</h1>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-8 overflow-auto">
        {/* Basic Employee Details */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-gray-700">Basic Employee Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Input label="First Name*" value={formData.FirstName} onChange={(e) => handleFieldChange("FirstName", e.target.value)} error={errors.FirstName} />
            <Input label="Middle Name" value={formData.MiddleName} onChange={(e) => handleFieldChange("MiddleName", e.target.value)} />
            <Input label="Last Name*" value={formData.LastName} onChange={(e) => handleFieldChange("LastName", e.target.value)} error={errors.LastName} />
            <SinglePageSelection label="Gender*" value={formData.Gender} onChange={(val) => handleFieldChange("Gender", String(val))} options={GENDER_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))} />
            <SinglePageSelection label="Marital Status*" value={formData.MaritalStatus} onChange={(val) => handleFieldChange("MaritalStatus", String(val))} options={MARITAL_STATUS_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))} />
            <SinglePageSelection label="Blood Group*" value={formData.BloodGroup} onChange={(val) => handleFieldChange("BloodGroup", String(val))} options={BLOOD_GROUP_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))} />
            <DatePicker label="DOB" value={formData.DateOfBirth ?? ""} onChange={(e) => handleFieldChange("DateOfBirth", e.target.value)} />
            <Input label="Office Email Id" value={formData.OfficeEmailId} onChange={(e) => handleFieldChange("OfficeEmailId", e.target.value)} />
            <Input label="Email Id" value={formData.EmailId} onChange={(e) => handleFieldChange("EmailId", e.target.value)} error={errors.EmailId} />
            <Input label="Personal Mobile Number" prefix="+91" value={formData.PersonalMobileNumber} onChange={(e) => handleFieldChange("PersonalMobileNumber", e.target.value)} error={errors.PersonalMobileNumber} />
            <Input label="Office Mobile Number" value={formData.OfficeMobileNumber} onChange={(e) => handleFieldChange("OfficeMobileNumber", e.target.value)} />
            <SinglePageSelection label="Employee Type" value={formData.EmployeeType} onChange={(val) => handleFieldChange("EmployeeType", String(val))} options={EMPLOYEE_TYPE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))} />
            <SinglePageSelection label="Relation to Emergency Contact" value={formData.EmergencyContactPersonRelationship} onChange={(val) => handleFieldChange("EmergencyContactPersonRelationship", String(val))} options={EMERGENCY_RELATION_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))} />
            <Input label="Emergency Contact Number" prefix="+91" value={formData.EmergencyMobileNumber} onChange={(e) => handleFieldChange("EmergencyMobileNumber", e.target.value)} />
          </div>
        </section>

        {/* Employee Info Sheet */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-gray-700">Employee Info Sheet</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            <SingleSelectDropdownWithPagination
              title="Select..."
              label="Company"
              size="lg"
              dataFetchCallBack={fetchCompanyOptions}
              onSelected={(item) => handleFieldChange("CompanyId", Number(item.value))}
              value={toDropdownValue(formData.CompanyId)}
            />
            <SingleSelectDropdownWithPagination
              title="Select..."
              label="Department"
              size="lg"
              dataFetchCallBack={fetchDepartmentOptions}
              onSelected={(item) => handleFieldChange("DepartmentMasterId", Number(item.value))}
              value={toDropdownValue(formData.DepartmentMasterId)}
            />
            <SingleSelectDropdownWithPagination
              title="Select..."
              label="Branch"
              size="lg"
              dataFetchCallBack={fetchBranchOptions}
              onSelected={(item) => handleFieldChange("BranchMasterId", Number(item.value))}
              value={toDropdownValue(formData.BranchMasterId)}
            />
            <SingleSelectDropdownWithPagination
              title="Select..."
              label="Designation"
              size="lg"
              dataFetchCallBack={fetchDesignationOptions}
              onSelected={(item) => handleFieldChange("DesignationMasterId", Number(item.value))}
              value={toDropdownValue(formData.DesignationMasterId)}
            />
            <DatePicker className="py-1" label="Joining Date" size="lg" value={formData.JoiningDate ?? ""} onChange={(e) => handleFieldChange("JoiningDate", e.target.value)} />
            <SingleSelectDropdownWithPagination
              title="Select..."
              label="Reporting Person"
              size="lg"
              dataFetchCallBack={fetchReportingOptions}
              onSelected={(item) => handleFieldChange("ReportPersonId", Number(item.value))}
              value={toDropdownValue(formData.ReportPersonId)}
            />
          </div>
        </section>

        {/* Address */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-gray-700">Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextArea label="Communication Address" value={formData.CommunicationAddress} onChange={(e) => handleFieldChange("CommunicationAddress", e.target.value)} />
            <TextArea label="Permanent Address" value={formData.PermanentAddress} onChange={(e) => handleFieldChange("PermanentAddress", e.target.value)} />
           <SingleSelectDropdownWithPagination
  title="Select..."
  label="State"
  size="lg"
  dataFetchCallBack={fetchStates}  // From cached data
  onSelected={(item) => {
    const num = Number(item.value);
    handleFieldChange("StateMasterId", num);
    // reset dependent fields
    handleFieldChange("DistrictMasterId", null);
    handleFieldChange("CityMasterId", null);
  }}
  value={toDropdownValue(formData.StateMasterId)}
/>

            <SingleSelectDropdownWithPagination
              title="Select..."
              label="District"
              size="lg"
              dataFetchCallBack={fetchDistricts}
              onSelected={(item) => {
                const num = Number(item.value);
                handleFieldChange("DistrictMasterId", num);
                // reset city when district changes
                handleFieldChange("CityMasterId", null);
              }}
              value={toDropdownValue(formData.DistrictMasterId)}
            />
            <SingleSelectDropdownWithPagination
              title="Select..."
              label="City"
              size="lg"
              dataFetchCallBack={fetchCities}
              onSelected={(item) => handleFieldChange("CityMasterId", Number(item.value))}
              value={toDropdownValue(formData.CityMasterId)}
            />
          </div>
        </section>

        {/* Bank Details */}
        <section className="flex flex-col gap-4 mt-6">
          <h2 className="text-xl font-semibold text-gray-700">Bank Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SingleSelectDropdownWithPagination
  title="Select..."
  label="Bank"
  size="lg"
  dataFetchCallBack={fetchBanks}
  onSelected={(item) => {
    handleFieldChange("BankListMasterId", Number(item?.value || 0));
  }}
  value={toDropdownValue(formData.BankListMasterId)}
/>

            <Input label="Bank Branch Name" value={formData.BankBranchName} onChange={(e) => handleFieldChange("BankBranchName", e.target.value)} />
            <Input label="Account Number" value={formData.AccountNo} onChange={(e) => handleFieldChange("AccountNo", e.target.value)} />
            <Input label="IFSC Code" value={formData.IFSCCode} onChange={(e) => handleFieldChange("IFSCCode", e.target.value)} />
          </div>
        </section>

        <div className="flex justify-end mt-4">
          <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
            {formData.EmployeeId ? "Update Employee" : "Add Employee"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUpdateEmployeePage;
