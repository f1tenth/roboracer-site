import React from "react";
import { Link } from "react-router-dom";

const Resources = () => {
  return (
    <div className="px-10 py-12 text-center">
      <h1 className="text-3xl font-extrabold mb-6">
        26th ROBORACER RACE RESOURCES
      </h1>
      <p className="mb-8 max-w-2xl mx-auto text-gray-700">
        All necessary information about the race e.g. rules, scoring system,
        simulation environments and track data will be displayed here.
      </p>

      <ul className="space-y-4">
        <li>
          <Link
            to="/rules"
            className="text-blue-600 underline hover:text-blue-800"
          >
            Rules
          </Link>
        </li>
        <li>
          <a
            href="https://example.com/orientation-session.pptx"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            Orientation Session
          </a>
        </li>
      </ul>
    </div>
  );
};

export default Resources;
