export class Grid2D {
  points: Float32Array;
  constructor(public width: number, public height: number, public components: number) {
    this.points = new Float32Array(width * height * components);
  }

  // Resize only scales cells but keeps the row count the same
  resize(newWidth: number) {
    if (this.width === newWidth) return; // Avoid unnecessary updates
    this.width = newWidth;
    this.points = new Float32Array(newWidth * this.height * this.components);
  }
}

// Iterate through grid points
export function iterateGrid2D(
  grid: Grid2D,
  callback: (points: Float32Array, x: number, y: number, i: number) => void
) {
  const { width, height, points, components } = grid;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * components;
      callback(points, x, y, i);
    }
  }
}
