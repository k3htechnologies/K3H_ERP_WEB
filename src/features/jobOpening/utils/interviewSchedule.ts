import {
  numberValue,
  stringValue,
  type ApiRecord,
} from "./candidateApplication";

export type InterviewStatus = "Scheduled" | "Completed" | "Cancelled";

export interface InterviewItem {
  id: number;
  uniqueKey: string;
  candidateId: number;
  jobOpeningMasterId: number;
  candidate: string;
  position: string;
  interviewerId: string;
  interviewer: string;
  date: Date;
  startTime: string;
  endTime: string;
  stage: string;
  attachmentUrl: string;
  remarks: string;
  status: InterviewStatus;
  eventColor: "blue" | "orange" | "green";
}

const normalizeTime = (value: string, date: Date): string => {
  const match = /^(\d{1,2}):(\d{2})/.exec(value);
  if (match) {
    return `${match[1].padStart(2, "0")}:${match[2]}`;
  }

  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
};

export const addHourToTime = (value: string): string => {
  const [hours = 0, minutes = 0] = value.split(":").map(Number);
  return `${String((hours + 1) % 24).padStart(2, "0")}:${String(
    minutes,
  ).padStart(2, "0")}`;
};

const normalizeStatus = (value: string): InterviewStatus => {
  const status = value.trim().toUpperCase();
  if (status === "COMPLETED") return "Completed";
  if (status === "CANCELLED" || status === "CANCELED") return "Cancelled";
  return "Scheduled";
};

export const isValidInterviewRecord = (item: ApiRecord): boolean => {
  const interviewId = numberValue(item, ["InterviewId"]);
  const candidateId = numberValue(item, ["CandidateId", "CareerId"]);
  const interviewDate = stringValue(item, [
    "InterviewDate",
    "ScheduledDate",
    "Date",
    "CalendarDate",
  ]);

  return (
    interviewId > 0 &&
    candidateId > 0 &&
    interviewDate.trim().length > 0 &&
    !Number.isNaN(new Date(interviewDate).getTime())
  );
};

export const mapApiToInterview = (
  item: ApiRecord,
  index: number,
): InterviewItem => {
  const interviewId = numberValue(item, ["InterviewId"]);
  const dateValue = stringValue(item, [
    "InterviewDate",
    "ScheduledDate",
    "Date",
    "CalendarDate",
  ]);
  const parsedDate = new Date(dateValue);
  const date = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
  const startTime = normalizeTime(
    stringValue(item, ["InterviewTime", "StartTime"]),
    date,
  );
  const colors: InterviewItem["eventColor"][] = [
    "blue",
    "orange",
    "green",
  ];

  return {
    id: interviewId || index + 1,
    uniqueKey: stringValue(item, ["UniqueKey", "Uniquekey"]),
    candidateId: numberValue(item, ["CandidateId", "CareerId"]),
    jobOpeningMasterId: numberValue(item, [
      "JobOpeningMasterId",
      "JobOpeningId",
    ]),
    candidate: stringValue(
      item,
      ["CandidateName", "FullName"],
      `Candidate #${numberValue(item, ["CandidateId", "CareerId"])}`,
    ),
    position: stringValue(
      item,
      ["JobRoleName", "Position", "RoleName"],
      "Not Available",
    ),
    interviewerId: stringValue(item, [
      "InterviewPanel",
      "InterviewPanelIds",
      "InterviewerIds",
    ]),
    interviewer: stringValue(
      item,
      [
        "InterviewPanelNames",
        "InterviewPanelName",
        "PanelName",
        "InterviewerNames",
        "InterviewerName",
        "InterviewPanel",
      ],
      "Not Assigned",
    ),
    date,
    startTime,
    endTime: addHourToTime(startTime),
    stage: stringValue(item, ["Stage"], "Interview"),
    attachmentUrl: stringValue(item, ["AttachmentUrl", "AttachmentURL"]),
    remarks: stringValue(item, ["Remarks", "Remark"]),
    status: normalizeStatus(
      stringValue(item, ["InterviewStatus", "Status"], "Scheduled"),
    ),
    eventColor: colors[index % colors.length],
  };
};

export const toInterviewDateTimeIso = (
  date: string,
  time: string,
): string => `${date}T${time}:00`;
