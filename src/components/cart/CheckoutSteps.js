import React from "react";

export default function CheckoutSteps({ currentStep }) {
  const steps = [
    { id: 1, label: "Koszyk" },
    { id: 2, label: "Dostawa i płatność" },
    { id: 3, label: "Podsumowanie" },
  ];

  return (
    <div className="cart-steps">
      {steps.map((step) => (
        <div
          key={step.id}
          className={`step${step.id === currentStep ? " active" : ""}${
            step.id < currentStep ? " done" : ""
          }`}
          data-content={step.id}
        >
          <span className="step-label">{step.label}</span>
        </div>
      ))}
    </div>
  );
}
