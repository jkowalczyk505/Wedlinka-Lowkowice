// controllers/orderController.js
const OrderModel = require("../models/orderModel");
const ProductModel = require("../models/productModel");
const Cart = require("../models/cartModel");
const PaymentModel = require("../models/paymentModel");

const { calculateCartSummary } = require("../helpers/orderHelpers");
const { registerTransaction } = require("../services/p24");
const {
  sendBankTransferDetailsEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusChangedEmail,
} = require("../services/emailService");

const BANK_ACCOUNT = process.env.BANK_ACCOUNT;

const PAYMENT_PL = {
  przelewy24: "Płatność online (Przelewy24)",
  bank_transfer: "Przelew tradycyjny",
  cod: "Przy odbiorze",
};

// POST /api/orders
async function createOrder(req, res) {
  let created = null;
  try {
    // 1. Dane wejściowe
    const { items, form, paymentMethod, selectedShipping } = req.body;
    const userId = req.user?.id ?? null;

    // 2. Produkty & podsumowanie
    const productIds = items.map((i) => i.productId);
    const products = await ProductModel.getByIds(productIds);
    const enriched = items.map((i) => ({
      product: products.find((p) => p.id === i.productId),
      quantity: i.quantity,
    }));
    const summary = calculateCartSummary(enriched);

    // 3. Wstawienie zamówienia
    const {
      id: orderId,
      orderNumber,
      accessToken,
    } = (created = await OrderModel.create({
      user_id: userId,
      form,
      invoice_type:
        form.wantsInvoice && form.companyName && form.nip
          ? "company"
          : form.wantsInvoice
          ? "person"
          : null,
      total_net: summary.totalNet,
      total_vat: summary.totalVat,
      total_brut: summary.totalBrut,
    }));

    await OrderModel.addOrderItems(orderId, enriched);
    await OrderModel.addShippingDetails(
      orderId,
      form,
      selectedShipping,
      form.lockerCode
    );

    // 4. Przygotowanie płatności i kosztu dostawy
    const shippingCost = Number(selectedShipping.priceTotal) || 0;
    const totalWithShipping = summary.totalBrut + shippingCost;

    const payment = {
      method: paymentMethod,
      amount: totalWithShipping.toFixed(2),
      bankAccount: null,
      title: null,
      redirectUrl: null,
      deliveryMethod: selectedShipping.id,
    };

    if (paymentMethod === "bank_transfer") {
      payment.bankAccount = BANK_ACCOUNT;
      payment.title = orderNumber;
    }
    if (paymentMethod === "przelewy24") {
      try {
        const returnUrl = `${
          process.env.PUBLIC_BACKEND_URL
        }/api/p24/return?order=${encodeURIComponent(
          orderNumber
        )}&token=${encodeURIComponent(accessToken)}`;
        const cancelUrl = `${process.env.PUBLIC_BACKEND_URL}/api/p24/cancel`;

        const p24SessionId = `${orderNumber}::${Date.now()}`;
        const { token, redirectUrl } = await registerTransaction({
          sessionId: p24SessionId,
          amountPln: totalWithShipping,
          email: form.email,
          description: `Zamowienie ${orderNumber}`,
          returnUrl, // <── backend
          cancelUrl,
        });

        payment.redirectUrl = redirectUrl;
        payment.token = token;
      } catch (e) {
        console.error("P24 register failed:", e?.message || e);
        // <<< NOWE: zawsze failed + cancelled >>>
        try {
          await PaymentModel.markFailedByOrderNumber(orderNumber, {});
          await OrderModel.updatePaymentStatusByOrderNumber(
            orderNumber,
            "failed"
          );
          await OrderModel.updateStatusByOrderNumber(orderNumber, "cancelled");
        } catch (e2) {
          console.error("FAIL-SAFE cancelling order failed:", e2);
        }
        return res.status(502).json({
          error: "P24_REGISTER_FAILED",
          details: String(e?.message || e),
        });
      }
    }

    // 5. Zapis do tabeli payments
    await PaymentModel.create({
      orderId,
      provider: payment.method,
      amount: payment.amount,
      currency: "PLN",
      transactionId: payment.token || null, // token z P24
      status: "pending",
    });

    // 5a. Wysyłka maila z danymi do przelewu
    if (paymentMethod === "bank_transfer") {
      try {
        await sendBankTransferDetailsEmail(form.email, {
          orderNumber,
          amount: payment.amount,
          bankAccount: payment.bankAccount,
          bankName: process.env.BANK_NAME,
          recipient: process.env.BANK_RECIPIENT,
        });
      } catch (mailErr) {
        console.error("Błąd wysyłki maila z przelewem:", mailErr);
      }
    }

    // 6. Sprzątanie koszyka
    await Cart.clearCart(userId);

    // 7. Odpowiedź z pełnymi danymi podsumowania
    const clientItems = enriched.map(({ product, quantity }) => ({
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: product.image,
        category: product.category,
        unit: product.unit,
        quantityPerUnit: product.quantityPerUnit,
        price_brut: Number(product.price_brut), // ← ważne!
      },
      quantity,
    }));

    try {
      await sendOrderConfirmationEmail(form.email, {
        orderNumber,
        items: enriched,
        shippingMethod: selectedShipping.id, // <── nowa właściwość
        shippingCost,
        lockerCode: form.lockerCode || "", // <── nowa właściwość
        paymentMethod: payment.method,
        total: totalWithShipping,
        notes: form.notes || "",

        /* dane do sekcji „Adres dostawy” */
        shipping: {
          firstName: form.firstName,
          lastName: form.lastName,
          street: form.address + (form.address2 ? " / " + form.address2 : ""),
          zip: form.zip,
          city: form.city,
          country: form.country || "Polska",
          phone: form.phone || "",
          email: form.email || "",
        },

        /* dane fakturowe – lub null, jeśli brak */
        invoice: form.wantsInvoice
          ? {
              name: form.companyName || `${form.firstName} ${form.lastName}`,
              street:
                form.address + (form.address2 ? " / " + form.address2 : ""),
              zip: form.zip,
              city: form.city,
              country: form.country || "Polska",
              nip: form.nip || "",
              email: form.invoice_email || form.email,
            }
          : null,
      });
    } catch (mailErr) {
      console.error("Błąd wysyłki maila potwierdzającego zamówienie:", mailErr);
    }

    return res.status(201).json({
      success: true,
      orderId,
      orderNumber,
      accessToken,
      payment,
      items: clientItems,
      shipping: {
        id: selectedShipping.id,
        name: selectedShipping.name || selectedShipping.id,
        priceTotal: shippingCost,
      },
      form,
      invoice: {
        type: form.wantsInvoice
          ? form.companyName && form.nip
            ? "company"
            : "person"
          : null,
      },
      orderStatus: "waiting_payment",
    });
  } catch (err) {
    console.error("Create order error:", err);
    // <<< OPCJONALNY BEZPIECZNIK: jeśli order już powstał, to go anuluj i wpisz payments=failed >>>
    if (created?.orderNumber) {
      try {
        await PaymentModel.markFailedByOrderNumber(created.orderNumber, {});
        await OrderModel.updatePaymentStatusByOrderNumber(
          created.orderNumber,
          "failed"
        );
        await OrderModel.updateStatusByOrderNumber(
          created.orderNumber,
          "cancelled"
        );
      } catch (e2) {
        console.error("FAIL-SAFE (outer) cancelling order failed:", e2);
      }
    }
    return res.status(500).json({ error: "Błąd tworzenia zamówienia" });
  }
}

// GET /api/orders/summary/:orderNumber
async function getOrderSummary(req, res) {
  const { orderNumber } = req.params;
  const token = req.query.token;
  try {
    const summary = await OrderModel.getFullSummary(orderNumber, token);
    if (!token) {
      return res.status(403).json({ error: "Brak dostępu – brak tokenu" });
    }
    if (!summary) {
      return res.status(404).json({ error: "Nie znaleziono zamówienia" });
    }
    return res.json(summary);
  } catch (err) {
    console.error("getOrderSummary error:", err);
    return res.status(500).json({ error: "Błąd pobierania zamówienia" });
  }
}

async function getAllOrders(req, res) {
  try {
    const orders = await OrderModel.getAllAdmin();
    res.json(orders);
  } catch (err) {
    console.error("Błąd pobierania zamówień:", err);
    res.status(500).json({ error: "Błąd pobierania zamówień" });
  }
}

async function getOrderDetails(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const order = await OrderModel.getByIdAdmin(id);
    if (!order)
      return res.status(404).json({ error: "Zamówienie nie znalezione" });
    res.json(order);
  } catch (err) {
    console.error("Błąd pobierania szczegółów zamówienia:", err);
    res.status(500).json({ error: "Błąd pobierania szczegółów" });
  }
}

// controllers/orderController.js
async function updateOrderStatus(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;

    // 1) aktualizacja w DB
    await OrderModel.updateStatus(id, status);

    // 2) przygotuj dane do maila
    const full = await OrderModel.getByIdAdmin(id);
    const email =
      full?.invoice?.email || full?.shipping?.recipient_email || null;

    let emailSent = false;
    let emailWarning = null;

    if (email) {
      try {
        await sendOrderStatusChangedEmail(email, {
          orderNumber: full.order.order_number,
          orderStatus: status,
          token: full.order.access_token,
          items: full.items,
          shippingLine: `${full.shipping.name} – ${Number(
            full.shipping.priceTotal
          ).toFixed(2)} zł`,
          shippingExtra: full.shipping.locker_code
            ? `<strong>Paczkomat:</strong> ${full.shipping.locker_code}<br/>`
            : "",
          paymentLabel:
            PAYMENT_PL[full.payment.provider] || full.payment.provider,
          total: Number(full.payment.amount),
          shippingAddressHtml: [
            `${full.shipping.recipient_first_name} ${full.shipping.recipient_last_name}`,
            full.shipping.street,
            `${full.shipping.postal_code} ${full.shipping.city}`,
            "Polska",
            full.shipping.recipient_phone
              ? "tel.: " + full.shipping.recipient_phone
              : null,
            full.shipping.recipient_email,
          ]
            .filter(Boolean)
            .join("<br/>"),
          invoiceBlock: full.invoice?.name
            ? `<h3 style="margin:25px 0 5px 0;color:#333;font-size:16px">Dane do faktury</h3>
               <p style="margin:0;color:#555">${[
                 full.invoice.name,
                 full.invoice.street,
                 `${full.invoice.zip} ${full.invoice.city}`,
                 full.invoice.country,
                 full.invoice.nip ? "NIP: " + full.invoice.nip : null,
                 full.invoice.email,
               ]
                 .filter(Boolean)
                 .join("<br/>")}</p>`
            : "",
          notesBlock: full.shipping?.notes
            ? `<h3 style="margin:25px 0 5px 0;color:#333;font-size:16px">Uwagi do zamówienia</h3>
               <p style="margin:0;color:#555">${full.shipping.notes}</p>`
            : "",
        });
        emailSent = true;
      } catch (mailErr) {
        console.error("Błąd wysyłki maila o zmianie statusu:", mailErr);
        // wyciągnij z nodemailera czytelny komunikat (550 itp.)
        const srv = mailErr?.response || mailErr?.message || String(mailErr);
        emailWarning = `Nie udało się wysłać powiadomienia e-mail (${srv}).`;
      }
    } else {
      emailWarning =
        "Brak adresu e-mail odbiorcy – powiadomienie nie zostało wysłane.";
    }

    // 3) ZAWSZE 200 – a o mailu informujemy dodatkowymi polami
    return res.json({
      ok: true,
      message: "Status zamówienia zaktualizowany",
      emailSent,
      emailWarning, // null lub treść ostrzeżenia do pokazania w UI
    });
  } catch (err) {
    console.error("Błąd aktualizacji statusu:", err);
    return res.status(500).json({ error: "Błąd aktualizacji statusu" });
  }
}

async function updatePaymentStatus(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;
    await OrderModel.updatePaymentStatus(id, status);
    res.json({ message: "Status płatności zaktualizowany" });
  } catch (err) {
    console.error("Błąd aktualizacji statusu płatności:", err);
    res.status(500).json({ error: "Błąd aktualizacji statusu płatności" });
  }
}

// GET /api/orders/latest?limit=2
async function getLatestOrders(req, res) {
  const userId = req.user.id;
  const limit = req.query.limit || 2;
  try {
    const list = await OrderModel.getLatestForUser(userId, limit);
    res.json(list);
  } catch (err) {
    console.error("getLatestOrders:", err);
    res.status(500).json({ error: "Błąd pobierania zamówień" });
  }
}

// GET /api/orders/:id
async function getOneForUser(req, res) {
  const { id } = req.params;
  const summary = await OrderModel.getSummaryForUser(id, req.user.id);
  if (!summary) return res.status(404).json({ error: "Nie znaleziono" });
  res.json(summary);
}

async function updateTrackingNumber(req, res) {
  try {
    const orderId = parseInt(req.params.id, 10);
    const { trackingNumber } = req.body;
    if (!trackingNumber) {
      return res.status(400).json({ error: "Brak numeru przesyłki" });
    }
    await OrderModel.updateTrackingNumber(orderId, trackingNumber);
    res.json({ message: "Numer przesyłki zaktualizowany" });
  } catch (err) {
    console.error("UPDATE TRACKING ERROR:", err);
    res.status(500).json({ error: "Błąd aktualizacji numeru przesyłki" });
  }
}

module.exports = {
  createOrder,
  getOrderSummary,
  getLatestOrders,
  getOneForUser,
  // — admin export —
  getAllOrders,
  getOrderDetails,
  updateOrderStatus,
  updatePaymentStatus,
  updateTrackingNumber,
};
