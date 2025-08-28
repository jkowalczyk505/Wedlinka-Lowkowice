import { useState } from "react";
import Button from "../common/Button";
import { AuthFetch } from "../auth/AuthFetch";

const API_URL = process.env.REACT_APP_API_URL;

function filenameFromDisposition(disposition, fallback) {
  try {
    if (!disposition) return fallback;
    // filename*=UTF-8''xxx.pdf lub filename="xxx.pdf"
    const star = /filename\*\=UTF-8''([^;]+)/i.exec(disposition);
    if (star && star[1]) return decodeURIComponent(star[1]);
    const plain = /filename="?([^"]+)"?/i.exec(disposition);
    if (plain && plain[1]) return plain[1];
  } catch {}
  return fallback;
}

export default function DownloadInvoicePDFButton({ orderId, fallbackName }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const res = await AuthFetch(`${API_URL}/api/invoices/${orderId}/pdf`);
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Nie udało się pobrać faktury.");
      }

      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition");
      const name = filenameFromDisposition(
        cd,
        fallbackName || `faktura-${orderId}.pdf`
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e.message || "Błąd pobierania faktury.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button
      variant="beige"
      onClick={handleDownload}
      disabled={downloading}
      className="mt-8"
    >
      {downloading ? "Pobieranie…" : "Pobierz (PDF)"}
    </Button>
  );
}
