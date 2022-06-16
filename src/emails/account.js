const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  service: "outlook",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendWelcomeMail = (email, name) => {
  let details = {
    from: '"TaskApp" <taskdemoapp@outlook.com>',
    to: email,
    subject: "The Task App",
    text: `welcome ${name}, thank you for joining us`,
  };

  transporter.sendMail(details, (err) => {
    if (err) {
      console.log("an error occured" + err);
    } else {
      console.log("email sent");
    }
  });
};

const sendGoodbyeMail = (email, name) => {
  let details = {
    from: '"TaskApp" <taskdemoapp@outlook.com>',
    to: email,
    subject: "The Task App",
    text: `Goodbye ${name}, So sad to see you leave`,
  };

  transporter.sendMail(details, (err) => {
    if (err) {
      console.log("an error occured" + err);
    } else {
      console.log("email sent");
    }
  });
};

module.exports = {
  sendWelcomeMail,
  sendGoodbyeMail,
};
