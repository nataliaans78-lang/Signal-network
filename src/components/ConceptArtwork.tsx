import type { PreviewType } from "./ConceptPreview";

type ConceptArtworkProps = {
  disciplines: string[];
  concept: {
    title: string;
    description: string;
    previewType: PreviewType;
  };
};

const includesAll = (
  disciplines: string[],
  required: string[],
) => required.every((item) => disciplines.includes(item));

export default function ConceptArtwork({
  disciplines,
  concept,
}: ConceptArtworkProps) {
  const isEditorialSystem =
    concept.previewType === "editorial" ||
    includesAll(disciplines, [
      "Web",
      "Strategy",
      "Typography",
    ]);

  const isKineticIdentity =
    concept.previewType === "identity" ||
    includesAll(disciplines, [
      "Brand",
      "Motion",
    ]);

  const isAdaptiveInterface =
    concept.previewType === "generative" ||
    concept.previewType === "dashboard" ||
    includesAll(disciplines, [
      "AI",
      "Development",
    ]);

  const isResponsiveVisualPlatform =
    includesAll(disciplines, [
      "Development",
      "Brand",
      "Typography",
    ]) ||
    includesAll(disciplines, [
      "Web",
      "Brand",
      "Typography",
    ]);

  const isSpatialExperience =
    concept.previewType === "spatial" ||
    (disciplines.includes("3D") &&
      (disciplines.includes("Motion") ||
        disciplines.includes("Sound")));

  if (isEditorialSystem) {
    return (
      <div className="concept-artwork concept-artwork--editorial">
        <div className="editorial-grid" />

        <div className="editorial-symbol">
          <span>CF</span>
        </div>

        <div className="editorial-line editorial-line--one" />
        <div className="editorial-line editorial-line--two" />

        <div className="editorial-card editorial-card--one">
          <span>01</span>
          <strong>Structure</strong>
        </div>

        <div className="editorial-card editorial-card--two">
          <span>02</span>
          <strong>Direction</strong>
        </div>

        <div className="editorial-type">
          CONNECTED
          <br />
          SYSTEM
        </div>
      </div>
    );
  }

  if (isKineticIdentity) {
    return (
      <div className="concept-artwork concept-artwork--kinetic">
        <div className="kinetic-mark">
          <span>N</span>
          <span>N</span>
          <span>N</span>
        </div>

        <div className="kinetic-ring kinetic-ring--one" />
        <div className="kinetic-ring kinetic-ring--two" />

        <p>{concept.title}</p>
      </div>
    );
  }

  if (isAdaptiveInterface) {
    return (
      <div className="concept-artwork concept-artwork--adaptive">
        <div className="adaptive-status">
          <i />
          Adaptive system active
        </div>

        <div className="adaptive-chart">
          {Array.from({ length: 12 }, (_, index) => (
            <span
              key={index}
              style={{
                height: `${20 + ((index * 17) % 72)}%`,
              }}
            />
          ))}
        </div>

        <div className="adaptive-cards">
          <div>Input</div>
          <div>Process</div>
          <div>Output</div>
        </div>
      </div>
    );
  }

  if (isSpatialExperience) {
    return (
      <div className="concept-artwork concept-artwork--spatial">
        <div className="spatial-plane spatial-plane--one" />
        <div className="spatial-plane spatial-plane--two" />
        <div className="spatial-plane spatial-plane--three" />

        <div className="spatial-core">
          <span>{disciplines[0]}</span>
        </div>
      </div>
    );
  }

  if (isResponsiveVisualPlatform) {
    return (
      <div className="concept-artwork concept-artwork--platform">
        <div className="platform-grid" />

        <header className="platform-header">
          <div className="platform-logo">
            N<span>/</span>
          </div>

          <div className="platform-status">
            <i />
            System online
          </div>
        </header>

        <div className="platform-scene">
          <div className="platform-aura" />

          <div className="platform-device">
            <div className="platform-device__sidebar">
              <span />
              <span />
              <span />
            </div>

            <div className="platform-device__body">
              <small>Responsive identity</small>

              <div className="platform-device__metrics">
                <div>
                  <span>Brand</span>
                  <strong>01</strong>
                </div>

                <div>
                  <span>Type</span>
                  <strong>02</strong>
                </div>

                <div>
                  <span>Build</span>
                  <strong>03</strong>
                </div>
              </div>

              <div className="platform-device__hero">
                <div className="platform-device__hero-mark">N/</div>

                <div>
                  <strong>{concept.title}</strong>
                  <p>{concept.description}</p>
                </div>
              </div>

              <div className="platform-bars">
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
            </div>
          </div>

          <div className="platform-phone">
            <div className="platform-phone__screen">
              <div className="platform-phone__header" />

              <div className="platform-phone__title" />

              <div className="platform-phone__line" />
              <div className="platform-phone__line short" />

              <div className="platform-phone__card" />
              <div className="platform-phone__card small" />
            </div>
          </div>

          <div className="platform-chip platform-chip--brand">
            Brand
          </div>

          <div className="platform-chip platform-chip--type">
            Typography
          </div>

          <div className="platform-chip platform-chip--dev">
            Development
          </div>

          <div className="platform-link platform-link--one" />
          <div className="platform-link platform-link--two" />
          <div className="platform-link platform-link--three" />
        </div>

        <div className="platform-code" aria-hidden="true">
          <span>01</span>
          <code>brand.system.initialize()</code>

          <span>02</span>
          <code>type.scale = responsive</code>

          <span>03</span>
          <code>ui.render("adaptive")</code>
        </div>

        <div className="platform-cursor" aria-hidden="true">
          <span />
        </div>
      </div>
    );
  }

  return (
    <div className="concept-artwork concept-artwork--default">
      {disciplines.map((discipline, index) => {
        const angle =
          (Math.PI * 2 * index) / disciplines.length;

        return (
          <div
            key={discipline}
            className="default-node"
            style={{
              left: `${50 + Math.cos(angle) * 31}%`,
              top: `${50 + Math.sin(angle) * 31}%`,
            }}
          >
            {discipline}
          </div>
        );
      })}

      <div className="default-core">
        <span>Connected</span>
      </div>
    </div>
  );
}
