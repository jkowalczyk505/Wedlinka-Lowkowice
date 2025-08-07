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

exports.sendContactEmail = async (name, email, message) => {
  const html = `
    <h3>Nowa wiadomość z formularza kontaktowego</h3>
    <p><strong>Imię:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Wiadomość:</strong><br/>${message.replace(/\n/g, "<br/>")}</p>
  `;

  await transporter.sendMail({
    from: '"Formularz kontaktowy" <system@wedlinkalowkowice.pl>',
    to: "kontakt@wedlinkalowkowice.pl",
    subject: `Wiadomość od ${name} (${email})`,
    html,
  });
};

exports.sendEmailChangedOldEmail = async (to, newEmail) => {
  const html = loadTemplateWithFooter("emailChangedOld", { newEmail });
  await transporter.sendMail({
    from: '"Wędlinka Łowkowice" <system@wedlinkalowkowice.pl>',
    to,
    subject: "Twój adres e-mail został zmieniony",
    html,
  });
};

exports.sendEmailChangedNewEmail = async (to) => {
  const html = loadTemplateWithFooter("emailChangedNew");
  await transporter.sendMail({
    from: '"Wędlinka Łowkowice" <system@wedlinkalowkowice.pl>',
    to,
    subject: "Nowy adres przypisany do konta",
    html,
  });
};

exports.sendAccountDeletedEmail = async (to) => {
  const html = loadTemplateWithFooter("accountDeleted");
  await transporter.sendMail({
    from: '"Wędlinka Łowkowice" <system@wedlinkalowkowice.pl>',
    to,
    subject: "Twoje konto zostało usunięte",
    html,
  });
};

exports.sendPasswordResetEmail = async (to, resetUrl) => {
  const html = loadTemplateWithFooter("passwordReset", { resetUrl });

  await transporter.sendMail({
    from: '"Wędlinka Łowkowice" <system@wedlinkalowkowice.pl>',
    to,
    subject: "Reset hasła",
    html,
  });
};
