import { PDFDocument, rgb } from "pdf-lib";
import * as fontkit from "fontkit";
import { formatGrossPrice } from "./product";

export async function generatePaymentPDF({ orderNumber, payment }) {
  const fontUrl = `${window.location.origin}/fonts/Roboto/Roboto-Regular.ttf`;
  const fontRes = await fetch(fontUrl);
  const fontBuffer = await fontRes.arrayBuffer();

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const roboto = await pdfDoc.embedFont(fontBuffer);

  const page = pdfDoc.addPage([595, 842]); // A4
  const { height } = page.getSize();
  const fontSize = 12;
  let y = height - 40;

  page.drawText("Dane do przelewu", {
    x: 40,
    y,
    size: 18,
    font: roboto,
    color: rgb(0, 0, 0),
  });
  y -= 30;

  [
    `Zamówienie: ${orderNumber}`,
    `Odbiorca: ${process.env.REACT_APP_RECIPIENT_NAME || "-"}`,
    `Tytuł przelewu: ${payment.title}`,
    `Kwota: ${formatGrossPrice(payment.amount)} zł`,
    `Nr konta: ${payment.bankAccount}`,
    `Bank: ${process.env.REACT_APP_BANK_NAME || "-"}`,
  ].forEach((text) => {
    page.drawText(text, { x: 40, y, size: fontSize, font: roboto });
    y -= 20;
  });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  return url;
}
