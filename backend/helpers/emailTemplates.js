const fs = require("fs");
const path = require("path");

exports.loadTemplateWithFooter = (templateName, replacements = {}) => {
  const templatePath = path.join(
    __dirname,
    "..",
    "controllers",
    "emailTemplates",
    `${templateName}.html`
  );
  const footerPath = path.join(
    __dirname,
    "..",
    "controllers",
    "emailTemplates",
    "footer.html"
  );

  let html = fs.readFileSync(templatePath, "utf-8");
  const footer = fs.readFileSync(footerPath, "utf-8");

  html += footer;

  // Podstaw zmienne {{name}}, {{link}}, itd.
  for (const [key, value] of Object.entries(replacements)) {
    html = html.replace(new RegExp(`{{${key}}}`, "g"), value);
  }

  return html;
};
