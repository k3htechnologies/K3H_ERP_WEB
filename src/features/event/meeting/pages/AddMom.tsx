import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";
import { Loader } from "@/core/utils/loader";
import { useToast } from "@/core/hooks/useToast";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import MeetingAgendaSection from "@/features/event/meeting/components/MeetingAgendaSection";
import type {
    AgendaData,
    AgendaPriority,
    AgendaStatus,
    MeetingAgenda,
    MeetingMasterData,
    PullAgendaRequest,
} from "@/features/event/meeting/models/MeetingModel";
import {
    DEFAULT_UNIQUE_KEY,
    getMeetingDetailRequest,
} from "@/features/event/meeting/utils/MeetingUtils";
import { MeetingService } from "@/features/event/meeting/services/MeetingService";

const getApiMessage = (
  messages: string[] | undefined,
  fallback: string,
): string => messages?.filter(Boolean).join(", ") || fallback;

const mapAgendaDataToMeetingAgenda = (agenda: AgendaData): MeetingAgenda => {
  const priorityValue = String(agenda.Priority || "Medium");
  const normalizedPriority = `${priorityValue.charAt(0).toUpperCase()}${priorityValue.slice(1).toLowerCase()}`;
  const status = agenda.AgendaStatus || "Pending";

  return {
    AgendaId: agenda.AgendaId,
    UniqueKey: agenda.UniqueKey || DEFAULT_UNIQUE_KEY,
    Title: agenda.AgendaTitle || "",
    Description: agenda.AgendaDescription || "",
    CreatedBy: agenda.CreatedBy || "--",
    ResponsiblePersonId: String(agenda.ResponsiblePersonId || ""),
    ResponsiblePerson:
      agenda.ResponsiblePersonName || agenda.ResponsiblePerson || "--",
    ResponsiblePersonJson: agenda.ResponsiblePersonJson || "",
    Priority: (["Low", "Medium", "High"].includes(normalizedPriority)
      ? normalizedPriority
      : "Medium") as AgendaPriority,
    Status: (["active", "inactive", "Pending", "In Progress", "Completed"].includes(status)
      ? status
      : "Pending") as AgendaStatus,
    Remark: agenda.Remark || "",
    Discussion: agenda.Discussion || "",
    Conclusion: agenda.AgendaConclusion || "",
    DocumentUrl: agenda.DocumentURLs || "",
    MeetingTitle: agenda.MeetingTitle || "",
    MeetingDate: agenda.MeetingDate || "",
  };
};

export const AddMom: React.FC = () => {

  //#region STATE MANAGEMENT
  const [meeting, setMeeting] = useState<MeetingMasterData | null>(null);
  const [agendas, setAgendas] = useState<MeetingAgenda[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // USE NAVIGATE
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId?: string }>();
  const eventIdNumber = eventId ? Number(eventId) : 0;

  // TOAST
  const { addToast } = useToast();
  //#endregion

  //#region MENU PERMISSIONS
  const { canAction } = useMenuPermissions("/event");
  //#endregion

  //#region INITIALIZATION
  useEffect(() => {
    if (eventIdNumber <= 0) {
      navigate("/meeting", { replace: true });
      return;
    }

    void loadMomDetails();
  }, [eventId]);
  //#endregion

  //#region FETCH MOM DETAILS
  const loadMomDetails = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const meetingRequest = getMeetingDetailRequest(eventIdNumber);
        const agendaRequest: PullAgendaRequest = {
          PageSize: 10,
          PageNumber: 1,
          meetingId: eventIdNumber,
          AgendaSource: "MOM",
        };

        const [meetingResponse, agendaResponse] = await Promise.all([
          MeetingService.apiCallPullMeetingMaster(meetingRequest),
          MeetingService.apiCallPullAgenda(agendaRequest),
        ]);

        if (E.isRight(meetingResponse)) {
          if (meetingResponse.right.IsSuccess) {
            const meetingData = Array.isArray(meetingResponse.right.Data)
              ? meetingResponse.right.Data.find(
                  (item) => item.MeetingId === eventIdNumber,
                ) ?? meetingResponse.right.Data[0]
              : undefined;

            if (meetingData) {
              setMeeting(meetingData);
            } else {
              addToast({ type: "error", title: "Meeting not found" });
            }
          } else {
            addToast({
              type: "error",
              title: getApiMessage(
                meetingResponse.right.ErrorMessage,
                "Unable to load meeting",
              ),
            });
          }
        } else {
          addToast({ type: "error", title: meetingResponse.left.message });
        }

        if (E.isRight(agendaResponse)) {
          if (agendaResponse.right.IsSuccess) {
            const agendaData = Array.isArray(agendaResponse.right.Data)
              ? agendaResponse.right.Data
              : [];

            setAgendas(agendaData.map(mapAgendaDataToMeetingAgenda));
          } else {
            addToast({
              type: "error",
              title: getApiMessage(
                agendaResponse.right.ErrorMessage,
                "Unable to load agendas",
              ),
            });
          }
        } else {
          addToast({ type: "error", title: agendaResponse.left.message });
        }

        return meetingResponse;
      },
      undefined,
      (error: any) => addToast({ type: "error", title: error.message }),
      undefined,
      "Loading MOM",
    );
  };
  //#endregion

  //#region RENDER
  return (
    <div className="rounded-lg border border-gray-200 bg-[#F7F8FA] p-5 shadow-sm">
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <HeaderActionBar
        titleText={meeting?.MeetingTitle || "Minutes Of Meeting"}
        onCancel={() => navigate("/meeting")}
      />

      <div className="mt-6 min-h-[28rem]">
        <MeetingAgendaSection
          agendas={agendas}
          meetingId={eventIdNumber}
          onChange={setAgendas}
        />
      </div>

      <div className="mt-8 border-t border-gray-200 pt-4">
        <BottomActionBar
          cancelText="Back"
          saveText="Finish"
          onCancel={() => navigate("/meeting")}
          onSave={() => navigate("/meeting", { replace: true })}
          canAction={canAction}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
  //#endregion
};

export default AddMom;
