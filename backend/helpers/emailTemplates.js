const fs = require("fs");
const path = require("path");

exports.renderTemplate = (name, repl = {}) => {
  const base = fs.readFileSync(
    path.join(__dirname, "..", "controllers", "emailTemplates", "base.html"),
    "utf-8"
  );
  const body = fs.readFileSync(
    path.join(__dirname, "..", "controllers", "emailTemplates", `${name}.html`),
    "utf-8"
  );
  const footer = fs.readFileSync(
    path.join(__dirname, "..", "controllers", "emailTemplates", "footer.html"),
    "utf-8"
  );

  // 1) wstawiamy treść i stopkę w miejsce {{content}}
  let html = base.replace("{{content}}", body + footer);

  // 2) placeholdery użytkownika
  for (const [k, v] of Object.entries(repl)) {
    html = html.replace(new RegExp(`{{${k}}}`, "g"), v);
  }

  // 3) rok w stopce
  html = html.replace(/{{year}}/g, new Date().getFullYear());

  return html;
};
