const Cart = require("../models/cartModel");
const ProductModel = require("../models/productModel");

exports.getCart = async (req, res, next) => {
  try {
    const removed = await Cart.purgeInvalid(req.user.id); // 🧹
    const items = await Cart.getItems(req.user.id);
    // liczba usuniętych trafia w custom-nagłówek
    res.set("X-Cart-Removed", removed);
    res.json({ items });
  } catch (err) {
    next(err);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await ProductModel.findById(productId);
    if (!product || product.is_deleted || !product.is_available) {
      return res
        .status(400)
        .json({ error: "Tego produktu nie można dodać do koszyka." });
    }

    await Cart.addItem(req.user.id, productId, quantity);
    res.status(201).json({ message: "Dodano do koszyka" });
  } catch (err) {
    next(err);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    // 🔐 WALIDACJA PRODUKTU
    const product = await ProductModel.findById(productId);
    if (!product || product.is_deleted || !product.is_available) {
      return res
        .status(400)
        .json({ error: "Nie można zaktualizować niedostępnego produktu." });
    }

    await Cart.updateQuantity(req.user.id, productId, quantity);
    res.json({ message: "Zaktualizowano ilość" });
  } catch (err) {
    next(err);
  }
};

exports.removeCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    await Cart.removeItem(req.user.id, productId);
    res.json({ message: "Usunięto z koszyka" });
  } catch (err) {
    next(err);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    await Cart.clearCart(req.user.id);
    res.json({ message: "Koszyk wyczyszczony" });
  } catch (err) {
    next(err);
  }
};
