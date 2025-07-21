const OrderModel = require("../models/orderModel");
const ProductModel = require("../models/productModel");
const Cart = require("../models/cartModel");

const { calculateCartSummary } = require("../helpers/orderHelpers");

const createOrder = async (req, res) => {
  try {
    const { items, form, paymentMethod, invoiceType, selectedShipping } =
      req.body;
    const user_id = req.user?.id || null;

    // Pobierz produkty z bazy
    const productIds = items.map((item) => item.productId);
    const products = await ProductModel.getByIds(productIds);

    // Złącz produkty z ilością
    const enrichedItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        product,
        quantity: item.quantity,
      };
    });

    const summary = calculateCartSummary(enrichedItems);

    // 1) Ustalamy typ faktury na podstawie form.wantsInvoice, companyName i nip
    let invoiceTypeToSave = null;
    if (form.wantsInvoice) {
      if (form.companyName && form.nip) {
        invoiceTypeToSave = "company";
      } else {
        invoiceTypeToSave = "person";
      }
    }

    const totalBrut = summary.totalBrut;
    const totalVat = summary.totalVat;
    const totalNet = summary.totalNet;

    const { id: orderId, orderNumber } = await OrderModel.create({
      user_id,
      form,
      invoice_type: invoiceTypeToSave,
      total_net: totalNet,
      total_vat: totalVat,
      total_brut: totalBrut,
    });

    /* przekazujemy TYLKO liczbę */
    await OrderModel.addOrderItems(orderId, enrichedItems);
    await OrderModel.addShippingDetails(
      orderId,
      form,
      selectedShipping,
      form.lockerCode
    );

    await Cart.clearCart(user_id);

    res.status(201).json({ success: true, orderId, orderNumber });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ error: "Błąd tworzenia zamówienia" });
  }
};

module.exports = {
  createOrder,
};
