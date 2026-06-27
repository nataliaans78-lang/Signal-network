import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import ConceptResultModal from "./ConceptResultModal";
import type { PreviewType } from "./ConceptPreview";


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

type PointerState = Point & {
  active: boolean;
  speed: number;
  lastX: number;
  lastY: number;
  lastTime: number;
};

type GenerationState = {
  active: boolean;
  startTime: number;
  duration: number;
};

type GeneratedConcept = {
  title: string;
  description: string;
  previewType: PreviewType;
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

const NODE_DESCRIPTIONS = [
  "Identity, tone and recognition.",
  "Direction, positioning and purpose.",
  "Movement, rhythm and visual storytelling.",
  "Interaction, structure and digital experience.",
  "Depth, space and dimensional expression.",
  "Atmosphere, rhythm and auditory feedback.",
  "Voice, hierarchy and written expression.",
  "Adaptive and generative systems.",
  "Reliable technology and scalable products.",
];

const CONNECTION_DISTANCE = 230;
const CANVAS_MARGIN = 50;
const CLICK_DISTANCE = 8;
const TOUCH_CLICK_DISTANCE = 14;
const MAX_SELECTED_NODES = 3;
const REPULSION_DISTANCE = 132;
const POINTER_RADIUS = 150;
const NODE_PAIRS = NODE_LABELS.flatMap((_, firstIndex) =>
  NODE_LABELS.slice(firstIndex + 1).map((_, pairIndex) => [
    firstIndex,
    firstIndex + pairIndex + 1,
  ] as const),
);

const CONCEPTS: Record<string, GeneratedConcept> = {
  "Brand|Motion": {
    title: "Kinetic Identity",
    previewType: "identity",
    description:
      "A dynamic brand system designed to evolve through movement and interaction.",
  },

  "Brand|Typography": {
    title: "Visual Language System",
    previewType: "editorial",
    description:
      "A flexible identity built through expressive typography and consistent brand principles.",
  },

  "AI|Strategy": {
    title: "Adaptive Brand System",
    previewType: "generative",
    description:
      "A strategic identity capable of responding to changing audiences, contexts and data.",
  },

  "Development|Web": {
    title: "Digital Product Engine",
    previewType: "dashboard",
    description:
      "A scalable digital platform combining thoughtful interaction with reliable technology.",
  },

  "3D|Motion": {
    title: "Spatial Motion Study",
    previewType: "spatial",
    description:
      "An experiment exploring movement, depth and visual storytelling in digital space.",
  },

  "Motion|Web": {
    title: "Kinetic Web Experience",
    previewType: "interface",
    description:
      "An interactive web experience shaped through responsive motion, transitions and user interaction.",
  },

  "Sound|Typography": {
    title: "Sonic Editorial System",
    previewType: "sonic",
    description:
      "A visual language where rhythm, sound and typography work as one expressive system.",
  },

  "3D|Sound|Web": {
    title: "Immersive Digital Space",
    previewType: "spatial",
    description:
      "An interactive environment combining spatial visuals, sound and web technology.",
  },

  "AI|Development|Web": {
    title: "Intelligent Interface",
    previewType: "generative",
    description:
      "A responsive digital experience shaped by artificial intelligence and real-time interaction.",
  },

  "Brand|Strategy|Typography": {
    title: "Brand Language System",
    previewType: "editorial",
    description:
      "A coherent identity connecting positioning, visual expression and typographic structure.",
  },

  "Motion|Sound|Web": {
    title: "Responsive Media Experience",
    previewType: "sonic",
    description:
      "A digital experience that reacts through movement, sound and user interaction.",
  },

  "Brand|Strategy": {
    title: "Strategic Identity",
    previewType: "identity",
    description:
      "A brand system where positioning, purpose and visual decisions reinforce one clear direction.",
  },

  "Brand|Web": {
    title: "Digital Brand Experience",
    previewType: "interface",
    description:
      "A digital expression of the brand built through interaction, content and a coherent visual language.",
  },

  "AI|Brand": {
    title: "Generative Identity",
    previewType: "generative",
    description:
      "An evolving identity system that uses artificial intelligence to create responsive brand expressions.",
  },

  "AI|Motion": {
    title: "Adaptive Motion Language",
    previewType: "generative",
    description:
      "A motion system that changes its rhythm and behavior in response to context, content and data.",
  },

  "AI|Typography": {
    title: "Generative Type System",
    previewType: "generative",
    description:
      "A typographic language shaped by intelligent rules, variation and responsive composition.",
  },

  "3D|Brand": {
    title: "Spatial Brand World",
    previewType: "spatial",
    description:
      "A distinctive brand universe translated into dimensional forms, materials and digital environments.",
  },

  "Development|Strategy": {
    title: "Product Systems Blueprint",
    previewType: "dashboard",
    description:
      "A strategic and technical framework for building coherent, scalable digital products.",
  },

  "Motion|Typography": {
    title: "Kinetic Type System",
    previewType: "editorial",
    description:
      "An expressive typographic system where movement carries hierarchy, tone and meaning.",
  },

  "Sound|Web": {
    title: "Sonic Interface",
    previewType: "sonic",
    description:
      "A web experience where sound provides feedback, atmosphere and an additional layer of interaction.",
  },

  "Strategy|Web": {
    title: "Digital Experience Strategy",
    previewType: "interface",
    description:
      "A focused framework connecting audience needs, content and interaction across the web experience.",
  },

  "Motion|Strategy|Web": {
    title: "Strategic Motion Interface",
    previewType: "interface",
    description:
      "A purposeful digital interface where motion guides attention, behavior and communication.",
  },

  "AI|Brand|Motion": {
    title: "Generative Identity Engine",
    previewType: "generative",
    description:
      "An intelligent identity system that continuously creates motion-led brand expressions.",
  },

  "3D|Typography": {
    title: "Spatial Type Environment",
    previewType: "spatial",
    description:
      "A dimensional typographic world where language becomes space, structure and experience.",
  },

  "AI|Brand|Strategy": {
    title: "Adaptive Brand Intelligence",
    previewType: "generative",
    description:
      "A strategic brand platform that learns from context while protecting a coherent identity.",
  },

  "Brand|Development|Web": {
    title: "Connected Brand Platform",
    previewType: "interface",
    description:
      "A scalable digital platform translating brand principles into a consistent product experience.",
  },

  "3D|Motion|Typography": {
    title: "Dimensional Type Motion",
    previewType: "spatial",
    description:
      "A moving spatial language combining expressive typography with depth and cinematic behavior.",
  },

  "Brand|Development|Typography": {
    title: "Responsive Visual Platform",
    previewType: "interface",
    description:
      "A scalable digital identity combining responsive typography and product technology.",
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

  const selectedIdsSetRef = useRef(new Set<number>());
  const generatedIdsSetRef = useRef(new Set<number>());
  const requestRenderRef = useRef<() => void>(() => undefined);
  const generationTimeoutRef = useRef<number | null>(null);
  const generationRef = useRef<GenerationState>({
    active: false,
    startTime: 0,
    duration: 650,
  });
  const hoverChargeRef = useRef({
    nodeId: -1,
    startTime: 0,
  });

  const pointerRef = useRef<PointerState>({
    x: 0,
    y: 0,
    active: false,
    speed: 0,
    lastX: 0,
    lastY: 0,
    lastTime: 0,
  });

  const sizeRef = useRef({
    width: 0,
    height: 0,
  });

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [generatedConcept, setGeneratedConcept] =
    useState<GeneratedConcept | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeDisciplineId, setActiveDisciplineId] =
    useState<number | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] =
    useState<boolean>(false);

  const selectedLabels = selectedIds.map((id) => NODE_LABELS[id]);

  const cancelPendingGeneration = () => {
    if (generationTimeoutRef.current !== null) {
      window.clearTimeout(generationTimeoutRef.current);
      generationTimeoutRef.current = null;
    }

    generationRef.current.active = false;
    generatedIdsSetRef.current = new Set();
    setIsGenerating(false);
  };

  const createConcept = (ids: number[]) => {
    const labels = ids.map((id) => NODE_LABELS[id]);
    const conceptKey = [...labels].sort().join("|");
    const existingConcept = CONCEPTS[conceptKey];

    if (existingConcept) {
      return existingConcept;
    }

    const seed = ids.reduce((sum, id) => sum + id, 0);
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
    const previewType: PreviewType = labels.includes("3D")
      ? "spatial"
      : labels.includes("Sound")
        ? "sonic"
        : labels.includes("AI")
          ? "generative"
          : labels.includes("Development")
            ? "dashboard"
            : labels.includes("Typography")
              ? "editorial"
              : labels.includes("Brand")
                ? "identity"
                : "interface";

    return {
      title: `${prefixes[seed % prefixes.length]} ${
        subjects[(seed + labels.length) % subjects.length]
      }`,
      description: `A creative direction combining ${labels.join(
        ", ",
      )} into one connected and interactive system.`,
      previewType,
    };
  };

  const startGeneration = (ids: number[]) => {
    cancelPendingGeneration();

    const concept = createConcept(ids);

    setGeneratedConcept(null);
    setIsResultModalOpen(false);
    setIsGenerating(true);
    generationRef.current = {
      active: true,
      startTime: performance.now(),
      duration: 650,
    };
    requestRenderRef.current();

    generationTimeoutRef.current = window.setTimeout(() => {
      generationTimeoutRef.current = null;
      generationRef.current.active = false;
      generatedIdsSetRef.current = new Set(ids);
      setGeneratedConcept(concept);
      setIsResultModalOpen(true);
      setIsGenerating(false);
      requestRenderRef.current();
    }, generationRef.current.duration);
  };

  const toggleNodeSelection = (nodeId: number) => {
    cancelPendingGeneration();

    setSelectedIds((currentIds) => {
      let nextIds: number[];

      if (currentIds.includes(nodeId)) {
        nextIds = currentIds.filter((id) => id !== nodeId);
      } else if (currentIds.length < MAX_SELECTED_NODES) {
        nextIds = [...currentIds, nodeId];
      } else {
        return currentIds;
      }

      selectedIdsSetRef.current = new Set(nextIds);
      requestRenderRef.current();

      return nextIds;
    });

    setGeneratedConcept(null);
    setIsResultModalOpen(false);
  };

  const clearSelection = () => {
    cancelPendingGeneration();
    selectedIdsSetRef.current = new Set();
    setSelectedIds([]);
    setGeneratedConcept(null);
    setIsResultModalOpen(false);
    requestRenderRef.current();
  };

  const generateConnection = () => {
    if (selectedIds.length < 2) {
      return;
    }

    startGeneration(selectedIds);
  };

  const surpriseMe = () => {
    const availableIds = NODE_LABELS.map((_, id) => id);

    for (let index = availableIds.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));

      [availableIds[index], availableIds[randomIndex]] = [
        availableIds[randomIndex],
        availableIds[index],
      ];
    }

    const ids = availableIds.slice(0, Math.random() < 0.55 ? 2 : 3);

    selectedIdsSetRef.current = new Set(ids);
    setSelectedIds(ids);
    setActiveDisciplineId(ids[0]);
    startGeneration(ids);
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
      const randomOffset = Math.min(width, height) * 0.05;

      nodesRef.current = NODE_LABELS.map((label, index) => {
        const baseAngle = (Math.PI * 2 * index) / NODE_LABELS.length;
        const angle = baseAngle + (Math.random() - 0.5) * 0.24;
        const nodeOrbit = orbitRadius * (0.82 + Math.random() * 0.18);
        const movementAngle = Math.random() * Math.PI * 2;
        const movementSpeed = 0.16 + Math.random() * 0.12;

        return {
          id: index,
          label,

          x:
            centerX +
            Math.cos(angle) * nodeOrbit +
            (Math.random() - 0.5) * randomOffset,

          y:
            centerY +
            Math.sin(angle) * nodeOrbit +
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

      const isMobile = window.matchMedia(
        "(max-width: 700px), (pointer: coarse)",
      ).matches;
      const pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        isMobile ? 1.5 : 2,
      );

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

      requestRenderRef.current();
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);

    resizeObserver.observe(canvas);
    resizeCanvas();

    const updateNodes = (
      nodes: NetworkNode[],
      timeScale: number,
      simplifiedMotion: boolean,
      time: number,
    ) => {
      const { width, height } = sizeRef.current;
      const centerX = width / 2;
      const centerY = height / 2;
      const generatedNodes = generatedIdsSetRef.current;

      if (!simplifiedMotion) {
        for (const [firstIndex, secondIndex] of NODE_PAIRS) {
          const firstNode = nodes[firstIndex];
          const secondNode = nodes[secondIndex];
          const deltaX = secondNode.x - firstNode.x;
          const deltaY = secondNode.y - firstNode.y;
          const distance = Math.max(Math.hypot(deltaX, deltaY), 0.01);
          const directionX = deltaX / distance;
          const directionY = deltaY / distance;

          let force = 0;

          if (distance < REPULSION_DISTANCE) {
            force = -(1 - distance / REPULSION_DISTANCE) * 0.05;
          } else if (
            generatedNodes.has(firstNode.id) &&
            generatedNodes.has(secondNode.id) &&
            distance > 150
          ) {
            force = (distance - 150) * 0.000055;
          }

          const forceX = directionX * force * timeScale;
          const forceY = directionY * force * timeScale;

          if (draggedNodeRef.current !== firstNode) {
            firstNode.vx += forceX;
            firstNode.vy += forceY;
          }

          if (draggedNodeRef.current !== secondNode) {
            secondNode.vx -= forceX;
            secondNode.vy -= forceY;
          }
        }
      }

      const pointer = pointerRef.current;

      for (const node of nodes) {
        if (draggedNodeRef.current !== node) {
          node.vx += (centerX - node.x) * 0.000003 * timeScale;
          node.vy += (centerY - node.y) * 0.000003 * timeScale;

          const flowStrength = simplifiedMotion ? 0.0012 : 0.0032;

          node.vx +=
            Math.sin(time * 0.00055 + node.id * 1.7) *
            flowStrength *
            timeScale;
          node.vy +=
            Math.cos(time * 0.00047 + node.id * 2.1) *
            flowStrength *
            timeScale;

          if (pointer.active && !simplifiedMotion) {
            const pointerDeltaX = node.x - pointer.x;
            const pointerDeltaY = node.y - pointer.y;
            const pointerDistance = Math.max(
              Math.hypot(pointerDeltaX, pointerDeltaY),
              0.01,
            );

            if (pointerDistance < POINTER_RADIUS) {
              const activity = Math.min(pointer.speed / 1.2, 1);
              const pointerForce =
                (1 - pointerDistance / POINTER_RADIUS) *
                (0.008 + activity * 0.018) *
                timeScale;

              node.vx +=
                (pointerDeltaX / pointerDistance) * pointerForce;
              node.vy +=
                (pointerDeltaY / pointerDistance) * pointerForce;
            }
          }

          const damping = Math.pow(simplifiedMotion ? 0.985 : 0.992, timeScale);
          node.vx *= damping;
          node.vy *= damping;

          const speed = Math.hypot(node.vx, node.vy);
          const minimumSpeed = simplifiedMotion ? 0.055 : 0.1;
          const maximumSpeed = simplifiedMotion ? 0.5 : 0.75;

          if (speed > maximumSpeed) {
            node.vx = (node.vx / speed) * maximumSpeed;
            node.vy = (node.vy / speed) * maximumSpeed;
          } else if (speed < minimumSpeed) {
            const driftAngle = time * 0.00015 + node.id * 1.7;

            if (speed > 0.001) {
              node.vx = (node.vx / speed) * minimumSpeed;
              node.vy = (node.vy / speed) * minimumSpeed;
            } else {
              node.vx = Math.cos(driftAngle) * minimumSpeed;
              node.vy = Math.sin(driftAngle) * minimumSpeed;
            }
          }

          node.x += node.vx * timeScale;
          node.y += node.vy * timeScale;
        }

        if (
          node.x <= CANVAS_MARGIN ||
          node.x >= width - CANVAS_MARGIN
        ) {
          node.vx *= -0.72;
          node.x = Math.min(
            Math.max(node.x, CANVAS_MARGIN),
            width - CANVAS_MARGIN,
          );
        }

        if (
          node.y <= CANVAS_MARGIN ||
          node.y >= height - CANVAS_MARGIN
        ) {
          node.vy *= -0.72;
          node.y = Math.min(
            Math.max(node.y, CANVAS_MARGIN),
            height - CANVAS_MARGIN,
          );
        }
      }
    };

    const drawElectricConnection = (
      firstNode: NetworkNode,
      secondNode: NetworkNode,
      time: number,
      intensity: number,
      showImpulse: boolean,
    ) => {
      const deltaX = secondNode.x - firstNode.x;
      const deltaY = secondNode.y - firstNode.y;
      const distance = Math.max(Math.hypot(deltaX, deltaY), 1);
      const normalX = -deltaY / distance;
      const normalY = deltaX / distance;
      const segments = 9;

      context.save();
      context.beginPath();
      context.moveTo(firstNode.x, firstNode.y);

      for (let index = 1; index < segments; index += 1) {
        const progress = index / segments;
        const jitter =
          Math.sin(time * 0.025 + index * 2.8 + firstNode.id) *
          1.8 *
          intensity;

        context.lineTo(
          firstNode.x + deltaX * progress + normalX * jitter,
          firstNode.y + deltaY * progress + normalY * jitter,
        );
      }

      context.lineTo(secondNode.x, secondNode.y);
      context.strokeStyle = `rgba(255, 255, 255, ${0.24 + intensity * 0.62})`;
      context.lineWidth = 0.8 + intensity * 0.9;
      context.shadowColor = "rgba(255, 255, 255, 0.9)";
      context.shadowBlur = intensity * 9;
      context.stroke();

      if (showImpulse) {
        const generation = generationRef.current;
        const progress = Math.min(
          Math.max((time - generation.startTime) / generation.duration, 0),
          1,
        );
        const impulseProgress = Math.min(progress * 1.18, 1);
        const impulseX = firstNode.x + deltaX * impulseProgress;
        const impulseY = firstNode.y + deltaY * impulseProgress;

        context.beginPath();
        context.arc(impulseX, impulseY, 2.4 + intensity * 1.8, 0, Math.PI * 2);
        context.fillStyle = `rgba(255, 255, 255, ${0.55 + intensity * 0.45})`;
        context.shadowBlur = 18;
        context.fill();
      }

      context.restore();
    };

    const drawConnections = (nodes: NetworkNode[], time: number) => {
      const selectedNodes = selectedIdsSetRef.current;
      const generatedNodes = generatedIdsSetRef.current;
      const pointer = pointerRef.current;
      const generation = generationRef.current;
      const generationProgress = generation.active
        ? Math.min(
            Math.max((time - generation.startTime) / generation.duration, 0),
            1,
          )
        : 0;
      const generationIntensity = Math.sin(generationProgress * Math.PI);

      for (const [firstIndex, secondIndex] of NODE_PAIRS) {
        const firstNode = nodes[firstIndex];
        const secondNode = nodes[secondIndex];
        const deltaX = secondNode.x - firstNode.x;
        const deltaY = secondNode.y - firstNode.y;
        const distance = Math.hypot(deltaX, deltaY);
        const isSelectedConnection =
          selectedNodes.has(firstNode.id) &&
          selectedNodes.has(secondNode.id);

        if (!isSelectedConnection && distance > CONNECTION_DISTANCE) {
          continue;
        }

        if (isSelectedConnection) {
          const isGeneratedConnection =
            generatedNodes.has(firstNode.id) &&
            generatedNodes.has(secondNode.id);
          const electricIntensity = generation.active
            ? 0.35 + generationIntensity * 0.65
            : isGeneratedConnection
              ? 0.3
              : 0.14;

          drawElectricConnection(
            firstNode,
            secondNode,
            time,
            electricIntensity,
            generation.active,
          );
          continue;
        }

        const strength = 1 - distance / CONNECTION_DISTANCE;
        const pointerDistance = Math.min(
          Math.hypot(pointer.x - firstNode.x, pointer.y - firstNode.y),
          Math.hypot(pointer.x - secondNode.x, pointer.y - secondNode.y),
        );
        const hoverCharge = Math.min(
          Math.max((time - hoverChargeRef.current.startTime) / 300, 0),
          1,
        );
        const pointerLight = pointer.active
          ? Math.max(0, 1 - pointerDistance / 180) *
            (0.08 + hoverCharge * 0.14)
          : 0;

        context.beginPath();
        context.moveTo(firstNode.x, firstNode.y);
        context.lineTo(secondNode.x, secondNode.y);
        context.strokeStyle = `rgba(
          255,
          255,
          255,
          ${Math.min(0.72, Math.max(0, strength) * 0.5 + pointerLight)}
        )`;
        context.lineWidth = 1;
        context.stroke();
      }
    };

    const drawPointerGlow = (simplifiedMotion: boolean) => {
      const pointer = pointerRef.current;

      if (!pointer.active || simplifiedMotion) {
        return;
      }

      const activity = Math.min(pointer.speed / 1.2, 1);
      const glowRadius = 80 + activity * 35;
      const gradient = context.createRadialGradient(
        pointer.x,
        pointer.y,
        0,
        pointer.x,
        pointer.y,
        glowRadius,
      );

      gradient.addColorStop(0, `rgba(255, 255, 255, ${0.035 + activity * 0.025})`);
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      context.fillStyle = gradient;
      context.fillRect(
        pointer.x - glowRadius,
        pointer.y - glowRadius,
        glowRadius * 2,
        glowRadius * 2,
      );
    };

    const drawElectricHalo = (
      node: NetworkNode,
      time: number,
      intensity: number,
    ) => {
      const segments = 22;
      const baseRadius = node.radius + 24;
      const phase = time * 0.018 + node.id * 1.7;

      const flash =
        (0.45 +
          Math.max(0, Math.sin(time * 0.03 + node.id * 2.4)) * 0.55) *
        intensity;

      context.save();

      context.lineCap = "round";
      context.lineJoin = "round";
      context.shadowColor = "rgba(255, 255, 255, 0.9)";
      context.shadowBlur = 4 + intensity * 10;

      /*
       * Draw two irregular electric rings.
       */
      for (let layer = 0; layer < 2; layer += 1) {
        context.beginPath();

        for (let index = 0; index <= segments; index += 1) {
          const angle = (Math.PI * 2 * index) / segments;

          const distortion =
            Math.sin(index * 2.7 + phase + layer * 1.9) * 2.8 +
            Math.sin(index * 5.3 - phase * 1.4) * 1.2;

          const radius =
            baseRadius +
            distortion +
            layer * 3;

          const x = node.x + Math.cos(angle) * radius;
          const y = node.y + Math.sin(angle) * radius;

          if (index === 0) {
            context.moveTo(x, y);
          } else {
            context.lineTo(x, y);
          }
        }

        context.strokeStyle =
          layer === 0
            ? `rgba(255, 255, 255, ${0.7 * flash})`
            : `rgba(255, 255, 255, ${0.24 * flash})`;

        context.lineWidth = layer === 0 ? 1.3 : 0.8;
        context.stroke();
      }

      /*
       * Draw short lightning branches.
       */
      for (let branch = 0; branch < 3; branch += 1) {
        const angle =
          phase * 0.35 +
          branch * ((Math.PI * 2) / 3);

        const bend =
          angle +
          Math.sin(phase * 1.4 + branch) * 0.14;

        const startRadius = baseRadius - 1;
        const middleRadius =
          baseRadius + 8 + Math.sin(phase + branch) * 3;
        const endRadius =
          baseRadius + 15 + Math.cos(phase * 0.7 + branch) * 4;

        context.beginPath();

        context.moveTo(
          node.x + Math.cos(angle) * startRadius,
          node.y + Math.sin(angle) * startRadius,
        );

        context.lineTo(
          node.x + Math.cos(bend) * middleRadius,
          node.y + Math.sin(bend) * middleRadius,
        );

        context.lineTo(
          node.x + Math.cos(angle - 0.06) * endRadius,
          node.y + Math.sin(angle - 0.06) * endRadius,
        );

        context.strokeStyle =
          `rgba(255, 255, 255, ${0.6 * flash})`;

        context.lineWidth = 1;
        context.stroke();
      }

      context.restore();
    };

    const drawNodes = (
      nodes: NetworkNode[],
      time: number,
      reducedMotion: boolean,
    ) => {
      const selectedNodes = selectedIdsSetRef.current;
      const generatedNodes = generatedIdsSetRef.current;
      const generation = generationRef.current;
      const generationProgress = generation.active
        ? Math.min(
            Math.max((time - generation.startTime) / generation.duration, 0),
            1,
          )
        : 0;
      const generationEnergy = Math.sin(generationProgress * Math.PI);

      context.font = "500 12px Arial, sans-serif";
      context.textAlign = "center";
      context.textBaseline = "top";

      for (const node of nodes) {
        const isDragged = draggedNodeRef.current === node;
        const isHovered = hoveredNodeRef.current === node;
        const isSelected = selectedNodes.has(node.id);
        const isGenerated = generatedNodes.has(node.id);
        const hoverCharge =
          isHovered && hoverChargeRef.current.nodeId === node.id
            ? Math.min(
                Math.max(
                  (time - hoverChargeRef.current.startTime) / 300,
                  0,
                ),
                1,
              )
            : 0;
        const generationFlash =
          generation.active && isSelected
            ? generationEnergy * (0.65 + Math.sin(time * 0.045 + node.id) * 0.35)
            : 0;

        if (isHovered && !isDragged) {
          drawElectricHalo(node, time, hoverCharge);
        }

        const pulse = reducedMotion
          ? 1
          : 1 +
            Math.sin(time * (isGenerated ? 0.006 : 0.004) + node.id) *
              (isGenerated ? 0.12 : 0.08);

        if (isSelected) {
          context.beginPath();

          context.arc(
            node.x,
            node.y,
            (node.radius + 18) * pulse,
            0,
            Math.PI * 2,
          );

          context.strokeStyle = `rgba(255, 255, 255, ${
            0.28 + generationFlash * 0.55 + (isGenerated ? 0.15 : 0)
          })`;
          context.lineWidth = 1;
          context.stroke();
        }

        context.beginPath();

        context.arc(
          node.x,
          node.y,
          isDragged || isSelected
            ? node.radius + 3 + generationFlash * 2
            : node.radius + hoverCharge * 2,
          0,
          Math.PI * 2,
        );

        context.fillStyle =
          isSelected || isDragged
            ? "rgba(255, 255, 255, 1)"
            : isHovered
              ? "rgba(255, 255, 255, 0.96)"
            : "rgba(255, 255, 255, 0.82)";

        context.shadowColor = "rgba(255, 255, 255, 0.4)";
        context.shadowBlur = isDragged || isSelected ? 14 : isHovered ? 10 : 0;
        context.fill();
        context.shadowBlur = 0;

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

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const mobileQuery = window.matchMedia(
      "(max-width: 700px), (pointer: coarse)",
    );

    let animationFrameId = 0;
    let lastFrameTime = 0;
    let lastRenderedTime = 0;
    let isIntersecting = true;
    let isDocumentVisible = !document.hidden;
    let prefersReducedMotion = reducedMotionQuery.matches;
    let isMobile = mobileQuery.matches;

    const drawScene = (time: number, updatePhysics: boolean) => {
      const { width, height } = sizeRef.current;
      const nodes = nodesRef.current;
      const simplifiedMotion = isMobile || prefersReducedMotion;

      context.clearRect(0, 0, width, height);

      if (updatePhysics) {
        const timeScale = lastFrameTime
          ? Math.min((time - lastFrameTime) / 16.667, 2)
          : 1;

        updateNodes(nodes, timeScale, simplifiedMotion, time);
        lastFrameTime = time;
        pointerRef.current.speed *= 0.92;
      }

      drawPointerGlow(simplifiedMotion);
      drawConnections(nodes, time);
      drawNodes(nodes, time, prefersReducedMotion);
    };

    const canAnimate = () => isDocumentVisible && isIntersecting;

    function animate(time: number) {
      animationFrameId = 0;

      if (!canAnimate()) {
        return;
      }

      if (
        isMobile &&
        lastRenderedTime &&
        time - lastRenderedTime < 1000 / 30
      ) {
        animationFrameId = window.requestAnimationFrame(animate);
        return;
      }

      drawScene(time, !prefersReducedMotion);
      lastRenderedTime = time;

      if (!prefersReducedMotion) {
        animationFrameId = window.requestAnimationFrame(animate);
      }
    }

    const startAnimation = () => {
      if (canAnimate() && animationFrameId === 0) {
        lastFrameTime = 0;
        animationFrameId = window.requestAnimationFrame(animate);
      }
    };

    const stopAnimation = () => {
      if (animationFrameId !== 0) {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = 0;
      }

      lastFrameTime = 0;
    };

    requestRenderRef.current = () => {
      if (prefersReducedMotion) {
        startAnimation();
      }
    };

    const handleVisibilityChange = () => {
      isDocumentVisible = !document.hidden;

      if (isDocumentVisible) {
        startAnimation();
      } else {
        stopAnimation();
      }
    };

    const handleMotionPreferenceChange = () => {
      prefersReducedMotion = reducedMotionQuery.matches;
      stopAnimation();
      startAnimation();
    };

    const handleMobileChange = () => {
      isMobile = mobileQuery.matches;
      stopAnimation();
      resizeCanvas();
      startAnimation();
    };

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;

        if (isIntersecting) {
          startAnimation();
        } else {
          stopAnimation();
        }
      },
      { threshold: 0.01 },
    );

    intersectionObserver.observe(canvas);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    reducedMotionQuery.addEventListener(
      "change",
      handleMotionPreferenceChange,
    );
    mobileQuery.addEventListener("change", handleMobileChange);
    startAnimation();

    return () => {
      if (generationTimeoutRef.current !== null) {
        window.clearTimeout(generationTimeoutRef.current);
        generationTimeoutRef.current = null;
      }

      requestRenderRef.current = () => undefined;
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
      reducedMotionQuery.removeEventListener(
        "change",
        handleMotionPreferenceChange,
      );
      mobileQuery.removeEventListener("change", handleMobileChange);
      stopAnimation();
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

  const findNodeAtPosition = (position: Point, hitArea = 22) => {
    return [...nodesRef.current]
      .reverse()
      .find((node) => {
        const distance = Math.hypot(
          position.x - node.x,
          position.y - node.y,
        );

        return distance <= node.radius + hitArea;
      });
  };

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLCanvasElement>,
  ) => {
    event.preventDefault();

    const pointer = getPointerPosition(event);
    const hitArea = event.pointerType === "mouse" ? 22 : 34;
    const selectedNode = findNodeAtPosition(pointer, hitArea);

    pointerRef.current = {
      ...pointer,
      active: event.pointerType === "mouse",
      speed: 0,
      lastX: pointer.x,
      lastY: pointer.y,
      lastTime: event.timeStamp,
    };

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
    requestRenderRef.current();
  };

  const handlePointerMove = (
    event: ReactPointerEvent<HTMLCanvasElement>,
  ) => {
    const pointer = getPointerPosition(event);
    const draggedNode = draggedNodeRef.current;
    const previousPointer = pointerRef.current;
    const elapsedTime = Math.max(event.timeStamp - previousPointer.lastTime, 1);
    const pointerSpeed =
      Math.hypot(
        pointer.x - previousPointer.lastX,
        pointer.y - previousPointer.lastY,
      ) / elapsedTime;

    pointerRef.current = {
      ...pointer,
      active: event.pointerType === "mouse",
      speed: previousPointer.speed * 0.65 + pointerSpeed * 0.35,
      lastX: pointer.x,
      lastY: pointer.y,
      lastTime: event.timeStamp,
    };
    requestRenderRef.current();

    if (!draggedNode) {
      const hoveredNode = findNodeAtPosition(pointer, 18);

      hoveredNodeRef.current = hoveredNode ?? null;

      if (hoverChargeRef.current.nodeId !== (hoveredNode?.id ?? -1)) {
        hoverChargeRef.current = {
          nodeId: hoveredNode?.id ?? -1,
          startTime: performance.now(),
        };
        setActiveDisciplineId(hoveredNode?.id ?? null);
      }

      event.currentTarget.style.cursor = hoveredNode
        ? "pointer"
        : "default";

      return;
    }

    event.preventDefault();

    const { width, height } = sizeRef.current;

    const nextX = Math.min(
      Math.max(pointer.x, CANVAS_MARGIN),
      width - CANVAS_MARGIN,
    );
    const nextY = Math.min(
      Math.max(pointer.y, CANVAS_MARGIN),
      height - CANVAS_MARGIN,
    );

    draggedNode.vx = (nextX - draggedNode.x) * 0.18;
    draggedNode.vy = (nextY - draggedNode.y) * 0.18;
    draggedNode.x = nextX;
    draggedNode.y = nextY;
    requestRenderRef.current();
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
        pointerMovement <=
          (event.pointerType === "mouse"
            ? CLICK_DISTANCE
            : TOUCH_CLICK_DISTANCE) &&
        pointerStart.nodeId === draggedNode.id
      ) {
        toggleNodeSelection(draggedNode.id);
      }
    }

    draggedNodeRef.current = null;
    pointerStartRef.current = null;

    const hoveredNode =
      event.pointerType === "mouse"
        ? findNodeAtPosition(pointer, 18)
        : undefined;
    hoveredNodeRef.current = hoveredNode ?? null;
    pointerRef.current.active = event.pointerType === "mouse";

    if (hoveredNode) {
      hoverChargeRef.current = {
        nodeId: hoveredNode.id,
        startTime: performance.now(),
      };
      setActiveDisciplineId(hoveredNode.id);
    }

    event.currentTarget.style.cursor = hoveredNode
      ? "pointer"
      : "default";

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    requestRenderRef.current();
  };

  const handlePointerCancel = (
    event: ReactPointerEvent<HTMLCanvasElement>,
  ) => {
    draggedNodeRef.current = null;
    pointerStartRef.current = null;
    hoveredNodeRef.current = null;
    hoverChargeRef.current.nodeId = -1;
    pointerRef.current.active = false;
    pointerRef.current.speed = 0;

    event.currentTarget.style.cursor = "default";

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    requestRenderRef.current();
  };

  const handlePointerLeave = (
    event: ReactPointerEvent<HTMLCanvasElement>,
  ) => {
    if (!draggedNodeRef.current) {
      hoveredNodeRef.current = null;
      hoverChargeRef.current.nodeId = -1;
      setActiveDisciplineId(null);
      pointerRef.current.active = false;
      pointerRef.current.speed = 0;
      event.currentTarget.style.cursor = "default";
      requestRenderRef.current();
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

        <div className="network-container" aria-busy={isGenerating}>
          <div className="network-stage">
            <canvas
              ref={canvasRef}
              className="network-canvas"
              aria-hidden="true"
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
              <span
                id="network-discipline-label"
                className="network-panel-label"
              >
                Choose disciplines
              </span>

              <div
                className="network-node-controls"
                role="group"
                aria-labelledby="network-discipline-label"
              >
                {NODE_LABELS.map((label, id) => {
                  const isSelected = selectedIds.includes(id);

                  const isDisabled =
                    !isSelected &&
                    selectedIds.length >= MAX_SELECTED_NODES;

                  return (
                    <button
                      key={label}
                      type="button"
                      className={`network-discipline${
                        isSelected ? " is-selected" : ""
                      }`}
                      aria-pressed={isSelected}
                      disabled={isDisabled}
                      title={NODE_DESCRIPTIONS[id]}
                      onClick={() => toggleNodeSelection(id)}
                      onMouseEnter={() => setActiveDisciplineId(id)}
                      onMouseLeave={() => setActiveDisciplineId(null)}
                      onFocus={() => setActiveDisciplineId(id)}
                      onBlur={() => setActiveDisciplineId(null)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <span className="network-discipline-description">
                {activeDisciplineId === null
                  ? "Hover or focus a discipline to learn more."
                  : `${NODE_LABELS[activeDisciplineId]} — ${
                      NODE_DESCRIPTIONS[activeDisciplineId]
                    }`}
              </span>

              <span
                className="network-selection-count"
                aria-live="polite"
              >
                {selectedIds.length} of {MAX_SELECTED_NODES} selected
              </span>
            </div>

            <div className="network-actions">
              <button
                type="button"
                className="network-generate"
                disabled={selectedIds.length < 2 || isGenerating}
                onClick={generateConnection}
              >
                {isGenerating
                  ? "Generating…"
                  : "Generate connection"}
              </button>

              <button
                type="button"
                className="network-surprise"
                disabled={isGenerating}
                onClick={surpriseMe}
              >
                Surprise me
              </button>

              {generatedConcept && !isGenerating && (
                <button
                  type="button"
                  className="network-view-result"
                  onClick={() => setIsResultModalOpen(true)}
                >
                  View result
                </button>
              )}

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
        </div>

        {generatedConcept && isResultModalOpen && (
          <ConceptResultModal
            concept={generatedConcept}
            disciplines={selectedLabels}
            onClose={() => setIsResultModalOpen(false)}
          />
        )}
      </main>
    );
  }