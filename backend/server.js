const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

require("dotenv").config(); // Jeśli używasz pliku .env

app.use(express.json()); // Parsowanie JSON
app.get("/", (req, res) => {
  res.send("Backend działa!");
});

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
