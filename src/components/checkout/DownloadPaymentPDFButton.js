// components/checkout/DownloadPaymentPDFButton.jsx
import Button from "../common/Button";
import { generatePaymentPDF } from "../../utils/paymentPdf";

export default function DownloadPaymentPDFButton({ orderNumber, payment }) {
  const handleDownloadPDF = async () => {
    try {
      const url = await generatePaymentPDF({ orderNumber, payment });
      const a = document.createElement("a");
      a.href = url;
      a.download = `dane-przelewu-${orderNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Błąd generowania PDF:", error);
    }
  };

  if (!orderNumber || !payment?.method || payment.method !== "bank_transfer") {
    return null;
  }

  return (
    <Button onClick={handleDownloadPDF}>Pobierz dane do przelewu (PDF)</Button>
  );
}
