const nodemailer = require("nodemailer");
const { loadTemplateWithFooter } = require("../helpers/emailTemplates");

const transporter = nodemailer.createTransport({
  host: "mail.wedlinkalowkowice.pl",
  port: 465,
  secure: true,
  auth: {
    user: "system@wedlinkalowkowice.pl",
    pass: process.env.SYSTEM_EMAIL_PASSWORD,
  },
});

exports.sendAccountCreatedEmail = async (to, name) => {
  const html = loadTemplateWithFooter("accountCreated", { name });

  await transporter.sendMail({
    from: '"Wędlinka Łowkowice" <system@wedlinkalowkowice.pl>',
    to,
    subject: "Twoje konto zostało utworzone",
    html,
  });
};
