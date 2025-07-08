// components/common/InfoTip.jsx
import { Info } from "lucide-react";

function InfoTip({ children }) {
  return (
    <div className="info-tip">
      <Info className="info-icon" />
      <span className="info-text">{children}</span>
    </div>
  );
}

export default InfoTip;
