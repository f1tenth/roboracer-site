'use client';
import useEmblaCarousel from 'embla-carousel-react';
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

const carouselImages = [
    '/about/upenn-ppl-min.jpg',
    '/about/image-2.JPG',
    '/about/image-3.JPG',
]

//reusable profile card component
const ProfileCard = (member: TeamMember) => (
    <div className="text-center flex flex-col justify-end p-4">
        <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
            <img src={`/${member.image}`} alt={member.name} className="rounded-md mx-auto contrast-[1]" width={100} height={100} />
        </a>
        <h5 className="mt-2">{member.name}</h5>
    </div>
);

//profile card grid
const ProfileList = ({ title, data }: { title: string, data: TeamMember[] }) => (
    <div className="responsive-padding">
        <h4 className="text-center">{title}</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {data.map((person) => (
                <ProfileCard key={person.name} {...person} />
            ))}
        </div>
    </div>
);

//institutional partners grid
const PartnersList = ({ partners }: { partners: Partner[] }) => (
    <div className="flex flex-col items-center responsive-padding">
        <h3>Institutional Partners</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {partners.map((partner: Partner) => (
                <div key={partner.name} className="text-center flex flex-col justify-end p-4">
                    <a href={partner.website} target="_blank" rel="noopener noreferrer">
                        <img src={`/${partner.image}`} alt={partner.name} className="mx-auto" width={150} height={80} />
                    </a>
                    <h5 className="mt-2">{partner.name}</h5>
                </div>
            ))}
        </div>
    </div>
);

// About Page
export default function About() {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center"});
 
    useEffect(() => {
        if (!emblaApi) return;
        const scrollNext = () => emblaApi.scrollNext();
        const interval = setInterval(scrollNext, 4000); //scroll every 4 seconds
        return () => clearInterval(interval);
    }, [emblaApi]);

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
        <div className="w-full flex flex-col items-center gap-8 responsive-padding py-24 sm:px-12 ">
            <div className="relative lg:max-w-[75svw] shadow-inner rounded-lg p-8 bg-brand-radial text-center flex flex-col gap-8 items-center justify-center overflow-hidden z-[5]">
                <p className='lg:max-w-[70svw] space-font z-[5]'>
                    RoboRacer is an international community of researchers, engineers, and autonomous systems enthusiasts. 
                    It was originally founded at the University of Pennsylvania in 2016 but has since spread to many other institutions worldwide. 
                    Our mission is to foster interest, excitement, and critical thinking about the increasingly ubiquitous field of autonomous systems.
                </p>
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                    <div className="embla h-full w-full absolute">
                        <div className="embla__viewport w-full h-full flex items-center justify-center" ref={emblaRef}>
                        <div className="embla__container flex">
                            {carouselImages.map((url, index) => (
                            <div key={index} className="embla__slide w-full h-full flex items-center justify-center">
                                <img 
                                src={url} 
                                alt={`Creative Piece Image ${index + 1}`} 
                                className="absolute inset-0 w-full h-full object-cover"
                                />
                            </div>
                            ))}
                        </div>
                        </div>
                    </div>
                </div>

                <ol className='flex flex-col text-left gap-4 z-[5]'>
                    <li>
                    <span className='space-font'>Build:</span> We designed and maintain the RoboRacer Autonomous Vehicle System, a powerful and versatile open-source platform for autonomous systems research and education.
                    </li>
                    <li>
                    <span className='space-font'>Learn:</span> We create courses that teach the foundations of autonomy but also emphasize the analytical skills to recognize and reason about situations with moral content in the design of autonomous.
                    </li>
                    <li>
                    <span className='space-font'>Race:</span> We bring our international community together by holding a number of autonomous race car competitions each year where teams from all around the world gather to compete.
                    </li>
                    <li>
                    <span className='space-font'>Research:</span> Our platform is powerful and versatile enough to be used for a variety of research that includes and is not limited to autonomous racing, reinforcement learning, robotics, communication systems, and much more.
                    </li>
                </ol>
            </div>

            <h1 className="text-2xl text-center font-bold mt-12">Meet the Team</h1>
            <ProfileList title="Developers" data={developers} />
            <ProfileList title="Alumni" data={alumni} />

            <h1 className="text-2xl text-center font-bold mt-12">Our Partners</h1>
            <PartnersList partners={partners}/>
        </div>
    );
};
