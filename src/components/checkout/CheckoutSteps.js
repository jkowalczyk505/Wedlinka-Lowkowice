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

  return (
    <div className="cart-steps">
      {steps.map((step) => {
        const isDone = step.id < currentStep;
        const isActive = step.id === currentStep;
        return (
          <div
            key={step.id}
            className={
              "step" +
              (isActive ? " active" : "") +
              (isDone ? " done clickable" : "")
            }
            style={{ cursor: isDone ? "pointer" : "default" }}
            onClick={() => isDone && navigate(step.path)}
            data-content={step.id}
          >
            <span className="step-label">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}
