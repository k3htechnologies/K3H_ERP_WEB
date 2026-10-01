import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as E from 'fp-ts/Either';

import { runApiWithLoader } from '@/core/utils';
import { Loader } from '@/core/utils/loader';
import useToast from '@/core/hooks/useToast';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { EventCalendarHeader, EventCalendarSidebar, EventTypeBadge } from '@/features/teamWorkspaceCalendar/components';
import { getMonthDateRange, groupEventsByType } from '@/features/teamWorkspaceCalendar/utils/eventCalendarUtils';
import { conferenceService } from '@/features/conference/services/ConferenceService';
import type { ConferenceDetailsData, PullConferenceBookingDetailsRequest } from '@/features/conference/models/ConferenceModel';
import { meetingService } from '@/features/meeting/services/MeetingService';
import { useMeetingListState } from '@/features/meeting/context/MeetingListStateContext';
import type { FilterWithPaginationMeetingMasterRequest, MeetingMasterData } from '@/features/meeting/models/MeetingModel';
import { taskService } from '@/features/task/services/TaskService';
import { useTaskListState } from '@/features/task/context/TaskListStateContext';
import type { FilterWithPaginationTaskDetailsRequest, TaskDetails } from '@/features/task/models/TaskModel';
import { TASK_TYPE } from '@/features/task/constants/taskConstants';
import type { CalendarEvent } from '@/ui/components/Calender/CalendarEvent';
import CustomCalendar, { type CalendarView } from '@/ui/components/Calender/CustomCalendar';
import { toLocalDateKey } from '@/ui/components/Calender/CalendarUtils';

export const Event: React.FC = () => {
  const [meetingList, setMeetingList] = useState<MeetingMasterData[]>([]);
  const [taskList, setTaskList] = useState<TaskDetails[]>([]);
  const [conferenceList, setConferenceList] = useState<ConferenceDetailsData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [view, setView] = useState<CalendarView>('month');

  const navigate = useNavigate();
  const { addToast } = useToast();
  const { canAction } = useMenuPermissions('/event');
  const { updateListState: updateMeetingListState } = useMeetingListState();
  const { updateListState: updateTaskListState } = useTaskListState();

  const loadMeetingEvents = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationMeetingMasterRequest = {
          PageNumber: 1,
          PageSize: 1000,
        };

        const response = await meetingService.apiCallPullMeetingMaster(params);

        if (E.isRight(response)) {
          setMeetingList(response.right.Data);
        } else {
          addToast({ type: 'error', title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      'Loading Meeting',
    );
  };

  const loadTaskEvents = async (startDate: string, endDate: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationTaskDetailsRequest = {
          PageNumber: 1,
          PageSize: 1000,
          TaskType: TASK_TYPE.Task,
          StartDate: startDate,
          DueDate: endDate,
        };

        const response = await taskService.apiCallPullTask(params);

        if (E.isRight(response)) {
          setTaskList(response.right.Data);
        } else {
          addToast({ type: 'error', title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      'Loading Task',
    );
  };

  const loadConferenceEvents = async (startDate: string, endDate: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: PullConferenceBookingDetailsRequest = {
          PageNumber: 1,
          PageSize: 1000,
          StartDate: startDate,
          EndDate: endDate,
        };

        const response =
          await conferenceService.apiCallPullConferenceBookingDetails(params);

        if (E.isRight(response)) {
          setConferenceList(response.right.Data);
        } else {
          addToast({ type: 'error', title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      'Loading Conference',
    );
  };

  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    loadMeetingEvents();
  }, []);

  useEffect(() => {
    const { startDate, endDate } = getMonthDateRange(currentMonth, currentYear);
    loadTaskEvents(startDate, endDate);
    loadConferenceEvents(startDate, endDate);
  }, [currentMonth, currentYear]);

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    const meetingEvents = meetingList
      .map((meeting) => {
        if (!meeting.MeetingDate || !meeting.MeetingStartTime) return null;

        const dateKey = meeting.MeetingDate.split('T')[0];
        const start = `${dateKey}T${meeting.MeetingStartTime}`;

        return {
          id: meeting.MeetingId,
          type: 'MEETING' as const,
          title: meeting.MeetingTitle || '',
          start,
          end: meeting.MeetingEndTime
            ? `${dateKey}T${meeting.MeetingEndTime}`
            : undefined,
          room: meeting.RoomName || meeting.MeetingLocation,
          CreatedBy: meeting.CreatedBy,
          CreatedDate: meeting.CreatedDate,
        };
      })
      .filter(Boolean) as CalendarEvent[];

    const taskEvents = taskList
      .map((task) => {
        if (!task.DueDate) return null;

        const dateKey = task.DueDate.split('T')[0];

        return {
          id: task.TaskId,
          type: 'TASK' as const,
          title: task.TaskTitle || '',
          start: dateKey,
          description: task.TaskDescription,
          fullname: task.AssigneeName,
          CreatedBy: task.CreatedBy,
          CreatedDate: task.CreatedDate,
        };
      })
      .filter(Boolean) as CalendarEvent[];

    const conferenceEvents = conferenceList
      .map((booking) => {
        if (!booking.MeetingDate || !booking.StartTime) return null;

        const dateKey = booking.MeetingDate.split('T')[0];
        const start = `${dateKey}T${booking.StartTime}`;

        return {
          id: booking.ConferenceRoomBookingId,
          type: 'CONFERENCE' as const,
          color: 'green' as const,
          title:
            booking.ConferenceTitle?.trim() ||
            booking.Purpose?.trim() ||
            'Conference',
          start,
          end: booking.EndTime ? `${dateKey}T${booking.EndTime}` : undefined,
          CreatedDate: booking.CreatedDate,
        };
      })
      .filter(Boolean) as CalendarEvent[];

    return [...meetingEvents, ...taskEvents, ...conferenceEvents];
  }, [meetingList, taskList, conferenceList]);

  const filteredCalendarEvents = useMemo(
    () =>
      activeTab === 'All'
        ? calendarEvents
        : calendarEvents.filter((event) => event.type === activeTab),
    [calendarEvents, activeTab],
  );

  const eventsForSelectedDate = useMemo(() => {
    const selectedDateKey = toLocalDateKey(currentDate);
    return filteredCalendarEvents.filter(
      (event) => event.start.split('T')[0] === selectedDateKey,
    );
  }, [filteredCalendarEvents, currentDate]);

  const handlePrevious = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
      return;
    }

    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() - (view === 'week' ? 7 : 1));
    setCurrentDate(nextDate);
  };

  const handleNext = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
      return;
    }

    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + (view === 'week' ? 7 : 1));
    setCurrentDate(nextDate);
  };

  const handleOpenViewEvent = (event: CalendarEvent) => {
    if (event.type === 'MEETING') {
      updateMeetingListState({
        meetingId: Number(event.id),
        meetingTitle: event.title || '',
      });
      navigate('/meeting');
      return;
    }

    if (event.type === 'TASK') {
      updateTaskListState({
        searchTerm: event.title || '',
        filters: {},
        page: 1,
      });
      navigate('/task');
      return;
    }

    if (event.type === 'CONFERENCE') {
      navigate('/conference');
    }
  };

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-[#F9FAFB] p-5 shadow-sm">
      <Loader loading={isLoading} title={loadingMessage}>
        <div />
      </Loader>

      <div className="flex w-full flex-col gap-5 overflow-hidden lg:h-[calc(100dvh-140px)] lg:min-h-[640px] lg:flex-row">
        <EventCalendarSidebar
          currentDate={currentDate}
          events={eventsForSelectedDate}
          onEventClick={handleOpenViewEvent}
        />

        <main className="flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white p-4 lg:w-auto">
          <EventCalendarHeader
            currentDate={currentDate}
            activeTab={activeTab}
            view={view}
            canAction={canAction}
            onTabChange={setActiveTab}
            onViewChange={setView}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onAddConference={() => navigate('/conference/add')}
            onAddMeeting={() => navigate('/meeting/add')}
            onAddTask={() => navigate('/task/add')}
          />

          <div className="thin-scroll min-h-0 w-full flex-1 overflow-auto">
            <CustomCalendar
              view={view}
              currentDate={currentDate}
              selectedDate={currentDate}
              events={filteredCalendarEvents}
              onDateChange={setCurrentDate}
              renderDayEvents={({ dayEvents, onEventClick }) =>
                groupEventsByType(dayEvents).slice(0, 3).map((group) => (
                  <EventTypeBadge
                    key={group.type}
                    label={group.label}
                    event={group.firstEvent}
                    onEventClick={onEventClick}
                  />
                ))
              }
              renderWeekSlotEvents={({ slotEvents, onEventClick }) => (
                <div className="space-y-1 p-1">
                  {groupEventsByType(slotEvents).slice(0, 3).map((group) => (
                    <EventTypeBadge
                      key={group.type}
                      label={group.label}
                      event={group.firstEvent}
                      onEventClick={onEventClick}
                    />
                  ))}
                </div>
              )}
              renderDayHourEvents={({ hourEvents, onEventClick }) => (
                <div className="flex h-full items-center gap-2 px-2">
                  {groupEventsByType(hourEvents).slice(0, 3).map((group) => (
                    <EventTypeBadge
                      key={group.type}
                      label={group.label}
                      event={group.firstEvent}
                      onEventClick={onEventClick}
                    />
                  ))}
                </div>
              )}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Event;
