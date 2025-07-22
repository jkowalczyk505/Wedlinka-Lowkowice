// src/components/checkout/CheckoutSteps.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function CheckoutSteps({ currentStep }) {
  const navigate = useNavigate();
  const steps = [
    { id: 1, label: "Koszyk", path: "/koszyk" },
    { id: 2, label: "Dostawa i płatność", path: "/zamowienie" },
    { id: 3, label: "Podsumowanie", path: "/podsumowanie" },
  ];
  const lastStep = steps.length;

  return (
    <div className="cart-steps">
      {steps.map((step) => {
        const isDone =
          step.id < currentStep ||
          (currentStep === lastStep && step.id === currentStep);
        const isActive = step.id === currentStep;
        const isClickable = step.id < currentStep;

        return (
          <div
            key={step.id}
            className={
              "step" +
              (isDone ? " done clickable" : "") +
              (isActive ? " active" : "")
            }
            style={{ cursor: isClickable ? "pointer" : "default" }}
            onClick={() => isClickable && navigate(step.path)}
            data-content={step.id}
          >
            <span className="step-label">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}
