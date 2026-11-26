import { invite } from '../invite';

// a Save-the-date link: an .ics file the phone opens in its calendar app
export function calendarLink(event) {
  const start = new Date(event.start);
  const end = new Date(start.getTime() + 2 * 36e5);
  const stamp = (date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const text = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Invitation//EN', 'BEGIN:VEVENT',
    `UID:${stamp(start)}-${event.name.replace(/\W/g, '')}@invitation`,
    `DTSTAMP:${stamp(start)}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`,
    `SUMMARY:${event.name} · ${invite.groom} & ${invite.bride}`,
    `LOCATION:${event.place}\\, ${invite.city}`, 'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(text)}`;
}
