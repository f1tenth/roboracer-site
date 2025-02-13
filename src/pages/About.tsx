'use client';
import { useState, useEffect } from "react";

class TeamMember {
    name!: string;
    linkedin?: string;
    image!: string;

    constructor(name: string, image: string, linkedin?: string) {
        this.name = name;
        this.image = image;
        this.linkedin = linkedin;
    }
}

class Partner {
    name!: string;
    website!: string;
    image!: string;
}

//reusable profile card component
const ProfileCard = (member: TeamMember) => (
    <div className="text-center flex flex-col justify-end p-4">
        <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
            <img src={`/${member.image}`} alt={member.name} className="rounded-md mx-auto contrast-[1]" width={100} height={100} />
        </a>
        <h5 className="mt-2 text-white">{member.name}</h5>
    </div>
);

//profile card grid
const ProfileList = ({ title, data }: { title: string, data: TeamMember[] }) => (
    <div className="mt-8 responsive-padding">
        <h5 className="text-lg font-semibold">{title}</h5>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {data.map((person) => (
                <ProfileCard key={person.name} {...person} />
            ))}
        </div>
    </div>
);

//institutional partners grid
const PartnersList = ({ partners }: { partners: Partner[] }) => (
    <div className="mt-8 responsive-padding">
        <h3 className="text-lg font-semibold">Institutional Partners</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {partners.map((partner: Partner) => (
                <div key={partner.name} className="text-center flex flex-col justify-end p-4">
                    <a href={partner.website} target="_blank" rel="noopener noreferrer">
                        <img src={`/${partner.image}`} alt={partner.name} className="mx-auto" width={150} height={80} />
                    </a>
                    <h5 className="mt-2 text-white">{partner.name}</h5>
                </div>
            ))}
        </div>
    </div>
);

// About Page
export default function About() {

    const [developers, setDevelopers] = useState([]);
    const [alumni, setAlumni] = useState([]);
    const [partners, setPartners] = useState([]);
  
    useEffect(() => {
      async function fetchData() {
        try {
          const devRes = await fetch("/data/team_developers.json");
          const alumniRes = await fetch("/data/team_alumni.json");
          const partnersRes = await fetch("/data/partners.json");
  
          const devData = await devRes.json();
          const alumniData = await alumniRes.json();
          const partnersData = await partnersRes.json();
  
          setDevelopers(devData);
          setAlumni(alumniData);
          setPartners(partnersData);
        } catch (error) {
          console.error("Error fetching JSON files:", error);
        }
      }
      fetchData();
    }, []);

    return (
        <div className="w-full text-white bg-zinc-950 p-8 pt-32 sm:px-12 ">
            <div className="w-full h-[65svh] branded-card text-white text-center flex flex-col gap-8 items-center justify-center overflow-hidden">
                <img
                    src="/about/upenn-ppl.jpg"
                    alt="Logo Gradient"
                    className='lg:max-w-[60svw]'
                    width={400}
                    height={350}
                />
                <p className='lg:max-w-[70svw]'>
                    RoboRacer is an international community of researchers, engineers, and autonomous systems enthusiasts. 
                    It was originally founded at the University of Pennsylvania in 2016 but has since spread to many other institutions worldwide. 
                    Our mission is to foster interest, excitement, and critical thinking about the increasingly ubiquitous field of autonomous systems.
                </p>
            </div>

            <h2 className="text-2xl font-bold mt-12">Meet the Team</h2>
            <ProfileList title="Developers" data={developers} />
            <ProfileList title="Alumni" data={alumni} />

            <h2 className="text-2xl font-bold mt-12">Our Partners</h2>
            <PartnersList partners={partners}/>
        </div>
    );
};
