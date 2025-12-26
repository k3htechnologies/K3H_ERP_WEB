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

  useEffect(() => {
    if (!open) {
      setFiles([]);
      setMergeExisting("1");   // optional reset Yes
    }
  }, [open])
  
  const handleSubmit = () => {
    if (!files.length) return;
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
      resetText=""
    >
      <div className="space-y-6">

        <MultiFilePicker
          label="Upload Excel"
          value={files}
          onChange={setFiles}
          allowedTypes={[".xlsx", ".xls", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/octet-stream", "text/csv"]}
          maxFiles={1}
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
