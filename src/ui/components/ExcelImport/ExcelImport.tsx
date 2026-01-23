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
  const [mergeExisting, setMergeExisting] = useState<string>("1");
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!open) {
      setFiles([]);
      setMergeExisting("1");
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
      size="md"
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

      </div>
    </Modal>
  );
}
