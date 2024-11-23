import { useRef, useState, useCallback, useEffect } from "react";
import { Stage, Layer, Rect as KonvaRect, Transformer } from "react-konva";
import { Line as KonvaLine } from "react-konva";
import { KonvaEventObject, Node } from "konva/lib/Node";
import ExportIcon from "../assets/images.png";
import ScribbleIcon from "../assets/scribble.png";
import OnclearIcon from "../assets/onclear.png";
import SelectIcon from "../assets/select.jpg";
import Konva from "konva";
import { UserState } from "./App";
import { HubConnection } from "@microsoft/signalr";

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

const Paint = (props: { userState: UserState, connection: HubConnection }) => {
  const [color, setColor] = useState("#000");
  const [drawAction, setDrawAction] = useState<DrawAction>(DrawAction.Select);
  const [scribbles, setScribbles] = useState<Scribble[]>([]);
  const [, setSelectedId] = useState<string | null>(null);
  const [dataframeSize, setDataframeSize] = useState(0);
  const dataframeSizeRef = useRef(0);
  const isPainting = useRef(false);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);


  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log("in")
      console.log(dataframeSizeRef.current);
      setDataframeSize(dataframeSizeRef.current)
    }, 100);
    () => clearInterval(intervalId);
  }, [])


  useEffect(() => {
    props.connection.on("OnDrawEvent", (data) => {
      dataframeSizeRef.current = (data as string).length
      Konva.Node.create(JSON.parse(data), stageRef.current!.container());
    });
    return () => {

    }
  }, [props.connection, props.userState])


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
    setDataframeSize(0);
    dataframeSizeRef.current = 0;
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


  const handleSendDrawEvent = async () => {
    const stage = stageRef.current;
    const pos = stage!.toJSON();
    if (pos && dataframeSizeRef.current <30_000) {
      dataframeSizeRef.current = pos.length;
      props.connection.invoke("DrawEvent", pos);
    }
  }

  // Continue drawing
  const onStageMouseMove = useCallback(() => {
    if (!isPainting.current || drawAction !== DrawAction.Scribble)
      return;
    const length = stageRef.current!.toJSON().length;
    if (length && dataframeSizeRef.current > 30_000) 
      return

    if (props.userState === UserState.Drawer) {
      handleSendDrawEvent();
    }

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
      <p>{Math.round(100-(dataframeSize / 30_000)*100)}</p>

      {props.userState === UserState.Drawer ?
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
        : null}

      {/* Canvas */}
      <Stage
        width={700}
        height={700}
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
