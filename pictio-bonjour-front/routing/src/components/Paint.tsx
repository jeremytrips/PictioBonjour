import  { useRef, useState, useCallback } from "react";
import { Stage, Layer, Rect as KonvaRect, Transformer } from "react-konva";
import { Line as KonvaLine } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import ExportIcon from "../assets/images.png";
import ScribbleIcon from "../assets/scribble.png";
import OnclearIcon from "../assets/onclear.png";
import SelectIcon from "../assets/select.jpg";
import Konva from "konva";

const CANVAS_SIZE = 500;

// eslint-disable-next-line react-refresh/only-export-components
export enum DrawAction {
  Select = "select",
  Scribble = "scribble",
}

interface Scribble {
  id: string;
  points: number[];
  color: string;
}

const Paint = () => {
  const [color, setColor] = useState("#000");
  const [drawAction, setDrawAction] = useState<DrawAction>(DrawAction.Select);
  const [scribbles, setScribbles] = useState<Scribble[]>([]);
  const [, setSelectedId] = useState<string | null>(null);

  const isPainting = useRef(false);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  // Export canvas to image
  const onExportClick = useCallback(() => {
    const uri = stageRef.current?.toDataURL({ pixelRatio: 3 });
    if (uri) {
      const link = document.createElement("a");
      link.download = "drawing.png";
      link.href = uri;
      link.click();
    }
  }, []);

  // Clear all scribbles
  const onClearClick = useCallback(() => {
    setScribbles([]);
    setSelectedId(null);
    if (transformerRef.current) transformerRef.current.nodes([]);
  }, []);

  // Start drawing a scribble
  const onStageMouseDown = useCallback(() => {
    if (drawAction !== DrawAction.Scribble) return;

    isPainting.current = true;
    const stage = stageRef.current;
    const pos = stage?.getPointerPosition();

    if (pos) {
      const newScribble: Scribble = {
        id: `${Date.now()}`,
        points: [pos.x, pos.y],
        color,
      };
      setScribbles((prevScribbles) => [...prevScribbles, newScribble]);
    }
  }, [drawAction, color]);

  // Stop drawing
  const onStageMouseUp = useCallback(() => {
    isPainting.current = false;
  }, []);

  // Continue drawing
  const onStageMouseMove = useCallback(() => {
    if (!isPainting.current || drawAction !== DrawAction.Scribble) return;

    const stage = stageRef.current;
    const pos = stage?.getPointerPosition();
    if (pos) {
      setScribbles((prevScribbles) =>
        prevScribbles.map((scribble, index) =>
          index === prevScribbles.length - 1
            ? { ...scribble, points: [...scribble.points, pos.x, pos.y] }
            : scribble
        )
      );
    }
  }, [drawAction]);

  // Handle scribble selection
  const onShapeClick = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (drawAction !== DrawAction.Select) return;

      const id = e.currentTarget.id();
      setSelectedId(id);

      if (transformerRef.current) {
        transformerRef.current.nodes([e.currentTarget]);
      }
    },
    [drawAction]
  );

  // Deselect everything
  const onBgClick = useCallback(() => {
    setSelectedId(null);
    if (transformerRef.current) {
      transformerRef.current.nodes([]);
    }
  }, []);

  const isDraggable = drawAction === DrawAction.Select;

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <button onClick={() => setDrawAction(DrawAction.Select)}>
          <img src={SelectIcon} alt="Select" style={{ width: 30, height: 30 }} />
        </button>
        <button onClick={() => setDrawAction(DrawAction.Scribble)}>
          <img
            src={ScribbleIcon}
            alt="Scribble"
            style={{ width: 30, height: 30 }}
          />
        </button>
        <button onClick={onClearClick}>
          <img
            src={OnclearIcon}
            alt="Clear"
            style={{ width: 30, height: 30 }}
          />
        </button>
        <button onClick={onExportClick}>
          <img
            src={ExportIcon}
            alt="Export"
            style={{ width: 30, height: 30 }}
          />
        </button>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </div>

      {/* Canvas */}
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        style={{ border: "1px solid black" }}
        ref={stageRef}
        onMouseDown={onStageMouseDown}
        onMouseMove={onStageMouseMove}
        onMouseUp={onStageMouseUp}
      >
        <Layer>
          {/* Background */}
          <KonvaRect
            x={0}
            y={0}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            fill="white"
            onClick={onBgClick}
          />

          {/* Scribbles */}
          {scribbles.map((scribble) => (
            <KonvaLine
              key={scribble.id}
              id={scribble.id}
              points={scribble.points}
              stroke={scribble.color}
              strokeWidth={4}
              lineCap="round"
              lineJoin="round"
              onClick={onShapeClick}
              draggable={isDraggable}
            />
          ))}

          {/* Transformer */}
          <Transformer ref={transformerRef} />
        </Layer>
      </Stage>
    </div>
  );
};

export default Paint;