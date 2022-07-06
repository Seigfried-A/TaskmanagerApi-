const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");
const { userId, userOne, configDb } = require("./fixtures/db");

//const { mock } = require("nodemailer");

beforeEach(configDb);

test("should create a new user", async () => {
  await request(app)
    .post("/users")
    .send({
      name: "Davinci",
      email: "Deamons@gmail.com",
      password: "Davinci1",
    })
    .expect(201);

  //const sentEmails = mock.getSentMail();
});

test("should login existing user", async () => {
  const response = await request(app)
    .post("/user/login")
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);

  const user = await User.findById(userId);
  expect(response.body.token).toBe(user.token[1].token);
});

test("should not login non-existent user", async () => {
  await request(app)
    .post("/user/login")
    .send({
      email: "Prestine@gmail.com",
      password: "Fillerwidth34",
    })
    .expect(500);
});

test("should get user profile", async () => {
  await request(app)
    .get("/users/myprofile")
    .set("Authorization", `Bearer ${userOne.token[0].token}`)
    .send()
    .expect(200);
});

test("should not get profile for unAuth user", async () => {
  await request(app).get("/users/myprofile").send().expect(401);
});

test("should delete acct", async () => {
  await request(app)
    .delete("/user/delete/myprofile")
    .set("Authorization", `Bearer ${userOne.token[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(userId);
  expect(user).toBe(null);
});

test("should not delete acct for unauthorized user", async () => {
  await request(app).delete("/user/delete/myprofile").send().expect(401);
});

test("should upload images to db", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.token[0].token}`)
    .attach("avatar", "tests/fixtures/Netoro.jpg")
    .expect(200);

  const user = await User.findById(userId);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test("should update valid user fields", async () => {
  const response = await request(app)
    .patch("/updateuser/myprofile")
    .set("Authorization", `Bearer ${userOne.token[0].token}`)
    .send({
      name: "Sage",
    })
    .expect(200);

  const user = await User.findById(userId);
  expect(user.name).toEqual("Sage");
});

test("should not update invalid user fields", async () => {
  const response = await request(app)
    .patch("/updateuser/myprofile")
    .set("Authorization", `Bearer ${userOne.token[0].token}`)
    .send({
      Location: "mars",
    })
    .expect(400);
});
