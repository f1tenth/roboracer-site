const Rules = () => {
  return (
    <div className="px-6 md:px-20 py-10">
      <h1 className="text-3xl md:text-5xl font-extrabold text-center mb-10">
        ROBORACER RULES
      </h1>

      {/* Scrollable Box for Rules */}
      <div className="bg-gray-100 p-6 rounded-lg shadow-md max-h-[70vh] overflow-y-auto whitespace-pre-wrap text-justify">
        {`
RULEBOOK – 26th ROBORACER AUTONOMOUS RACING COMPETITION

1. INTRODUCTION
The Roboracer competition is intended to foster innovation in autonomous driving...
[⚡ Paste your full rules content here exactly as it is ⚡]

2. VEHICLE REQUIREMENTS
- The Roboracer car must comply with the 1:10 scale baseline...
- Only official Roboracer hardware is allowed...

3. COMPETITION FORMAT
- Orientation
- Open Training
- Time Trials
- Head-to-Head Races
- Final Race & Awards

4. PENALTIES
- Collisions
- Track violations
- Time penalties

... (continue full content without removing anything)
        `}
      </div>
    </div>
  );
};

export default Rules;
