import { vec3, mat4 } from "gl-matrix";
import { Grid2D, iterateGrid2D } from "./Grid2D";
import { createNoise2D } from "simplex-noise";
import { fbm2d } from "./fbm2d";
import alea from "alea";

const rng = alea("B");
const simplexNoise2D = createNoise2D(rng);
const noise2D = fbm2d(simplexNoise2D, 2);

type Render = (t: number) => void;

export function renderer(ctx: CanvasRenderingContext2D, width: number, height: number): Render {
  const aspectRatio = width / height;
  
  // Fixed number of rows based on viewport height
  const fixedRows = 40; // Example: 40 rows for terrain, constant

  // Compute width dynamically based on aspect ratio
  const grid = new Grid2D(Math.floor(fixedRows * aspectRatio), fixedRows, 3);

  const projectionMatrix = mat4.perspective(mat4.create(), 45, aspectRatio, 0.1, 200);

  function updateTerrain(t: number) {
    // Only update columns (width), keeping rows (height) fixed
    const newWidth = Math.floor(fixedRows * aspectRatio);
    grid.resize(newWidth);

    const gridPoint = vec3.create();
    iterateGrid2D(grid, (p, x, y, i) => {
      const speed = 1;
      const terrainOffset = Math.floor(t * speed);
      const roadWidth = 0.03;
      const roadTwistyness = 6 * Math.max(0, Math.sin((y - terrainOffset) / 210));
      const roadWinding = Math.sin((y - terrainOffset) / 10) * roadTwistyness;
      const road = Math.max(
        roadWidth - 1,
        -Math.cos(((x + roadWinding) / grid.width - 0.5) * Math.PI * 2)
      ) + 1;

      const noiseScale = 0.15;
      const hillinessPeriod = 120;
      const hilliness = Math.abs(Math.sin((y - terrainOffset) / hillinessPeriod));
      const mountainHeight = 5;
      const mountains = 2 + noise2D(x * noiseScale, (y - terrainOffset) * noiseScale) * mountainHeight * hilliness;
      const elevation = road * mountains;

      vec3.set(gridPoint, -grid.width / 2 + x, -5 + elevation, 5 + (grid.height - y) - (t * speed) % 1);
      vec3.transformMat4(gridPoint, gridPoint, projectionMatrix);
      gridPoint[0] = ((1 + gridPoint[0]) / 2) * width;
      gridPoint[1] = ((1 + gridPoint[1]) / 2) * height;
      p[i] = gridPoint[0];
      p[i + 1] = gridPoint[1];
      p[i + 2] = (grid.height - y + (terrainOffset % 1)) / grid.height;
    });
  }

  function drawGrid2D() {
    ctx.strokeStyle = "black";
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";

    for (let y = 0; y < grid.height - 1; y++) {
      for (let x = 0; x < grid.width - 1; x++) {
        const i = (y * grid.width + x) * grid.components;
        const iRight = ((y * grid.width) + (x + 1)) * grid.components;
        const iDown = (((y + 1) * grid.width) + x) * grid.components;
        const iDiagonal = (((y + 1) * grid.width) + (x + 1)) * grid.components;

        ctx.beginPath();
        ctx.moveTo(grid.points[i], grid.points[i + 1]);
        ctx.lineTo(grid.points[iRight], grid.points[iRight + 1]);
        ctx.lineTo(grid.points[iDiagonal], grid.points[iDiagonal + 1]);
        ctx.lineTo(grid.points[iDown], grid.points[iDown + 1]);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }
  }

  return function render(t: number) {
    ctx.clearRect(0, 0, width, height);
    updateTerrain(t);
    drawGrid2D();
  };
}
