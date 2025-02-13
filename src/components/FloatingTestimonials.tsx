"use client";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

// Import testimonials JSON (Replace with actual file path if needed)
const testimonials = [
  {
    name: "Rosa Zheng",
    role: "Lehigh University",
    testimonial:
      "I learned the subject entirely from RoboRacer and I created a new course in my department following the RoboRacer course materials.",
    image: "/testimonials/Rosa Zheng.jpeg",
  },
  {
    name: "Kunal R Nalamwar",
    role: "The University of Texas at Austin",
    testimonial:
      "I took RoboRacer Autonomous Robots course at UT Austin and I highly recommend it for anyone entering autonomous vehicles.",
    image: "/crew/Nalamwar.png",
  },
  {
    name: "Samarth Kalluraya",
    role: "PhD in WashU",
    testimonial:
      "The RoboRacer course at UPenn was one of the best. Implementing motion planning and debugging real-world issues was invaluable.",
    image: "/crew/Kalluraya.jpeg",
  },
  {
    name: "William Hoganson",
    role: "MS Robotics’23",
    testimonial:
      "RoboRacer was by far the most fun class I’ve taken at Penn! The combination of labs and racing made it super exciting.",
    image: "/crew/WilliamHoganson.jpg",
  },
];

const generateDummyTestimonials = (count: number) => {
  const dummyData = [...testimonials];
  for (let i = 0; i < count; i++) {
    dummyData.push({
      name: `User ${i + 1}`,
      role: "Autonomous Robotics Enthusiast",
      testimonial: `This is a fantastic experience in autonomous racing. Truly remarkable! - ${i + 1}`,
      image: "/crew/avatar.svg",
    });
  }
  return dummyData;
};

const fullTestimonials = generateDummyTestimonials(12);

export default function FloatingTestimonials() {
  const [rows, setRows] = useState<{ name: string; role: string; testimonial: string; image: string; }[][]>([[], [], []]);

  useEffect(() => {
    const row1 = fullTestimonials.filter((_, i) => i % 3 === 0);
    const row2 = fullTestimonials.filter((_, i) => i % 3 === 1);
    const row3 = fullTestimonials.filter((_, i) => i % 3 === 2);
    setRows([row1, row2, row3]);
  }, []);

  return (
    <div className="relative w-full flex flex-col gap-2 overflow-hidden py-12">
      {rows.map((row, index) => (
        <motion.div
          key={index}
          className="flex space-x-6"
          initial={{ x: index % 2 === 0 ? "100%" : "-100%" }}
          animate={{ x: index % 2 === 0 ? "-100%" : "100%" }}
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
            duration: 40 + index * 5,
          }}
        >
          {row.map((testimonial, i) => (
            <motion.div
              key={i}
              className="p-6 border border-gray-700 bg-gray-900 rounded-lg shadow-lg min-w-[300px] max-w-[350px] flex-shrink-0"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-gray-300">{testimonial.testimonial}</p>
              <div className="mt-4 flex items-center">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  width={100}
                    height={100}
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
                <div>
                  <h4 className="text-white font-semibold">{testimonial.name}</h4>
                  <p className="text-gray-400 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ))}
    </div>
  );
}
