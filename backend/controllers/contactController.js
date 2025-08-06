// controllers/contactController.js
const { sendContactEmail } = require("../services/emailService");

exports.handleContactForm = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Brak wymaganych pól" });
    }

    await sendContactEmail(name, email, message);
    res.json({ message: "Wiadomość wysłana" });
  } catch (err) {
    next(err);
  }
};
