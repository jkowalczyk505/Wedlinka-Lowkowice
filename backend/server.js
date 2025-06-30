const express = require("express");
const app = express();
const PORT = process.env.PORT || 5001;

require("dotenv").config();

app.use(express.json());
app.get("/", (req, res) => {
  res.send("Backend działa!");
});

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
