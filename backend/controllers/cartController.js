const Cart = require("../models/cartModel");

exports.getCart = async (req, res, next) => {
  try {
    const items = await Cart.getItems(req.user.id);
    res.json({ items });
  } catch (err) {
    next(err);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    await Cart.addItem(req.user.id, productId, quantity);
    res.status(201).json({ message: "Dodano do koszyka" });
  } catch (err) {
    next(err);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
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
