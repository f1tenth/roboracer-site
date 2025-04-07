"use client";
import { useEffect, useRef, useState } from "react";

interface TestimonialProps {
  author: string;
  institution: string;
  quote: string;
  image: string;
}

export default function FloatingTestimonials() {
  const [testimonials, setTestimonials] = useState<TestimonialProps[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollInterval = useRef<number | null>(null); // Use 'number' instead of 'NodeJS.Timeout'

  useEffect(() => {
    fetch("/data/testimonies.json")
      .then((res) => res.json())
      .then((data) => setTestimonials(data))
      .catch((err) => console.error("Error loading testimonials:", err));
  }, []);

  useEffect(() => {
    if (!scrollContainerRef.current || testimonials.length === 0) return;

    let index = 0;
    const container = scrollContainerRef.current;

    const scrollTestimonials = () => {
      if (!container) return;
      const items = container.children;
      if (items.length === 0) return;

      index = (index + 1) % items.length;
      const nextItem = items[index] as HTMLElement;
      
      container.scrollTo({
        left: nextItem.offsetLeft,
        behavior: "smooth"
      });
    };

    scrollInterval.current = window.setInterval(scrollTestimonials, 4000); // Correct type for browser

    return () => {
      if (scrollInterval.current !== null) clearInterval(scrollInterval.current);
    };
  }, [testimonials]);

  return (
    <div className="w-full flex flex-col gap-10 items-start py-12 scrollbar-hide">
      <h1>Hear Their <span className='tilted-highlight'>Voices.</span></h1>
      <div
        ref={scrollContainerRef}
        className="w-full overflow-x-auto  flex gap-16 p-4 snap-x snap-mandatory scrollbar-hide scroll-smooth"
        style={{ scrollBehavior: "smooth", display: "flex", overflowX: "scroll", scrollSnapType: "x mandatory" }}
      >
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="bg-[url('/landing/testimony-outline.png')] bg-contain bg-no-repeat bg-[position:top_-55px__left_-40px] relative flex-shrink-0 w-140 h-110 p-16 rounded-lg shadow-md shadow-inner-lg snap-center"
          >
            <p className='h-60 overflow-y-scroll scrollbar-hide'>{testimonial.quote}</p>
            <div className="absolute w-[100%] left-5 bottom-0 p-4 pb-6 flex justify-between items-end">
              <div>
                <h3 style={{fontSize: "3rem", fontWeight: 700}}>{testimonial.author}</h3>
                <p className="text-slate-500">{testimonial.institution}</p>
              </div>
              <img
                src={testimonial.image}
                alt={testimonial.author}
                className="w-36 h-36 rounded-full mr-4 object-cover shadow-md"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
