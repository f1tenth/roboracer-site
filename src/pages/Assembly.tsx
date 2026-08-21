import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useProgress } from "@react-three/drei";
import type { Group } from "three";
import {
  RacecarAssemblyCanvas,
} from "../components/RacecarAssembly";
import {
  RACECAR_PARTS,
  type RacecarPartId,
} from "../components/racecarAssemblyData";
import "./assembly.css";

type IconProps = { children: ReactNode };

function Icon({ children }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      {children}
    </svg>
  );
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return hidden ? (
    <Icon>
      <path d="m3 3 18 18" />
      <path d="M10.6 10.7a2 2 0 0 0 2.7 2.7" />
      <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5.5 0 9 6 9 6a15 15 0 0 1-2.1 2.9M6.6 6.6C4.4 8 3 10 3 10s3.5 6 9 6a9.7 9.7 0 0 0 3-.5" />
    </Icon>
  ) : (
    <Icon>
      <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </Icon>
  );
}

function ToggleButton({
  active,
  label,
  onClick,
  children,
}: {
  active?: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`viewer-tool ${active ? "is-active" : ""}`}
      aria-label={label}
      title={label}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function formatPosition(position: readonly number[]) {
  return position.map((value) => `${value.toFixed(3)} m`).join("  /  ");
}

export default function Assembly() {
  const [explosion, setExplosion] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [labelsVisible, setLabelsVisible] = useState(true);
  const [selectedPart, setSelectedPart] = useState<RacecarPartId | null>(null);
  const [hiddenParts, setHiddenParts] = useState<Set<RacecarPartId>>(() => new Set());
  const [resetKey, setResetKey] = useState(0);
  const [sceneReady, setSceneReady] = useState(false);
  const [exportStatus, setExportStatus] = useState<"idle" | "exporting" | "done" | "error">("idle");
  const assemblyRef = useRef<Group>(null);
  const { progress } = useProgress();

  const selected = useMemo(
    () => RACECAR_PARTS.find((part) => part.id === selectedPart) ?? null,
    [selectedPart],
  );

  const handleReady = useCallback(() => setSceneReady(true), []);

  const exportForCad = async () => {
    if (!assemblyRef.current || exportStatus === "exporting") return;
    setExportStatus("exporting");

    try {
      const { GLTFExporter } = await import("three/examples/jsm/exporters/GLTFExporter.js");
      const exportScene = assemblyRef.current.clone(true);

      // CAD receives the canonical Xacro assembly, regardless of the current
      // exploded/visibility UI state.
      exportScene.traverse((object) => {
        object.visible = true;
      });
      RACECAR_PARTS.forEach((part) => {
        exportScene.getObjectByName(part.id)?.position.fromArray(part.position);
      });

      const result = await new GLTFExporter().parseAsync(exportScene, {
        binary: false,
        onlyVisible: false,
        trs: true,
        maxTextureSize: 2048,
      });
      const blob = new Blob([JSON.stringify(result)], { type: "model/gltf+json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "f1tenth-xacro-assembly.gltf";
      anchor.click();
      URL.revokeObjectURL(url);
      setExportStatus("done");
    } catch (error) {
      console.error("Unable to export racecar glTF", error);
      setExportStatus("error");
    }
  };

  const togglePart = (partId: RacecarPartId) => {
    setHiddenParts((current) => {
      const next = new Set(current);
      if (next.has(partId)) next.delete(partId);
      else next.add(partId);
      return next;
    });
    if (selectedPart === partId && !hiddenParts.has(partId)) setSelectedPart(null);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;
      if (event.key.toLowerCase() === "e") {
        setExplosion((current) => (current > 0.5 ? 0 : 1));
      }
      if (event.key.toLowerCase() === "r") setResetKey((current) => current + 1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const sliderStyle = {
    "--explode-progress": `${explosion * 100}%`,
  } as CSSProperties;

  return (
    <div className="assembly-viewer">
      <RacecarAssemblyCanvas
        explosion={explosion}
        hiddenParts={hiddenParts}
        labelsVisible={labelsVisible}
        selectedPart={selectedPart}
        wireframe={wireframe}
        autoRotate={autoRotate}
        resetKey={resetKey}
        assemblyRef={assemblyRef}
        onReady={handleReady}
        onSelect={setSelectedPart}
      />

      <div className="assembly-vignette" aria-hidden="true" />

      <header className="viewer-header">
        <a className="viewer-brand" href="/" aria-label="Back to RoboRacer home">
          <img src="/logo-square.svg" alt="" />
          <span>
            RoboRacer
            <small>Assembly workspace</small>
          </span>
        </a>

        <div className="viewer-tools" aria-label="Viewer tools">
          <ToggleButton
            label="Reset camera (R)"
            onClick={() => setResetKey((current) => current + 1)}
          >
            <Icon>
              <path d="M4.9 7A8 8 0 1 1 4 14" />
              <path d="M4 3v4h4" />
            </Icon>
          </ToggleButton>
          <ToggleButton
            active={autoRotate}
            label="Auto rotate"
            onClick={() => setAutoRotate((current) => !current)}
          >
            <Icon>
              <path d="M8 5.1A8 8 0 0 1 20 12" />
              <path d="m20 7 .1 5-5 .1" />
              <path d="M16 18.9A8 8 0 0 1 4 12" />
              <path d="m4 17-.1-5 5-.1" />
            </Icon>
          </ToggleButton>
          <ToggleButton
            active={labelsVisible}
            label="Part labels"
            onClick={() => setLabelsVisible((current) => !current)}
          >
            <Icon>
              <path d="M4 5h16v11H9l-5 4V5Z" />
              <path d="M8 9h8M8 12h5" />
            </Icon>
          </ToggleButton>
          <ToggleButton
            active={wireframe}
            label="Wireframe"
            onClick={() => setWireframe((current) => !current)}
          >
            <Icon>
              <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
              <path d="m4.3 7.7 7.7 4.4 7.7-4.4M12 12.1V21" />
            </Icon>
          </ToggleButton>
          <ToggleButton
            label="Download assembled glTF for CAD"
            onClick={() => void exportForCad()}
          >
            <Icon>
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M5 20h14" />
            </Icon>
          </ToggleButton>
        </div>
      </header>

      <section className="viewer-intro" aria-labelledby="assembly-title">
        <div className="viewer-kicker"><span /> Xacro visual assembly</div>
        {/* Content skill: write "RoboRacer" everywhere (2026-08-21). */}
        <h1 id="assembly-title">
          RoboRacer
          <span>Assembly lab</span>
        </h1>
        <p>
          Inspect the racecar visual tree, isolate parts, and pull the assembly apart along its
          real component frames.
        </p>
        <dl className="viewer-stats">
          <div><dt>Scale</dt><dd>1:1</dd></div>
          <div><dt>Parts</dt><dd>07</dd></div>
          <div><dt>Wheelbase</dt><dd>0.322 m</dd></div>
        </dl>
      </section>

      <aside className="parts-panel" aria-label="Assembly parts">
        <div className="parts-panel-heading">
          <div>
            <span>Scene tree</span>
            <strong>Visual components</strong>
          </div>
          <button
            type="button"
            onClick={() => setHiddenParts(new Set())}
            disabled={hiddenParts.size === 0}
          >
            Show all
          </button>
        </div>

        <div className="parts-list">
          {RACECAR_PARTS.map((part, index) => {
            const hidden = hiddenParts.has(part.id);
            return (
              <div
                className={`part-row ${selectedPart === part.id ? "is-selected" : ""} ${hidden ? "is-hidden" : ""}`}
                key={part.id}
              >
                <button type="button" className="part-select" onClick={() => setSelectedPart(part.id)}>
                  <span className="part-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="part-color" style={{ backgroundColor: part.color }} />
                  <span>{part.name}</span>
                </button>
                <button
                  type="button"
                  className="part-visibility"
                  aria-label={`${hidden ? "Show" : "Hide"} ${part.name}`}
                  title={`${hidden ? "Show" : "Hide"} ${part.name}`}
                  onClick={() => togglePart(part.id)}
                >
                  <EyeIcon hidden={hidden} />
                </button>
              </div>
            );
          })}
        </div>

        <div className="part-inspector" aria-live="polite">
          {selected ? (
            <>
              <div className="inspector-heading">
                <span style={{ backgroundColor: selected.color }} />
                <strong>{selected.name}</strong>
              </div>
              <p>{selected.description}</p>
              <dl>
                <div><dt>Frame</dt><dd>{selected.frame}</dd></div>
                <div><dt>Joint</dt><dd>{selected.joint}</dd></div>
                <div><dt>XYZ</dt><dd>{formatPosition(selected.position)}</dd></div>
              </dl>
            </>
          ) : (
            <div className="inspector-empty">
              <Icon>
                <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
                <path d="m4.3 7.7 7.7 4.4 7.7-4.4M12 12.1V21" />
              </Icon>
              <span>Select a part to inspect its Xacro frame.</span>
            </div>
          )}
        </div>
      </aside>

      <section className="explode-control" aria-label="Exploded view control">
        <div className="explode-heading">
          <span>Exploded view</span>
          <output>{Math.round(explosion * 100)}%</output>
        </div>
        <div className="explode-slider-row">
          <button type="button" onClick={() => setExplosion(0)}>Assembled</button>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={Math.round(explosion * 100)}
            style={sliderStyle}
            aria-label="Explosion amount"
            onChange={(event) => setExplosion(Number(event.target.value) / 100)}
          />
          <button type="button" onClick={() => setExplosion(1)}>Exploded</button>
        </div>
        <div className="explode-hint">
          <span>Drag to orbit · Scroll to zoom</span>
          <span><kbd>E</kbd> Toggle <kbd>R</kbd> Reset</span>
        </div>
      </section>

      {!sceneReady && (
        <div className="assembly-loader" role="status" aria-live="polite">
          <div className="loader-mark">
            <img src="/logo-square.svg" alt="" />
            <span />
          </div>
          <strong>Building visual assembly</strong>
          <div className="loader-track"><span style={{ width: `${Math.max(progress, 6)}%` }} /></div>
          <small>{Math.round(progress)}% · loading local meshes</small>
        </div>
      )}

      {exportStatus !== "idle" && (
        <div className={`export-toast is-${exportStatus}`} role="status" aria-live="polite">
          <span />
          {exportStatus === "exporting" && "Packaging the assembled model…"}
          {exportStatus === "done" && "f1tenth-xacro-assembly.gltf downloaded"}
          {exportStatus === "error" && "The model could not be exported"}
          {exportStatus !== "exporting" && (
            <button type="button" aria-label="Dismiss export status" onClick={() => setExportStatus("idle")}>×</button>
          )}
        </div>
      )}
    </div>
  );
}
