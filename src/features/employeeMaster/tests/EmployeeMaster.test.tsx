import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, test, expect, beforeEach } from "vitest";
import EmployeeMaster from "../pages/EmployeeMaster";
import { employeeMasterService } from "@/features/employeeMaster/services/EmployeeMasterService";
import * as E from "fp-ts/Either";

const mockAddToast = vi.fn();

vi.mock("@/core/hooks/useToast", () => ({
  useToast: () => ({
    addToast: mockAddToast,
  }),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

const mockUpdateListState = vi.fn();
let mockListState = {
  page: 1,
  searchTerm: "",
  sortInfo: undefined,
  filters: {},
};

vi.mock("@/features/employeeMaster/context/EmployeeListStateContext", () => ({
  useEmployeeListState: () => ({
    listState: mockListState,
    updateListState: mockUpdateListState,
  }),
}));

vi.mock("@/features/menu/hooks/useMenuPermissions", () => ({
  useMenuPermissions: () => ({ canAction: true, canExport: true }),
}));

vi.mock("@/core/utils/localStorageHelper", () => ({
  LocalStorageHelper: {
    getStoredTokenData: () => "mock-token",
    getStoredEmployeeData: () => ({
      UniqueKey: "123",
      FullName: "Test User",
    }),
    getEmployeeMasterTableColumns: () => null,
    storeEmployeeMasterTableColumns: vi.fn(),
  },
}));

vi.mock("@/features/employeeMaster/services/EmployeeMasterService", () => ({
  employeeMasterService: {
    apiCallPullEmployeeMaster: vi.fn(),
  },
}));

vi.mock("@/features/employeeMaster/utils/employeeUtils", () => ({
  isEmployeeComplete: () => true,
}));

vi.mock("@/core/utils/getNameInitials", () => ({
  getNameInitials: () => "JD",
}));

const mockEmployees = [
  { EmployeeId: 101, FullName: "John Doe", EmployeeCode: "EMP101", Department: "IT" },
];

describe("EmployeeMaster Page Component Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockListState = { page: 1, searchTerm: "", sortInfo: undefined, filters: {} };

    vi.mocked(employeeMasterService.apiCallPullEmployeeMaster).mockResolvedValue(
      E.right({
        Data: mockEmployees,
        TotalNumberOfRecord: 1,
      } as any)
    );
  });

  test("should load employee roster data onto screen immediately when page mounts", async () => {
    render(<EmployeeMaster />);

    expect(employeeMasterService.apiCallPullEmployeeMaster).toHaveBeenCalled();

    const employeeName = await screen.findByText("John Doe");
    expect(employeeName).toBeInTheDocument();
  });

  test("should redirect pages to input creation form when clicking the Add button", async () => {
    render(<EmployeeMaster />);

    const addButton = screen.getByRole("button", { name: "Add" });
    fireEvent.click(addButton);

    expect(mockNavigate).toHaveBeenCalledWith("/employeeMaster/add");
  });


  test("should synchronize text changes into state variables during text lookups", async () => {
    vi.useFakeTimers();
    render(<EmployeeMaster />);

    const searchBar = screen.getByPlaceholderText("Search By Employee Name");

    fireEvent.change(searchBar, { target: { value: "Alice" } });

    expect(mockUpdateListState).toHaveBeenCalledWith({ searchTerm: "Alice" });

    vi.advanceTimersByTime(350);

    expect(mockUpdateListState).toHaveBeenCalledWith({ searchTerm: "Alice", page: 1 });
    vi.useRealTimers();
  });

  test("should update target identifiers and redirect when clicking employee row values", async () => {
    render(<EmployeeMaster />);

    const textLink = await screen.findByText("John Doe");
    fireEvent.click(textLink);

    expect(mockUpdateListState).toHaveBeenCalledWith({
      employeeId: 101,
      employeeName: "John Doe",
    });
    expect(mockNavigate).toHaveBeenCalledWith("/employeeMaster/view");
  });
});