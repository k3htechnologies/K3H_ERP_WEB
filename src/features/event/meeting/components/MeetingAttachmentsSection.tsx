import React from "react";
import { FileText, Paperclip, SquarePlay } from "lucide-react";
import MultiFilePicker, {
  type FileValue,
} from "@/ui/components/ImagePicker/MultiFilePicker";
import MeetingSection from "@/features/event/meeting/components/MeetingSection";

interface MeetingAttachmentsSectionProps {
  disabled?: boolean;

  existingMomFiles?: string[];
  existingPresentationFiles?: string[];
  existingSupportingFiles?: string[];

  momDocuments: File[];
  presentationDocuments: File[];
  supportingDocuments: File[];

  onMomDocumentsChange: (files: File[]) => void;
  onPresentationDocumentsChange: (files: File[]) => void;
  onSupportingDocumentsChange: (files: File[]) => void;

  onRemoveExistingMom?: (url: string) => void;
  onRemoveExistingPresentation?: (url: string) => void;
  onRemoveExistingSupporting?: (url: string) => void;
}

const DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const PRESENTATION_TYPES = [
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const SUPPORTING_DOCUMENT_TYPES = [
  ...DOCUMENT_TYPES,
  ...PRESENTATION_TYPES,
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
];

const getNewFiles = (files: FileValue[]): File[] => {
  return files.filter(
    (file): file is File => file instanceof File,
  );
};

export const MeetingAttachmentsSection: React.FC<
  MeetingAttachmentsSectionProps
> = ({
  disabled = false,

  existingMomFiles = [],
  existingPresentationFiles = [],
  existingSupportingFiles = [],

  momDocuments,
  presentationDocuments,
  supportingDocuments,

  onMomDocumentsChange,
  onPresentationDocumentsChange,
  onSupportingDocumentsChange,

  onRemoveExistingMom,
  onRemoveExistingPresentation,
  onRemoveExistingSupporting,
}) => {

  //#region HANDLE DOCUMENT CHANGE

  const handleMomDocumentsChange = (files: FileValue[]) => {
    onMomDocumentsChange(getNewFiles(files));
  };

  const handlePresentationDocumentsChange = (
    files: FileValue[],
  ) => {
    onPresentationDocumentsChange(getNewFiles(files));
  };

  const handleSupportingDocumentsChange = (
    files: FileValue[],
  ) => {
    onSupportingDocumentsChange(getNewFiles(files));
  };


  return (
    <MeetingSection
      className="mt-6"
      title="Documents"
      contentClassName="flex flex-col gap-4"
    >
      {/* MOM DOCUMENT */}
      <MultiFilePicker
        disabled={disabled}
        variant="dropzone"
        placeholder="Select MOM document"
        dropzoneTitle="MOM Document"
        dropzoneDescription="Click or drag to upload Minutes of Meeting"
        dropzoneIcon={
          <FileText className="h-6 w-6" />
        }
        dropzoneTone="indigo"
        dropzoneSize="compact"
        value={momDocuments}
        availableFilesURL={existingMomFiles}
        onChange={handleMomDocumentsChange}
        allowedTypes={DOCUMENT_TYPES}
        onRemoveExisting={(url) => {
          onRemoveExistingMom?.(url);
        }}
      />

      {/* PRESENTATION */}
      <MultiFilePicker
        disabled={disabled}
        variant="dropzone"
        placeholder="Select presentation"
        dropzoneTitle="Presentation"
        dropzoneDescription="Click or drag to upload slide deck (PDF/PPT)"
        dropzoneIcon={
          <SquarePlay className="h-6 w-6" />
        }
        dropzoneSize="compact"
        value={presentationDocuments}
        availableFilesURL={
          existingPresentationFiles
        }
        onChange={
          handlePresentationDocumentsChange
        }
        allowedTypes={PRESENTATION_TYPES}
        onRemoveExisting={(url) => {
          onRemoveExistingPresentation?.(url);
        }}
      />

      {/* SUPPORTING DOCUMENT */}
      <MultiFilePicker
        disabled={disabled}
        variant="dropzone"
        placeholder="Select supporting document"
        dropzoneTitle="Supporting Document"
        dropzoneDescription="Click or drag additional evidence/resources"
        dropzoneIcon={
          <Paperclip className="h-6 w-6" />
        }
        dropzoneTone="coral"
        dropzoneSize="compact"
        value={supportingDocuments}
        availableFilesURL={
          existingSupportingFiles
        }
        onChange={
          handleSupportingDocumentsChange
        }
        allowedTypes={
          SUPPORTING_DOCUMENT_TYPES
        }
        onRemoveExisting={(url) => {
          onRemoveExistingSupporting?.(url);
        }}
      />
    </MeetingSection>
  );
};

export default MeetingAttachmentsSection;
