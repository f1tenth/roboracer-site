import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { Canvas, type ThreeEvent, useFrame, useLoader, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Grid, Html, OrbitControls, useGLTF } from "@react-three/drei";
import {
  ACESFilmicToneMapping,
  Color,
  Euler,
  MathUtils,
  Mesh,
  type EulerOrder,
  type Group,
  type Material,
  type Object3D,
  Vector3,
} from "three";
import { STLLoader, type GLTF, type OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  RACECAR_PARTS,
  type RacecarPart,
  type RacecarPartId,
  type VectorTuple,
} from "./racecarAssemblyData";
import {
  FINISH,
  HIGHLIGHT_EMISSIVE,
  HIGHLIGHT_INTENSITY,
  overridePartMaterial,
} from "./racecarMaterials";

const glbAssets = RACECAR_PARTS.filter((part) => part.format === "glb").map(
  (part) => part.asset,
);

glbAssets.forEach((asset) => useGLTF.preload(asset));

// URDF `rpy` is a fixed-axis roll, pitch, yaw (R = Rz * Ry * Rx). three.js
// Euler order "ZYX" is that same matrix; the default "XYZ" is not
// (docs/design/CAR_CHAPTER.md, transform chain).
const URDF_EULER_ORDER: EulerOrder = "ZYX";
const NO_ROTATION: [number, number, number, EulerOrder] = [0, 0, 0, URDF_EULER_ORDER];

type ViewerMaterial = Material & {
  emissive?: Color;
  emissiveIntensity?: number;
  wireframe?: boolean;
};

function cloneScene(scene: Object3D, partId: RacecarPartId) {
  const clone = scene.clone(true);

  clone.traverse((child) => {
    const mesh = child as Mesh;
    if (!mesh.isMesh) return;

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const clonedMaterials = materials.map((material) => {
      const cloned = overridePartMaterial(partId, material) as ViewerMaterial;
      if (cloned.emissive) {
        cloned.userData.viewerEmissive = cloned.emissive.clone();
        cloned.userData.viewerEmissiveIntensity = cloned.emissiveIntensity ?? 1;
      }
      return cloned;
    });
    mesh.material = Array.isArray(mesh.material) ? clonedMaterials : clonedMaterials[0];
  });

  return clone;
}

function updateSceneAppearance(
  scene: Object3D,
  isActive: boolean,
  isHovered: boolean,
  wireframe: boolean,
) {
  scene.traverse((child) => {
    const mesh = child as Mesh;
    if (!mesh.isMesh) return;

    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((material) => {
      const viewerMaterial = material as ViewerMaterial;
      viewerMaterial.wireframe = wireframe;
      if (!viewerMaterial.emissive) return;

      if (isActive || isHovered) {
        // Subtle brightness lift only - never a hue change.
        viewerMaterial.emissive.set(HIGHLIGHT_EMISSIVE);
        viewerMaterial.emissiveIntensity = isActive
          ? HIGHLIGHT_INTENSITY.selected
          : HIGHLIGHT_INTENSITY.hover;
      } else {
        const original = viewerMaterial.userData.viewerEmissive as Color | undefined;
        viewerMaterial.emissive.copy(original ?? new Color("#000000"));
        viewerMaterial.emissiveIntensity =
          (viewerMaterial.userData.viewerEmissiveIntensity as number | undefined) ?? 1;
      }
      viewerMaterial.needsUpdate = true;
    });
  });
}

type ModelGeometryProps = {
  part: RacecarPart;
  selected: boolean;
  hovered: boolean;
  wireframe: boolean;
};

function GlbGeometry({ part, selected, hovered, wireframe }: ModelGeometryProps) {
  const gltf = useGLTF(part.asset) as GLTF;
  const scene = useMemo(() => cloneScene(gltf.scene, part.id), [gltf.scene, part.id]);
  const rotation = useMemo<[number, number, number, EulerOrder]>(
    () => (part.rotation ? [...part.rotation, URDF_EULER_ORDER] : NO_ROTATION),
    [part.rotation],
  );

  useEffect(() => {
    updateSceneAppearance(scene, selected, hovered, wireframe);
  }, [hovered, scene, selected, wireframe]);

  return <primitive object={scene} rotation={rotation} />;
}

function StlGeometry({ part, selected, hovered, wireframe }: ModelGeometryProps) {
  const geometry = useLoader(STLLoader, part.asset);

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        color={FINISH.graphite.color}
        emissive={HIGHLIGHT_EMISSIVE}
        emissiveIntensity={
          selected ? HIGHLIGHT_INTENSITY.selected : hovered ? HIGHLIGHT_INTENSITY.hover : 0
        }
        envMapIntensity={FINISH.graphite.envMapIntensity}
        metalness={FINISH.graphite.metalness}
        roughness={FINISH.graphite.roughness}
        wireframe={wireframe}
      />
    </mesh>
  );
}

type ExplodedPartProps = {
  part: RacecarPart;
  explosion: number;
  /** When set, overrides `explosion` every frame without re-rendering React
   * (scroll-driven landing chapter). */
  explosionRef?: RefObject<number>;
  visible: boolean;
  labelsVisible: boolean;
  selected: boolean;
  wireframe: boolean;
  /** Pointer selection/hover; the landing chapter turns this off. */
  interactive?: boolean;
  onSelect: (part: RacecarPartId) => void;
};

function ExplodedPart({
  part,
  explosion,
  explosionRef,
  visible,
  labelsVisible,
  selected,
  wireframe,
  interactive = true,
  onSelect,
}: ExplodedPartProps) {
  const group = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const target = useMemo(() => new Vector3(), []);
  const initialExplosion = useMemo(
    () => explosionRef?.current ?? explosion,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount pose only
    [],
  );
  const initialPosition = useMemo<VectorTuple>(
    () => [
      part.position[0] + part.explosion[0] * initialExplosion,
      part.position[1] + part.explosion[1] * initialExplosion,
      part.position[2] + part.explosion[2] * initialExplosion,
    ],
    [part, initialExplosion],
  );

  useEffect(() => {
    if (!hovered) return;
    const previousCursor = document.body.style.cursor;
    document.body.style.cursor = "pointer";
    return () => {
      document.body.style.cursor = previousCursor;
    };
  }, [hovered]);

  useFrame((_, delta) => {
    if (!group.current) return;
    const amount = explosionRef ? explosionRef.current : explosion;
    target.set(
      part.position[0] + part.explosion[0] * amount,
      part.position[1] + part.explosion[1] * amount,
      part.position[2] + part.explosion[2] * amount,
    );
    group.current.position.lerp(target, 1 - Math.exp(-11 * delta));
  });

  const handleSelect = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(part.id);
  };

  return (
    <group
      ref={group}
      name={part.id}
      position={initialPosition}
      visible={visible}
      onClick={interactive ? handleSelect : undefined}
      onPointerEnter={
        interactive
          ? (event) => {
              event.stopPropagation();
              setHovered(true);
            }
          : undefined
      }
      onPointerLeave={interactive ? () => setHovered(false) : undefined}
    >
      {part.format === "glb" ? (
        <GlbGeometry
          part={part}
          selected={selected}
          hovered={hovered}
          wireframe={wireframe}
        />
      ) : (
        <StlGeometry
          part={part}
          selected={selected}
          hovered={hovered}
          wireframe={wireframe}
        />
      )}

      {labelsVisible && explosion > 0.08 && (
        <Html position={[0, 0, 0.085]} center distanceFactor={0.75} zIndexRange={[20, 0]}>
          <div className={`assembly-label ${selected ? "is-selected" : ""}`}>
            <span style={{ backgroundColor: part.color }} />
            {part.name}
          </div>
        </Html>
      )}
    </group>
  );
}

type CameraControllerProps = {
  autoRotate: boolean;
  resetKey: number;
};

// /assembly opens on the same long lens as the landing chapter (30 degrees);
// the orbit distances are scaled from the old 38 degree setup so the car
// frames identically.
const VIEWER_FOV = 30;
const VIEWER_HOME = new Vector3(1.19, 0.8, 1.19);
const VIEWER_TARGET = new Vector3(-0.015, 0.09, 0);

function CameraController({ autoRotate, resetKey }: CameraControllerProps) {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();

  useEffect(() => {
    camera.position.copy(VIEWER_HOME);
    camera.up.set(0, 1, 0);
    controls.current?.target.copy(VIEWER_TARGET);
    controls.current?.update();
  }, [camera, resetKey]);

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      autoRotate={autoRotate}
      autoRotateSpeed={0.7}
      enableDamping
      dampingFactor={0.06}
      enablePan={false}
      minDistance={0.54}
      maxDistance={3.2}
      minPolarAngle={0.12}
      maxPolarAngle={Math.PI * 0.49}
      target={VIEWER_TARGET.toArray() as VectorTuple}
    />
  );
}

function SceneReady({ onReady }: { onReady: () => void }) {
  useEffect(onReady, [onReady]);
  return null;
}

/** Neutral three-point substitute used while the studio HDR loads or when it
 * cannot load at all (offline). Keeps the car readable, never black. */
function NeutralStudioLights() {
  return (
    <>
      <ambientLight intensity={0.85} />
      <directionalLight intensity={2.4} position={[1.6, 2.2, 1.2]} />
      <directionalLight intensity={1.0} position={[-1.8, 1.2, -1.4]} />
    </>
  );
}

type EnvironmentBoundaryProps = { children: ReactNode };

class EnvironmentBoundary extends Component<EnvironmentBoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("Studio environment unavailable, using neutral lights", error);
  }

  render() {
    return this.state.failed ? <NeutralStudioLights /> : this.props.children;
  }
}

/**
 * Studio image-based lighting shared by both racecar canvases (the /assembly
 * viewer and the landing ExplodedModel chapter). Poly Haven's CC0 1k studio
 * HDRs all exceed the 1.5 MB git budget (checked 2026-08-21: 1.51-1.69 MB),
 * so no binary is committed; drei's `preset="studio"` runtime fetch is used
 * instead, with neutral lights while loading and if the fetch fails.
 * Lighting-only: no `background` prop, so the landing canvas stays
 * alpha-transparent over ink-950.
 */
// The studio HDR is turned so its big softbox is not in the mirror direction
// of the car's flat decks as seen from the front-right three-quarter camera
// (azimuth 45): at 0 the plates mirrored it and read as light grey whatever
// their albedo; at -90 degrees they read as dark satin and the aluminum still
// catches the light (measured in the live chapter, docs/design/CAR_CHAPTER.md).
const STUDIO_ROTATION = new Euler(0, -Math.PI / 2, 0);

export function StudioLighting({ intensity = 0.9 }: { intensity?: number }) {
  return (
    <EnvironmentBoundary>
      <Suspense fallback={<NeutralStudioLights />}>
        <Environment
          preset="studio"
          environmentIntensity={intensity}
          environmentRotation={STUDIO_ROTATION}
        />
      </Suspense>
    </EnvironmentBoundary>
  );
}

/** World position of a light `distance` meters away at an azimuth in the
 * ground plane (0 = car front, 90 = car right) and an elevation above it. */
function lightPosition(azimuthDeg: number, elevationDeg: number, distance: number): VectorTuple {
  const az = MathUtils.degToRad(azimuthDeg);
  const el = MathUtils.degToRad(elevationDeg);
  return [
    distance * Math.cos(el) * Math.cos(az),
    distance * Math.sin(el),
    distance * Math.cos(el) * Math.sin(az),
  ];
}

type ProductLightingProps = {
  /** Studio IBL strength. */
  environment?: number;
  /** Key directional strength (35 degrees elevation, soft shadow). */
  keyIntensity?: number;
  /** Rim from behind-left of the three-quarter view, white. */
  rimIntensity?: number;
  shadowMapSize?: number;
  /** Half extent (meters) of the key light's shadow frustum. */
  shadowExtent?: number;
};

/**
 * The product-render light rig shared by /assembly and the landing chapter
 * (landing-v3 section 4): studio IBL, one key directional at 35 degrees
 * elevation casting a soft shadow, one white rim from behind-left at 0.6. No
 * fog, no colored lights. Both canvases sit the camera at azimuth 45 degrees
 * (front-right three-quarter), so the key comes from the camera's left-front
 * (azimuth 85) and the rim from behind-left (azimuth 180, the car's rear).
 */
export function ProductLighting({
  environment = 0.5,
  // Physically-sized lights: next to the studio HDR (radiance in the units
  // digits), a key below ~4 leaves no visible shape or shadow.
  keyIntensity = 5,
  rimIntensity = 2,
  shadowMapSize = 2048,
  shadowExtent = 0.6,
}: ProductLightingProps) {
  const key = useMemo(() => lightPosition(85, 35, 3), []);
  const rim = useMemo(() => lightPosition(180, 28, 3), []);
  return (
    <>
      <StudioLighting intensity={environment} />
      <directionalLight
        castShadow
        color="#ffffff"
        intensity={keyIntensity}
        position={key}
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
        shadow-bias={-0.00015}
        shadow-normalBias={0.004}
        shadow-camera-left={-shadowExtent}
        shadow-camera-right={shadowExtent}
        shadow-camera-top={shadowExtent}
        shadow-camera-bottom={-shadowExtent}
        shadow-camera-near={0.5}
        shadow-camera-far={6}
      />
      <directionalLight color="#ffffff" intensity={rimIntensity} position={rim} />
    </>
  );
}

type RacecarAssemblyPartsProps = {
  explosion: number;
  explosionRef?: RefObject<number>;
  hiddenParts?: ReadonlySet<RacecarPartId>;
  labelsVisible?: boolean;
  selectedPart?: RacecarPartId | null;
  wireframe?: boolean;
  interactive?: boolean;
  groupRef?: RefObject<Group | null>;
  onSelect?: (part: RacecarPartId | null) => void;
};

/**
 * The one shared assembly scene graph (design system: "do not build a second
 * loader"). /assembly renders it inside RacecarAssemblyCanvas with full
 * controls; the landing ExplodedModel chapter renders it in its own light
 * canvas with a scroll-driven explosionRef.
 */
export function RacecarAssemblyParts({
  explosion,
  explosionRef,
  hiddenParts,
  labelsVisible = false,
  selectedPart = null,
  wireframe = false,
  interactive = true,
  groupRef,
  onSelect,
}: RacecarAssemblyPartsProps) {
  return (
    <group ref={groupRef} name="f1tenth_xacro_assembly" rotation={[-Math.PI / 2, 0, 0]}>
      {RACECAR_PARTS.map((part) => (
        <ExplodedPart
          key={part.id}
          part={part}
          explosion={explosion}
          explosionRef={explosionRef}
          visible={!hiddenParts?.has(part.id)}
          labelsVisible={labelsVisible}
          selected={selectedPart === part.id}
          wireframe={wireframe}
          interactive={interactive}
          onSelect={onSelect ?? (() => {})}
        />
      ))}
    </group>
  );
}

type RacecarAssemblyCanvasProps = {
  explosion: number;
  hiddenParts: ReadonlySet<RacecarPartId>;
  labelsVisible: boolean;
  selectedPart: RacecarPartId | null;
  wireframe: boolean;
  autoRotate: boolean;
  resetKey: number;
  assemblyRef: RefObject<Group | null>;
  onReady: () => void;
  onSelect: (part: RacecarPartId | null) => void;
};

export function RacecarAssemblyCanvas({
  explosion,
  hiddenParts,
  labelsVisible,
  selectedPart,
  wireframe,
  autoRotate,
  resetKey,
  assemblyRef,
  onReady,
  onSelect,
}: RacecarAssemblyCanvasProps) {
  return (
    <Canvas
      className="assembly-canvas"
      camera={{ fov: VIEWER_FOV, near: 0.01, far: 30, position: VIEWER_HOME.toArray() }}
      dpr={[1, 1.75]}
      shadows="soft"
      gl={{ antialias: true, toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.15 }}
      onPointerMissed={() => onSelect(null)}
    >
      <color attach="background" args={["#f3f4f8"]} />
      {/* Same rig as the landing chapter; the full 0-1 explosion range needs
          a wider shadow frustum. */}
      <ProductLighting shadowExtent={0.85} />

      <Suspense fallback={null}>
        <RacecarAssemblyParts
          explosion={explosion}
          hiddenParts={hiddenParts}
          labelsVisible={labelsVisible}
          selectedPart={selectedPart}
          wireframe={wireframe}
          groupRef={assemblyRef}
          onSelect={onSelect}
        />
        <SceneReady onReady={onReady} />
      </Suspense>

      <ContactShadows
        position={[0, -0.003, 0]}
        opacity={0.55}
        scale={2.4}
        blur={2.4}
        far={1.2}
        resolution={512}
      />
      <Grid
        position={[0, -0.006, 0]}
        args={[3, 3]}
        cellSize={0.075}
        cellThickness={0.55}
        cellColor="#dcdfe8"
        sectionSize={0.3}
        sectionThickness={0.9}
        sectionColor="#ced2de"
        fadeDistance={2.2}
        fadeStrength={1.5}
        infiniteGrid
      />
      <CameraController autoRotate={autoRotate} resetKey={resetKey} />
    </Canvas>
  );
}
