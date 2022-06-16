const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const { sendWelcomeMail, sendGoodbyeMail } = require("../emails/account");

const router = new express.Router();

router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    sendWelcomeMail(user.email, user.name);
    const token = await user.genAuthToken();
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.genAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.token = req.user.token.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();

    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/users/logoutall", auth, async (req, res) => {
  try {
    req.user.token = [];
    await req.user.save();

    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/users/myprofile", auth, async (req, res) => {
  try {
    res.send(req.user);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.patch("/updateuser/myprofile", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password"];
  const isValidation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidation) {
    return res.status(400).send({ error: "Update not allowed" });
  }

  try {
    const user = req.user;
    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();

    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.delete("/user/delete/myprofile", auth, async (req, res) => {
  try {
    await req.user.remove();
    sendGoodbyeMail(req.user.email, req.user.name);

    res.send(req.user);
  } catch (error) {
    res.status(500).send(error);
  }
});

//upload
//profile
const upload = multer({
  limits: {
    fileSize: 1000000,
  },

  fileFilter(req, files, cb) {
    if (!files.originalname.match(/\.(jpg|png|jpeg)$/)) {
      return cb(new Error("image format not supported"));
    }
    cb(undefined, true);
  },
});

router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();

    req.user.avatar = buffer;
    await req.user.save();
    res.send("picture updated");
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  req.user.save();
  res.send();
});

router.get("/users/:id/avatar", async (req, res) => {
  try {
    const users = await User.findById(req.params.id);

    if (!users || !users.avatar) {
      throw new Error();
    }

    res.set("Content-Type", "image/png");
    res.send(users.avatar);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
