// services/p24.js
/**
 * Zwraca fikcyjny link do sandboxa Przelewy24.
 * W produkcji zastąp realnym wywołaniem API.
 */
async function generateP24RedirectUrl(orderNumber, amount) {
  return `https://sandbox.przelewy24.pl/trnRequest/${encodeURIComponent(
    orderNumber
  )}?amount=${amount}`;
}

module.exports = { generateP24RedirectUrl };
