import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

interface CalendarEvent {
  id: string; // ✅ FIXED
  title: string;
  start: string;
  end?: string;
  backgroundColor?: string;
  textColor?: string;
}

interface Props {
  events: CalendarEvent[];
}

export default function GoogleCalendar({ events }: Props) {
  return (
    <div className="bg-white p-2 rounded-lg thin-scroll">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next',
          center: 'title',
          right: 'timeGridDay,timeGridWeek,dayGridMonth'
        }}
        events={events}
        editable
        selectable
        nowIndicator
        allDaySlot
        height="70vh"
        slotMinTime="00:00:00"
        slotMaxTime="24:00:00"
      />
    </div>
  );
}
