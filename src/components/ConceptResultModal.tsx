import { useEffect, useRef, type MouseEvent } from "react";
import { createPortal } from "react-dom";

import ConceptPreview, { type PreviewType } from "./ConceptPreview";

type GeneratedConcept = {
  title: string;
  description: string;
  previewType: PreviewType;
};

type ConceptResultModalProps = {
  concept: GeneratedConcept;
  disciplines: string[];
  onClose: () => void;
};

export default function ConceptResultModal({
  concept,
  disciplines,
  onClose,
}: ConceptResultModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleBackdropClick = (
    event: MouseEvent<HTMLDivElement>,
  ) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="concept-modal"
      onMouseDown={handleBackdropClick}
    >
      <div
        className="concept-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="concept-modal-title"
        aria-describedby="concept-modal-description"
      >
        <header className="concept-modal__header">
          <div className="concept-modal__meta">
            <span>Generated connection</span>
            <strong>{disciplines.join(" + ")}</strong>
          </div>

          <div className="concept-modal__summary">
            <h2 id="concept-modal-title">
              {concept.title}
            </h2>

            <p id="concept-modal-description">
              {concept.description}
            </p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            className="concept-modal__close"
            aria-label="Close generated concept"
            onClick={onClose}
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="concept-modal__preview">
          <ConceptPreview
            concept={concept}
            disciplines={disciplines}
            compact
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}