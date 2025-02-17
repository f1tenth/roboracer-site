import { useEffect, useRef } from "react";
import { renderer } from "./renderer";

const TerrainRenderer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderRef = useRef<ReturnType<typeof renderer> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("Canvas element not found.");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Failed to get canvas 2D context.");
      return;
    }

    let animationFrameId: number;
    let startTime: number | null = null;

    renderRef.current = renderer(ctx, canvas.width, canvas.height);

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      console.log("Canvas resized:", canvas.width, canvas.height);

      if (renderRef.current) {
        renderRef.current = renderer(ctx, canvas.width, canvas.height);
      }
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const update = (time: number) => {
      if (startTime === null) startTime = time;
      const t = (time - startTime) * 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (renderRef.current) {
        console.log("Rendering frame at time:", t);
        renderRef.current(t);
      }

      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-[100vh] z-[0] bg-brand-gradient"
    />
  );
};

export default TerrainRenderer;
