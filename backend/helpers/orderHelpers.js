// helpers/orderHelpers.js
// helpers/orderHelpers.js
function calculateCartSummary(items) {
  let totalBrut = 0;
  let totalVat = 0;
  let totalNet = 0;

  for (const item of items) {
    if (!item.product) continue;

    // coerce to number up front
    const brutRate = Number(item.product.price_brut);
    const rate = Number(item.product.vat_rate);

    const brut = brutRate * item.quantity;
    const net = +(brut / (1 + rate)).toFixed(2);
    const vat = +(brut - net).toFixed(2);

    totalBrut += brut;
    totalVat += vat;
    totalNet += net;
  }

  return { totalBrut, totalVat, totalNet };
}

module.exports = { calculateCartSummary };
