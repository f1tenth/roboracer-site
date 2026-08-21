// Product-render material overrides for the shared racecar scene graph
// (RacecarAssemblyParts). One mapping serves both the landing ExplodedModel
// chapter and /assembly. Direction (landing-v2 spec, 2026-08-21): neutral
// studio finishes only - graphite, aluminum, rubber, and the LiDAR's real
// sensor colors. No purple, no cyan, no emissive neon anywhere.
import {
  CanvasTexture,
  Color,
  MeshStandardMaterial,
  SRGBColorSpace,
  type Material,
  type Texture,
} from "three";
import type { RacecarPartId } from "./racecarAssemblyData";

type Finish = {
  color: string;
  metalness: number;
  roughness: number;
};

/** Named finishes; racecarAssemblyData label dots reuse these tones. */
export const FINISH = {
  /** Satin graphite - the STL accent shell and dark structural plastic. */
  graphite: { color: "#4a4e55", metalness: 0.4, roughness: 0.5 },
  /** Brushed aluminum - wheel hubs; the chassis palette texture already
   * carries its own aluminum slots for standoffs and hardware. */
  aluminum: { color: "#b4b9c1", metalness: 0.9, roughness: 0.35 },
  /** Tire rubber. */
  rubber: { color: "#131316", metalness: 0, roughness: 0.9 },
  /** Hokuyo-style blue-black sensor housing. */
  lidarBody: { color: "#10141f", metalness: 0.15, roughness: 0.45 },
  /** Sensor base and cable plastic. */
  lidarBase: { color: "#17191f", metalness: 0.2, roughness: 0.55 },
  /** The orange optical window band; glossier than the housing. */
  lidarWindow: { color: "#e8641b", metalness: 0.1, roughness: 0.28 },
} satisfies Record<string, Finish>;

/** Subtle brightness lift for hover/selected states - a small white emissive,
 * never a hue change. */
export const HIGHLIGHT_EMISSIVE = "#ffffff";
export const HIGHLIGHT_INTENSITY = { hover: 0.12, selected: 0.2 } as const;

function standard(finish: Finish) {
  const material = new MeshStandardMaterial();
  material.color = new Color(finish.color);
  material.metalness = finish.metalness;
  material.roughness = finish.roughness;
  return material;
}

/**
 * The chassis palette strip carries three saturated slots (decoded from the
 * source GLB, 2026-08-21): battery/ESC blue #0600a4, connector green #42c54f,
 * switch red #ce4c41. They read like toy plastic under studio light, so they
 * are muted to technical tones. Everything else in the strip (graphite darks,
 * aluminum lights, brass) is kept untouched.
 */
const CHASSIS_PALETTE_REMAP: ReadonlyArray<{ from: [number, number, number]; to: [number, number, number] }> = [
  { from: [0x06, 0x00, 0xa4], to: [0x26, 0x2b, 0x3d] }, // blue -> dark slate blue
  { from: [0x42, 0xc5, 0x4f], to: [0x2e, 0x4a, 0x34] }, // green -> dark PCB green
  { from: [0xce, 0x4c, 0x41], to: [0x8a, 0x4a, 0x42] }, // red -> muted oxide red
];

function remapChassisPalette(material: MeshStandardMaterial) {
  const map = material.map;
  const image = map?.image as CanvasImageSource & { width?: number; height?: number };
  if (!map || !image || typeof document === "undefined") return;
  const width = Number(image.width ?? 0);
  const height = Number(image.height ?? 0);
  // Only ever touch the tiny palette strip, never a real texture.
  if (!width || !height || width > 256 || height > 256) return;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.drawImage(image, 0, 0);
  const pixels = ctx.getImageData(0, 0, width, height);
  const data = pixels.data;
  for (let i = 0; i < data.length; i += 4) {
    for (const { from, to } of CHASSIS_PALETTE_REMAP) {
      if (
        Math.abs(data[i] - from[0]) <= 8 &&
        Math.abs(data[i + 1] - from[1]) <= 8 &&
        Math.abs(data[i + 2] - from[2]) <= 8
      ) {
        data[i] = to[0];
        data[i + 1] = to[1];
        data[i + 2] = to[2];
        break;
      }
    }
  }
  ctx.putImageData(pixels, 0, 0);

  const remapped = copyTextureSettings(new CanvasTexture(canvas), map);
  material.map = remapped;
  material.needsUpdate = true;
}

function copyTextureSettings(target: Texture, source: Texture) {
  target.colorSpace = SRGBColorSpace;
  target.flipY = source.flipY;
  target.wrapS = source.wrapS;
  target.wrapT = source.wrapT;
  target.magFilter = source.magFilter;
  target.minFilter = source.minFilter;
  target.generateMipmaps = source.generateMipmaps;
  target.needsUpdate = true;
  return target;
}

/**
 * Returns the display material for one primitive of a part's GLB. Material
 * names come from the source meshes (inspected 2026-08-21):
 * - chassis: one "PaletteMaterial001" with palette base-color and
 *   metallic-roughness textures that ALREADY split graphite decks, aluminum
 *   standoffs/hardware, and small real electronics tones. We keep those maps
 *   (replacing them with one flat graphite would erase the aluminum split the
 *   product-render direction asks for) and pull roughness toward satin.
 * - wheels: "rim" + "tire" - neutral aluminum hub over near-black rubber.
 * - lidar: "black" / "hokuyo" / "orange" - kept as the sensor's real colors,
 *   with the housing steered to blue-black.
 */
export function overridePartMaterial(partId: RacecarPartId, material: Material): Material {
  if (partId === "chassis") {
    const cloned = material.clone() as MeshStandardMaterial;
    if ("roughness" in cloned) {
      // Multiplies the palette's per-region roughness map: satin body,
      // brushed hardware.
      cloned.roughness = 0.85;
    }
    // The palette's deck tones render bright silver under studio IBL; the
    // spec wants a satin-graphite dark-neutral body. A grey multiplier
    // darkens every slot uniformly (decks go graphite, hardware stays
    // relatively brighter) without erasing the palette's aluminum split.
    cloned.color = new Color("#82878f");
    cloned.envMapIntensity = 0.7;
    if (cloned.emissive) {
      cloned.emissive = new Color("#000000");
      cloned.emissiveIntensity = 1;
    }
    remapChassisPalette(cloned);
    return cloned;
  }

  if (partId === "lidar") {
    if (material.name === "orange") return standard(FINISH.lidarWindow);
    if (material.name === "hokuyo") return standard(FINISH.lidarBody);
    return standard(FINISH.lidarBase);
  }

  if (partId.endsWith("wheel")) {
    return material.name === "rim" ? standard(FINISH.aluminum) : standard(FINISH.rubber);
  }

  return material.clone();
}
