import { useMemo, useState, type CSSProperties } from "react";

import ConceptArtwork from "./ConceptArtwork";

export type PreviewType =
  | "identity"
  | "editorial"
  | "interface"
  | "dashboard"
  | "spatial"
  | "sonic"
  | "generative";

type PreviewConcept = {
  title: string;
  description: string;
  previewType: PreviewType;
};

type ConceptPreviewProps = {
  concept: PreviewConcept;
  disciplines: string[];
  compact?: boolean;
};

const DISCIPLINE_COPY: Record<string, string> = {
  Brand: "Identity system",
  Strategy: "Clear direction",
  Motion: "Responsive movement",
  Web: "Digital interface",
  "3D": "Spatial layer",
  Sound: "Sonic feedback",
  Typography: "Editorial voice",
  AI: "Adaptive logic",
  Development: "Scalable system",
};

const LAYOUT_NAMES = ["Overview", "System", "Prototype"];

export default function ConceptPreview({
  concept,
  disciplines,
  compact = false,
}: ConceptPreviewProps) {
  const [layoutIndex, setLayoutIndex] = useState(0);
  const [activeCard, setActiveCard] = useState(0);

  const features = useMemo(
    () =>
      disciplines.map((discipline) => ({
        discipline,
        description:
          DISCIPLINE_COPY[discipline] ?? "Connected creative layer",
      })),
    [disciplines],
  );

  const hasMotion = disciplines.includes("Motion");
  const hasSound = disciplines.includes("Sound");
  const hasAi = disciplines.includes("AI");
  const hasThreeD = disciplines.includes("3D");

  const hasWeb =
    disciplines.includes("Web") ||
    disciplines.includes("Development");

  const nextLayout = () => {
    setLayoutIndex(
      (current) => (current + 1) % LAYOUT_NAMES.length,
    );

    setActiveCard(
      (current) => (current + 1) % Math.max(features.length, 1),
    );
  };

  return (
    <section
      className={`concept-preview concept-preview--layout-${layoutIndex}${
          compact ? " concept-preview--modal" : ""
        }${hasMotion ? " has-motion" : ""}${
          hasThreeD ? " has-depth" : ""
        }`}
        aria-label={`Concept preview for ${concept.title}`}
    >
      <div className="concept-preview__toolbar">
        <div>
          <span className="concept-preview__eyebrow">
            Concept preview
          </span>

          <strong>{LAYOUT_NAMES[layoutIndex]}</strong>
        </div>

        <button type="button" onClick={nextLayout}>
          Regenerate layout
        </button>
      </div>

      <div className="concept-preview__frame">
        {hasWeb && (
          <div
            className="concept-preview__browser-bar"
            aria-hidden="true"
          >
            <span />
            <span />
            <span />

            <small>n-system.local</small>
          </div>
        )}

          {!compact && (
            <div className="concept-preview__hero">
              <div
                className="concept-preview__mark"
                aria-hidden="true"
              >
                N/
              </div>

              <div>
                <span>{disciplines.join(" / ")}</span>
                <h3>{concept.title}</h3>
                <p>{concept.description}</p>
              </div>

              {hasAi && (
                <div className="concept-preview__ai-status">
                  <span />
                  Adaptive mode
                </div>
              )}
            </div>
          )}

        <div className="concept-preview__workspace">
          <div className="concept-preview__cards">
            {features.map((feature, index) => (
              <button
                key={feature.discipline}
                type="button"
                className={
                  index === activeCard ? "is-active" : ""
                }
                onClick={() => setActiveCard(index)}
              >
                <span>0{index + 1}</span>

                <strong>{feature.discipline}</strong>

                <small>{feature.description}</small>
              </button>
            ))}
          </div>

          <div className="concept-preview__visual">
            <ConceptArtwork
              concept={concept}
              disciplines={disciplines}
            />

            {hasSound && (
              <div
                className="concept-preview__waveform"
                aria-hidden="true"
              >
                {Array.from(
                  { length: 18 },
                  (_, index) => (
                    <i
                      key={index}
                      style={
                        {
                          "--wave-index": index,
                          height: `${
                            8 + (index % 6) * 4
                          }px`,
                        } as CSSProperties
                      }
                    />
                  ),
                )}
              </div>
            )}
          </div>
        </div>

        <div className="concept-preview__footer">
          <span>Prototype 0{layoutIndex + 1}</span>
          <span>{features.length} connected layers</span>
          <span>
            {hasMotion ? "Live motion" : "Static system"}
          </span>
        </div>
      </div>
    </section>
  );
}
