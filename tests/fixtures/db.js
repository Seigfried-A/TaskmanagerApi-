const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../../src/models/user");
const Task = require("../../src/models/tasks");

const userId = new mongoose.Types.ObjectId();
const userOne = {
  _id: userId,
  name: "Davinci",
  email: "DavinciNk@gmail.com",
  password: "Confused1",
  token: [
    {
      token: jwt.sign({ _id: userId }, process.env.TOKEN_SECRET),
    },
  ],
};

const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
  _id: userTwoId,
  name: "Eggshells",
  email: "Philip@gmail.com",
  password: "refused1",
  token: [
    {
      token: jwt.sign({ _id: userTwoId }, process.env.TOKEN_SECRET),
    },
  ],
};

const taskOne = {
  _id: new mongoose.Types.ObjectId(),
  description: "First Test Task",
  completed: false,
  owner: userOne._id,
};

const taskTwo = {
  _id: new mongoose.Types.ObjectId(),
  description: "second Test Task",
  completed: true,
  owner: userOne._id,
};

const taskThree = {
  _id: new mongoose.Types.ObjectId(),
  description: "Third Test Task",
  completed: true,
  owner: userTwo._id,
};

const configDb = async () => {
  await User.deleteMany();
  await Task.deleteMany();
  await new User(userOne).save();
  await new User(userTwo).save();
  await new Task(taskOne).save();
  await new Task(taskTwo).save();
  await new Task(taskThree).save();
};

module.exports = {
  userId,
  userOne,
  userTwo,
  taskOne,
  taskTwo,
  taskThree,
  configDb,
};
