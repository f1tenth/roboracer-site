import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { type ISourceOptions, MoveDirection, OutMode } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

export default function PoppingParticles() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: { color: { value: "transparent" } },
      fpsLimit: 120,
      interactivity: {
        events: {
          onClick: { enable: true, mode: "push" },
          onHover: { enable: true, mode: "repulse" },
        },
        modes: {
          push: { quantity: 4 },
          repulse: { distance: 100, duration: 0.4 },
          attract: {
            distance: 400, 
            duration: 0.6,
            speed: 2,
          },
        },
      },
      particles: {
        color: { value: ["#FC00FF", "#00D1DA"] },
        move: {
          enable: true,
          speed: 2,
          direction: MoveDirection.none,
          random: false,
          straight: false,
          outModes: { default: OutMode.out },
          attract: { enable: true, rotate: { x: 1200, y: 1200 } },
        },
        number: { value: 10, density: { enable: true, area: 800 } },
        opacity: { value: 0.5, anim: { enable: true, speed: 0.5, minimumValue: 0.3, sync: false } },
        shape: { type: "circle" },
        links: {enable: true, distance: 100, color: "#FC00FF", opacity: 0.4, width: 60},
        size: {
          value: { min: 20, max: 200 },
          anim: { enable: true, speed: 1, minimumValue: 0.3, sync: false },
        },
        collisions: { enable: true },
        repulse: { enable: true, distance: 50 }, 
        detectRetina: true,
      },
    }),
    []
  );
  
  return (
    <>
      {init && (
        <Particles
          id="tsparticles"
          options={options}
          className="absolute inset-0 z-[0] w-full h-full"
        />
      )}
    </>
  );
}
