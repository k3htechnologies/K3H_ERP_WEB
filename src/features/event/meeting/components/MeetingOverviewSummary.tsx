import React, { useMemo } from "react";
import { CONFERENCE_ROOM_NAME } from "@/core/constants";
import {
  convert_hh_mm_ss_to_hh_mm,
  formatDate_dd_MonthName_yy,
} from "@/core/utils/dateFormat";
import { getNameInitials } from "@/core/utils/getNameInitials";
import type { ConferenceDetailsData } from "@/features/event/conference/models/ConferenceModel";
import type { MeetingMasterData } from "@/features/event/meeting/models/MeetingModel";
import {
  getExternalMeetingParticipants,
  getMeetingParticipants,
} from "@/features/event/meeting/utils/MeetingUtils";
import MeetingSummarySection, {
  MeetingSummaryField,
} from "@/features/event/meeting/components/MeetingSummarySection";

interface ExternalParticipantSummary {
  key: string;
  name: string;
  email: string;
  mobile: string;
  details: string;
  remark: string;
}

interface MeetingOverviewSummaryProps {
  meeting: MeetingMasterData | null;
  conference: ConferenceDetailsData | null;
}

const formatMeetingTime = (startTime?: string, endTime?: string): string => {
  const start = convert_hh_mm_ss_to_hh_mm(startTime);
  const end = convert_hh_mm_ss_to_hh_mm(endTime);

  if (start && end) return `${start} - ${end}`;
  return start || end || "--";
};

export const MeetingOverviewSummary: React.FC<MeetingOverviewSummaryProps> = ({
  meeting,
  conference,
}) => {
  const employees = useMemo(
    () =>
      (meeting ? getMeetingParticipants(meeting) : []).filter(
        (participant) => {
          const participantType = participant.MeetingType.trim().toLowerCase();

          return (
            participant.ExternalId === 0 &&
            participantType.includes("employee") &&
            !participantType.includes("external")
          );
        },
      ),
    [meeting],
  );

  const externalParticipants = useMemo<ExternalParticipantSummary[]>(() => {
    if (!meeting) return [];

    return getExternalMeetingParticipants(meeting).map(
      (participant, index) => ({
        key:
          participant.UniqueKey ||
          (participant.ParticipantId > 0
            ? String(participant.ParticipantId)
            : `external-${index}`),
        name: participant.ParticipantName,
        email: participant.EmaEmail,
        mobile: participant.MobileNo,
        details: [participant.DesignationName, participant.OrganizationName]
          .filter(Boolean)
          .join(", "),
        remark: participant.Remark || "",
      }),
    );
  }, [meeting]);

  const conferenceRoomName = useMemo(() => {
    if (!conference) return "";
    if (conference.ConferenceRoomName) return conference.ConferenceRoomName;
    if (conference.RoomName) return conference.RoomName;

    return (
      CONFERENCE_ROOM_NAME.find(
        (room) => String(room.id) === String(conference.RoomId),
      )?.name || String(conference.RoomId || "")
    );
  }, [conference]);

  const isOnlineMeeting = meeting?.MeetingMode?.toLowerCase() === "online";
  const isPhysicalMeeting = meeting?.MeetingMode?.toLowerCase() === "physical";
  const effectiveMeetingDate = conference?.MeetingDate || meeting?.MeetingDate;
  const effectiveStartTime = conference?.StartTime || meeting?.MeetingStartTime;
  const effectiveEndTime = conference?.EndTime || meeting?.MeetingEndTime;
  const effectiveMeetingLocation = isOnlineMeeting
    ? meeting?.MeetingLink
    : isPhysicalMeeting
      ? conferenceRoomName || meeting?.RoomName || meeting?.MeetingLocation
      : meeting?.MeetingLocation;

  return (
    <div className="space-y-4">
      <MeetingSummarySection title="Meeting Overview" tone="purple">
        <div className="p-4">
          <div className="grid grid-cols-1 gap-5 border-b border-[#DFE3EA] pb-4 sm:grid-cols-2 lg:grid-cols-4">
            <MeetingSummaryField label="Meeting Subject" value={meeting?.MeetingTitle} />
            <MeetingSummaryField
              label="Meeting Date"
              value={
                effectiveMeetingDate
                  ? formatDate_dd_MonthName_yy(effectiveMeetingDate)
                  : undefined
              }
            />
            <MeetingSummaryField
              label="Meeting Time"
              value={formatMeetingTime(effectiveStartTime, effectiveEndTime)}
            />
            <MeetingSummaryField label="Meeting Mode" value={meeting?.MeetingMode} />
          </div>

          <div className="grid grid-cols-1 gap-5 pt-4 sm:grid-cols-2 lg:grid-cols-4">
            <MeetingSummaryField
              label={isOnlineMeeting ? "Meeting Link" : "Meeting Location"}
              value={effectiveMeetingLocation}
            />
            <MeetingSummaryField label="Meeting Status" value={meeting?.MeetingStatus} />
            {isPhysicalMeeting && (
              <MeetingSummaryField
                label="Booking Status"
                value={conference?.BookingStatus}
              />
            )}
            <MeetingSummaryField label="Remark" value={meeting?.Remark} />
          </div>
        </div>
      </MeetingSummarySection>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MeetingSummarySection
          title={
            <>
              Employees{" "}
              <span className="text-sm font-normal">({employees.length})</span>
            </>
          }
          tone="blue"
        >
          <div className="max-h-[280px] overflow-auto p-3">
            <table className="w-full table-fixed text-left">
              <thead className="border-b border-[#DCE2EC] text-sm uppercase text-[#5D6778]">
                <tr>
                  <th className="w-[34%] px-3 py-2 font-medium">Name</th>
                  <th className="w-[37%] px-3 py-2 font-medium">Department</th>
                  <th className="w-[29%] px-3 py-2 font-medium">Designation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6ED]">
                {employees.length > 0 ? (
                  employees.map((employee) => (
                    <tr key={employee.UniqueKey} className="text-sm text-[#5E6673]">
                      <td className="px-3 py-3">
                        <div className="flex min-w-0 items-center gap-2">
                          {employee.ProfilePhotoURL &&
                          employee.ProfilePhotoURL !== "-" &&
                          employee.ProfilePhotoURL !== "—" &&
                          employee.ProfilePhotoURL !== "â€”" ? (
                            <img
                              src={employee.ProfilePhotoURL}
                              alt={employee.ParticipantName}
                              className="h-7 w-7 shrink-0 rounded-full border border-gray-300 object-cover"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-600 text-xs font-semibold text-white"
                              title={employee.ParticipantName || "-"}
                            >
                              {getNameInitials(employee.ParticipantName)}
                            </div>
                          )}
                          <span className="truncate">
                            {employee.ParticipantName || "--"}
                          </span>
                        </div>
                      </td>
                      <td className="truncate px-3 py-3">
                        {employee.DepartmentName ||
                          (employee.MeetingType.toLowerCase().includes("department")
                            ? employee.ParticipantName
                            : "--")}
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-block max-w-full truncate rounded bg-[#EFEFF0] px-2 py-1 text-sm font-medium text-[#33383F]">
                          {employee.DesignationName || employee.MeetingType || "--"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-3 py-8 text-center text-sm text-[#98A0AD]">
                      No employees available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </MeetingSummarySection>

        <MeetingSummarySection title="Participants" tone="blue">
          <div className="space-y-3 p-3">
            {externalParticipants.length > 0 ? (
              externalParticipants.map((participant) => (
                <div
                  key={participant.key}
                  className="rounded border border-[#DFE5EE] p-4 shadow-sm"
                >
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#202229]">
                        {participant.name || "--"}
                      </p>
                      {participant.email && (
                        <a
                          href={`mailto:${participant.email}`}
                          className="mt-3 block text-sm text-[#2B6DE5] underline"
                        >
                          {participant.email}
                        </a>
                      )}
                      {participant.mobile && (
                        <p className="mt-2 text-sm text-[#737D8F]">
                          {participant.mobile}
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-[#8791A2]">
                      {participant.details || "--"}
                    </p>
                  </div>
                  {participant.remark && (
                    <div className="mt-3 border-l-2 border-[#2B6DE5] bg-[#F7F7F8] px-3 py-2">
                      <p className="text-xs uppercase text-[#8791A2]">Remark</p>
                      <p className="mt-1 text-sm text-[#202229]">
                        {participant.remark}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-[#98A0AD]">
                No participants available
              </div>
            )}
          </div>
        </MeetingSummarySection>
      </div>
    </div>
  );
};

export default MeetingOverviewSummary;
