import car from "./assets/car.png"
import lecture from "./assets/lecture.png"
import f1tenth from "./assets/f1tenth.gif"

const GettingStarted = () => {
  return (
    <div className="px-10 py-8">
      <h1 className="text-2xl font-bold mb-8">ROBORACER RESOURCES</h1>

      {/* Build Section */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-12">
        <div className="w-full md:w-1/3 flex justify-center">
          <img
            src={car}
            alt="Roboracer Car"
            className="w-72 object-contain"
          />
        </div>
        <div className="w-full md:w-2/3">
          <h2 className="font-bold mb-4">BUILD</h2>
          <p className="text-justify">
            We designed and maintain the Roboracer Autonomous Vehicle System, a
            powerful and versatile open-source platform for autonomous systems
            research and education on a 1:10 scale. This vehicle defines the
            baseline for the in-person competition and provides both sensors as
            well as enough computation power to run autonomous driving
            algorithms. If you want to take part in the in-person competition
            you have to bring your own Roboracer racecar. A detailed description
            on how to build the vehicle including videos and a step by step
            instruction can be found here:{" "}
            <a href="#" className="text-blue-600 underline">
              Roboracer Build Instructions
            </a>.
          </p>
        </div>
      </div>

      {/* Simulation Section */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-12">
        <div className="w-full md:w-2/3">
          <h2 className="font-bold mb-4">SIMULATION</h2>
          <p className="text-justify mb-4">
            Autonomous Driving needs heavy development in simulation to provide
            a good evaluation for the developed algorithms before we bring them
            on the car. We provide different simulation environments that can
            help you in your development. The{" "}
            <a href="#" className="text-blue-600 underline">
              Roboracer Gym
            </a>{" "}
            is an asynchronous, 2D simulator built in Python. This simulation
            runs faster than real-time execution (30x realtime), provides a
            realistic vehicle simulation and collision, runs multiple vehicle
            instances and publishes laser scan and odometry data. When it comes
            to a more close vehicle development we provide the{" "}
            <a href="#" className="text-blue-600 underline">
              Roboracer ROS Simulator
            </a>{" "}
            which is providing the ROS messages from the Roboracer car in a
            simulation environment.
          </p>
        </div>
        <div className="w-full md:w-1/3 flex justify-center">
          <div className="w-72 h-40 md:h-48 rounded-lg overflow-hidden shadow-lg flex items-center justify-center bg-black">
            <img
              src={f1tenth}
              alt="Roboracer Simulation GIF"
              className="w-full h-full object-cover"
              style={{ maxWidth: '100%', maxHeight: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Digital Twin Section */}
      <div className="mb-12">
        <h2 className="font-bold mb-4">DIGITAL TWIN</h2>
        <p className="text-justify">
          You can leverage the <a href="#" className="text-blue-600 underline">AutoDRIVE Simulator</a> to simulate high-fidelity 3D digital twin of the Roboracer racecar within any virtual racetrack in real-time. AutoDRIVE Simulator offers photorealistic graphics, and high-fidelity vehicle dynamics simulation along with physically accurate sensor and actuator models to bridge the gap between simulation and reality – the simulator holds a track-record of enabling zero-shot sim2real transfer of various autonomy algorithms. The simulator supports single as well as multi-agent racing scenarios including manual (human vs. human), autonomous (AI vs. AI) as well as mixed (human vs. AI) races. It offers various <a href="#" className="text-blue-600 underline">APIs</a> to flexibly develop autonomy algorithms and supports a range of <a href="#" className="text-blue-600 underline">HMIs</a> to observe and interact with the digital twins in real-time. This simulator will be used for the <a href="#" className="text-blue-600 underline">Roboracer Sim Racing League</a>, but you can also use it to prototype your autonomous racing algorithms before deploying them on the physical vehicles. The best part – AutoDRIVE Simulator is completely <a href="#" className="text-blue-600 underline">open-source</a> and can be customized to fit your R&D objectives beyond this competition!
        </p>
      </div>

      {/* Autonomous Racing Section */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-12">
        <div className="w-full md:w-1/3 flex justify-center">
          <img
            src={lecture}
            alt="Autonomous Racing Course"
            className="w-72 object-contain"
          />
        </div>
        <div className="w-full md:w-2/3">
          <h2 className="font-bold mb-4">AUTONOMOUS RACING</h2>
          <p className="text-justify">
            If you are new to the field of autonomous racing then we can provide some useful learning resources for you. The complete material from our Roboracer Penn course can be found online at <a href="#" className="text-blue-600 underline">Roboracer Learn</a>. This course provides lectures about autonomous driving foundations, includes tutorials about the Roboracer car and provides you with some insights in autonomous racing techniques e.g. raceline finding. In addition all lectures were recorded and can be found at the <a href="#" className="text-blue-600 underline">Roboracer Autonomous Racing Course</a> on Youtube.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-sm text-gray-400 mt-10 text-center">
        © Copyright 2025 Roboracer Foundation
      </footer>
    </div>
  )
}

export default GettingStarted
