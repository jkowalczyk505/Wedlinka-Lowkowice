// controllers/orderController.js
const OrderModel = require("../models/orderModel");
const ProductModel = require("../models/productModel");
const Cart = require("../models/cartModel");
const PaymentModel = require("../models/paymentModel");

const { calculateCartSummary } = require("../helpers/orderHelpers");
const { generateP24RedirectUrl } = require("../services/p24"); // mock P24

const BANK_ACCOUNT = process.env.BANK_ACCOUNT;

// POST /api/orders
async function createOrder(req, res) {
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
    } = await OrderModel.create({
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
    });

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
      payment.redirectUrl = await generateP24RedirectUrl(
        orderNumber,
        totalWithShipping
      );
    }

    // 5. Zapis do tabeli payments
    await PaymentModel.create({
      orderId,
      provider: payment.method,
      amount: payment.amount,
      currency: "PLN",
      transactionId: payment.redirectUrl,
      status: "pending",
    });

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
        price: product.price,
      },
      quantity,
    }));

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
      orderStatus: "new",
    });
  } catch (err) {
    console.error("Create order error:", err);
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

async function updateOrderStatus(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;
    await OrderModel.updateStatus(id, status);
    res.json({ message: "Status zamówienia zaktualizowany" });
  } catch (err) {
    console.error("Błąd aktualizacji statusu:", err);
    res.status(500).json({ error: "Błąd aktualizacji statusu" });
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

module.exports = {
  createOrder,
  getOrderSummary,
  // — admin export —
  getAllOrders,
  getOrderDetails,
  updateOrderStatus,
  updatePaymentStatus,
};
