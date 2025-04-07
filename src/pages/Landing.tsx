"use client";
import { motion } from "framer-motion";
import { useState } from "react";

import FloatingTestimonials from "../components/FloatingTestimonials";
import EmailSubscribeForm from "../components/EmailSubscribeForm";
import GlobeView from "../components/GlobeView";

const sections = [
  {
    title: "Educational Materials Development",
    content:
      "We create teaching and training materials for university and K-12 courses covering robot perception, computer vision, localization, mapping, motion planning, and safe control. Over 90 universities, including the University of Pennsylvania, UC San Diego, Clemson University, and more, use these resources.",
    link: "Learn more",
    url: "/learn",
  },
  {
    title: "Educational Events",
    content:
      "We host workshops, tutorials, seminars, and panels on safe autonomous vehicle development at IEEE and ACM accredited conferences.",
  },
  {
    title: "Community Events",
    content:
      "We organize international autonomous racing competitions, hosting over 24 events in locations such as New York, Pittsburgh, Portugal, South Korea, Italy, and Canada.",
    link: "See details",
    url: "/race",
  },
  {
    title: "Open-Source Contributions",
    content:
      "We develop and share open-source software and hardware designs to help anyone build autonomous robotic platforms.",
    link: "Explore resources",
    url: "/build",
  },
];

export default function Home() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleSection = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col gap-16 pb-20 responsive-padding items-center justify-center overflow-hidden min-h-screen">
      <div className='absolute w-full z-[8] top-0 p-5 pt-36 md:px-20'>
        <div className='w-full h-full text-center text-white rounded-md border border-red-800 p-3 md:p-5 text-xs flex items-center justify-center'>
         <h5>Over the last 5 years, RoboRacer has enjoyed tremendous growth and community support. The organization has grown up and we are ready to go beyond just the 1/10th-scale vehicles for broader community-driven engagements. This includes new platform scales and more challenging competitions for a modern AI-enabled autonomy. Stay tuned as we migrate F1Tenth.org to RoboRacer.AI!</h5>
        </div>
      </div>

      <div className="landing-bg w-screen h-[90svh] flex items-center justify-center lg:px-[10svw] z-[6]">
          <img
            src="/logos/logo-black-vector-animated.svg"
            alt="Logo Gradient"
            className="w-full p-8"
          />
      </div>


        <h1 className='self-start mt-16'>Our Legendary <span className='tilted-highlight'>Roster.</span></h1>
      <img className='self-start' src='/logos/universities.png'/>

      <div id="mission" className="relative w-full flex flex-col justify-center items-center gap-5">
      <div className='w-full h-20'/>
      <div id="testimonies" className="relative w-full">
        <FloatingTestimonials />
      </div>

      <div className='w-full h-20'/>

      <GlobeView />

      <div className='w-full h-20'/>

      <h1 className='self-start mt-16'>Our <span className='tilted-highlight'>Building Blocks</span> under the hood.</h1>
      <div className="w-full flex flex-col gap-8 items-start justify-start">
        <h2 className="relative z-2" style={{color: "black", fontWeight: 500}}>The RoboRacer Program and Foundation Promote STEM Education</h2>
        <h4 className="relative z-2 -mt-6">We advance robotics and autonomous vehicle education through the following initiatives:</h4>

        <div className="relative z-2 w-full  mx-auto space-y-6 py-10">
          {sections.map((item, index) => (
            <div key={index} className="border-b border-slate-500 p-4 pt-1">
              <button
                className="w-full text-left cursor-pointer focus:outline-none flex justify-between items-center py-2"
                onClick={() => toggleSection(index)}
              >
                <h3>{item.title}</h3>
                <span className="hidden md:visible md:block pointer text-lg">{openIndex === index ? "▲" : "▼"}</span>
              </button>

              <motion.div
                className="overflow-hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={openIndex === index ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <p className="text-sm mt-2">{item.content}</p>
                {item.link && (
                  <a href={item.url} className="text-blue-400 text-sm underline block mt-2">
                    {item.link}
                  </a>
                )}
              </motion.div>
            </div>
          ))}
        </div>
      </div>
      </div>          
      <div id="join" className="relative w-full flex flex-col md:flex-row-reverse gap-8 justify-center items-center">
        <div>
          <h2>Simple. Fast. Open Source.</h2>
          <h4>Join the future of autonomous racing.</h4>
          <div className="flex flex-col bg-white rounded-md p-4 mt-4">
            <EmailSubscribeForm />
          </div>
        </div>
        <div>
          <img src="/landing/car-inside.png" alt="Car Image" width={400} height={300} />
        </div>
      </div>

    </div>
  );
}
