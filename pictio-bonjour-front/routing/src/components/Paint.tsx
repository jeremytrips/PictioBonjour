import { useRef, useState, useCallback, useEffect } from "react";
import { Stage, Layer, Rect as KonvaRect, Transformer } from "react-konva";
import { Line as KonvaLine } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import ExportIcon from "../assets/images.png";
import OnclearIcon from "../assets/onclear.png";
import Konva from "konva";
import { UserState } from "./App";
import { HubConnection } from "@microsoft/signalr";
import CuteGauge from "./gauge";
import "./paint.css"

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

const colors = [
  "#FFEB3B",
  "#03A9F4",
  "#F44336",
  "#4CAF50",
  "#9C27B0",
  "#FF9800",
  "#E91E63",
  "#00BCD4"
] as const;

const MAX_VALUE = 10_000;

const Paint = (props: { userState: UserState, connection: HubConnection}) => {
  const [color, setColor] = useState<string>(colors[0]);
  const [drawAction, setDrawAction] = useState<DrawAction>(DrawAction.Scribble);
  const [scribbles, setScribbles] = useState<Scribble[]>([]);
  const [, setSelectedId] = useState<string | null>(null);
  const [dataframeSize, setDataframeSize] = useState(0);
  const dataframeSizeRef = useRef(0);
  const isPainting = useRef(false);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);


  useEffect(() => {
    const intervalId = setInterval(() => {
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
    if (dataframeSizeRef.current > MAX_VALUE) {
      applyShake()
      return;
    }

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
    if (pos && dataframeSizeRef.current < MAX_VALUE) {
      dataframeSizeRef.current = pos.length;
      props.connection.invoke("DrawEvent", pos);
    }
  }

  const applyShake = () => {
    const gaugeElement = document.getElementById("gauge");
    if (gaugeElement) {
      gaugeElement.classList.add("shake");
      setTimeout(() => {
        gaugeElement.classList.remove("shake");
      }, 500);
    }
  }

  // Continue drawing
  const onStageMouseMove = useCallback(() => {
    const length = stageRef.current!.toJSON().length;
    if (length && dataframeSizeRef.current > MAX_VALUE) {
      applyShake()
      return;
    }

    if (!isPainting.current || drawAction !== DrawAction.Scribble)
      return;

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
    <div
      onMouseLeave={()=>{
        if (isPainting.current) {
          isPainting.current = false;
        }
      }}
    >
      {props.userState === UserState.Drawer ?
        <div className="painterheader">
          <div className="colorsPallete">
            {colors.map((c) => (
              <div
                key={c}
                className="colorDiv"
                style={{
                  backgroundColor: c,
                  border: c === color ? "2px solid black" : "2px solid white"
                }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
          <div className="actionContainer">
            <div onClick={onClearClick} className="actionButton">
              <img
                src={"/assets/erase.png"}
                alt="Clear"
                style={{ width: 30, height: 30 }}
              />
            </div>
          </div>

        </div>
        : null}

      <CuteGauge
        value={100 - Math.round(100 - (dataframeSize / MAX_VALUE) * 100)}
        maxValue={100}
      />
      <Stage
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
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
