const nodemailer = require("nodemailer");

const sendEmail = async ({ email, html }) => {
  const transporter = nodemailer.createTransport({
    host: "mail.zisindosat.id",
    port: 465,
    secure: true,
    auth: {
      user: "admin@zisindosat.id",
      pass: "ziswaf2019",
    },
  });

  const info = await transporter.sendMail({
    from: "admin@zisindosat.id",
    to: email,
    subject: "Pendaftaran Ziswaf INDOSAT",
    html: html,
  });

  console.log("Message sent: %s", info.messageId);

  return info.messageId;
};

const generateTemplate = ({ email, password }) => {
  const encodedEmail = Buffer.from(email).toString("base64");
  const url = `https://portal.zisindosat.id/verifikasi?akun=${encodedEmail}`;

  const content = `
   Assalamu'alaikum, Wr Wb. \n
   Terima Kasih Telah Mendaftar sebagai Mustahiq Ke Ziswaf INDOSAT. \n
   Berikut ini adalah detail login anda :\n
   Username : ${email}\n
   Password : ${password}\n
   Untuk melanjutkan proses registrasi dan agar anda bisa melakukan login, silahkan lakukan Verifikasi terlebih dahulu, dengan melakukan klik pada link berikut\n
   <br />
   <a href="${url}">VERIFIKASI AKUN</a>
   <br />
   Terima kasih atas partisipasi anda.
   Wassalamu'alaikum Wr, Wb
`;

  return content;
};

const generateTemplateForgotEmail = ({ email, token }) => {
  const encodedEmail = Buffer.from(email).toString("base64");
  const url = `https://portal.zisindosat.id/reset-password?akun=${encodedEmail}=token${token}`;

  console.log({ encodedEmail, token });

  const content = `
    Assalamu'alaikum, Wr Wb. \n
    Anda telah melakukan permintaan untuk melakukan reset password. \n
    Untuk melanjutkan proses reset password, silahkan klik link berikut: \n
    <br />
    <a href="${url}">RESET PASSWORD</a>
    <br />
    Wassalamu'alaikum Wr, Wb
 `;

  return content;
};

module.exports = {
  sendEmail,
  generateTemplate,
  generateTemplateForgotEmail,
};
