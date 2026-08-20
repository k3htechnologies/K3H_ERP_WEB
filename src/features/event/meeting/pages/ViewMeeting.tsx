import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import * as E from "fp-ts/Either";
import {
  formatDate_dd_MonthName_yy,
} from "@/core/utils/dateFormat";
import { Loader } from "@/core/utils/loader";
import type { ConferenceDetailsData } from "@/features/event/conference/models/ConferenceModel";
import type {
  AgendaData,
  MeetingAgenda,
  MeetingAgendaDetailData,
  MeetingMasterData,
} from "@/features/event/meeting/models/MeetingModel";
import {
  getMeetingDetailRequest,
  getMeetingDocumentUrlGroups,
} from "@/features/event/meeting/utils/MeetingUtils";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { Button } from "@/ui/components/forms";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import type { TableColumn } from "@/ui/components/DataTable/DataTable";
import DataTableExpandable from "@/ui/components/DataTable/DataTableExpandable";
import { DataTableWithOutBorder } from "@/ui/components/DataTable/DataTableWithoutBorder";
import Accordion from "@/ui/components/Card/Accordion";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import MeetingAgendaSection from "@/features/event/meeting/components/MeetingAgendaSection";
import MeetingOverviewSummary from "@/features/event/meeting/components/MeetingOverviewSummary";
import MeetingSummarySection, {
  MeetingSummaryField,
} from "@/features/event/meeting/components/MeetingSummarySection";
import useToast from "@/core/hooks/useToast";
import { ConferenceService } from "@/features/event/conference/services/ConferenceService";
import { MeetingService } from "@/features/event/meeting/services/MeetingService";

const getDocumentName = (url: string): string => {
  const path = url.split("?")[0];
  const name = path.split("/").pop() || "Document";
  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
};

const mapAgendaDataToView = (
  agenda: AgendaData | MeetingAgendaDetailData,
): MeetingAgenda => {
  const priorityValue = String(agenda.Priority || "Medium");
  const normalizedPriority = `${priorityValue.charAt(0).toUpperCase()}${priorityValue.slice(1).toLowerCase()}`;

  return {
    AgendaId: agenda.AgendaId,
    UniqueKey: agenda.UniqueKey,
    Title: agenda.AgendaTitle || "",
    Description: agenda.AgendaDescription || agenda.Description || "",
    CreatedBy: agenda.CreatedBy || "--",
    ResponsiblePersonId: String(agenda.ResponsiblePersonId || ""),
    ResponsiblePerson:
      agenda.ResponsiblePersonName || agenda.ResponsiblePerson || "--",
    ResponsiblePersonJson: agenda.ResponsiblePersonJson || "",
    Priority: (["Low", "Medium", "High"].includes(normalizedPriority)
      ? normalizedPriority
      : "Medium") as MeetingAgenda["Priority"],
    Status: (agenda.AgendaStatus || "Pending") as MeetingAgenda["Status"],
    Remark: agenda.Remark || "",
    Discussion: agenda.Discussion || "",
    Conclusion: agenda.AgendaConclusion || "",
    DocumentUrl: agenda.DocumentURLs || "",
    MeetingTitle: agenda.MeetingTitle || "",
    MeetingDate: agenda.MeetingDate || "",
  };
};

export const ViewMeeting: React.FC = () => {

  //#region STATE MANAGEMENT
  const [meeting, setMeeting] = useState<MeetingMasterData | null>(null);
  const [conference, setConference] = useState<ConferenceDetailsData | null>(null);
  const [agendas, setAgendas] = useState<MeetingAgenda[]>([]);
  const [isAgendaEditMode, setIsAgendaEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // USE NAVIGATE
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const eventIdNumber = Number(eventId);

  // TOAST
  const { addToast } = useToast();
  //#endregion

  //#region MENU PERMISSIONS
  const { canAction } = useMenuPermissions("/event");
  //#endregion

  //#region INITIALIZATION
  useEffect(() => {
    if (!Number.isInteger(eventIdNumber) || eventIdNumber <= 0) {
      addToast({ type: "error", title: "Invalid meeting ID" });
      navigate("/meeting", { replace: true });
      return;
    }

    const controller = new AbortController();

    const loadMeetingView = async () => {
      setIsLoading(true);
      setMeeting(null);
      setConference(null);
      setAgendas([]);

      const [meetingResponse, agendaResponse] = await Promise.all([
        MeetingService.apiCallPullMeetingMaster(
          getMeetingDetailRequest(eventIdNumber),
          { signal: controller.signal },
        ),
        MeetingService.apiCallPullAgenda(
          {
            PageSize: 1000,
            PageNumber: 1,
            meetingId: eventIdNumber,
            AgendaSource: "Meeting",
          },
          { signal: controller.signal },
        ),
      ]);

      if (controller.signal.aborted) return;

      if (E.isLeft(meetingResponse)) {
        addToast({ type: "error", title: meetingResponse.left.message });
        setIsLoading(false);
        return;
      }

      const meetings = Array.isArray(meetingResponse.right.Data)
        ? meetingResponse.right.Data
        : [];
      const meetingRecord =
        meetings.find((item) => item.MeetingId === eventIdNumber) ??
        meetings[0] ??
        null;

      if (!meetingRecord) {
        addToast({ type: "error", title: "Meeting not found" });
        setIsLoading(false);
        return;
      }

      setMeeting(meetingRecord);

      const embeddedAgendaRows = Array.isArray(meetingRecord.AgendaDetails)
        ? meetingRecord.AgendaDetails
        : [];

      if (E.isRight(agendaResponse)) {
        const pulledAgendaRows = Array.isArray(agendaResponse.right.Data)
          ? agendaResponse.right.Data
          : [];
        const agendaRows =
          pulledAgendaRows.length > 0 ? pulledAgendaRows : embeddedAgendaRows;
        setAgendas(agendaRows.map(mapAgendaDataToView));
      } else if (embeddedAgendaRows.length > 0) {
        setAgendas(embeddedAgendaRows.map(mapAgendaDataToView));
      } else {
        addToast({ type: "error", title: agendaResponse.left.message });
      }

      if (meetingRecord.MeetingMode?.trim().toLowerCase() === "physical") {
        const conferenceResponse =
          await ConferenceService.apiCallPullConferenceBookingDetails(
            {
              PageSize: 10,
              PageNumber: 1,
              SortBy: "",
              MeetingId: eventIdNumber,
            },
            { signal: controller.signal },
          );

        if (controller.signal.aborted) return;

        if (E.isLeft(conferenceResponse)) {
          addToast({ type: "error", title: conferenceResponse.left.message });
          setIsLoading(false);
          return;
        }

        const conferences = Array.isArray(conferenceResponse.right.Data)
          ? conferenceResponse.right.Data
          : [];
        setConference(
          conferences.find((item) => item.MeetingId === eventIdNumber) ??
            conferences[0] ??
            null,
        );
      }

      setIsLoading(false);
    };

    void loadMeetingView();

    return () => controller.abort();
  }, [addToast, eventIdNumber, navigate]);
  //#endregion

  const documentGroups = useMemo(() => {
    if (!meeting) return [];

    const groups = getMeetingDocumentUrlGroups(meeting);
    return [
      { key: "mom", title: "MOM Document", urls: groups.mom },
      {
        key: "presentation",
        title: "Presentation",
        urls: groups.presentation,
      },
      {
        key: "supporting",
        title: "Supporting Document",
        urls: groups.supporting,
      },
    ].filter((group) => group.urls.length > 0);
  }, [meeting]);

  const agendaColumns = useMemo<TableColumn[]>(
    () => [
      { key: "Title", label: "Title", width: "25%", align: "left" },
      {
        key: "CreatedBy",
        label: "Created By",
        width: "18%",
        align: "left",
        render: (value) => value || "--",
      },
      {
        key: "ResponsiblePerson",
        label: "Responsible Person",
        width: "24%",
        align: "left",
        render: (value) => value || "--",
      },
      { key: "Priority", label: "Priority", width: "15%", align: "left" },
      { key: "Status", label: "Status", width: "18%", align: "left" },
    ],
    [],
  );

  const agendaDetailColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: "Description",
        label: "Agenda Description",
        width: "35%",
        align: "left",
        truncate: false,
        render: (value) => value || "--",
      },
      {
        key: "Discussion",
        label: "Discussion / Remark",
        width: "35%",
        align: "left",
        truncate: false,
        render: (value, row: MeetingAgenda) => value || row.Remark || "--",
      },
      {
        key: "Conclusion",
        label: "Conclusion",
        width: "30%",
        align: "left",
        truncate: false,
        render: (value) => value || "--",
      },
    ],
    [],
  );

  //#region RENDER
  return (
    <div className="h-[calc(100vh-88px)] space-y-4 overflow-y-scroll bg-[#F7F8FA] p-3 pr-2">
      <Loader loading={isLoading} title="Loading Meeting">
        <div />
      </Loader>
      <HeaderActionBar
        titleText={meeting?.MeetingTitle || "Meeting Details"}
        onCancel={() => navigate(-1)}
        canAction={canAction}
        EditText={isAgendaEditMode ? "Done" : "Edit"}
        onEdit={() => setIsAgendaEditMode((current) => !current)}
        isLoading={isLoading}
      />
      <MeetingOverviewSummary meeting={meeting} conference={conference} />

      {isAgendaEditMode ? (
        <MeetingAgendaSection
          agendas={agendas}
          meetingId={eventIdNumber}
          onChange={setAgendas}
        />
      ) : (
        <MeetingSummarySection
          title={
            <>
              Agenda <span className="text-sm font-normal">({agendas.length})</span>
            </>
          }
          tone="orange"
        >
          <div className="p-3">
            <DataTableExpandable
              data={agendas}
              columns={agendaColumns}
              emptyMessage="No agenda available"
              recordsPerPage={20}
              expandable={{
                keyField: "AgendaId",
                renderRow: (_fetchedData, row: MeetingAgenda) => (
                  <div className="flex-1">
                    <DataTableWithOutBorder
                      data={[row]}
                      columns={agendaDetailColumns}
                      emptyMessage="No agenda details available"
                      recordsPerPage={20}
                    />
                  </div>
                ),
              }}
            />
          </div>
        </MeetingSummarySection>
      )}

      {!isAgendaEditMode && <MeetingSummarySection title="Documents" tone="cyan">
        <div className="p-3">
          {documentGroups.length > 0 ? (
            <Accordion
              items={documentGroups.map((group) => ({
                key: group.key,
                title: group.title,
              }))}
              allowMultipleOpen
              renderItem={(item, isOpen, toggle) => {
                const group = documentGroups.find(
                  (documentGroup) => documentGroup.key === item.key,
                );
                if (!group) return null;

                return (
                  <div>
                    <Button
                      color="transparent"
                      fullWidth
                      onClick={toggle}
                      aria-expanded={isOpen}
                    >
                      <span className="flex w-full items-center justify-between text-left">
                        <h3 className="text-base font-medium text-[#202229]">
                          {group.title}
                        </h3>
                        {isOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
                      </span>
                    </Button>

                    {isOpen && (
                      <div className="grid grid-cols-1 gap-3 px-3 pb-3 md:grid-cols-3">
                        {group.urls.map((documentUrl) => (
                          <div
                            key={documentUrl}
                            className="flex min-h-[150px] flex-col rounded-lg border border-gray-200 bg-white"
                          >
                            <div className="flex items-start justify-between gap-2 p-3">
                              <span className="line-clamp-2 break-words text-base font-medium text-gray-900">
                                {getDocumentName(documentUrl)}
                              </span>
                              <MultiImageViewer
                                images={[documentUrl]}
                                title={getDocumentName(documentUrl)}
                                triggerLabel="View"
                                isIcon={false}
                              />
                            </div>

                            <div className="mt-auto space-y-2 bg-gray-50 p-3">
                              <FieldItem label="Remark" value="-" />
                              <FieldItem
                                label="Uploaded By / Date"
                                value={`${meeting?.ModifiedById || meeting?.CreatedById || "-"} / ${
                                  meeting?.ModifiedDate
                                    ? formatDate_dd_MonthName_yy(
                                        meeting.ModifiedDate,
                                      )
                                    : meeting?.CreatedDate
                                      ? formatDate_dd_MonthName_yy(
                                          meeting.CreatedDate,
                                        )
                                      : "-"
                                }`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }}
            />
          ) : (
            <p className="py-8 text-center text-sm text-[#98A0AD]">
              No documents available
            </p>
          )}
        </div>
      </MeetingSummarySection>}

      <MeetingSummarySection
        title="Action Details"
        tone="gray"
      >
        <div className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <MeetingSummaryField
            label="Created By"
            value={meeting?.CreatedById ? String(meeting.CreatedById) : undefined}
          />
          <MeetingSummaryField
            label="Created Date"
            value={
              meeting?.CreatedDate
                ? formatDate_dd_MonthName_yy(meeting.CreatedDate)
                : undefined
            }
          />
          <MeetingSummaryField
            label="Modified By"
            value={meeting?.ModifiedById ? String(meeting.ModifiedById) : undefined}
          />
          <MeetingSummaryField
            label="Modified Date"
            value={
              meeting?.ModifiedDate
                ? formatDate_dd_MonthName_yy(meeting.ModifiedDate)
                : undefined
            }
          />
        </div>
      </MeetingSummarySection>
    </div>
  );
  //#endregion
};

export default ViewMeeting;
