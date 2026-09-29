import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/ui/components/forms/Input";
import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";
import { useToast } from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { useEffect, useState } from "react";
import React from "react";
import type { AddUpdateConferenceDetailsRequest, ConferenceDetailsData, PullConferenceBookingDetailsRequest, PullConferenceDetailsRequest, VisitorFormData, VisitorModalMode } from "@/features/conference/models/ConferenceModel";
import { conferenceService } from "@/features/conference/services/ConferenceService";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { Button } from "@/ui/components/forms";
import { getTimeDuration } from "@/core/utils/comman";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, convert_hh_mm_ss_to_hh_mm, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { Modal } from "@/ui/components/Modal/Modal";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { TimePicker } from "@/ui/components/TimePicker/TimePicker";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import { Clock3 } from "lucide-react";

const initialVisitorFormState = (): VisitorFormData => ({
  Name: "",
  EmailId: "",
  MobileNo: "",
  VisitorRole: "",
});

const initialFormState = (): AddUpdateConferenceDetailsRequest => ({
  ConferenceRoomBookingId: 0,
  UniqueKey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  RoomId: 0,
  MeetingDate: "",
  StartTime: "",
  EndTime: "",
  MeetingId: 0,
  BookingStatus: "Booked",
  Conclusion: "",
  Purpose: "",
  ConferenceTitle: "",
});

export const AddUpdateConference: React.FC = () => {

  const [formData, setFormData] = useState<AddUpdateConferenceDetailsRequest>(() => initialFormState());
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [roomOptions, setRoomOptions] = useState<Array<{ label: string; value: string | number }>>([]);
  const [appointmentFilterDate, setAppointmentFilterDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [appointments, setAppointments] = useState<ConferenceDetailsData[]>([]);
  const [visitorModalMode, setVisitorModalMode] = useState<VisitorModalMode | null>(null);
  const [visitorFormData, setVisitorFormData] = useState<VisitorFormData>(initialVisitorFormState);

  const navigate = useNavigate();
  const location = useLocation();
  const roomId = Number((location.state as { roomId?: number | string })?.roomId);

  const { addToast } = useToast();

  const { canAction } = useMenuPermissions("/event");

  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [visitorErrors, setVisitorErrors] = useState<{ [k: string]: string }>({});

  const handleFieldChange = (field: keyof AddUpdateConferenceDetailsRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  useEffect(() => {
    loadConferenceRooms();
  }, []);

  useEffect(() => {
    if (roomId) {
      setFormData((prev) => ({ ...prev, RoomId: roomId }));
    }
  }, [roomId]);

  useEffect(() => {
    loadScheduledAppointments();
  }, [appointmentFilterDate]);

  const loadConferenceRooms = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: PullConferenceDetailsRequest = {
          PageSize: 100,
          PageNumber: 1,
          RoomId: 0,
        };
        const response = await conferenceService.apiCallPullConferenceDetails(params);

        if (E.isRight(response)) {
          setRoomOptions(response.right.Data.map((room) => ({ label: room.RoomName, value: room.ConferenceRoomId })));
        } else {
          addToast({ type: "error", title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: "error", title: error.message });
      },
      undefined,
      "Loading Conference",
    );
  };

  const loadScheduledAppointments = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: PullConferenceBookingDetailsRequest = {
          PageSize: 500,
          PageNumber: 1,
          BookingDate: appointmentFilterDate,
        };
        const response = await conferenceService.apiCallPullConferenceBookingDetails(params);

        if (E.isRight(response)) {
          setAppointments(response.right.Data);
        } else {
          addToast({ type: "error", title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: "error", title: error.message });
      },
      undefined,
      "Loading Appointments",
    );
  };

  const validateAddConferenceForm = (): {
    isValid: boolean;
    errors: { [key: string]: string };
  } => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.ConferenceTitle.trim()) {
      newErrors.ConferenceTitle = "Conference title is required";
    }

    if (!formData.Purpose.trim()) {
      newErrors.Purpose = "Meeting purpose is required";
    }

    if (!formData.MeetingDate?.trim()) {
      newErrors.MeetingDate = "Meeting date is required";
    }

    if (!formData.StartTime?.trim()) {
      newErrors.StartTime = "Start time is required";
    }

    if (!formData.EndTime?.trim()) {
      newErrors.EndTime = "End time is required";
    } else if (formData.StartTime && formData.EndTime <= formData.StartTime) {
      newErrors.EndTime = "End time must be after start time";
    }

    if (!formData.RoomId) {
      newErrors.RoomId = "Conference room is required";
    }

    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  };

  const PushConferenceFormData = (): AddUpdateConferenceDetailsRequest => {
    return {
      ConferenceRoomBookingId: formData.ConferenceRoomBookingId,
      UniqueKey: formData.UniqueKey,
      RoomId: formData.RoomId,
      MeetingDate: formData.MeetingDate ? `${formData.MeetingDate.trim().split("T")[0]}T${(formData.StartTime?.trim() || "00:00:00").split(".")[0]}` : "",
      StartTime: formData.StartTime,
      EndTime: formData.EndTime,
      MeetingId: formData.MeetingId,
      BookingStatus: formData.BookingStatus,
      Conclusion: formData.Conclusion.trim(),
      Purpose: formData.Purpose.trim(),
      ConferenceTitle: formData.ConferenceTitle.trim(),
    };
  };

  const handleAddUpdateConference = async () => {
    setErrors({});
    const validation = validateAddConferenceForm();
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = PushConferenceFormData();
        const response = await conferenceService.apiCallAddUpdateConferenceDetails(payload);

        if (E.isRight(response)) {
          addToast({ type: "success", title: response.right.SuccessMessage?.[0] });
          navigate("/conference");
        } else {
          addToast({ type: "error", title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: "error", title: error.message });
      },
      undefined,
      "Schedule Conference",
    );
  };

  const handleBack = () => {
    navigate("/conference");
  };

  const openVisitorModal = (mode: VisitorModalMode) => {
    setVisitorFormData(initialVisitorFormState());
    setVisitorErrors({});
    setVisitorModalMode(mode);
  };

  const closeVisitorModal = () => {
    setVisitorModalMode(null);
    setVisitorFormData(initialVisitorFormState());
    setVisitorErrors({});
  };

  const handleVisitorFieldChange = (field: keyof VisitorFormData, value: any) => {
    setVisitorFormData((prev) => ({ ...prev, [field]: value }));
    if (visitorErrors[field]) {
      setVisitorErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleVisitorSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: { [k: string]: string } = {};
    const isNewVisitor = visitorModalMode === "new";

    if (!visitorFormData.MobileNo.trim()) {
      nextErrors.MobileNo = "Mobile No. is required";
    }

    if (isNewVisitor && !visitorFormData.Name.trim()) {
      nextErrors.Name = "Name is required";
    }

    if (Object.keys(nextErrors).length > 0) {
      setVisitorErrors(nextErrors);
      return;
    }
    closeVisitorModal();
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-[#F9FAFB] shadow-sm">
      {/* Loader */}
      <Loader loading={isLoading} title={loadingMessage}>
        <div />
      </Loader>

      <div className="thin-scroll flex-1 space-y-6 overflow-y-auto p-5">
        <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="border-b border-gray-300 pb-2 text-lg font-semibold text-gray-900">
            Meeting Details
          </h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <DatePickerInput
                label="Meeting Date"
                value={formatDate_dd_mm_yyyy(formData.MeetingDate)}
                minDate={new Date()}
                onChange={(val) =>
                  handleFieldChange(
                    "MeetingDate",
                    convert_dd_mm_yyyy_To_Yyyy_mm_dd(val) || "",
                  )
                }
                required
                error={errors.MeetingDate}
              />
            </div>

            <div>
              <TimePicker
                label="Meeting Start Time"
                required
                size="sm"
                format={24}
                value={formData.StartTime}
                onChange={(val) => handleFieldChange("StartTime", val)}
                error={errors.StartTime}
              />
            </div>

            <div>
              <TimePicker
                label="Meeting End Time"
                required
                size="sm"
                format={24}
                value={formData.EndTime}
                onChange={(val) => handleFieldChange("EndTime", val)}
                error={errors.EndTime}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
            <div>
              <Input
                label="Conference Title"
                required
                value={formData.ConferenceTitle}
                onChange={(e) =>
                  handleFieldChange("ConferenceTitle", e.target.value)
                }
                placeholder="Enter Conference Title"
                error={errors.ConferenceTitle}
              />
            </div>

            <div>
              <SinglePageSelection
                label="Conference Room"
                required
                placeholder="Select Conference Room"
                value={formData.RoomId || ""}
                onChange={(value) => handleFieldChange("RoomId", Number(value))}
                options={roomOptions}
                error={errors.RoomId}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input
              label="Meeting Purpose"
              required
              value={formData.Purpose}
              maxLength={50}
              onChange={(e) => handleFieldChange("Purpose", e.target.value)}
              placeholder="Enter Meeting Purpose"
              error={errors.Purpose}
            />

            <Input
              label="Meeting Conclusion"
              value={formData.Conclusion}
              onChange={(e) => handleFieldChange("Conclusion", e.target.value)}
              placeholder="Enter Meeting Conclusion"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                color="blue"
                colorMode="extraLight"
                size="sm"
                onClick={() => openVisitorModal("existing")}
              >
                Add Existing Visitors
              </Button>
              <Button
                color="green"
                colorMode="light"
                size="sm"
                onClick={() => openVisitorModal("new")}
              >
                Add New Visitors
              </Button>
            </div>

            <BottomActionBar
              cancelText="Cancel"
              saveText="Schedule"
              onCancel={handleBack}
              canAction={canAction}
              onSave={handleAddUpdateConference}
              isLoading={isLoading}
            />
          </div>
        </div>

        <div className="space-y-4 pb-6 mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-300 pb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Scheduled Appointments
            </h3>
            <div className="w-full max-w-[220px]">
              <DatePickerInput
                label=""
                value={formatDate_dd_mm_yyyy(appointmentFilterDate)}
                onChange={(val) =>
                  setAppointmentFilterDate(
                    convert_dd_mm_yyyy_To_Yyyy_mm_dd(val) || "",
                  )
                }
              />
            </div>
          </div>

          {appointments.length === 0 ? (
            <NoDataView message="No scheduled appointments found" />
          ) : (
            <div className="thin-scroll flex gap-4 overflow-x-auto pb-2">
              {appointments.map((appointment) => (
                <article
                  key={appointment.ConferenceRoomBookingId}
                  className="flex w-[min(100%,420px)] shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                >
                  <div className="flex w-[108px] flex-col items-center justify-center gap-2 bg-blue-50 px-3 py-4 text-center">
                    <Clock3
                      className="h-5 w-5 text-[#135BEC]"
                      aria-hidden="true"
                    />
                    <div className="text-sm font-semibold leading-tight text-gray-900">
                      {convert_hh_mm_ss_to_hh_mm(appointment.StartTime) || "-"}
                    </div>
                    <div className="text-sm font-semibold leading-tight text-gray-900">
                      {convert_hh_mm_ss_to_hh_mm(appointment.EndTime) || "-"}
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-wide text-gray-500">
                      Duration
                    </div>
                    <div className="text-xs font-medium text-gray-500">
                      {getTimeDuration(
                        appointment.StartTime || "",
                        appointment.EndTime || "",
                      ) || "-"}
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col p-4">
                    <h4 className="truncate text-sm font-semibold text-gray-900">
                      {appointment.ConferenceTitle?.trim() ||
                        appointment.Purpose?.trim() ||
                        "Conference"}
                    </h4>

                    <div className="mt-3 space-y-1.5 text-sm text-gray-500">
                      <div>
                        <span className="text-gray-500">Date :</span>{" "}
                        <span className="text-gray-900">
                          {appointment.MeetingDate
                            ? formatDate_dd_MonthName_yy(appointment.MeetingDate)
                            : "-"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-[#135BEC]">
                        {appointment.BookingStatus || "-"}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={visitorModalMode !== null}
        onClose={closeVisitorModal}
        title={
          visitorModalMode === "existing"
            ? "Add Existing Visitor"
            : "Add New Visitor"
        }
        size="md"
        saveText="Add"
        onSubmit={handleVisitorSubmit}
      >
        <div className="space-y-4 rounded-xl bg-[#EFF6FF] p-4">
          {visitorModalMode === "new" && (
            <>
              <Input
                label="Name"
                value={visitorFormData.Name}
                onChange={(e) =>
                  handleVisitorFieldChange("Name", e.target.value)
                }
                placeholder="Enter Visitor Name"
                error={visitorErrors.Name}
              />
              <Input
                label="E-mail Id"
                value={visitorFormData.EmailId}
                onChange={(e) =>
                  handleVisitorFieldChange("EmailId", e.target.value)
                }
                placeholder="Enter Visitor E-mail Id"
                error={visitorErrors.EmailId}
              />
            </>
          )}

          <Input
            label="Mobile No."
            value={visitorFormData.MobileNo}
            onChange={(e) =>
              handleVisitorFieldChange("MobileNo", e.target.value)
            }
            placeholder={
              visitorModalMode === "new"
                ? "Enter Visitor Mobile No."
                : "Enter Registered Mobile No."
            }
            error={visitorErrors.MobileNo}
          />

          {visitorModalMode === "new" && (
            <Input
              label="Visitor Role"
              value={visitorFormData.VisitorRole}
              onChange={(e) =>
                handleVisitorFieldChange("VisitorRole", e.target.value)
              }
              placeholder="Enter Visitor Role"
              error={visitorErrors.VisitorRole}
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AddUpdateConference;
