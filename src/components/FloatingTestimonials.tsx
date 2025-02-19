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
    <div className="w-full flex flex-col items-center py-12 scrollbar-hide">
      <h1 className="text-3xl font-bold mb-6">From Our Community</h1>
      <div
        ref={scrollContainerRef}
        className="w-full max-w-5xl overflow-x-auto flex gap-4 px-4 snap-x snap-mandatory scrollbar-hide scroll-smooth"
        style={{ scrollBehavior: "smooth", display: "flex", overflowX: "scroll", scrollSnapType: "x mandatory" }}
      >
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-80 p-6  rounded-lg shadow-lg snap-center"
          >
            <p>{testimonial.quote}</p>
            <div className="mt-4 flex items-center">
              <img
                src={testimonial.image}
                alt={testimonial.author}
                className="w-12 h-12 rounded-full mr-4 object-cover"
              />
              <div>
                <h4>{testimonial.author}</h4>
                <p className="text-slate-200">{testimonial.institution}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
