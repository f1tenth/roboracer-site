// Lazy chunk: everything that pulls three.js/R3F for the landing chapter
// lives here so the hero never waits for it (design system: ExplodedModel).
import { Suspense, useRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { ACESFilmicToneMapping, type Group } from "three";
import { RacecarAssemblyParts } from "../RacecarAssembly";

type ExplodedModelSceneProps = {
  /** Scroll-driven explosion amount, 1 scattered -> 0 assembled. */
  explosionRef: RefObject<number>;
  /** Render one assembled frame and stop (reduced motion). */
  staticPose?: boolean;
};

function SpinGroup({
  explosionRef,
  children,
}: {
  explosionRef: RefObject<number>;
  children: React.ReactNode;
}) {
  const spin = useRef<Group>(null);
  useFrame((_, delta) => {
    if (!spin.current) return;
    // Slow rotation fades in as the car assembles (explosion -> 0).
    spin.current.rotation.y += delta * 0.3 * (1 - explosionRef.current);
  });
  return <group ref={spin}>{children}</group>;
}

export default function ExplodedModelScene({ explosionRef, staticPose = false }: ExplodedModelSceneProps) {
  const zeroRef = useRef(0);
  return (
    <Canvas
      camera={{ fov: 42, near: 0.01, far: 30, position: [1.12, 0.66, 1.12] }}
      dpr={[1, 1.5]}
      frameloop={staticPose ? "demand" : "always"}
      gl={{ antialias: true, alpha: true, toneMapping: ACESFilmicToneMapping }}
      onCreated={({ camera }) => camera.lookAt(0, 0.05, 0)}
      aria-hidden="true"
    >
      <ambientLight intensity={0.72} />
      <hemisphereLight args={["#d9fbff", "#13131a", 1.45]} />
      <directionalLight color="#dbfbff" intensity={3.2} position={[1.2, 1.7, 0.8]} />
      <spotLight color="#7057ff" intensity={12} angle={0.42} penumbra={0.8} position={[-1, 1.3, -1]} />
      <Suspense fallback={null}>
        {staticPose ? (
          <RacecarAssemblyParts explosion={0} explosionRef={zeroRef} interactive={false} />
        ) : (
          <SpinGroup explosionRef={explosionRef}>
            <RacecarAssemblyParts explosion={1} explosionRef={explosionRef} interactive={false} />
          </SpinGroup>
        )}
        <ContactShadows position={[0, -0.003, 0]} opacity={0.4} scale={2.2} blur={2.5} far={1.2} resolution={512} />
      </Suspense>
    </Canvas>
  );
}
