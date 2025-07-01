// server.js
// 1. Ładujemy .env i testujemy DB jeszcze przed uruchomieniem Expressa
require("dotenv").config();
require("./config/db");

const app = require("./app");
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Serwer działa na porcie ${PORT}`);
});
