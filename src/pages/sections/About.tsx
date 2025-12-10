import avhad from "./assets/7th.png";
import tf from "./assets/tfLogo.png";
import iitb from "./assets/iitb.png";
import rahul from "./assets/rahul.jpeg";
import mike from "./assets/mike.jpg";
import mittal from "./assets/mittal.webp";
import roboracer from "./assets/roboracer_video.gif";
import parth from "./assets/parth.jpg";
import sedrica from "./assets/sedrica.png";

const organizers = [
  {
    name: "Rahul Mangharam",
    role: "Associate Professor",
    dept: "Department of Electrical and Systems Engineering",
    org: "University of Pennsylvania",
    img: rahul,
  },
  {
    name: "Mike Coraluzzi",
    role: "Senior Program Manager",
    org: "The Roboracer Foundation UPenn Autoware Center of Excellence",
    img: mike,
  },
  {
    name: "Archak Mittal",
    role: "Assistant Professor",
    dept: "Department of Civil Engineering",
    org: "IIT Bombay",
    img: mittal,
  },
  {
    name: "Parth Agrawal",
    role: "Team Lead",
    org: "Sedrica, IIT Bombay",
    img: parth,
  },
  {
    name: "Vaibhav Avhad",
    role: "Events Manager",
    org: "Techfest, IIT Bombay",
    img: avhad,
  },
];

const About = () => {
  return (
    <div className="max-w-5xl mx-auto text-center space-y-8">
      {/* Heading */}
      {/* <h2 className="text-3xl md:text-4xl font-bold text-gray-900"> */}
      <h1 className="text-4xl md:text-6xl font-extrabold text-black text-center">
       26th Roboracer Autonomous Racing Competition at Techfest, IIT Bombay
      </h1>

      {/* First Paragraph */}
      <p className="text-lg text-gray-700 text-justify">
       The Roboracer Autonomous Racing Competition brings together researchers, engineers, and enthusiasts from around the world to push the limits of autonomous driving. This year, the 26th edition will be hosted at Techfest, IIT Bombay, where teams will race their 1:10 scaled autonomous cars on a specially designed track. The challenge is simple but tough — don’t crash, and complete the lap in the shortest possible time.
      </p>

      {/* Video Embed */}
      <div className="flex justify-center">
        <div className="w-full md:w-2/3 aspect-video rounded-lg shadow-md overflow-hidden flex items-center justify-center bg-black">
          <img
            src={roboracer}
            alt="Roboracer Promo GIF"
            className="w-full h-full object-cover"
            style={{ maxWidth: "100%", maxHeight: "100%" }}
          />
        </div>
      </div>


      {/* More Content */}
      <p className="text-lg text-gray-700 text-justify">
     Each team will bring its own Roboracer car and write the software that drives it. A detailed build manual and open-source tools are available to help teams get started, but the real test lies in developing smart and reliable algorithms. The organizers at Techfest will provide the rules, the track, and the race infrastructure, creating a level playing field for everyone.
<br />
<br />
Roboracer Autonomous Racing at Techfest, IIT Bombay is a two-stage competition where teams first submit a 1-minute autonomous time trial video and then compete in-person with practice and open track sessions before head-to-head knockout races. With standardized hardware, teams focus on their perception, planning, and control systems to complete laps efficiently on an unpredictable, reflective track. The final score combines performance from both the time trial and knockout races.<br />
<br />
The 26th Roboracer at Techfest, IIT Bombay promises thrilling battles, innovative solutions, and an unforgettable showcase of autonomous racing technology </p>

      {/* Image */}
      <a href="https://techfest.org/competitions/Roboracer" target="_blank" rel="noopener noreferrer">
      <img
        src={tf}
        alt="Roboracer Event"
        className="w-full md:w-1/2 mx-auto rounded-lg"
      />
      </a>
      <br />
      <img
        src={iitb}
        alt="Roboracer Event"
        className="w-full md:w-1/3 mx-auto rounded-lg"
      />
      <br />
      <img
        src={sedrica}
        alt="sedrica"
        className="w-full md:w-1/4 mx-auto rounded-lg"
      />

      {/* Divider */}
      <hr className="my-10 border-gray-300" />

      {/* Organizers Section */}
      <div>
        <h3 className="text-2xl font-bold mb-8">Organizers</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 justify-items-center">
          {organizers.map((org, idx) => (
            <div key={idx} className="text-center space-y-3">
              <img
                src={org.img}
                alt={org.name}
                className="w-32 h-32 mx-auto object-cover rounded-md shadow-md"
              />
              <h4 className="font-semibold text-lg">{org.name}</h4>
              <p className="text-sm font-medium text-gray-600">{org.role}</p>
              <p className="text-sm text-gray-700">{org.dept}</p>
              <p className="text-sm text-gray-700 font-semibold">{org.org}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
