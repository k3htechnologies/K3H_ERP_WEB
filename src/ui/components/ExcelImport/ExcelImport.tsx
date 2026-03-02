import { Modal } from "@/ui/components/Modal/Modal";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import { useEffect, useState } from "react";
import RadioPill from "../forms/RadioPill";

export default function ExportImport({
  open,
  onClose,
  onUpload
}: {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File, mergeExisting: string) => void;
}) {

  const [files, setFiles] = useState<(File | string)[]>([]);
  const [mergeExisting, setMergeExisting] = useState<string>("0");
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!open) {
      setFiles([]);
      setMergeExisting("0");
    }
  }, [open])

  const validateFileForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!files.length) {
      newErrors.file = "Excel file is required";
    } else {
      const file = files[0] as File;

      const allowedTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv",
        "application/octet-stream"
      ];

      if (!allowedTypes.includes(file.type)) {
        newErrors.file = "Only Excel or CSV files are allowed";
      }
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }


  const handleSubmit = () => {

    const { isValid, errors } = validateFileForm();

    if (!isValid) {

      setErrorMessage(errors.file);

      return;
    }

    onUpload(files[0] as File, mergeExisting);
  };


  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Upload Option"
      saveText="Upload"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      size="xl"
    >
      <div className="space-y-6">

        <MultiFilePicker
          label="Upload Excel"
          value={files}
          onChange={(val) => {
            setFiles(val);
            setErrorMessage("");
          }}
          allowedTypes={[".xlsx", ".xls", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/octet-stream", "text/csv"]}
          maxFiles={1}
          error={errorMessage}
        />

        <div>
          <p className="text-sm text-gray-600 mb-2">
            Do you want to upload the file with existing record?
          </p>

          <div className="flex gap-3">
            <RadioPill
              name="mergeExisting"
              label="Yes"
              value="1"
              checked={mergeExisting === "0"}
              onChange={() => setMergeExisting("0")}
            />

            <RadioPill
              name="mergeExisting"
              label="No"
              value="0"
              checked={mergeExisting === "1"}
              onChange={() => setMergeExisting("1")}
            />
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-sm text-gray-700 space-y-2">
          <p className="font-medium text-gray-800">Notes:</p>

          <ul className="list-disc list-inside space-y-1">
            <li>
              If <span className="font-medium">Yes</span> is selected, existing records will be kept and new data will be merged.
            </li>
            <li>
              If <span className="font-medium text-red-600">No</span> is selected, all existing records will be permanently deleted before uploading new data.
            </li>
            <li>
              Only <span className="font-medium">.xlsx, .xls, or .csv</span> files are allowed.
            </li>
            <li>
              Maximum one file can be uploaded at a time.
            </li>
            <li>
              Do <span className="font-semibold">not change the column header names</span> in the downloaded sample Excel file.
            </li>
            <li>
              Do <span className="font-semibold">not modify, remove, or add extra columns</span>.
            </li>
            <li>
              Do <span className="font-semibold">not write data outside the provided column boundaries</span>.
            </li>
            <li>
              Blank rows or completely empty columns should not be added.
            </li>
          </ul>
        </div>

      </div>
    </Modal>
  );
}
