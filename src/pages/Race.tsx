import { useState, useEffect } from "react";

class Race {
  name!: string;
  url!: string;
}

class UpcomingEvent {
  title!: string;
  dates!: string;
  location!: string;
  url!: string;
}

export default function RaceCalendar() {
  const [pastRaces, setPastRaces] = useState<Race[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
    
  useEffect(() => {
      fetch("/data/past_races.json")
        .then((res) => res.json())
        .then((data) => setPastRaces(data))
        .catch((err) => console.error("Error loading races:", err));

      fetch("/data/upcoming_events.json")
        .then((res) => res.json())
        .then((data) => setUpcomingEvents(data))
        .catch((err) => console.error("Error loading events:", err));
    }, []);


    return (
      <div className="w-full responsive-padding py-24 flex flex-col justify-center  items-center gap-8">
        {/* <h1>Calendar</h1>
        <iframe src="https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=America%2FNew_York&showPrint=0&mode=AGENDA&src=Y19iMDY0ZTk5ZTk3YWE5OTdhNTQzMmRlOTlkNDIwOTdlMGEwYzZmZDVjNmE1ZTg5MmM3OTY1MWRkM2ZmM2ZhMDExQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&color=%234285F4"
          className='w-full h-[60svh] border-animated'></iframe> */}
            <h1>Upcoming Events</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
            {upcomingEvents.map((event, index) => (
                <a
                  key={event.url ?? index}
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-lg bg-gradient-to-br from-purple-100 via-pink-50 to-gray-100 flex flex-col items-start justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.01] transition-transform cursor-pointer"
                >
                  <h3 className="text-lg font-semibold space-font text-gray-900">{event.title}</h3>
                  {event.dates && <p className="text-sm text-gray-700">{event.dates}</p>}
                  {event.location && <p className="text-sm text-gray-600">{event.location}</p>}
                </a>
            ))}
            </div>

          <h1>Past Events</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
            {pastRaces.map((race, index) => (
              <a key={index}
              href={race.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-lg bg-gradient-to-br from-purple-100 via-pink-50 to-gray-100 flex items-center justify-center shadow-lg hover:shadow-xl transition-all">
                <p className="text-center space-font text-gray-900">{race.name}</p>
              </a>
            ))}
          </div>
      </div>
    );
  }
  