import React from "react";

export default function CheckoutSteps({ currentStep }) {
  const steps = [
    { id: 1, label: "Koszyk", to: "/koszyk" },
    { id: 2, label: "Dostawa i płatność", to: "/dostawa" },
    { id: 3, label: "Podsumowanie", to: "/podsumowanie" },
  ];

  return (
    <div className="cart-steps">
      {steps.map((step) => (
        <div
          key={step.id}
          className={`step${step.id === currentStep ? " active" : ""}`}
          data-step={step.id}
        >
          {step.id < currentStep ? (
            // jeśli już za tobą, zamiast numeru daj checkmark
            <span className="step-icon">✓</span>
          ) : null}
          <span>{step.label}</span>
        </div>
      ))}
    </div>
  );
}
