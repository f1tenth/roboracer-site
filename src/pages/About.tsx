'use client';
import useEmblaCarousel from 'embla-carousel-react';
import { useState, useEffect, useCallback } from "react";

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
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
    const scrollPrev = useCallback(() => {
      if (emblaApi) emblaApi.scrollPrev()
    }, [emblaApi])
  
    const scrollNext = useCallback(() => {
      if (emblaApi) emblaApi.scrollNext()
    }, [emblaApi])

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
        <div className="w-full flex flex-col gap-8 responsive-padding py-32 sm:px-12 ">
            <div className="h-[65svh] shadow-inner rounded-lg p-8 purple-radial-gradient text-center flex flex-col gap-8 items-center justify-center overflow-hidden z-[5]">
                <div className="embla">
                    <div className="embla__viewport" ref={emblaRef} style={{ height: "100%" }}>
                    <div className="embla__container">
                        {carouselImages.map((url, index) => (
                        <div key={index} className="embla__slide">
                            <img src={url} alt={`Creative Piece Image ${index + 1}`} className="w-full h-full object-contain" />
                        </div>
                        ))}
                    </div>
                    </div>
                    <button className="embla__prev" onClick={scrollPrev}>&lt;</button>
                    <button className="embla__next" onClick={scrollNext}>&gt;</button>
                </div>
                <p className='lg:max-w-[70svw]'>
                    RoboRacer is an international community of researchers, engineers, and autonomous systems enthusiasts. 
                    It was originally founded at the University of Pennsylvania in 2016 but has since spread to many other institutions worldwide. 
                    Our mission is to foster interest, excitement, and critical thinking about the increasingly ubiquitous field of autonomous systems.
                </p>
            </div>

            <h1 className="text-2xl text-center font-bold mt-12">Meet the Team</h1>
            <ProfileList title="Developers" data={developers} />
            <ProfileList title="Alumni" data={alumni} />

            <h1 className="text-2xl text-center font-bold mt-12">Our Partners</h1>
            <PartnersList partners={partners}/>
        </div>
    );
};
