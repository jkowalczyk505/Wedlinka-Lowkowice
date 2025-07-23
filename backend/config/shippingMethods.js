module.exports = {
  "methods": [
    {
      "id": "pickup",
      "label": "Odbiór osobisty",
      "price": 0,
      "cod": false,
      "codFee": 0
    },
    {
      "id": "inpost",
      "label": "Paczkomaty InPost 24/7",
      "price": 18.99,
      "cod": false,
      "codFee": 0
    },
    {
      "id": "courier",
      "label": "Kurier",
      "price": 20.99,
      "cod": true,
      "codFee": 3
    }
  ],
  "freeShippingThreshold": 230
};
