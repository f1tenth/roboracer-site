"use client";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";

import PoppingParticles from "../components/PoppingParticles";
import FloatingTestimonials from "../components/FloatingTestimonials";

const sections = [
  {
    title: "Educational Materials Development",
    content:
      "We create teaching and training materials for university and K-12 courses covering robot perception, computer vision, localization, mapping, motion planning, and safe control. Over 90 universities, including the University of Pennsylvania, UC San Diego, Clemson University, and more, use these resources.",
    link: "Learn more",
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
  },
  {
    title: "Open-Source Contributions",
    content:
      "We develop and share open-source software and hardware designs to help anyone build autonomous robotic platforms.",
    link: "Explore resources",
  },
];

export default function Home() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  //prevent unnecessary re renders
  const memoizedParticles = useMemo(() => <PoppingParticles />, []);

  const toggleSection = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col items-center justify-center overflow-hidden min-h-screen bg-black text-white">
      <div className="big-blur fixed w-[100vw] h-[100vh] inset-0 pointer-events-none">
          {memoizedParticles}
      </div>
      <div id="landing" className="relative w-[100svw] h-[100svh]">
      <div className="absolute inset-0 bg-black bg-opacity-50 z-[5]"></div>
        <video 
        autoPlay 
        muted 
        loop
        playsInline 
        webkit-playsinline="true"
        disablePictureInPicture
         className="absolute w-full h-full object-cover">
          <source src="landing/f110_fpv.mp4" type="video/mp4"/>
        </video>
        <div className="absolute w-full h-full bg-opacity-50 flex items-center justify-center lg:px-[10svw] z-[6]">
          <img
            src="/logos/Logo_Gradient.gif"
            alt="Logo Gradient"
            className="w-full"
            width={200}
            height={50}
          />
        </div>
      </div>

      <div id="mission" className="relative w-full text-center responsive-padding pt-32">

        <h1 className="relative z-2">The RoboRacer Program and Foundation Promote STEM Education</h1>
        <h2 className="relative z-2">We advance robotics and autonomous vehicle education through the following initiatives:</h2>

        <div className="relative z-2 w-full max-w-lg mx-auto space-y-6 py-12">
          {sections.map((item, index) => (
            <div key={index} className="border-b border-gray-700 pb-4">
              <button
                className="w-full text-left focus:outline-none flex justify-between items-center py-2"
                onClick={() => toggleSection(index)}
              >
                <h2>{item.title}</h2>
                <span className="text-lg">{openIndex === index ? "▲" : "▼"}</span>
              </button>

              <motion.div
                className="overflow-hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={openIndex === index ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <p className="text-sm mt-2">{item.content}</p>
                {item.link && (
                  <a href="#" className="text-blue-400 text-sm underline block mt-2">
                    {item.link}
                  </a>
                )}
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      <div id="join" className="relative w-full flex flex-col md:flex-row-reverse gap-8 justify-center items-center responsive-padding">
        <div>
          <h2>Simple. Fast. Open Source.</h2>
          <h4>Join the future of autonomous racing.</h4>
          <div className="flex flex-col bg-blue-200 rounded-md p-4 mt-4">
            <input type="text" placeholder="Enter your email" className="p-2 rounded-md mb-2" />
          </div>
        </div>
        <div>
          <img src="/landing/car-inside.png" alt="Car Image" width={400} height={300} />
        </div>
      </div>

      <div id="testimonies" className="relative w-full">
        <FloatingTestimonials />
      </div>
    </div>
  );
}
