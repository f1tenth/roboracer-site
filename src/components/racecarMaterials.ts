// Product-render material overrides for the shared racecar scene graph
// (RacecarAssemblyParts). One mapping serves both the landing ExplodedModel
// chapter and /assembly. Direction (landing-v3, 2026-08-21): neutral studio
// finishes only - satin decks, brushed aluminum hardware, rubber, and the
// LiDAR's real sensor colors. No purple, no emissive neon, and no flat grey
// multiplier: tone is controlled per material through `envMapIntensity`,
// metalness and roughness (docs/design/CAR_CHAPTER.md). The one colored part
// is the accent plate (landing-v4 section 4, Cedric's third accent exception
// after the headline gradient and the map): anodized cyan, or magenta.
import { Color, MeshStandardMaterial, type Material } from "three";
import type { RacecarPartId } from "./racecarAssemblyData";

export type Finish = {
  color: string;
  metalness: number;
  roughness: number;
  /** Studio IBL reflectance: decks 0.5, aluminum 1.2 (landing-v3 section 4). */
  envMapIntensity: number;
};

/** A finish with a clearcoat layer (MeshPhysicalMaterial). */
export type PhysicalFinish = Finish & {
  clearcoat: number;
  clearcoatRoughness: number;
};

export type AccentVariant = "cyan" | "magenta";

/** Committed default for the accent plate; the director picks from the
 * captures (`docs/qa/landing-v4/b-plate-cyan.png`, `b-plate-magenta.png`). */
export const ACCENT_VARIANT: AccentVariant = "cyan";

/** Anodized finish of the STL accent plate (the upper deck the sim tints per
 * agent). Same finish for both hues; only the base color differs. */
export const ACCENT_FINISH: Readonly<Record<AccentVariant, PhysicalFinish>> = {
  cyan: {
    color: "#00d1da",
    metalness: 0.55,
    roughness: 0.32,
    envMapIntensity: 0.9,
    clearcoat: 0.3,
    clearcoatRoughness: 0.25,
  },
  magenta: {
    color: "#fc00ff",
    metalness: 0.55,
    roughness: 0.32,
    envMapIntensity: 0.9,
    clearcoat: 0.3,
    clearcoatRoughness: 0.25,
  },
};

/** The accent variant to render. In development only, `?carAccent=magenta`
 * (or `cyan`) overrides the committed default so both can be captured without
 * an edit; Vite compiles the branch out of production bundles. */
export function resolveAccentVariant(): AccentVariant {
  if (import.meta.env.DEV && typeof window !== "undefined") {
    const requested = new URLSearchParams(window.location.search).get("carAccent");
    if (requested === "cyan" || requested === "magenta") return requested;
  }
  return ACCENT_VARIANT;
}

/** Named finishes; racecarAssemblyData label dots reuse these tones. */
export const FINISH = {
  /** Anodized aluminum compute case on the upper deck. */
  caseAluminum: { color: "#8c9198", metalness: 0.8, roughness: 0.42, envMapIntensity: 0.8 },
  /** Lower deck plate: dark anodized, satin. Flat plates seen at a grazing
   * angle Fresnel-reflect the studio ceiling, so the IBL term is kept low. */
  deck: { color: "#22252b", metalness: 0.12, roughness: 0.68, envMapIntensity: 0.16 },
  /** Black structural plastic and housings (bumper, mounts, battery tray). */
  plastic: { color: "#15171c", metalness: 0.05, roughness: 0.74, envMapIntensity: 0.2 },
  /** Brushed aluminum - wheel hubs, standoffs, shock bodies, hardware. */
  aluminum: { color: "#b4b9c1", metalness: 0.9, roughness: 0.35, envMapIntensity: 1.2 },
  /** Polished steel pins and fasteners. */
  steel: { color: "#a6abb4", metalness: 0.95, roughness: 0.28, envMapIntensity: 1.2 },
  /** Brass header pins. */
  brass: { color: "#8f7640", metalness: 0.9, roughness: 0.38, envMapIntensity: 1.0 },
  /** Tire rubber. */
  rubber: { color: "#131316", metalness: 0, roughness: 0.9, envMapIntensity: 0.3 },
  /** Light grey connector plastic. */
  connector: { color: "#9aa0a8", metalness: 0, roughness: 0.7, envMapIntensity: 0.5 },
  /** Electronics tones, muted from the source's toy-plastic saturation
   * (motor can and driveline blue, connector green, switch red). */
  slate: { color: "#262b3d", metalness: 0.2, roughness: 0.5, envMapIntensity: 0.5 },
  pcb: { color: "#2e4a34", metalness: 0.1, roughness: 0.6, envMapIntensity: 0.5 },
  oxide: { color: "#8a4a42", metalness: 0.05, roughness: 0.6, envMapIntensity: 0.5 },
  /** Status LEDs, unlit. */
  lampGreen: { color: "#2a3a2c", metalness: 0, roughness: 0.4, envMapIntensity: 0.6 },
  lampAmber: { color: "#5f592a", metalness: 0, roughness: 0.4, envMapIntensity: 0.6 },
  /** Hokuyo-style blue-black sensor housing. */
  lidarBody: { color: "#10141f", metalness: 0.15, roughness: 0.45, envMapIntensity: 0.6 },
  /** Sensor base and cap plastic. */
  lidarBase: { color: "#17191f", metalness: 0.2, roughness: 0.55, envMapIntensity: 0.5 },
  /** The amber optical window band; glossier than the housing. Stays amber
   * whatever the accent variant (landing-v4 section 4). */
  lidarWindow: { color: "#e8641b", metalness: 0.1, roughness: 0.28, envMapIntensity: 0.9 },
} satisfies Record<string, Finish>;

/**
 * Chassis material names come from the source mesh
 * (f1tenth_gym_ros/meshes/roboracer_chassis.glb, inspected 2026-08-21; what
 * each one covers was read off its vertex bounds, see
 * docs/design/CAR_CHAPTER.md). The site copy is re-exported with
 * `--palette false` so these names survive meshopt compression and each one
 * gets its own finish.
 */
const CHASSIS_FINISH: Readonly<Record<string, Finish>> = {
  // Verified with a flat-color debug render (2026-08-21): the upper platform
  // deck is NOT in this mesh, it is the accent STL (ACCENT_FINISH).
  chassis_gray: FINISH.deck, // lower deck plate
  metal: FINISH.caseAluminum, // aluminum box at the rear of the upper deck (the ESC) and the deck's front edge
  black: FINISH.plastic, // chassis tub, arms, towers, bumper frame
  black_002: FINISH.plastic, // housing on the upper deck
  gray_001: FINISH.plastic, // small top plate (the compute module)
  bumper: FINISH.plastic, // front bumper
  metal_001: FINISH.aluminum, // small hardware on the upper deck
  standoff: FINISH.aluminum, // deck standoffs
  silver: FINISH.steel, // small plate at the left
  gold_pin_001: FINISH.brass, // pin header
  white_connector: FINISH.steel, // shock springs
  motor_blue: FINISH.slate,
  green_connector: FINISH.pcb,
  red_switch: FINISH.oxide,
  green_light_001: FINISH.lampGreen,
  yellow_light_001: FINISH.lampAmber,
};

/** Subtle brightness lift for hover/selected states - a small white emissive,
 * never a hue change. */
export const HIGHLIGHT_EMISSIVE = "#ffffff";
export const HIGHLIGHT_INTENSITY = { hover: 0.12, selected: 0.2 } as const;

function standard(finish: Finish, name: string) {
  const material = new MeshStandardMaterial();
  material.name = name;
  material.color = new Color(finish.color);
  material.metalness = finish.metalness;
  material.roughness = finish.roughness;
  material.envMapIntensity = finish.envMapIntensity;
  return material;
}

/**
 * Returns the display material for one primitive of a part's GLB:
 * - chassis: one finish per source material name (table above); unknown
 *   names fall back to the deck finish so a future re-export never renders
 *   white.
 * - wheels: "rim" + "tire" - neutral aluminum hub over near-black rubber.
 * - lidar: "black" / "hokuyo" / "orange" - the sensor's real colors, with
 *   the housing steered to blue-black.
 * The STL accent plate is not a GLB; RacecarAssembly.tsx builds its
 * MeshPhysicalMaterial from ACCENT_FINISH directly.
 */
export function overridePartMaterial(partId: RacecarPartId, material: Material): Material {
  if (partId === "chassis") {
    return standard(CHASSIS_FINISH[material.name] ?? FINISH.deck, material.name);
  }

  if (partId === "lidar") {
    if (material.name === "orange") return standard(FINISH.lidarWindow, material.name);
    if (material.name === "hokuyo") return standard(FINISH.lidarBody, material.name);
    return standard(FINISH.lidarBase, material.name);
  }

  if (partId.endsWith("wheel")) {
    return material.name === "rim"
      ? standard(FINISH.aluminum, material.name)
      : standard(FINISH.rubber, material.name);
  }

  return material.clone();
}
