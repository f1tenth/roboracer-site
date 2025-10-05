import React from "react";

const Registration = () => {
  return (
    <div className="px-6 md:px-20 py-12 text-center">
      {/* Heading */}
      <h1 className="text-3xl md:text-4xl font-extrabold uppercase mb-6">
        Registration
      </h1>

      {/* Description */}
      <p className="text-gray-800 leading-relaxed max-w-3xl mx-auto mb-6">
        This competition is open for everyone of all levels, everyone is welcome
        to participate in this competition. A team can consist of multiple
        teammates. Teams with only one person are also allowed. Teams that take
        part in the in-person competition need to provide and build an Roboracer
        car by themselves.
        <br />
        <br />
        This Google form is for preliminary registration for the 26th Roboracer Competition at Techfest, IIT Bombay, including orientation and information sessions.
      </p>

      {/* Button */}
      <div className="mb-12">
        <a
          href="https://forms.gle/FdfY9sKXREdu772u6"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="px-6 py-2 border-2 border-black font-semibold uppercase tracking-wide hover:bg-black hover:text-white transition duration-300">
            Registration Open
          </button>
        </a>
      </div>

      {/* Separator */}
      <hr className="border-t border-gray-300 mb-10" />

     
      {/* Footer */}
      <footer className="text-sm text-gray-400">
        © Copyright 2025 Roboracer Foundation
      </footer>
    </div>
  );
};

export default Registration;
