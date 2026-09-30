"use client";

import { useEffect, useId } from "react";

type ModalProps = {
    title: string;
    onClose: () => void;
    // Extra classes for the panel, e.g. "max-w-md" for a narrow dialog.
    className?: string;
    children: React.ReactNode;
};

// Closes on Escape and on the × button. Render it only while open.
export default function Modal({
    title,
    onClose,
    className = "",
    children,
}: ModalProps) {
    const titleId = useId();

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    return (
        <div className="modal-backdrop">
            <div
                className={`modal-panel ${className}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
            >
                <div className="mb-2 flex items-center justify-between">
                    <h2 id={titleId} className="text-xl font-semibold">
                        {title}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="text-2xl leading-none text-muted transition-colors hover:text-ink"
                    >
                        ×
                    </button>
                </div>

                {children}
            </div>
        </div>
    );
}
