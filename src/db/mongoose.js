const mongoose = require("mongoose");

mongoose.connect(process.env.MONDODB_URL, { useNewUrlParser: true }, () => {
  console.log("connected to a database");
});
