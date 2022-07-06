const express = require("express");
const userRouter = require("./routes/user");
const taskRouter = require("./routes/task");
require("./db/mongoose");

const app = express();

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

module.exports = app;
