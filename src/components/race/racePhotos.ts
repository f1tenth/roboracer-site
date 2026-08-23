/**
 * One photo per race in the "Every race so far" timeline.
 *
 * Every file is cropped to the same 16:9 and encoded to 800x450 WebP under
 * 150 KB by scripts/media.sh photo, so the timeline keeps one aspect from
 * 2016 to 2026 and a row never shifts while an image loads. Keys are
 * `events_map.json` ids.
 *
 * Sources and credits live in docs/ASSET_MANIFEST.md, never on the tile.
 * A race with no photo on file renders the designed placeholder in
 * RaceTimeline rather than an empty frame.
 */
export const PHOTO_WIDTH = 800;
export const PHOTO_HEIGHT = 450;

/** Alt text only: the file path follows from the id. */
export const RACE_PHOTOS: Record<string, string> = {
  cpsweek2018:
    "A competitor leaning over the barrier to reach a car on the carpeted track, conference banners behind",
  esweek2018: "Competitors standing behind the track barrier with their arms raised at the end of the race",
  cpsiot2019: "A RoboRacer car on an outdoor asphalt track beside a red and white kerb",
  columbia2019: "The field of competitors in a group photo behind a row of cars on the floor",
  icra2025: "The ICRA 2025 field in a group photo on the hall floor, teams holding their cars up",
  iccas2025: "A large group of competitors gathered inside the taped track in the exhibition hall",
  icra2026: "The whole ICRA 2026 field in a group photo inside the orange-barrier track, arms raised",
  iv2026: "Competitors holding a checkered flag behind the barriers, their cars lined up in front",
};

export type RacePhoto = { src: string; alt: string; width: number; height: number };

export function racePhoto(id: string): RacePhoto | null {
  const alt = RACE_PHOTOS[id];
  if (!alt) return null;
  return { src: `/media/race/${id}.webp`, alt, width: PHOTO_WIDTH, height: PHOTO_HEIGHT };
}
