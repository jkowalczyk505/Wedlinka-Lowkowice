// controllers/orderController.js
const OrderModel = require("../models/orderModel");
const ProductModel = require("../models/productModel");
const Cart = require("../models/cartModel");
const PaymentModel = require("../models/paymentModel");

const { calculateCartSummary } = require("../helpers/orderHelpers");
const { generateP24RedirectUrl } = require("../services/p24"); // mock P24

const BANK_ACCOUNT =
  process.env.BANK_ACCOUNT || "12 3456 0000 1111 2222 3333 4444";

async function createOrder(req, res) {
  try {
    /* ───── 1. Dane wejściowe ───── */
    const { items, form, paymentMethod, selectedShipping } = req.body;
    const userId = req.user?.id ?? null;

    /* ───── 2. Produkty & podsumowanie ───── */
    const productIds = items.map((i) => i.productId);
    const products = await ProductModel.getByIds(productIds);
    const enriched = items.map((i) => ({
      product: products.find((p) => p.id === i.productId),
      quantity: i.quantity,
    }));
    const summary = calculateCartSummary(enriched); // { totalNet, totalVat, totalBrut }

    /* ───── 3. Wstawienie zamówienia ───── */
    const { id: orderId, orderNumber } = await OrderModel.create({
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

    /* ───── 4. Payment object + koszt dostawy ───── */
    const shippingCost = Number(selectedShipping.priceTotal) || 0;
    const totalWithShipping = summary.totalBrut + shippingCost;

    const payment = {
      method: paymentMethod, // 'bank_transfer' | 'przelewy24' | 'cod'
      amount: totalWithShipping.toFixed(2), // STRING!
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

    /* ───── 5. Zapis do tabeli payments ───── */
    await PaymentModel.create({
      orderId, // <─ KAMEL-CASE zgodne z modelem
      provider: payment.method,
      amount: payment.amount,
      currency: "PLN",
      transactionId: payment.redirectUrl ?? null,
      status: "pending",
    });

    /* ───── 6. Sprzątanie + odpowiedź ───── */
    await Cart.clearCart(userId);

    return res.status(201).json({
      success: true,
      orderId,
      orderNumber,
      payment,
    });
  } catch (err) {
    console.error("Create order error:", err);
    return res.status(500).json({ error: "Błąd tworzenia zamówienia" });
  }
}

module.exports = { createOrder };
