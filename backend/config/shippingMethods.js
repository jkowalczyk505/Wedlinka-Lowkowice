module.exports = {
  methods: [
    {
      id: "pickup",
      label: "Odbiór osobisty",
      price: 0,
      cod: false,
    },
    {
      id: "inpost",
      label: "Paczkomaty InPost 24/7",
      price: 18.99,
      cod: false,
    },
    {
      id: "courier",
      label: "Kurier",
      price: 20.99,
      cod: true,
      codFee: 3.0,
    },
  ],
  freeShippingThreshold: 230,
};
