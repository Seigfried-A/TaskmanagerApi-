const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./tasks");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Enter a valid email");
        }
      },
    },

    password: {
      type: String,
      required: [true, "enter your password"],
      minLength: [6, "password cannot be less than 6 characters"],
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("password cannot contain the word password");
        }
      },
    },

    age: {
      type: Number,
      default: 0,
      trim: true,
      validate(value) {
        if (value < 0) {
          throw new Error("Age is not allowed to be negative");
        }
      },
    },
    token: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    strictPopulate: false,
  }
);

userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner",
});

userSchema.methods.toJSON = function () {
  const user = this;

  userObjects = user.toObject();

  delete userObjects.password;
  delete userObjects.token;
  delete userObjects.avatar;

  return userObjects;
};

userSchema.methods.genAuthToken = async function () {
  const user = this;
  const getToken = jwt.sign({ _id: user._id.toString() }, "Task%test");

  const newToken = user.token.concat({ token: getToken });
  user.token = newToken;
  user.save();

  return getToken;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const userExists = await User.findOne({ email });

  //console.log(userExists);
  if (!userExists) {
    throw new Error("Invalid Login");
  }

  const isValid = await bcrypt.compare(password, userExists.password);
  if (!isValid) {
    throw new Error("Invalid Login");
  }

  return userExists;
};

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

userSchema.pre("remove", async function (next) {
  const user = this;

  await Task.deleteMany({ owner: user._id });
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
