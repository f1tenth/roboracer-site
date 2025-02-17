import React, { useEffect, useState } from "react";

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  attachments?: {
    fileUrl?: string;
    mimeType?: string;
  }[];
  creator?: {
    email: string;
    displayName?: string;
    photo?: {
      url: string;
    };
  };
}

const GOOGLE_CALENDAR_ID = "your_calendar_id@group.calendar.google.com";
const API_KEY = "your_google_api_key";

const CalendarEvents: React.FC = () => {
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${GOOGLE_CALENDAR_ID}/events?key=${API_KEY}`
        );
        if (!response.ok) throw new Error("Failed to fetch events");

        const data = await response.json();
        if (data.items) {
          setEvents(data.items);
        } else {
          setEvents([]);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        setError("Could not load events.");
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <ul>
          {events.map((event) => {
            const thumbnail =
              event.attachments?.find((att) =>
                att.mimeType?.startsWith("image/")
              )?.fileUrl || event.creator?.photo?.url || null;

            return (
              <li key={event.id} className="border-b py-4 flex gap-4">
                {thumbnail && (
                  <img
                    src={thumbnail}
                    alt="Event"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h3 className="font-medium">{event.summary}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(
                      event.start.dateTime || event.start.date || ""
                    ).toLocaleString()}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default CalendarEvents;
