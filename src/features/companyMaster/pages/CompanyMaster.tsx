import React, { useEffect, useState } from "react";
import { usePagination } from "@/core/hooks/usePagination";
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { runApiWithLoader } from "@/core/utils";
import * as E from "fp-ts/Either";
import { ToastContainer } from "@/ui/components/Toast";
import { useToast } from "@/core/hooks/useToast";
import { companyMasterService } from "@/features/companyMaster/services/CompanyMasterService";
import type {
  FilterWithPaginationCompanyMasterRequest,
  CompanyMasterData,
  AddUpdateCompanyMasterRequest,
  DeleteCompanyMasterRequest,
} from "@/features/companyMaster/models/CompanyMasterModel";

import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { Edit, Trash2, Plus, Search, X, Filter } from "lucide-react";
import { Loader } from "@/core/utils/loader";
import { Modal } from "@/ui/components/Modal/Modal";
import ConfirmationDialogBox from "@/core/utils/confirmationDialogBox";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";

export const CompanyMaster: React.FC = () => {
  // #region STATE MANAGEMENT
  const [companyList, setCompanyList] = useState<CompanyMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState("");
  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { toasts, removeToast, addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCompany, setEditingCompany] = useState<CompanyMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
  const [deleteCompany, setDeleteCompany] = useState<CompanyMasterData | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  // #endregion

  // #region INITIALIZATION
  useEffect(() => {
    fetchCompanies();
  }, []);
  // #endregion

  // #region DATA LOADING
  const fetchCompanies = async (page: number = pagination.currentPage) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        const params: FilterWithPaginationCompanyMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          CompanyName: searchTerm?.trim() || undefined,
        };

        const response = await companyMasterService.apiCallPullCompanyMaster(params);

        if (E.isRight(response)) {
          setCompanyList(response.right.Data);
          setPagination({
            currentPage: page,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
          });
        } else {
          addToast({ type: "error", title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => addToast({ type: "error", title: error.message }),
      undefined,
      "Loading Company Data..."
    );
  };
  // #endregion

  // #region SEARCH
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.trim() === "") {
      fetchCompanies();
      return;
    }
    fetchCompanies(1);
  };
  // #endregion

  // #region TABLE CONFIGURATION
  const columns: TableColumn[] = [
    {
      key: "CompanyName",
      label: "Company Name",
      sortable: true,
      align: "left",
      render: (value, row) => (
        <div className="flex items-center justify-between">
          <TooltipText text={value || "N/A"} maxWidth="250px" tooltipThreshold={25} />
          <div className="flex items-center space-x-2 ml-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                setEditingCompany(row);
                setIsAddUpdateModalOpen(true);
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setDeleteCompany(row);
                setIsConfirmDeleteOpen(true);
              }}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ),
    },
    {
      key: "Company Type",
      label: "Company Type",
      align: "center",
      render: (value) => <span>{value || "-"}</span>,
    },
    {
      key: "MobileNumber",
      label: "Mobile Number",
      align: "center",
      render: (value) => value || "-",
    },
    {
      key:"emailId",
      label:"Email ID",
      align:"center",
      render:(value) => value || "-",
    },
    {
        key:"GSTNumber",
        label:"GST Number",
        align:"center",
        render:(value) => value || "-",
    },
    {
        key:"PANNumber",
        label:"PAN Number",
        align:"center",
        render:(value) => value || "-",
    },
    {
        key:"RERANumber",
        label:"RERA Number",
        align:"center",
        render:(value) => value || "-",
    },
    {
        key:"state",
        label:"State",
        align:"center",
        render:(value) => value || "-",
    },
    {
        key:"District",
        label:"District",
        align:"center",
        render:(value) => value || "-",
    },
    {
        key:"City",
        label:"City",
        align:"center",
        render:(value) => value || "-",
    },
    {
        key:"company letterhead header",
        label:"Company Letterhead Header",
        align:"center",
        render:(value) => value || "-",
    },
    {
        key:"company letterhead footer",
        label:"Company Letterhead Footer",
        align:"center",
        render:(value) => value || "-",
    },
    {
        key:"last modified by",
        label:"Last Modified By",
        align:"center",
        render:(value) => value || "-",
    },

    {
      key: "LastModifiedDate",
      label: "Last Modified Date",
      sortable: true,
      align: "center",
      render: (value) => (value ? formatDate_dd_MonthName_yy(value) : "-"),
    },
  ];
  // #endregion

  const paginationInfo: PaginationInfo = {
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    totalRecords: pagination.totalRecords,
    pageSize: pagination.pageSize,
    onPageChange: (p) => fetchCompanies(p),
  };

  // #region ADD/UPDATE MODAL
  const AddUpdateModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    data?: CompanyMasterData | null;
    onSubmit: (d: AddUpdateCompanyMasterRequest) => void;
  }> = ({ isOpen, onClose, data, onSubmit }) => {
    const [formData, setFormData] = useState<AddUpdateCompanyMasterRequest>({
      CompanyCode: "",
      CompanyName: "",
      CompanyType: "",
      ContactPerson: "",
      MobileNumber: "",
      EmailId: "",
      GSTNumber: "",
      State: "",
      District: "",
      City: "",
      CompanyLetterheadHeaderType: "",
      CompanyLetterheadHeaderValue: "",
      CompanyLetterheadFooterType: "",
      CompanyLetterheadFooterValue: "",
    });

    useEffect(() => {
      if (data) {
        setFormData({
          CompanyMasterId: data.CompanyMasterId,
          UniqueKey: data.UniqueKey,
          CompanyCode: data.CompanyCode || "",
          CompanyName: data.CompanyName || "",
          CompanyAddress: data.CompanyAddress || "",
          CompanyType: data.CompanyType || "",
          ContactPerson: data.ContactPerson || "",
          MobileNumber: data.MobileNumber || "",
          EmailId: data.EmailId || "",
          GSTNumber: data.GSTNumber || "",
          State: data.State || "",
          District: data.District || "",
          City: data.City || "",
          CompanyLetterheadHeaderType: data.CompanyLetterheadHeaderType || "",
          CompanyLetterheadHeaderValue: data.CompanyLetterheadHeaderValue || "",
          CompanyLetterheadFooterType: data.CompanyLetterheadFooterType || "",
          CompanyLetterheadFooterValue: data.CompanyLetterheadFooterValue || "",
        });
      }
    }, [data]);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Add / Update Company"
        onSubmit={handleSubmit}
        saveText={data ? "Update" : "Add"}
      >
        <div className="space-y-4">
          <div>
            <label>Company Name *</label>
            <input
              type="text"
              value={formData.CompanyName}
              onChange={(e) => setFormData({ ...formData, CompanyName: e.target.value })}
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>
          <div>
            <label>Company Code *</label>
            <input
              type="text"
              value={formData.CompanyCode}
              onChange={(e) => setFormData({ ...formData, CompanyCode: e.target.value })}
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>
          <div>
            <label>Contact Person</label>
            <input
              type="text"
              value={formData.ContactPerson || ""}
              onChange={(e) => setFormData({ ...formData, ContactPerson: e.target.value })}
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>
          <div>
            <label>Mobile Number</label>
            <input
              type="text"
              value={formData.MobileNumber || ""}
              onChange={(e) => setFormData({ ...formData, MobileNumber: e.target.value })}
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>
        </div>
      </Modal>
    );
  };
  // #endregion

  const handleAddUpdate = async (formData: AddUpdateCompanyMasterRequest) => {
    await runApiWithLoader(setIsLoading, setIsLoadingMessage, async () => {
      const response = await companyMasterService.apiCallAddUpdateCompanyMaster(formData);
      if (E.isRight(response)) {
        addToast({ type: "success", title: "Company saved successfully!" });
        setIsAddUpdateModalOpen(false);
        fetchCompanies();
      } else {
        addToast({ type: "error", title: response.left.message });
      }
      return response;
    });
  };

  const handleDelete = async () => {
    if (!deleteCompany) return;
    const params: DeleteCompanyMasterRequest = {
      CompanyMasterId: deleteCompany.CompanyMasterId,
      UniqueKey: deleteCompany.UniqueKey,
    };
    await runApiWithLoader(setIsLoading, setIsLoadingMessage, async () => {
      const response = await companyMasterService.apiCallDeleteCompanyMaster(params);
      if (E.isRight(response)) {
        addToast({ type: "success", title: "Company deleted successfully!" });
        setCompanyList((prev) => prev.filter((c) => c.CompanyMasterId !== deleteCompany.CompanyMasterId));
        setIsConfirmDeleteOpen(false);
      } else {
        addToast({ type: "error", title: response.left.message });
      }
    });
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <div className="flex items-center space-x-4 p-4 bg-white border-b">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search Company..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md"
          />
          {searchTerm && (
            <button onClick={() => handleSearch("")} className="absolute right-3 top-2 text-gray-500 hover:text-gray-700">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => {
            setEditingCompany(null);
            setIsAddUpdateModalOpen(true);
          }}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Company
        </button>
        <button className="flex items-center p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
          <Filter className="h-4 w-4" />
        </button>
      </div>

      <DataTable
        data={companyList}
        columns={columns}
        pagination={paginationInfo}
        emptyMessage="No companies found"
        sortInfo={sortInfo}
        onSort={setSortInfo}
      />

      <AddUpdateModal
        isOpen={isAddUpdateModalOpen}
        onClose={() => setIsAddUpdateModalOpen(false)}
        data={editingCompany}
        onSubmit={handleAddUpdate}
      />

      <ConfirmationDialogBox
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Company?"
        message="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={isLoading}
      />
    </>
  );
};

export default CompanyMaster;
