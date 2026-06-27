import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

type NetworkNode = {
  id: number;
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
};

type Point = {
  x: number;
  y: number;
};

type GeneratedConcept = {
  title: string;
  description: string;
};

const NODE_LABELS = [
  "Brand",
  "Strategy",
  "Motion",
  "Web",
  "3D",
  "Sound",
  "Typography",
  "AI",
  "Development",
];

const CONNECTION_DISTANCE = 230;
const CANVAS_MARGIN = 50;
const CLICK_DISTANCE = 8;
const MAX_SELECTED_NODES = 3;

const CONCEPTS: Record<string, GeneratedConcept> = {
  "Brand|Motion": {
    title: "Kinetic Identity",
    description:
      "A dynamic brand system designed to evolve through movement and interaction.",
  },

  "Brand|Typography": {
    title: "Visual Language System",
    description:
      "A flexible identity built through expressive typography and consistent brand principles.",
  },

  "AI|Strategy": {
    title: "Adaptive Brand System",
    description:
      "A strategic identity capable of responding to changing audiences, contexts and data.",
  },

  "Development|Web": {
    title: "Digital Product Engine",
    description:
      "A scalable digital platform combining thoughtful interaction with reliable technology.",
  },

  "3D|Motion": {
    title: "Spatial Motion Study",
    description:
      "An experiment exploring movement, depth and visual storytelling in digital space.",
  },

  "Motion|Web": {
    title: "Kinetic Web Experience",
    description:
      "An interactive web experience shaped through responsive motion, transitions and user interaction.",
  },

  "Sound|Typography": {
    title: "Sonic Editorial System",
    description:
      "A visual language where rhythm, sound and typography work as one expressive system.",
  },

  "3D|Sound|Web": {
    title: "Immersive Digital Space",
    description:
      "An interactive environment combining spatial visuals, sound and web technology.",
  },

  "AI|Development|Web": {
    title: "Intelligent Interface",
    description:
      "A responsive digital experience shaped by artificial intelligence and real-time interaction.",
  },

  "Brand|Strategy|Typography": {
    title: "Brand Language System",
    description:
      "A coherent identity connecting positioning, visual expression and typographic structure.",
  },

  "Motion|Sound|Web": {
    title: "Responsive Media Experience",
    description:
      "A digital experience that reacts through movement, sound and user interaction.",
  },
};

export default function InteractiveNetwork() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const nodesRef = useRef<NetworkNode[]>([]);

  const draggedNodeRef = useRef<NetworkNode | null>(null);
  const hoveredNodeRef = useRef<NetworkNode | null>(null);

  const pointerStartRef = useRef<{
    x: number;
    y: number;
    nodeId: number;
  } | null>(null);

  const selectedIdsRef = useRef<number[]>([]);

  const sizeRef = useRef({
    width: 0,
    height: 0,
  });

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [generatedConcept, setGeneratedConcept] =
    useState<GeneratedConcept | null>(null);

  const selectedLabels = selectedIds.map((id) => NODE_LABELS[id]);

  const toggleNodeSelection = (nodeId: number) => {
    setSelectedIds((currentIds) => {
      let nextIds: number[];

      if (currentIds.includes(nodeId)) {
        nextIds = currentIds.filter((id) => id !== nodeId);
      } else if (currentIds.length < MAX_SELECTED_NODES) {
        nextIds = [...currentIds, nodeId];
      } else {
        return currentIds;
      }

      selectedIdsRef.current = nextIds;

      return nextIds;
    });

    setGeneratedConcept(null);
  };

  const clearSelection = () => {
    selectedIdsRef.current = [];
    setSelectedIds([]);
    setGeneratedConcept(null);
  };

  const generateConnection = () => {
    if (selectedIds.length < 2) {
      return;
    }

    const labels = selectedIds.map((id) => NODE_LABELS[id]);
    const conceptKey = [...labels].sort().join("|");

    const existingConcept = CONCEPTS[conceptKey];

    if (existingConcept) {
      setGeneratedConcept(existingConcept);
      return;
    }

    const seed = selectedIds.reduce((sum, id) => sum + id, 0);

    const prefixes = [
      "Connected",
      "Adaptive",
      "Dynamic",
      "Hybrid",
      "Responsive",
    ];

    const subjects = [
      "Creative System",
      "Digital Experience",
      "Visual Platform",
      "Interaction Framework",
      "Communication Space",
    ];

    const title = `${prefixes[seed % prefixes.length]} ${
      subjects[(seed + labels.length) % subjects.length]
    }`;

    setGeneratedConcept({
      title,
      description: `A creative direction combining ${labels.join(
        ", ",
      )} into one connected and interactive system.`,
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const createNodes = (width: number, height: number) => {
      const centerX = width / 2;
      const centerY = height / 2;

      const orbitRadius = Math.min(width, height) * 0.38;
      const randomOffset = Math.min(width, height) * 0.08;

      nodesRef.current = NODE_LABELS.map((label, index) => {
        const angle = (Math.PI * 2 * index) / NODE_LABELS.length;

        return {
          id: index,
          label,

          x:
            centerX +
            Math.cos(angle) * orbitRadius +
            (Math.random() - 0.5) * randomOffset,

          y:
            centerY +
            Math.sin(angle) * orbitRadius +
            (Math.random() - 0.5) * randomOffset,

          vx: (Math.random() - 0.5) * 0.55,
          vy: (Math.random() - 0.5) * 0.55,

          radius: index === 0 ? 9 : 7,
        };
      });
    };

    const resizeCanvas = () => {
      const rectangle = canvas.getBoundingClientRect();

      const width = rectangle.width;
      const height = rectangle.height;

      if (width === 0 || height === 0) {
        return;
      }

      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      sizeRef.current = {
        width,
        height,
      };

      if (nodesRef.current.length === 0) {
        createNodes(width, height);
        return;
      }

      for (const node of nodesRef.current) {
        node.x = Math.min(
          Math.max(node.x, CANVAS_MARGIN),
          width - CANVAS_MARGIN,
        );

        node.y = Math.min(
          Math.max(node.y, CANVAS_MARGIN),
          height - CANVAS_MARGIN,
        );
      }
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);

    resizeObserver.observe(canvas);
    resizeCanvas();

    const updateNodes = (nodes: NetworkNode[]) => {
      const { width, height } = sizeRef.current;

      for (const node of nodes) {
        if (draggedNodeRef.current !== node) {
          node.x += node.vx;
          node.y += node.vy;
        }

        if (
          node.x <= CANVAS_MARGIN ||
          node.x >= width - CANVAS_MARGIN
        ) {
          node.vx *= -1;

          node.x = Math.min(
            Math.max(node.x, CANVAS_MARGIN),
            width - CANVAS_MARGIN,
          );
        }

        if (
          node.y <= CANVAS_MARGIN ||
          node.y >= height - CANVAS_MARGIN
        ) {
          node.vy *= -1;

          node.y = Math.min(
            Math.max(node.y, CANVAS_MARGIN),
            height - CANVAS_MARGIN,
          );
        }
      }
    };

    const drawConnections = (nodes: NetworkNode[]) => {
      const selectedNodes = new Set(selectedIdsRef.current);

      for (
        let firstIndex = 0;
        firstIndex < nodes.length;
        firstIndex += 1
      ) {
        for (
          let secondIndex = firstIndex + 1;
          secondIndex < nodes.length;
          secondIndex += 1
        ) {
          const firstNode = nodes[firstIndex];
          const secondNode = nodes[secondIndex];

          const deltaX = secondNode.x - firstNode.x;
          const deltaY = secondNode.y - firstNode.y;

          const distance = Math.hypot(deltaX, deltaY);

          const isSelectedConnection =
            selectedNodes.has(firstNode.id) &&
            selectedNodes.has(secondNode.id);

          if (
            !isSelectedConnection &&
            distance > CONNECTION_DISTANCE
          ) {
            continue;
          }

          context.beginPath();
          context.moveTo(firstNode.x, firstNode.y);
          context.lineTo(secondNode.x, secondNode.y);

          if (isSelectedConnection) {
            context.strokeStyle = "rgba(255, 255, 255, 0.88)";
            context.lineWidth = 1.6;
          } else {
            const strength =
              1 - distance / CONNECTION_DISTANCE;

            context.strokeStyle = `rgba(
              255,
              255,
              255,
              ${Math.max(0, strength) * 0.5}
            )`;

            context.lineWidth = 1;
          }

          context.stroke();
        }
      }
    };

    const drawNodes = (nodes: NetworkNode[], time: number) => {
      const selectedNodes = new Set(selectedIdsRef.current);

      for (const node of nodes) {
        const isDragged = draggedNodeRef.current === node;
        const isHovered = hoveredNodeRef.current === node;
        const isSelected = selectedNodes.has(node.id);

        const pulse =
          1 + Math.sin(time * 0.004 + node.id) * 0.08;

        if (isSelected) {
          context.beginPath();

          context.arc(
            node.x,
            node.y,
            (node.radius + 18) * pulse,
            0,
            Math.PI * 2,
          );

          context.strokeStyle = "rgba(255, 255, 255, 0.28)";
          context.lineWidth = 1;
          context.stroke();
        }

        context.beginPath();

        context.arc(
          node.x,
          node.y,
          isDragged || isSelected
            ? node.radius + 3
            : node.radius,
          0,
          Math.PI * 2,
        );

        context.fillStyle =
          isSelected || isDragged
            ? "rgba(255, 255, 255, 1)"
            : "rgba(255, 255, 255, 0.82)";

        context.fill();

        context.beginPath();

        context.arc(
          node.x,
          node.y,
          node.radius + 13,
          0,
          Math.PI * 2,
        );

        context.strokeStyle =
          isSelected || isDragged
            ? "rgba(255, 255, 255, 0.7)"
            : isHovered
              ? "rgba(255, 255, 255, 0.4)"
              : "rgba(255, 255, 255, 0.13)";

        context.lineWidth = 1;
        context.stroke();

        context.font = "500 12px Arial, sans-serif";
        context.textAlign = "center";
        context.textBaseline = "top";

        context.fillStyle =
          isSelected || isHovered
            ? "rgba(255, 255, 255, 1)"
            : "rgba(255, 255, 255, 0.78)";

        context.fillText(
          node.label,
          node.x,
          node.y + node.radius + 18,
        );
      }
    };

    let animationFrameId = 0;

    const animate = (time: number) => {
      const { width, height } = sizeRef.current;
      const nodes = nodesRef.current;

      context.clearRect(0, 0, width, height);

      updateNodes(nodes);
      drawConnections(nodes);
      drawNodes(nodes, time);

      animationFrameId =
        window.requestAnimationFrame(animate);
    };

    animationFrameId = window.requestAnimationFrame(animate);

    return () => {
      resizeObserver.disconnect();
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const getPointerPosition = (
    event: ReactPointerEvent<HTMLCanvasElement>,
  ): Point => {
    const rectangle = event.currentTarget.getBoundingClientRect();

    return {
      x: event.clientX - rectangle.left,
      y: event.clientY - rectangle.top,
    };
  };

  const findNodeAtPosition = (position: Point) => {
    return [...nodesRef.current]
      .reverse()
      .find((node) => {
        const distance = Math.hypot(
          position.x - node.x,
          position.y - node.y,
        );

        return distance <= node.radius + 22;
      });
  };

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLCanvasElement>,
  ) => {
    const pointer = getPointerPosition(event);
    const selectedNode = findNodeAtPosition(pointer);

    if (!selectedNode) {
      return;
    }

    draggedNodeRef.current = selectedNode;

    pointerStartRef.current = {
      x: pointer.x,
      y: pointer.y,
      nodeId: selectedNode.id,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.style.cursor = "grabbing";
  };

  const handlePointerMove = (
    event: ReactPointerEvent<HTMLCanvasElement>,
  ) => {
    const pointer = getPointerPosition(event);
    const draggedNode = draggedNodeRef.current;

    if (!draggedNode) {
      const hoveredNode = findNodeAtPosition(pointer);

      hoveredNodeRef.current = hoveredNode ?? null;

      event.currentTarget.style.cursor = hoveredNode
        ? "pointer"
        : "default";

      return;
    }

    const { width, height } = sizeRef.current;

    draggedNode.x = Math.min(
      Math.max(pointer.x, CANVAS_MARGIN),
      width - CANVAS_MARGIN,
    );

    draggedNode.y = Math.min(
      Math.max(pointer.y, CANVAS_MARGIN),
      height - CANVAS_MARGIN,
    );
  };

  const handlePointerUp = (
    event: ReactPointerEvent<HTMLCanvasElement>,
  ) => {
    const pointer = getPointerPosition(event);

    const draggedNode = draggedNodeRef.current;
    const pointerStart = pointerStartRef.current;

    if (draggedNode && pointerStart) {
      const pointerMovement = Math.hypot(
        pointer.x - pointerStart.x,
        pointer.y - pointerStart.y,
      );

      if (
        pointerMovement <= CLICK_DISTANCE &&
        pointerStart.nodeId === draggedNode.id
      ) {
        toggleNodeSelection(draggedNode.id);
      }
    }

    draggedNodeRef.current = null;
    pointerStartRef.current = null;

    const hoveredNode = findNodeAtPosition(pointer);
    hoveredNodeRef.current = hoveredNode ?? null;

    event.currentTarget.style.cursor = hoveredNode
      ? "pointer"
      : "default";

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handlePointerCancel = (
    event: ReactPointerEvent<HTMLCanvasElement>,
  ) => {
    draggedNodeRef.current = null;
    pointerStartRef.current = null;
    hoveredNodeRef.current = null;

    event.currentTarget.style.cursor = "default";

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handlePointerLeave = (
    event: ReactPointerEvent<HTMLCanvasElement>,
  ) => {
    if (!draggedNodeRef.current) {
      hoveredNodeRef.current = null;
      event.currentTarget.style.cursor = "default";
    }
  };

  return (
    <main className="network-page">
      <header className="network-header">
        <p className="network-label">N/STUDIO LAB 001</p>

        <h1>Signal Network</h1>

        <p className="network-description">
          An interactive experiment exploring connections between strategy,
          design and technology.
        </p>
      </header>

      <div className="network-container">
        <div className="network-stage">
          <canvas
            ref={canvasRef}
            className="network-canvas"
            aria-label="Interactive network of creative disciplines"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onPointerLeave={handlePointerLeave}
          />

          <p className="network-hint">
            Drag to move · Click to select
          </p>
        </div>

        <div className="network-panel">
          <div className="network-selection">
            <span className="network-panel-label">
              Selected disciplines
            </span>

            <div className="network-chips">
              {selectedIds.length === 0 ? (
                <span className="network-empty">
                  Select two or three nodes
                </span>
              ) : (
                selectedIds.map((id) => (
                  <button
                    key={id}
                    type="button"
                    className="network-chip"
                    onClick={() => toggleNodeSelection(id)}
                  >
                    {NODE_LABELS[id]}
                    <span aria-hidden="true">×</span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="network-actions">
            <button
              type="button"
              className="network-generate"
              disabled={selectedIds.length < 2}
              onClick={generateConnection}
            >
              Generate connection
            </button>

            <button
              type="button"
              className="network-clear"
              disabled={selectedIds.length === 0}
              onClick={clearSelection}
            >
              Clear
            </button>
          </div>
        </div>

        {generatedConcept && (
          <div className="network-result">
            <div>
              <span className="network-result-label">
                Generated connection
              </span>

              <p className="network-result-combination">
                {selectedLabels.join(" + ")}
              </p>
            </div>

            <div>
              <h2>{generatedConcept.title}</h2>
              <p>{generatedConcept.description}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
