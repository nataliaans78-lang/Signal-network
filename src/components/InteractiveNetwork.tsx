import {
  useEffect,
  useRef,
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

export default function InteractiveNetwork() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const nodesRef = useRef<NetworkNode[]>([]);
  const draggedNodeRef = useRef<NetworkNode | null>(null);
  const hoveredNodeRef = useRef<NetworkNode | null>(null);

  const sizeRef = useRef({
    width: 0,
    height: 0,
  });

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

      nodesRef.current = NODE_LABELS.map((label, index) => {
        const baseAngle = (Math.PI * 2 * index) / NODE_LABELS.length;
        const angle = baseAngle + (Math.random() - 0.5) * 0.22;
        const nodeOrbitRadius = orbitRadius * (0.82 + Math.random() * 0.18);
        const randomOffset = Math.min(width, height) * 0.04;
        const movementAngle = Math.random() * Math.PI * 2;
        const movementSpeed = 0.2 + Math.random() * 0.12;

        return {
          id: index,
          label,
          x:
            centerX +
            Math.cos(angle) * nodeOrbitRadius +
            (Math.random() - 0.5) * randomOffset,
          y:
            centerY +
            Math.sin(angle) * nodeOrbitRadius +
            (Math.random() - 0.5) * randomOffset,
          vx: Math.cos(movementAngle) * movementSpeed,
          vy: Math.sin(movementAngle) * movementSpeed,
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

    let animationFrameId = 0;

    const drawConnections = (nodes: NetworkNode[]) => {
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

          if (distance > CONNECTION_DISTANCE) {
            continue;
          }

          const strength = 1 - distance / CONNECTION_DISTANCE;

          context.beginPath();
          context.moveTo(firstNode.x, firstNode.y);
          context.lineTo(secondNode.x, secondNode.y);

          context.strokeStyle = `rgba(
            255,
            255,
            255,
            ${strength * 0.56}
          )`;

          context.lineWidth = 1;
          context.stroke();
        }
      }
    };

    const drawNodes = (nodes: NetworkNode[]) => {
      for (const node of nodes) {
        const isDragged = draggedNodeRef.current === node;
        const isHovered = hoveredNodeRef.current === node;
        const interactionScale = isDragged ? 3 : isHovered ? 2 : 0;

        context.beginPath();

        context.arc(
          node.x,
          node.y,
          node.radius + interactionScale,
          0,
          Math.PI * 2,
        );

        context.fillStyle = isDragged
          ? "rgba(255, 255, 255, 1)"
          : isHovered
            ? "rgba(255, 255, 255, 0.96)"
          : "rgba(255, 255, 255, 0.82)";

        context.shadowColor = "rgba(255, 255, 255, 0.45)";
        context.shadowBlur = isDragged ? 16 : isHovered ? 12 : 0;
        context.fill();
        context.shadowBlur = 0;

        context.beginPath();

        context.arc(
          node.x,
          node.y,
          node.radius + (isDragged || isHovered ? 16 : 13),
          0,
          Math.PI * 2,
        );

        context.strokeStyle = isDragged
          ? "rgba(255, 255, 255, 0.5)"
          : isHovered
            ? "rgba(255, 255, 255, 0.38)"
          : "rgba(255, 255, 255, 0.13)";

        context.lineWidth = 1;
        context.stroke();

        context.font = "500 12px Arial, sans-serif";
        context.textAlign = "center";
        context.textBaseline = "top";

        context.fillStyle = isDragged
          ? "rgba(255, 255, 255, 1)"
          : isHovered
            ? "rgba(255, 255, 255, 0.96)"
            : "rgba(255, 255, 255, 0.84)";

        context.fillText(
          node.label,
          node.x,
          node.y + node.radius + 18,
        );
      }
    };

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

    const animate = () => {
      const { width, height } = sizeRef.current;
      const nodes = nodesRef.current;

      context.clearRect(0, 0, width, height);

      updateNodes(nodes);
      drawConnections(nodes);
      drawNodes(nodes);

      animationFrameId = window.requestAnimationFrame(animate);
    };

    animate();

    return () => {
      resizeObserver.disconnect();
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const getPointerPosition = (
    event: ReactPointerEvent<HTMLCanvasElement>,
  ) => {
    const rectangle = event.currentTarget.getBoundingClientRect();

    return {
      x: event.clientX - rectangle.left,
      y: event.clientY - rectangle.top,
    };
  };

  const findNodeAt = (
    pointer: { x: number; y: number },
    hitArea: number,
  ) =>
    [...nodesRef.current].reverse().find((node) => {
      const distance = Math.hypot(
        pointer.x - node.x,
        pointer.y - node.y,
      );

      return distance <= node.radius + hitArea;
    });

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLCanvasElement>,
  ) => {
    event.preventDefault();

    const pointer = getPointerPosition(event);
    const selectedNode = findNodeAt(pointer, 22);

    if (!selectedNode) {
      return;
    }

    draggedNodeRef.current = selectedNode;
    hoveredNodeRef.current = selectedNode;

    const { width, height } = sizeRef.current;

    selectedNode.x = Math.min(
      Math.max(pointer.x, CANVAS_MARGIN),
      width - CANVAS_MARGIN,
    );
    selectedNode.y = Math.min(
      Math.max(pointer.y, CANVAS_MARGIN),
      height - CANVAS_MARGIN,
    );

    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.style.cursor = "grabbing";
  };

  const handlePointerMove = (
    event: ReactPointerEvent<HTMLCanvasElement>,
  ) => {
    const draggedNode = draggedNodeRef.current;

    if (!draggedNode) {
      if (event.pointerType === "mouse") {
        const hoveredNode = findNodeAt(getPointerPosition(event), 13);

        hoveredNodeRef.current = hoveredNode ?? null;
        event.currentTarget.style.cursor = hoveredNode ? "pointer" : "grab";
      }

      return;
    }

    event.preventDefault();

    const pointer = getPointerPosition(event);
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
    draggedNodeRef.current = null;

    if (event.pointerType !== "mouse") {
      hoveredNodeRef.current = null;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    event.currentTarget.style.cursor = "grab";
  };

  const handlePointerLeave = () => {
    if (!draggedNodeRef.current) {
      hoveredNodeRef.current = null;
    }
  };

  const handleLostPointerCapture = () => {
    draggedNodeRef.current = null;
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
        <canvas
          ref={canvasRef}
          className="network-canvas"
          aria-label="Interactive network of creative disciplines"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          onLostPointerCapture={handleLostPointerCapture}
        />

        <p className="network-hint">
          Drag the nodes to reshape the network
        </p>
      </div>
    </main>
  );
}
