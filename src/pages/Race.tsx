import { useState, useEffect } from "react";

class Race {
  name!: string;
  url!: string;
}

export default function RaceCalendar() {
  const [pastRaces, setPastRaces] = useState<Race[]>([]);

    useEffect(() => {
      fetch("/data/past_races.json")
        .then((res) => res.json())
        .then((data) => setPastRaces(data))
        .catch((err) => console.error("Error loading races:", err));
    }, []);


    return (
      <div className="w-full responsive-padding py-24 flex flex-col justify-center  items-center gap-8">
        <h1>Calendar</h1>
        <iframe src="https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=America%2FNew_York&showPrint=0&src=Y19iMDY0ZTk5ZTk3YWE5OTdhNTQzMmRlOTlkNDIwOTdlMGEwYzZmZDVjNmE1ZTg5MmM3OTY1MWRkM2ZmM2ZhMDExQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&color=%234285F4"
          className='w-full h-[60svh] border-animated'></iframe>
          <h1>Past Events</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
            {pastRaces.map((race, index) => (
              <a key={index} href={race.url} target="_blank" className="p-4 rounded-lg bg-brand-radial flex items-center justify-center shadow-inner hover:shadow-md">
                <p className="text-center space-font">{race.name}</p>
              </a>
            ))}
          </div>
      </div>
    );
  }
  