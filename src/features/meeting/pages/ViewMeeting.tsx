import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as E from 'fp-ts/Either';
import { runApiWithLoader } from '@/core/utils';
import { convert_hh_mm_ss_to_hh_mm, formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import { getNameInitials } from '@/core/utils/getNameInitials';
import { parseDocumentUrls } from '@/core/utils/documentUtils';
import { Loader } from '@/core/utils/loader';
import { useToast } from '@/core/hooks/useToast';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import type { FilterWithPaginationMeetingMasterRequest, FilterWithPaginationMeetingParticipantsRequest, MeetingMasterData } from '@/features/meeting/models/MeetingModel';
import MeetingAgendaSection from '@/features/meeting/components/MeetingAgendaSection';
import { useMeetingListState } from '@/features/meeting/context/MeetingListStateContext';
import { meetingService } from '@/features/meeting/services/MeetingService';
import HeaderActionBar from '@/ui/components/forms/HeaderActionBar';
import BottomActionBar from '@/ui/components/forms/BottomActionBar';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import Tabs from '@/ui/components/Tab/Tab';
import MultiImageViewer from '@/ui/components/ImageViewer/ImageViewer';
import NoDataView from '@/ui/components/NoDataView/NoDataView';

const meetingTabList = [
  { id: 'Overview', label: 'Overview' },
  { id: 'Documents', label: 'Documents' },
];

export const ViewMeeting: React.FC = () => {
  const [meeting, setMeeting] = useState<MeetingMasterData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [activeTab, setActiveTab] = useState(meetingTabList[0].id);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isMomMode = searchParams.get('mode') === 'mom';

  const { addToast } = useToast();
  const { canAction } = useMenuPermissions('/event');
  const { listState, setMeetingContext } = useMeetingListState();
  const meetingIdNumber = Number(listState.meetingId);

  const documentGroups = [
    {
      key: 'mom',
      title: 'MOM Document',
      urls: parseDocumentUrls(meeting?.MOMDocumentUrl),
    },
    {
      key: 'presentation',
      title: 'Presentation',
      urls: parseDocumentUrls(meeting?.PresentationDocumentUrl),
    },
    {
      key: 'supporting',
      title: 'Supporting Document',
      urls: parseDocumentUrls(meeting?.SupportingDocumentUrl),
    },
  ].filter((group) => group.urls.length > 0);

  const fetchMeetingDetails = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationMeetingMasterRequest = {
          PageNumber: 1,
          PageSize: 1,
          MeetingId: meetingIdNumber,
        };

        const response = await meetingService.apiCallPullMeetingMaster(params);

        if (E.isLeft(response)) {
          addToast({ type: 'error', title: response.left.message });
          return response;
        }

        const meetingRecord = response.right.Data?.[0];

        if (meetingRecord) {
          const participantsParams: FilterWithPaginationMeetingParticipantsRequest = {
            PageNumber: 1,
            PageSize: 1000,
            MeetingId: meetingIdNumber,
          };

          const participantsResponse =
            await meetingService.apiCallPullMeetingParticipants(participantsParams);

          const participants = E.isRight(participantsResponse)
            ? participantsResponse.right.Data
            : [];

          if (E.isLeft(participantsResponse)) {
            addToast({ type: 'error', title: participantsResponse.left.message });
          }

          const internalEmployees = participants.filter(
            (p) => p.MeetingType !== 'External' && (!p.ExternalId || p.ExternalId === 0),
          );
          const externalParticipants = participants.filter(
            (p) => p.MeetingType === 'External' || (p.ExternalId && p.ExternalId > 0),
          );

          setMeeting({
            ...meetingRecord,
            Participants: internalEmployees,
            ExternalMeetingParticipants: externalParticipants,
          });

          setMeetingContext(meetingRecord.MeetingId, meetingRecord.MeetingTitle);
        }

        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      'Loading Meeting Details',
    );
  };

  useEffect(() => {
    if (!meetingIdNumber) {
      navigate('/meeting');
      return;
    }

    fetchMeetingDetails();
  }, [meetingIdNumber]);

  const handleBackToListMeeting = () => {
    navigate('/meeting');
  };

  const handleEditMeeting = () => {
    if (!meetingIdNumber) return;
    navigate(`/meeting/add/${meetingIdNumber}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <HeaderActionBar
        titleText={isMomMode ? 'Minutes Of Meeting : ' : 'Meeting Details : '}
        subTitleText={meeting?.MeetingTitle || ''}
        cancelText="Cancel"
        EditText={!isMomMode ? 'Edit' : undefined}
        onCancel={handleBackToListMeeting}
        canAction={canAction}
        onEdit={!isMomMode ? handleEditMeeting : undefined}
        isLoading={isLoading}
      />

      {!isMomMode && (
      <div className="pt-5">
        <Tabs
          tabs={meetingTabList}
          defaultActive={activeTab}
          islarge={true}
          onTabChange={(tab) => {
            setActiveTab(tab.id);
          }}
        />
      </div>
      )}

      {(isMomMode || activeTab === 'Overview') && (
        <div className="pt-5 space-y-4">
          <section className="overflow-hidden rounded-xl border border-gray-200">
            <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-purple-50 px-3 py-2">
              <h4 className="text-sm font-semibold text-purple-900">Meeting Overview</h4>
            </div>
            <div className="bg-white p-4">
              <div className="grid grid-cols-1 gap-4 border-b border-gray-200 pb-4 md:grid-cols-2 lg:grid-cols-4">
                <FieldItem
                  label="Meeting Subject"
                  value={meeting?.MeetingTitle || '-'}
                />
                <FieldItem
                  label="Meeting Date"
                  value={
                    meeting?.MeetingDate
                      ? formatDate_dd_MonthName_yy(meeting.MeetingDate)
                      : '-'
                  }
                />
                <FieldItem
                  label="Meeting Time"
                  value={
                    (() => {
                      const start = convert_hh_mm_ss_to_hh_mm(meeting?.MeetingStartTime);
                      const end = convert_hh_mm_ss_to_hh_mm(meeting?.MeetingEndTime);
                      return start && end ? `${start} - ${end}` :  '-';
                    })()
                  }
                />
                <FieldItem
                  label="Meeting Mode"
                  value={meeting?.MeetingMode || '-'}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2 lg:grid-cols-4">
              <FieldItem
                label={meeting?.MeetingMode === 'Online' ? 'Meeting Link' : 'Meeting Location'}
                value={
                  meeting?.MeetingMode === 'Online'
                    ? meeting?.MeetingLink || '-'
                    : meeting?.MeetingMode === 'Physical'
                                   ? meeting?.RoomName || '-'
                                   : meeting?.MeetingLocation || '-'
                }
              />
                <FieldItem label="Remark" value={meeting?.Remark || '-'} />
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section className="overflow-hidden rounded-xl border border-gray-200">
              <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-blue-50 px-3 py-2">
                <h4 className="text-sm font-semibold text-blue-900">
                  {`Employees (${meeting?.Participants?.length ?? 0})`}
                </h4>
              </div>
              <div className="bg-white p-4">
                {(meeting?.Participants?.length ?? 0) > 0 ? (
                  <div className="h-[240px] thin-scroll overflow-y-auto pr-2">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[320px] text-left">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="pb-2 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                              Name
                            </th>
                            <th className="pb-2 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                              Department
                            </th>
                            <th className="pb-2 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                              Designation
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {meeting?.Participants?.map((employee, index) => (
                            <tr
                              key={employee.UniqueKey || employee.ParticipantId || index}
                              className="border-b border-gray-100 last:border-b-0"
                            >
                              <td className="py-3 pr-3">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-blue-100 text-[10px] font-medium text-gray-800">
                                    {getNameInitials(
                                      employee.ParticipantName || '-',
                                    )}
                                  </div>
                                  <span className="text-sm font-medium text-gray-900">
                                    {employee.ParticipantName || '-'}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 pr-3 text-sm text-gray-600">
                                {employee.DepartmentName || '-'}
                              </td>
                              <td className="py-3">
                                {employee.DesignationName ? (
                                  <span className="inline-flex rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-800">
                                    {employee.DesignationName}
                                  </span>
                                ) : (
                                  <span className="text-sm text-gray-500">-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <NoDataView message="No employees found" />
                )}
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-gray-200">
              <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-blue-100/70 px-3 py-2">
                <h4 className="text-sm font-semibold text-blue-900">
                  {`Participants (${meeting?.ExternalMeetingParticipants?.length ?? 0})`}
                </h4>
              </div>
              <div className="bg-white p-4">
                {(meeting?.ExternalMeetingParticipants?.length ?? 0) > 0 ? (
                  <div className="h-[240px] thin-scroll space-y-4 overflow-y-auto pr-2">
                    {meeting?.ExternalMeetingParticipants?.map((participant, index) => (
                      <div
                        key={participant.UniqueKey || participant.ParticipantId || index}
                        className="rounded-lg border border-gray-200 bg-white p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-900">
                            {participant.ParticipantName || '-'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {[
                              participant.DesignationName,
                              participant.OrganizationName,
                            ]
                              .filter(Boolean)
                              .join(', ') || '-'}
                          </p>
                        </div>

                        {participant.EmaEmail ? (
                          <a
                            href={`mailto:${participant.EmaEmail}`}
                            className="mt-1 block text-sm font-medium text-blue-600 hover:underline"
                          >
                            {participant.EmaEmail}
                          </a>
                        ) : (
                          <p className="mt-1 text-sm text-gray-500">-</p>
                        )}

                        <p className="mt-0.5 text-sm text-gray-600">
                          {participant.MobileNo || '-'}
                        </p>

                        <div className="mt-3 rounded-md border-l-4 border-blue-900 bg-gray-50 px-3 py-2">
                          <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                            Remark
                          </p>
                          <p className="mt-1 text-sm text-gray-700">
                            {participant.Remark
                              ? `"${participant.Remark}"`
                              : '-'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <NoDataView message="No participants found" />
                )}
              </div>
            </section>
          </div>

          <MeetingAgendaSection
            meetingId={meetingIdNumber}
            agendaSource={isMomMode ? 'MOM' : 'Meeting'}
            canManageAgenda={isMomMode ? canAction : false}
          />

          <section className="overflow-hidden rounded-xl border border-gray-200">
            <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-gray-100 px-3 py-2">
              <h4 className="text-sm font-semibold text-gray-800">Action Details</h4>
            </div>
            <div className="bg-white p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <FieldItem label="Created By" value={meeting?.CreatedBy || '-'} />
                <FieldItem
                  label="Created Date"
                  value={
                    meeting?.CreatedDate
                      ? formatDate_dd_MonthName_yy_hh_mm(meeting.CreatedDate)
                      : '-'
                  }
                />
                <FieldItem label="Modified By" value={meeting?.ModifiedBy || '-'} />
                <FieldItem
                  label="Modified Date"
                  value={
                    meeting?.ModifiedDate
                      ? formatDate_dd_MonthName_yy_hh_mm(meeting.ModifiedDate)
                      : '-'
                  }
                />
              </div>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'Documents' && (
        <div className="pt-5">
          <section className="overflow-hidden rounded-xl border border-gray-200">
            <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-sky-50 px-3 py-2">
              <h4 className="text-sm font-semibold text-sky-900">Documents</h4>
            </div>
            <div className="bg-white p-4">
              {documentGroups.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  {documentGroups.map((group) => (
                    <div
                      key={group.key}
                      className="flex h-full flex-col rounded-lg border border-gray-200 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2 p-2">
                        <div className="flex min-w-0 flex-col">
                          <span className="line-clamp-2 break-words font-medium text-gray-900">
                            {group.title}
                          </span>
                          <span className="mt-1 text-sm text-gray-500">
                            Document Count : {group.urls.length}
                          </span>
                        </div>

                        <MultiImageViewer
                          images={group.urls}
                          title={group.title}
                          triggerLabel="View"
                          isIcon={false}
                        />
                      </div>

                      <div className="mt-auto bg-gray-50 p-2">
                        <FieldItem
                          label="Uploaded By / Date"
                          value={`${meeting?.ModifiedBy || meeting?.CreatedBy || '-'} / ${
                            meeting?.ModifiedDate
                              ? formatDate_dd_MonthName_yy_hh_mm(meeting.ModifiedDate)
                              : meeting?.CreatedDate
                                ? formatDate_dd_MonthName_yy_hh_mm(meeting.CreatedDate)
                                : '-'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <NoDataView message="No Documents Found" />
              )}
            </div>
          </section>
        </div>
      )}

      {isMomMode && (
        <div className="mt-6">
          <BottomActionBar
            cancelText="Back"
            saveText="Save"
            onCancel={handleBackToListMeeting}
            onSave={handleBackToListMeeting}
            canAction={canAction}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
};

export default ViewMeeting;
