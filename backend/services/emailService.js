const nodemailer = require("nodemailer");
const { renderTemplate } = require("../helpers/emailTemplates");

const transporter = nodemailer.createTransport({
  host: "mail.wedlinkalowkowice.pl",
  port: 465,
  secure: true,
  auth: {
    user: "system@wedlinkalowkowice.pl",
    pass: process.env.SYSTEM_EMAIL_PASSWORD,
  },
});

const SHIPPING_PL = {
  pickup: "Odbiór osobisty",
  inpost: "Paczkomaty InPost 24/7",
  courier: "Kurier",
  courier_prepaid: "Kurier (przedpłata)",
  courier_cod: "Kurier (za pobraniem)",
};

const PAYMENT_PL = {
  przelewy24: "Płatność online (Przelewy24)",
  bank_transfer: "Przelew tradycyjny",
  cod: "Przy odbiorze",
};

const STATUS_PL = {
  processing: "Przyjęto do realizacji",
  shipped: "Wysłano",
  delivered: "Dostarczono",
  cancelled: "Anulowano",
};

exports.sendAccountCreatedEmail = async (to, name) => {
  const html = renderTemplate("accountCreated", { name });

  await transporter.sendMail({
    from: '"Wędlinka Łowkowice" <system@wedlinkalowkowice.pl>',
    to,
    subject: "Twoje konto zostało utworzone",
    html,
  });
};

exports.sendContactEmail = async (name, email, message) => {
  const html = `
    <h3>Nowa wiadomość z formularza kontaktowego</h3>
    <p><strong>Imię:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Wiadomość:</strong><br/>${message.replace(/\n/g, "<br/>")}</p>
  `;

  await transporter.sendMail({
    from: '"Formularz kontaktowy" <system@wedlinkalowkowice.pl>',
    to: "kontakt@wedlinkalowkowice.pl",
    subject: `Wiadomość od ${name} (${email})`,
    html,
  });
};

exports.sendEmailChangedOldEmail = async (to, newEmail) => {
  const html = renderTemplate("emailChangedOld", { newEmail });
  await transporter.sendMail({
    from: '"Wędlinka Łowkowice" <system@wedlinkalowkowice.pl>',
    to,
    subject: "Twój adres e-mail został zmieniony",
    html,
  });
};

exports.sendEmailChangedNewEmail = async (to) => {
  const html = renderTemplate("emailChangedNew");
  await transporter.sendMail({
    from: '"Wędlinka Łowkowice" <system@wedlinkalowkowice.pl>',
    to,
    subject: "Nowy adres przypisany do konta",
    html,
  });
};

exports.sendAccountDeletedEmail = async (to) => {
  const html = renderTemplate("accountDeleted");
  await transporter.sendMail({
    from: '"Wędlinka Łowkowice" <system@wedlinkalowkowice.pl>',
    to,
    subject: "Twoje konto zostało usunięte",
    html,
  });
};

exports.sendPasswordResetEmail = async (to, resetUrl) => {
  const html = renderTemplate("passwordReset", { resetUrl });

  await transporter.sendMail({
    from: '"Wędlinka Łowkowice" <system@wedlinkalowkowice.pl>',
    to,
    subject: "Reset hasła",
    html,
  });
};

exports.sendBankTransferDetailsEmail = async (to, data) => {
  const html = renderTemplate("bankTransferDetails", {
    orderNumber: data.orderNumber,
    title: data.orderNumber,
    bankAccount: process.env.BANK_ACCOUNT,
    bankName: process.env.BANK_NAME,
    recipient: process.env.BANK_RECIPIENT,
    amount: data.amount,
  });

  await transporter.sendMail({
    from: '"Wędlinka Łowkowice" <system@wedlinkalowkowice.pl>',
    to,
    subject: `Dane do przelewu za zamówienie ${data.orderNumber}`,
    html,
  });
};

exports.sendOrderConfirmationEmail = async (to, data) => {
  /* ---------- tabela z pozycjami ---------- */
  const itemsHtml = data.items
    .map((item) => {
      const p = item.product;

      /* 1. kwoty --------------------------------------------------------- */
      const brut = Number(p.price_brut ?? p.price ?? 0);
      const price = brut.toFixed(2);
      const total = (brut * item.quantity).toFixed(2);

      /* 2. jednostki ----------------------------------------------------- */
      const perPack = Number(
        p.quantityPerUnit ?? p.quantity /* kolumna w DB */ ?? 1
      );
      const unitsTotal = perPack * item.quantity; // 2 × 8 szt = 16 szt
      const unitsLabel = `${unitsTotal.toLocaleString("pl-PL")} ${p.unit}`;

      /* 3. miniatura (60 px, zaokr. rogi) -------------------------------- */
      const thumb = p.image
        ? `<img src="https://wedlinkalowkowice.pl/api/uploads/products/${p.image}"
            width="60" height="60"
            alt="" style="object-fit:cover;border-radius:4px;margin-right:8px;vertical-align:middle">`
        : "";

      /* 4. wiersz -------------------------------------------------------- */
      return `
    <tr>
      <td style="padding:8px 10px;">
        ${thumb}
        <span style="vertical-align:middle">
          ${p.name}<br/><small style="color:#777;">${unitsLabel}</small>
        </span>
      </td>
      <td align="center" style="padding:8px 10px;">${price} zł</td>
      <td align="center" style="padding:8px 10px;">${item.quantity}</td>
      <td align="right"  style="padding:8px 10px;"><strong>${total} zł</strong></td>
    </tr>`;
    })
    .join("");

  /* ---------- etykiety ---------- */
  const shippingLabel = SHIPPING_PL[data.shippingMethod] || data.shippingMethod;
  const paymentLabel = PAYMENT_PL[data.paymentMethod] || data.paymentMethod;

  /* ---------- dodatkowe wiersze ---------- */
  const shippingLine = `${shippingLabel} – ${Number(data.shippingCost).toFixed(
    2
  )} zł`;
  const shippingExtra = data.lockerCode
    ? `<strong>Paczkomat:</strong> ${data.lockerCode}<br/>`
    : "";

  /* ---------- adresy ---------- */
  const shippingAddressHtml = [
    `${data.shipping.firstName} ${data.shipping.lastName}`,
    data.shipping.street,
    `${data.shipping.zip} ${data.shipping.city}`,
    data.shipping.country,
    data.shipping.phone ? "tel.: " + data.shipping.phone : null,
    data.shipping.email,
  ]
    .filter(Boolean)
    .join("<br/>");

  const invoiceBlock = data.invoice
    ? `<h3 style="margin:25px 0 5px 0;color:#333;font-size:16px">Dane do faktury</h3>
       <p style="margin:0;color:#555">${[
         data.invoice.name,
         data.invoice.street,
         `${data.invoice.zip} ${data.invoice.city}`,
         data.invoice.country,
         data.invoice.nip ? "NIP: " + data.invoice.nip : null,
         data.invoice.email,
       ]
         .filter(Boolean)
         .join("<br/>")}</p>`
    : "";

  const notesBlock = data.notes.trim()
    ? `<h3 style="margin:25px 0 5px 0;color:#333;font-size:16px">Uwagi do zamówienia</h3>
       <p style="margin:0;color:#555">${data.notes}</p>`
    : "";

  /* ---------- render szablonu ---------- */
  const html = renderTemplate("orderConfirmation", {
    orderNumber: data.orderNumber,
    itemsHtml,
    shippingLine,
    shippingExtra,
    paymentLabel,
    total: Number(data.total).toFixed(2),
    shippingAddressHtml,
    invoiceBlock,
    notesBlock,
  });

  /* ---------- wysyłka ---------- */
  const info = await transporter.sendMail({
    from: '"Wędlinka Łowkowice" <system@wedlinkalowkowice.pl>',
    to,
    subject: `Potwierdzenie zamówienia ${data.orderNumber}`,
    html,
  });
  console.log(`[MAIL] potwierdzenie wysłane – id: ${info.messageId}`);
};

exports.sendOrderStatusChangedEmail = async (to, data) => {
  const itemsHtml = data.items
    .map((item) => {
      const p = item.product;
      const brut = Number(p.price_brut ?? p.price ?? 0);
      const price = brut.toFixed(2);
      const total = (brut * item.quantity).toFixed(2);

      const perPack = Number(p.quantityPerUnit ?? p.quantity ?? 1);
      const unitsTotal = perPack * item.quantity;
      const unitsLabel = `${unitsTotal.toLocaleString("pl-PL")} ${p.unit}`;

      const thumb = p.image
        ? `<img src="https://wedlinkalowkowice.pl/api/uploads/products/${p.image}"
            width="60" height="60"
            alt="" style="object-fit:cover;border-radius:4px;margin-right:8px;vertical-align:middle">`
        : "";

      return `
      <tr>
        <td style="padding:8px 10px;">
          ${thumb}
          <span style="vertical-align:middle">
            ${p.name}<br/><small style="color:#777;">${unitsLabel}</small>
          </span>
        </td>
        <td align="center" style="padding:8px 10px;">${price} zł</td>
        <td align="center" style="padding:8px 10px;">${item.quantity}</td>
        <td align="right"  style="padding:8px 10px;"><strong>${total} zł</strong></td>
      </tr>`;
    })
    .join("");

  const html = renderTemplate("orderStatusChanged", {
    orderNumber: data.orderNumber,
    orderStatusLabel: STATUS_PL[data.orderStatus] || data.orderStatus,
    itemsHtml,
    shippingLine: data.shippingLine,
    shippingExtra: data.shippingExtra || "",
    paymentLabel: data.paymentLabel,
    total: Number(data.total).toFixed(2),
    shippingAddressHtml: data.shippingAddressHtml,
    invoiceBlock: data.invoiceBlock || "",
    notesBlock: data.notesBlock || "",
    token: data.token,
  });

  const info = await transporter.sendMail({
    from: '"Wędlinka Łowkowice" <system@wedlinkalowkowice.pl>',
    to,
    subject: `Nowy status zamówienia ${data.orderNumber}`,
    html,
  });

  console.log(`[MAIL] status zamówienia wysłany – id: ${info.messageId}`);
};
