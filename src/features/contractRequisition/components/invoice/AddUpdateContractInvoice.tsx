import { useEffect, useState } from "react";
import * as E from "fp-ts/Either";
import { useNavigate, useParams } from "react-router-dom";

import { useProject } from "@/features/projectMaster/context/ProjectContext";
import type { AddUpdateContractRequisitionInvoiceRequest, FilterWithPaginationContractRequisitionInvoice } from "@/features/contractRequisition/models/ContractRequisitionInvoiceModel";
import { runApiWithLoader } from "@/core/utils";
import { contractRequisitionInvoiceService } from "@/features/contractRequisition/services/ContractRequisitionInvoiceService";
import { useContractRequisitionListState } from "@/features/contractRequisition/context/ContractRequisitionListStateContext";
import useToast from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { Input } from "@/ui/components/forms";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import { hasAnyDocumentFile } from "@/core/utils/fileValidation";
import { convert_date_yy_mm_dd_To_dd_mm_yyyy, convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from "@/core/utils/dateFormat";
import { TextArea } from "@/ui/components/forms/Textarea";
import { isToDateGreaterOrEqualFromDate } from "@/core/utils/comman";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";

const initialFormState = (): AddUpdateContractRequisitionInvoiceRequest => ({
  ProjectId: 0,
  ContractRequisitionId: 0,
  ContractRequisitionInvoiceId: 0,
  UniqueKey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  InvoiceNumber: 0,
  InvoiceDate: '',
  UploadInvoiceURL: '',
  RemoveUploadInvoiceURL: '',
  InvoiceAmount: 0,
  InvoiceDueDate: '',
  Remarks: '',
  PhotoURL: '',
  RemovePhotoURL: '',
  CertificateURL: '',
  RemoveCertificateURL: ''
});

const AddUpdateContractInvoice = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [formData, setFormData] = useState<AddUpdateContractRequisitionInvoiceRequest>(() => initialFormState());

  const [uploadInvoiceURLFiles, setUploadInvoiceURLFiles] = useState<(File | string)[]>([]);
  const [removeUploadInvoiceUrls, setRemoveUploadInvoiceUrls] = useState<string[]>([]);
  const [uploadInvoiceURL, setUploadInvoiceURL] = useState<string | null>();

  const [uploadPhotographsURLFiles, setUploadPhotographsURLFiles] = useState<(File | string)[]>([]);
  const [removeUploadPhotographsUrls, setRemoveUploadPhotographsUrls] = useState<string[]>([]);
  const [uploadPhotographsURL, setUploadPhotographsURL] = useState<string | null>();

  const [uploadCompletionCertificateURLFiles, setUploadCompletionCertificateURLFiles] = useState<(File | string)[]>([]);
  const [removeUploadCompletionCertificateUrls, setRemoveUploadCompletionCertificateUrls] = useState<string[]>([]);
  const [uploadCompletionCertificateURL, setUploadCompletionCertificateURL] = useState<string | null>();

  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const navigate = useNavigate();
  const { canAction } = useMenuPermissions("Contract - Add Invoice");
  const { listState } = useContractRequisitionListState();
  const { ContractRequisitionId } = listState;
  const { projectId } = useProject();
  const { addToast } = useToast();
  const { ContractInvoiceId } = useParams<{ ContractInvoiceId?: string }>();
  const contractInvoiceId = ContractInvoiceId ? Number(ContractInvoiceId) : 0;
  const isAddMode = contractInvoiceId === 0;

  //#region INITIALIZATION
  useEffect(() => {
    if (!projectId) return;
    setFormData(prev => ({
      ...prev,
      ContractInvoiceId: contractInvoiceId,
      ProjectId: Number(projectId),
      ContractRequisitionId: ContractRequisitionId
    }));
    if (!isAddMode) {
      fetchContractInvoiceDetails();
    }
  }, [projectId, contractInvoiceId]);
  //#endregion

  //#region FETCH Contract INVOICE DETAILS
  const fetchContractInvoiceDetails = async () => {

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationContractRequisitionInvoice = {
          PageNumber: 1,
          PageSize: 20,
          ProjectId: Number(projectId),
          ContractRequisitionInvoiceId: Number(contractInvoiceId)
        };

        const response = await contractRequisitionInvoiceService.apiCallPullContractRequisitionInvoice(params);

        if (E.isRight(response)) {

          const e = response.right.Data?.[0];

          if (e) {
            setFormData(prev => ({
              ...prev,
              ContractRequisitionInvoiceId: e.ContractRequisitionInvoiceId ?? prev.ContractRequisitionInvoiceId,
              UniqueKey: e.UniqueKey ?? prev.UniqueKey,
              ProjectId: e.ProjectId ?? prev.ProjectId,
              InvoiceNumber: e.InvoiceNumber ?? prev.InvoiceNumber,
              InvoiceDate: e.InvoiceDate ?? prev.InvoiceDate,
              InvoiceAmount: e.InvoiceAmount ?? prev.InvoiceAmount,
              InvoiceDueDate: e.InvoiceDueDate ?? prev.InvoiceDueDate,
              Remarks: e.Remarks ?? prev.Remarks
            }))
          }
          setUploadInvoiceURL(e.UploadInvoiceURL);
          setUploadInvoiceURLFiles([]);
          setRemoveUploadInvoiceUrls([]);
          setUploadPhotographsURL(e.PhotoURL);
          setUploadPhotographsURLFiles([]);
          setRemoveUploadPhotographsUrls([]);
          setUploadCompletionCertificateURL(e.CertificateURL);
          setUploadCompletionCertificateURLFiles([]);
          setRemoveUploadCompletionCertificateUrls([]);
        } else {
          addToast({ type: 'error', title: response.left.message });
        }
        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message });
      },
      undefined,
      'Loading Contract Invoice'
    );
  };
  //#endregion

  //#region HANDLE FIELD CHANGE EVENT
  const handleFieldChange = (field: keyof AddUpdateContractRequisitionInvoiceRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };
  //#endregion

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddContractInvoiceForm = (): {

    isValid: boolean

    errors: { [key: string]: string }

  } => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.InvoiceNumber) {
      newErrors.InvoiceNumber = 'Invoice Number is required.';
    }

    if (!formData.InvoiceAmount) {
      newErrors.InvoiceAmount = "Invoice Amount is required";
    } else if (formData.InvoiceAmount <= 0) {
      newErrors.InvoiceAmount = "Invoice Amount cannot be zero or negative";
    }

    const invoiceDate = convert_date_yy_mm_dd_To_dd_mm_yyyy(formData.InvoiceDate ? new Date(formData.InvoiceDate) : undefined);
    const invoiceDueDate = convert_date_yy_mm_dd_To_dd_mm_yyyy(formData.InvoiceDueDate ? new Date(formData.InvoiceDueDate) : undefined);

    if (!formData.InvoiceDate) {
      newErrors.InvoiceDate = 'Invoice Date is required.';
    }

    if (!formData.InvoiceDueDate) {
      newErrors.DueDate = 'Due Date is required.';

    } else if (formData.InvoiceDate != null && formData.InvoiceDate !== "" && !isToDateGreaterOrEqualFromDate(invoiceDate, invoiceDueDate)) {
      newErrors.DueDate = "Due Date must be greater to Invoice Date";
    }

    if (!hasAnyDocumentFile(uploadInvoiceURLFiles, uploadInvoiceURL, removeUploadInvoiceUrls)) {
      newErrors.UploadInvoiceURL = "Invoice is required";
    }
    if (!hasAnyDocumentFile(uploadPhotographsURLFiles, uploadPhotographsURL, removeUploadPhotographsUrls)) {
      newErrors.PhotoURL = "Photographs are required";
    }
    if (!hasAnyDocumentFile(uploadCompletionCertificateURLFiles, uploadCompletionCertificateURL, removeUploadCompletionCertificateUrls)) {
      newErrors.CertificateURL = "Certificate is required";
    }

    if (!formData.Remarks) {
      newErrors.Remarks = 'Remark is required.';
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  };
  //#endregion

  //#region PUSH DATA
  const PushContractInvoiceData = (): FormData => {
    const fd = new FormData();

    fd.append("ProjectId", projectId!.toString());
    fd.append("ContractRequisitionId", ContractRequisitionId.toString());
    fd.append("ContractRequisitionInvoiceId", formData.ContractRequisitionInvoiceId.toString());
    fd.append("UniqueKey", formData.UniqueKey ?? "");
    fd.append("InvoiceNumber", formData.InvoiceNumber.toString());
    fd.append("InvoiceDate", formData.InvoiceDate ?? "");
    fd.append("InvoiceAmount", formData.InvoiceAmount.toString());
    fd.append("InvoiceDueDate", formData.InvoiceDueDate ?? "");
    fd.append("Remarks", formData.Remarks ?? "");

    uploadInvoiceURLFiles.forEach((file) => {
      if (file instanceof File) {
        fd.append("UploadInvoiceURL", file);
      }
    });
    fd.append("RemoveUploadInvoiceURL", removeUploadInvoiceUrls.join(","));

    uploadPhotographsURLFiles.forEach((file) => {
      if (file instanceof File) {
        fd.append("PhotoURL", file);
      }
    });
    fd.append("RemovePhotoURL", removeUploadPhotographsUrls.join(","));

    uploadCompletionCertificateURLFiles.forEach((file) => {
      if (file instanceof File) {
        fd.append("CertificateURL", file);
      }
    });
    fd.append("RemoveCertificateURL", removeUploadCompletionCertificateUrls.join(","));

    return fd;
  };
  //#endregion

  //#region HANDLE  ADD UPDATE Contracr INVOICE 
  const handleAddUpdateContractInvoice = async () => {
    setErrors({});

    const validation = validateAddContractInvoiceForm();

    if (!validation.isValid) {

      setErrors(validation.errors);

      return;
    }
    await runApiWithLoader(

      setIsLoading,
      setLoadingMessage,

      async () => {
        const payload = PushContractInvoiceData();

        const response = await contractRequisitionInvoiceService.apiCallAddUpdateContractRequisitionInvoice(payload);

        if (E.isRight(response)) {

          addToast({ type: "success", title: response.right.SuccessMessage[0] });

          navigate(`/contractRequisition/view`, {
            state: {
              activeTab: "Invoice"
            }
          });

        } else {
          addToast({ type: "error", title: response.left?.message });
        }
        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message });
      },
      undefined,
      isAddMode ? 'Add Contract Invoice' : 'Update Contract Invoice'
    );
  };
  //#endregion

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

      <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

      <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll ">

        <form onSubmit={handleAddUpdateContractInvoice}>
          <div className="space-y-4 pb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Add Invoice</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <div>
                <Input
                  type="text"
                  required
                  label='Invoice Number'
                  value={formData.InvoiceNumber ?? ""}
                  onChange={(e) => handleFieldChange("InvoiceNumber", e.target.value)}
                  placeholder="Enter Invoice Number"
                  maxLength={15}
                  error={errors.InvoiceNumber}
                />
              </div>
              <div>
                <DatePickerInput
                  label="Invoice Date"
                  value={formatDate_dd_mm_yyyy(formData.InvoiceDate)}
                  onChange={(val) => handleFieldChange('InvoiceDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                  required
                  error={errors.InvoiceDate}
                />
              </div>
              <div>
                <MultiFilePicker
                  label="Upload Invoice"
                  required
                  placeholder='Select Files'
                  error={errors.UploadInvoiceURL}
                  value={uploadInvoiceURLFiles}
                  onChange={setUploadInvoiceURLFiles}
                  availableFilesURL={uploadInvoiceURL ?? ""}
                  allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
                  maxFiles={3}
                  maxSizeMB={10}
                  onRemoveExisting={(url) => {
                    setRemoveUploadInvoiceUrls((prev) => [...prev, url])
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  type="text"
                  required
                  label='Invoice Amount'
                  value={formData.InvoiceAmount ?? ""}
                  onChange={(e) => handleFieldChange("InvoiceAmount", e.target.value)}
                  placeholder="Enter Invoice Amount"
                  maxLength={15}
                  error={errors.InvoiceAmount}
                />
              </div>

              <div>
                <DatePickerInput
                  label="Due Date"
                  value={formatDate_dd_mm_yyyy(formData.InvoiceDueDate)}
                  onChange={(val) => handleFieldChange('InvoiceDueDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                  required
                  error={errors.DueDate}
                />
              </div>
              <div>
                <MultiFilePicker
                  label="Upload Photographs"
                  required
                  placeholder='Select Files'
                  error={errors.PhotoURL}
                  value={uploadPhotographsURLFiles}
                  onChange={setUploadPhotographsURLFiles}
                  availableFilesURL={uploadPhotographsURL ?? ""}
                  allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
                  maxFiles={20}
                  maxSizeMB={10}
                  onRemoveExisting={(url) => {
                    setRemoveUploadPhotographsUrls((prev) => [...prev, url])
                  }}
                />
              </div>
              <div>
                <MultiFilePicker
                  label="Upload Completion Certificate"
                  required
                  placeholder='Select Files'
                  error={errors.CertificateURL}
                  value={uploadCompletionCertificateURLFiles}
                  onChange={setUploadCompletionCertificateURLFiles}
                  availableFilesURL={uploadCompletionCertificateURL ?? ""}
                  allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
                  maxFiles={3}
                  maxSizeMB={10}
                  onRemoveExisting={(url) => {
                    setRemoveUploadCompletionCertificateUrls((prev) => [...prev, url])
                  }}
                />
              </div>

            </div>

            <div>
              <TextArea
                label="Remarks"
                required
                className='thin-scroll'
                value={formData.Remarks ?? ""}
                placeholder="Enter Remarks"
                onChange={(e) => handleFieldChange("Remarks", e.target.value)}
                error={errors.Remarks} />
            </div>
          </div>
        </form>
      </div>

      <BottomActionBar
        cancelText="Cancel"
        saveText={formData.ContractRequisitionInvoiceId ? "Update" : "Add"}
        onCancel={() => navigate("/contractRequisition/view", {
          state: {
            activeTab: "Invoice"
          }
        })}
        canAction={canAction}
        onSave={() => {
          handleAddUpdateContractInvoice();
        }}
        isLoading={isLoading}
      />
    </div>
  )
}

export default AddUpdateContractInvoice;