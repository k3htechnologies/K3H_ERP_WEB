import React from "react";
import { Edit, FilePlus2 } from "lucide-react";
import { Button } from "@/ui/components/forms";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import type { MeetingMasterData } from "@/features/event/meeting/models/MeetingModel";

export type MeetingCardField =
  | "MeetingType"
  | "Date"
  | "Location"
  | "Status";

interface MeetingCardProps {
  meeting: MeetingMasterData;
  formattedDate: string;
  status: string;
  visibleFields?: readonly MeetingCardField[];
  canAction?: boolean;
  onView?: (meeting: MeetingMasterData) => void;
  onEdit?: (meeting: MeetingMasterData) => void;
  onAddMom: (meeting: MeetingMasterData) => void;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({
  meeting,
  formattedDate,
  status,
  visibleFields = [],
  canAction = false,
  onView,
  onEdit,
  onAddMom,
}) => {
  const details: Record<MeetingCardField, { label: string; value: string }> = {
    MeetingType: {
      label: "Meeting Type",
      value: meeting.MeetingType || "-",
    },
    Date: {
      label: "Date",
      value: formattedDate || "-",
    },
    Location: {
      label: meeting.MeetingMode?.toLowerCase() === "online" ? "Meeting Link" : "Location",
      value:
        (meeting.MeetingMode?.toLowerCase() === "online"
          ? meeting.MeetingLink
          : meeting.RoomName || meeting.MeetingLocation) || "-",
    },
    Status: {
      label: "Status",
      value: status,
    },
  };

  return (
    <article
      className="relative overflow-hidden rounded-[10px] border border-[#DDE4EF] bg-white px-5 py-4 shadow-[0_1px_3px_rgba(15,23,42,0.08)] transition-colors hover:bg-[#FBFCFF]"
    >
      <span className="absolute inset-y-0 left-0 w-1 bg-[#1463FF]" />

      <div className="flex min-w-0 flex-col gap-3 border-b border-[#E5E7EB] pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <Button
            color="transparent"
            fullWidth
            onClick={() => onView?.(meeting)}
          >
            <span className="w-full text-left text-sm font-medium text-[#075CF6]">
              <TooltipText
                text={meeting.MeetingTitle}
                maxWidth="100%"
                tooltipThreshold={60}
                isApplyBgTextColor
              />
            </span>
          </Button>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {canAction && (
            <>
            <Button
              color="transparent"
              size="sm"
              isborderRadius
              aria-label={`Edit ${meeting.MeetingTitle || "meeting"}`}
              title="Edit meeting"
              onClick={() => onEdit?.(meeting)}
            >
              <Edit className="h-4 w-4" />
            </Button>

            <Button
              color="blue"
              size="sm"
              leftIcon={<FilePlus2 className="h-4 w-4" />}
              onClick={() => onAddMom(meeting)}
            >
              Add MOM
            </Button>
            </>
          )}
        </div>
      </div>

      <div
        className="grid gap-x-8 gap-y-4 pt-4 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="Meeting details"
      >
        {visibleFields.map((field) => (
          <FieldItem
            key={field}
            label={details[field].label}
            value={details[field].value}
          />
        ))}
      </div>
    </article>
  );
};

export default MeetingCard;
