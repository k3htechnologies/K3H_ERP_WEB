import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, test, expect, beforeEach } from "vitest";
import AddUpdateEmployeePage from "../pages/AddUpdateEmployeeMaster";
import { employeeMasterService } from "@/features/employeeMaster/services/EmployeeMasterService";
import * as E from "fp-ts/Either";


const mockNavigate = vi.fn();
let mockParams = { employeeId: "" };

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockParams,
}));

vi.mock("@/features/menu/hooks/useMenuPermissions", () => ({
  useMenuPermissions: () => ({ canAction: true }),
}));

const mockAddToast = vi.fn();
vi.mock("@/core/hooks/useToast", () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));


vi.mock("@/core/utils/fileValidation", () => ({
  filterLetters: (v: string) => v.replace(/[^a-zA-Z]/g, ""),
  filterNumbers: (v: string) => v.replace(/\D/g, ""),
  filterEmail: (v: string) => v.trim(),
  filterMobile: (v: string) => v.replace(/\D/g, ""),
  filterIFSC: (v: string) => v,
  isValidEmail: (v: string) => v.includes("@"),
  isValidMobile: (v: string) => v.length === 10,
  isValidIFSC: (v: string) => v.length === 11,
}));

vi.mock("@/core/hooks/useCountryStateCityDistrictVillage", () => ({
  useCountryStateCityDistrictVillageData: () => ({
    isLoading: false,
    countries: [{ id: 1, name: "India" }],
    statesByCountryId: { 1: [{ id: 10, name: "Maharashtra" }] },
    districtsByStateId: { 10: [{ id: 20, name: "Mumbai" }] },
    citiesByDistrictId: { 20: [{ id: 30, name: "Mira Road" }] },
    villagesByCityId: { 30: [{ id: 40, name: "Local Village" }] },
  }),
}));

vi.mock("@/ui/components/DropDown/SingleSelectDropdownWithPagination", () => ({
  SingleSelectDropdownWithPagination: ({ label, onSelected }: any) => (
    <div data-testid={`async-dropdown-${label}`}>
      <button
        type="button"
        data-testid={`async-btn-${label}`}
        onClick={() => onSelected({ value: "99", label: `Mocked ${label}` })}
      >
        Select Mocked {label}
      </button>
    </div>
  ),
}));

vi.mock("@/ui/components/DropDown/SinglePageSelection", () => ({
  SinglePageSelection: ({ label, onChange, value, options, required, disabled }: any) => {
    const id = `select-${label}`;
    return (
      <div>
        <label htmlFor={id}>
          {label}
          {required && <span> *</span>}
        </label>
        <select
          id={id}
          value={value ?? ""}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">-- Select --</option>
          {(options || []).map((opt: any) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  },
}));


vi.mock("@/ui/components/forms/Datepicker", () => ({
  DatePickerInput: ({ label, value, onChange, required, error }: any) => {
    const id = `datepicker-${label}`;
    return (
      <div>
        <label htmlFor={id}>
          {label}
          {required && <span> *</span>}
        </label>
        <input
          id={id}
          type="text"
          placeholder="DD-MM-YYYY"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
        {error && <span>{error}</span>}
      </div>
    );
  },
}));

vi.mock("@/features/employeeMaster/services/EmployeeMasterService", () => ({
  employeeMasterService: {
    apiCallPullEmployeeMaster: vi.fn(),
    apiCallAddUpdateEmployeeMaster: vi.fn(),
  },
}));


describe("AddUpdateEmployeePage Component Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParams = { employeeId: "" };
  });


  test("should display form header categories and initialize fields with empty values", () => {
    render(<AddUpdateEmployeePage />);

    expect(screen.getByText("Employee Details")).toBeInTheDocument();
    expect(screen.getByText("Employee Info Sheet")).toBeInTheDocument();
    expect(screen.getByText("Bank Details")).toBeInTheDocument();

    expect(screen.getByPlaceholderText("Enter First Name")).toHaveValue("");
    expect(screen.getByPlaceholderText("Enter Account Number")).toHaveValue("");
  });


  test("should show validation highlights and block API calls when saving a completely blank form", async () => {
    render(<AddUpdateEmployeePage />);

    const saveButton = screen.getByRole("button", { name: "Add" });
    fireEvent.click(saveButton);

    expect(mockAddToast).toHaveBeenCalledWith({
      type: "error",
      title: "Please fill the required filed",
    });

    expect(screen.getByText("First Name is required.")).toBeInTheDocument();
    expect(screen.getByText("Account Number is required.")).toBeInTheDocument();

    expect(employeeMasterService.apiCallAddUpdateEmployeeMaster).not.toHaveBeenCalled();
  });


  test("should execute string replacement filters when user enters invalid formats", () => {
    render(<AddUpdateEmployeePage />);

    const firstNameInput = screen.getByPlaceholderText("Enter First Name");

    fireEvent.change(firstNameInput, { target: { value: "John123" } });

    expect(firstNameInput).toHaveValue("John");
  });


  test("should fire lookup endpoints and populate fields when an employeeId param exists in the URL", async () => {
    mockParams = { employeeId: "101" };

    const existingEmployee = {
      EmployeeId: 101,
      FirstName: "Harshita",
      MiddleName: "S",
      LastName: "Srivastava",
      CompanyName: "Abc Construction",
      AccountNo: "9988776655",
    };

    vi.mocked(employeeMasterService.apiCallPullEmployeeMaster).mockResolvedValue(
      E.right({ Data: [existingEmployee], TotalNumberOfRecord: 1 } as any)
    );

    render(<AddUpdateEmployeePage />);

    expect(employeeMasterService.apiCallPullEmployeeMaster).toHaveBeenCalledWith(
      expect.objectContaining({ EmployeeId: 101 })
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Enter First Name")).toHaveValue("Harshita");
      expect(screen.getByPlaceholderText("Enter Last Name")).toHaveValue("Srivastava");
    });
  });

  test("should successfully execute creation api callback and route backwards on successful validations", async () => {
    vi.mocked(employeeMasterService.apiCallAddUpdateEmployeeMaster).mockResolvedValue(
      E.right({ SuccessMessage: ["Employee added successfully"] } as any)
    );

    render(<AddUpdateEmployeePage />);

    fireEvent.change(screen.getByPlaceholderText("Enter First Name"), { target: { value: "Rahul" } });
    fireEvent.change(screen.getByPlaceholderText("Enter Middle Name"), { target: { value: "K" } });
    fireEvent.change(screen.getByPlaceholderText("Enter Last Name"), { target: { value: "Sharma" } });

    fireEvent.change(screen.getByPlaceholderText("Enter E-mail Id"), { target: { value: "rahul@gmail.com" } });
    fireEvent.change(screen.getByPlaceholderText("Enter Personal Mobile Number"), { target: { value: "9876543210" } });
    fireEvent.change(screen.getByPlaceholderText("Enter Emergency Contact Number"), { target: { value: "9123456789" } });

    fireEvent.change(screen.getByPlaceholderText("Enter Communication Address"), { target: { value: "Mumbai, India" } });
    fireEvent.change(screen.getByPlaceholderText("Enter Permanent Address"), { target: { value: "Mumbai, India" } });

    fireEvent.change(screen.getByPlaceholderText("Enter Bank Branch Name"), { target: { value: "Thane" } });
    fireEvent.change(screen.getByPlaceholderText("Enter Account Number"), { target: { value: "123456789012" } });
    fireEvent.change(screen.getByPlaceholderText("Enter IFSC Code"), { target: { value: "SBIN0001234" } });


    const genderSelect = screen.getByLabelText(/^Gender\b/);
    fireEvent.change(genderSelect, { target: { value: "Male" } });

    const maritalSelect = screen.getByLabelText(/^Marital Status\b/);
    fireEvent.change(maritalSelect, { target: { value: "Single" } });

    const bloodSelect = screen.getByLabelText(/^Blood Group\b/);
    fireEvent.change(bloodSelect, { target: { value: "O+" } });

    const employeeTypeSelect = screen.getByLabelText(/^Employee Type\b/);
    fireEvent.change(employeeTypeSelect, { target: { value: "Permanent" } });

    const relationSelect = screen.getByLabelText(/^Relation to Emergency Contact\b/);
    fireEvent.change(relationSelect, { target: { value: "Father" } });


    const countrySelect = screen.getByLabelText(/^Country\b/);
    fireEvent.change(countrySelect, { target: { value: "1" } });

    const stateSelect = screen.getByLabelText(/^State\b/);
    fireEvent.change(stateSelect, { target: { value: "10" } });

    const districtSelect = screen.getByLabelText(/^District\b/);
    fireEvent.change(districtSelect, { target: { value: "20" } });

    const citySelect = screen.getByLabelText(/^City\b/);
    fireEvent.change(citySelect, { target: { value: "30" } });

    const villageSelect = screen.getByLabelText(/^Village\b/);
    fireEvent.change(villageSelect, { target: { value: "40" } });

    const asyncLabels = ["Company", "Department", "Branch", "Designation", "Bank", "Reporting Person"];
    asyncLabels.forEach((lbl) => {
      const btn = screen.queryByTestId(`async-btn-${lbl}`);
      if (btn) fireEvent.click(btn);
    });

    fireEvent.change(screen.getByLabelText(/^DOB\b/), { target: { value: "15-08-1995" } });
    fireEvent.change(screen.getByLabelText(/^Joining Date\b/), { target: { value: "01-05-2026" } });

    const saveButton = screen.getByRole("button", { name: "Add" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(employeeMasterService.apiCallAddUpdateEmployeeMaster).toHaveBeenCalled();
      expect(mockAddToast).toHaveBeenCalledWith({ type: "success", title: "Employee added successfully" });
      expect(mockNavigate).toHaveBeenCalledWith("/employeeMaster");
    });
  });
});